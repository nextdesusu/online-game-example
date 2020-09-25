import express, { Application } from "express";
import socketIO, { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

const genP = (): String => Math.random().toString().slice(4);
const genId = (): string => `${genP()}-${genP()}-${genP()}-${genP()}`;

interface User {
  nickname: string;
  id: string;
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
  private rooms: Array<Room>;

  constructor(port: number) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.socketIO = new socketIO(this.httpServer);
    this.port = port;
    this.rooms = [];
    this.handleSocketConnection();
  }

  private addRoom(room: Room): void {
    this.rooms.push(room);
  }

  private addClientToRoom(roomId: string, client: User): void {
    const room = this.rooms.find((room: Room) => room.id === roomId);
    if (room === undefined) {
      console.log(`Room with id: ${roomId} does not exist!`);
      return;
    }
    if (room.client !== null) {
      console.log(`Room is full!`);
      return;
    }
    room.client = client;
  }

  private handleSocketConnection(): void {
    this.socketIO.on("connect", (socketClient: SocketIO.Socket) => {
      socketClient.on("game-userIdFetched", () => {
        this.socketIO.to(socketClient.id).emit("game-userIdFullfilled", { id: genId() });
      })
      socketClient.on("game-roomsRequest", () => {
        this.socketIO.to(socketClient.id).emit("game-roomsRequestFullfilled", { rooms: this.rooms });
      });
      socketClient.on("game-roomHostQuery", (data) => {
        const {
          roomName,
          gameType,
          host
        } = data;
        const id = genId();
        const room: Room = {
          name: roomName,
          id,
          client: null,
          host,
          type: gameType,
        }
        this.addRoom(room);
        this.socketIO.to(socketClient.id).emit("game-roomHostResponse", { roomId: id });
      });
      socketClient.on("game-host", (data) => {
        console.log("game-host", data);
      });
      socketClient.on("game-join", (data) => {
        console.log("game-join", data);
        const {
          roomId,
          client
        } = data;
        this.addClientToRoom(roomId, client);
      });
      /*
      socket.on("channel", (data): void => {
        socket.join(data.channel);
        socket.to(data.channel).emit("new-user", { socketId: socket.id });
      });
      socket.on("webrtc", (data) => {
        console.log("type", data.webRtcData.type);
        socket.to(data.channel).emit("webrtc", data);
      });
      socket.on("ICE-message", (data) => {
        socket.to(data.channel).emit("ICE-message", data);
      })
      socket.on("disconnect", (data) => {

      });
      */
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.port, () =>
      callback(this.port)
    );
  }
}
