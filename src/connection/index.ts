import io, { Socket as SocketValue } from 'socket.io-client';
import { hostEvent, Room } from "../app/types";

type Socket = typeof SocketValue;

type cbType = (arg: any) => void;

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
  private _rooms: Array<Room>;
  private _mesages: Array<any>;
  private _connectionEstablished: boolean = false;
  private gameDataCb: cbType | null;
  constructor(userName: string) {
    this._rooms = [];
    this._mesages = [];
    this.user = null;
    this.channel = null;
    this.p2p = null;
    this.socket = io.connect(`${window.location.hostname}:3000`);
    this.initSocket(userName);

    this.createP2P();
    this.createDataChannel();
  }

  setGameDataCb(cb: cbType) {
    this.gameDataCb = cb;
  }

  private initSocket(userName: string): void {
    this.socket.on("connect", () => {
      this.socket.emit("game-userJoined", { nickname: userName });
    });
    this.socket.on("game-userId", (data) => {
      this.user = {
        nickname: userName,
        id: data.id
      };
      this.fetchRooms();
    })
    const applyRooms = (data) => {
      console.log("applyRooms -> data:", data);
      this._rooms = data.rooms;
    }
    this.socket.on("game-roomsRequestFullfilled", applyRooms);
    this.socket.on("game-roomsUpdate", applyRooms);
  }

  private createP2P(): void {
    this.p2p = new RTCPeerConnection();
    this.p2p.onconnectionstatechange = () => {
      if (this.p2p.connectionState === "connected") {
        this._connectionEstablished = true;
      }
      console.log("connection state:", this.p2p.connectionState);
    }
  }

  private createDataChannel(): void {
    if (this.p2p === null) {
      throw `P2P is null!`;
    }
    this.channel = this.p2p.createDataChannel("game", { negotiated: true, id: 0 });
    this.channel.onopen = () => {
      const stringified = JSON.stringify(this.user);
      //console.log("sending:", stringified);
      this.channel.send(`p#${stringified}`);
    };
    this.channel.onmessage = (event: any) => {
      console.log("raw msg:", event.data);
      const codeChar = event.data[0];
      const msg = JSON.parse(event.data.slice(2)) || {};
      switch (codeChar) {
        case "m":
          this._mesages.push(msg);
          console.log(`messsage: ${msg}`);
          break;
        case "p":
          console.log(`player joined! ${msg}`);
          break;
        case "g":
          console.log(`game data arrived: ${msg}`);
          if (this.gameDataCb !== null) {
            this.gameDataCb(msg);
          }
          break;
        default:
          console.log(`unkown message type, message is: ${msg}`);
      }
    }
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

  get messages() {
    return this._mesages;
  }

  get connectionEstablished() {
    return this._connectionEstablished;
  }

  sendMessage(msgData: { text: string, date: Date }) {
    const msg: messageToSend = {
      ...msgData,
      author: this.user,
    };
    this._mesages.push(msg);
    const stringified = JSON.stringify(msg);
    //console.log("sending:", stringified);
    this.channel.send(`m#${stringified}`);
  }

  sendGameData(data: string): void {
    const stringified = JSON.stringify({ user: this.user, data });
    this.channel.send(`g#${stringified}`);
  }

  createRoom(event: hostEvent, onCreationCb: (roomId: string) => void) {
    this.socket.emit("game-roomHostQuery", { roomName: event.name, gameType: event.type });
    this.socket.on("game-roomHostResponse", (data) => {
      onCreationCb(data.roomId);
    });
    this.fetchRooms();
  }

  async join(roomId: string) {
    this.setCndExhanger(roomId);
    this.socket.emit("game-roomJoinQuery", { roomId });
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
