import io, { Socket as SocketValue } from 'socket.io-client';
import { hostEvent } from "../app/types";
type Socket = typeof SocketValue;

interface User {
  nickname: string;
  id: string;
}

interface connArgs {
  userName: string;
  roomId: string;
}

interface establishedConnection {
  user: User;
  socket: Socket;
}

export default class Connection {
  private socket: Socket;
  private user: User;
  private connection: RTCPeerConnection;
  private channel: any | null;
  //private roomsUpdateCb: (rooms: Array<any>) => void;
  private _rooms: Array<any>;
  constructor(userName: string) {
    this._rooms = [];
    this.socket = io.connect(`${window.location.hostname}:3000`);
    this.socket.on("connect", (data) => {
      this.socket.emit("game-userIdFetched");
    });
    this.socket.on("game-userIdFullfilled", (data) => {
      this.user = {
        nickname: userName,
        id: data.id
      };
      console.log("user:", this.user);
      this.fetchRooms();
    })
    this.socket.on("game-roomsRequestFullfilled", (data) => {
      //this.roomsUpdateCb(data.rooms);
      console.log("new rooms", data.rooms);
      this._rooms = data.rooms;
    });

    this.channel = null;
  }

  private fetchRooms(): void {
    this.socket.emit("game-roomsRequest");
  }

  get rooms() {
    return this._rooms;
  }

  createRoom(event: hostEvent, onCreationCb: (roomId: string) => void) {
    this.socket.emit("game-roomHostQuery", { roomName: event.name, gameType: event.type, host: this.user });
    this.socket.on("game-roomHostResponse", (data) => {
      onCreationCb(data.roomId);
    });
    this.fetchRooms();
  }

  async host() {
    const localConnection = new RTCPeerConnection();

    //const sendChannel = localConnection.createDataChannel(`channel: ${roomName}`);
    const offer = await localConnection.createOffer();
    this.socket.emit("webrtc", offer);

    this.connection = localConnection;
  }
}

export { establishedConnection, User, connArgs };
