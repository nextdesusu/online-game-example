import io, { Socket as SocketValue } from 'socket.io-client';
import { hostEvent } from "../app/types";

type Socket = typeof SocketValue;

export interface User {
  nickname: string;
  id: string;
}

interface messageToSend {
  text: string;
  date: Date;
  author: User;
}

export default class Connection {
  private socket: Socket;
  private user: User | null;
  private channel: RTCDataChannel | null;
  private p2p: RTCPeerConnection | null;
  private _rooms: Array<any>;
  constructor(userName: string) {
    this._rooms = [];
    this.user = null;
    this.channel = null;
    this.p2p = null;
    this.socket = io.connect(`${window.location.hostname}:3000`);
    this.initSocket(userName);

    this.createP2P();
    this.createDataChannel();
  }

  private initSocket(userName: string): void {
    this.socket.on("connect", () => {
      this.socket.emit("game-userIdFetched");
    });
    this.socket.on("game-userIdFullfilled", (data) => {
      this.user = {
        nickname: userName,
        id: data.id
      };
      this.fetchRooms();
    })
    const applyRooms = (data) => {
      this._rooms = data.rooms;
    }
    this.socket.on("game-roomsRequestFullfilled", applyRooms);
    this.socket.on("game-roomsUpdate", applyRooms);
  }

  private createP2P(): void {
    this.p2p = new RTCPeerConnection();
    this.p2p.onconnectionstatechange = () => {
      console.log("connection state:", this.p2p.connectionState);
    }
  }

  private createDataChannel(): void {
    if (this.p2p === null) {
      throw `P2P is null!`;
    }
    this.channel = this.p2p.createDataChannel("game", { negotiated: true, id: 0 });
    this.channel.onmessage = (e) => console.log(`messsage: > ${e.data}`);
    //this.channel.onopen = () => {console.log("channel opened");};
  }

  private fetchRooms(): void {
    this.socket.emit("game-roomsRequest");
  }

  private setCndExhanger(roomId: string) {
    const candidates = [];
    this.p2p.onicecandidate = ({ candidate }) => {
      if (candidate !== null) {
        candidates.push(candidate);
      } else {
        this.socket.emit("ICE-exhangeCandidates", { candidates, roomId });
      }
    }
    this.socket.on("ICE-exhangeCandidates", (exchangedCandidates) => {
      for (const candidate of exchangedCandidates) {
        this.p2p.addIceCandidate(candidate);
      }
    });
  }

  get rooms() {
    return this._rooms;
  }

  sendMessage(msgData: { text: string, date: Date }) {
    const msg: messageToSend = {
      ...msgData,
      author: this.user,
    };
    const stringified = JSON.stringify(msg);
    console.log("sending:", stringified);
    this.channel.send(`m:${stringified}`);
  }

  createRoom(event: hostEvent, onCreationCb: (roomId: string) => void) {
    this.socket.emit("game-roomHostQuery", { roomName: event.name, gameType: event.type, host: this.user });
    this.socket.on("game-roomHostResponse", (data) => {
      onCreationCb(data.roomId);
    });
    this.fetchRooms();
  }

  async join(roomId: string) {
    this.setCndExhanger(roomId);
    this.socket.emit("game-roomJoinQuery", { roomId, user: this.user });
    this.socket.on("webrtc-offer", async ({ webRtcData }) => {
      await this.p2p.setRemoteDescription(webRtcData);
      const answer = await this.p2p.createAnswer();
      await this.p2p.setLocalDescription(answer);
      this.socket.emit("webrtc-answer", {
        webRtcData: answer,
        roomId
      });
    });
  }

  async host(roomId: string) {
    this.setCndExhanger(roomId);
    this.socket.on("game-clientJoin", async () => {
      const offer = await this.p2p.createOffer();
      await this.p2p.setLocalDescription(offer);
      this.socket.emit("webrtc-offer", {
        webRtcData: offer,
        roomId
      });
    });
    this.socket.on("webrtc-answer", async ({ webRtcData }) => {
      await this.p2p.setRemoteDescription(webRtcData);
    });
  }
}
