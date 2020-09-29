import io, { Socket as SocketValue } from 'socket.io-client';
import { hostEvent } from "../app/types";

const CONFIG = { iceServers: [{ urls: "stun:stun.1.google.com:19302" }] };
type Socket = typeof SocketValue;

export interface User {
  nickname: string;
  id: string;
}

export default class Connection {
  private socket: Socket;
  private user: User;
  private p2p: RTCPeerConnection;
  private channel: RTCDataChannel;
  private candidates: Array<any>;
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
      console.log("new rooms", data.rooms);
      this._rooms = data.rooms;
    });
    this.p2p = new RTCPeerConnection();
    this.channel = this.p2p.createDataChannel("game", { negotiated: true, id: 0 });
    this.channel.onopen = () => {
      this.channel.send("kekekeek1!!111");
      console.log("channel opened");
    };
    this.channel.onmessage = (e) => console.log(`messsage: > ${e.data}`);
    this.p2p.onconnectionstatechange = () => {
      console.log("connection state:", this.p2p.connectionState);
    }
    this.candidates = [];
    this.socket.on("ICE-candidate", (cnd) => {
      console.log("adding cnd:", cnd);
      this.candidates.push(cnd);
      //this.p2p.addIceCandidate(cnd);
    });
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

  private addAllGatheredCandidates(): void {
    for (const candidate of this.candidates) {
      this.p2p.addIceCandidate(candidate);
    }
    this.candidates = [];
  }

  async join(roomId: string) {
    this.p2p.onicecandidate = ({ candidate }) => {
      console.log("cnd:", candidate)
      if (candidate !== null) {
        this.socket.emit("ICE-candidate", { candidate, roomId });
      } else {
        this.addAllGatheredCandidates();
      }
    }
    this.socket.emit("game-roomJoinQuery", { roomId, user: this.user });
    this.socket.on("webrtc", async ({ webRtcData }) => {
      if (webRtcData.type === "offer") {
        await this.p2p.setRemoteDescription(webRtcData);
        const answer = await this.p2p.createAnswer();
        await this.p2p.setLocalDescription(answer);
        console.log("join sending answer:", answer);
        this.socket.emit("webrtc", {
          webRtcData: answer,
          roomId
        });
      } else {
        //this.p2p.setLocalDescription(webRtcData);
        throw `Shouldnt get answer!`;
      }
    })
  }

  async host(roomId: string) {
    this.socket.on("game-clientJoin", async () => {
      const offer = await this.p2p.createOffer();
      await this.p2p.setLocalDescription(offer);
      this.p2p.onicecandidate = ({ candidate }) => {
        console.log("cnd:", candidate)
        if (candidate === null) {
          this.socket.emit("webrtc", {
            webRtcData: offer,
            roomId
          });
          this.addAllGatheredCandidates();
        } else {
          this.socket.emit("ICE-candidate", { candidate, roomId });
        }
      }
    });
    this.socket.on("webrtc", async ({ webRtcData }) => {
      if (webRtcData.type === "offer") {
        throw `Shouldnt get offer!`;
      } else {
        console.log("host getting answer:", webRtcData);
        await this.p2p.setRemoteDescription(webRtcData);
      }
    });
  }
}
