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

const initConnection = (userName): establishedConnection => {
  const socket = io.connect("http://localhost:3000");
  const user: User = {
    nickname: userName,
    id: genId()
  }
  return {
    user,
    socket
  }
}

const onDataChannel = (a: any) => {
  console.log(`a: ${a}`);
}

const host = async (args: connArgs) => {
  const localConnection = new RTCPeerConnection();
  const sendChannel = localConnection.createDataChannel(`channel: ${args.roomId}`);
/*
  const socket = spawnSocket();
  const offer = await localConnection.createOffer();

  socket.emit("webrtc", offer);
  //socket.on("webrtc", )
  */
}

const join = async (args: connArgs) => {
  const remoteConnection = new RTCPeerConnection();
  remoteConnection.ondatachannel = onDataChannel;
/*
  const socket = spawnSocket();
  socket.on("webrtc", (data) => {
    console.log("d:", data);
  })
  */
}

export { initConnection, host, join, establishedConnection, User, connArgs };
