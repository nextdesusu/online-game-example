import io, { Socket as SocketValue } from 'socket.io-client';
type Socket = typeof SocketValue;

const genP = (): String => Math.random().toString().slice(4);
const genId = (): string => `${genP()}-${genP()}-${genP()}-${genP()}`;

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

export class Connection {
  private socket: Socket;
  private user: User;
  private connection: RTCPeerConnection;
  private channel: any | null;
  constructor(userName: string, roomsCb: any) {
    this.socket = io.connect(`${window.location.hostname}:3000`);
    this.socket.on("connect", () => {
      this.socket.emit("game-roomsRequest");
    });
    this.socket.on("game-roomsRequestFullfilled", (data) => {
      console.log("rooms:", data.rooms);
      roomsCb(data.rooms);
    });

    this.user =  {
      nickname: userName,
      id: genId()
    };

    this.channel = null;
  }

  async host() {
    const localConnection = new RTCPeerConnection();

    //const sendChannel = localConnection.createDataChannel(`channel: ${roomName}`);
    const offer = await localConnection.createOffer();
    this.socket.emit("webrtc", offer);

    this.connection = localConnection;
  }

  createRoom(roomName: string) {
    //this.socket.emit();
  }
}

export { establishedConnection, User, connArgs };
