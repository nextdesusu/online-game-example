import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

const genP = (): String => Math.random().toString().slice(4);
const genId = (): string => `${genP()}-${genP()}-${genP()}-${genP()}`;

interface User {
  nickname: string;
  id: string;
  hosted: string | null;
}

interface Room {
  host: User;
  client: User | null;
  name: string;
  id: string;
  type: number;
}

export default class Server {
  private app: Application;
  private httpServer: HTTPServer;
  private socketIO: SocketIOServer;
  private port: number;
  private rooms: Map<string, Room>;
  private users: Map<string, User>;

  constructor(port: number) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.socketIO = new socketIO(this.httpServer);
    this.port = port;
    this.rooms = new Map();
    this.users = new Map();
    this.handleSocketConnection();
  }

  private addRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  private getRoomById(roomId: string): Room | null {
    const room: Room | undefined = this.rooms.get(roomId);//.find((room: Room) => room.id === roomId);
    return room === undefined ? null : room;
  }

  private addClientToRoom(roomId: string, client: User): void {
    const room = this.getRoomById(roomId);
    if (room === null) {
      console.log(`Room with id: ${roomId} does not exist!`);
      return;
    }
    if (room.client !== null) {
      console.log(`Room is full!`);
      return;
    }
    room.client = client;
  }

  get roomsArray() {
    return Array.from(this.rooms.values());
  }

  private handleSocketConnection(): void {
    this.socketIO.on("connect", (socketClient: SocketIO.Socket) => {
      socketClient.on("game-userJoined", (data) => {
        const user: User = {
          nickname: data.nickname,
          id: genId(),
          hosted: null,
        }
        this.socketIO.to(socketClient.id).emit("game-userId",
          {
            id: user.id,
            socketId: socketClient.id
          }
        );
        this.users.set(socketClient.id, user);
      });
      socketClient.on("game-roomsRequest", () => {
        this.socketIO.to(socketClient.id).emit("game-roomsRequestFullfilled", { rooms: this.roomsArray });
      });
      socketClient.on("game-roomJoinQuery", (data) => {
        const user = this.users.get(socketClient.id);
        if (user === undefined) return;
        const { roomId } = data;
        this.addClientToRoom(roomId, user);
        socketClient.join(roomId);
        this.socketIO.to(socketClient.id).emit("game-roomJoinResponse", { succes: true });
        socketClient.broadcast.to(roomId).emit("game-clientJoin");
      });
      socketClient.on("game-roomHostQuery", (data) => {
        const host = this.users.get(socketClient.id);
        if (host === undefined) return;
        const {
          roomName,
          gameType,
        } = data;
        const id = genId();
        const room: Room = {
          name: roomName,
          id,
          client: null,
          host,
          type: gameType,
        };
        this.addRoom(room);
        socketClient.join(id);
        this.socketIO.to(socketClient.id).emit("game-roomHostResponse", { roomId: id });
        this.socketIO.emit("game-roomsUpdate", { rooms: this.roomsArray });

        host.hosted = room.id;
      });
      socketClient.on("webrtc-offer", (data) => {
        socketClient.broadcast.to(data.roomId).emit("webrtc-offer", data);
      });
      socketClient.on("webrtc-answer", (data) => {
        socketClient.broadcast.to(data.roomId).emit("webrtc-answer", data);
      });
      socketClient.on("ICE-exhangeCandidates", (data) => {
        socketClient.broadcast.to(data.roomId).emit("ICE-exhangeCandidates", data.candidates);
      });
      socketClient.on("disconnect", () => {
        const user = this.users.get(socketClient.id);
        this.rooms.delete(user?.hosted || "");
        this.users.delete(socketClient.id);
        this.socketIO.emit("game-roomsUpdate", { rooms: this.roomsArray });
      })
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.port, () =>
      callback(this.port)
    );
  }
}
