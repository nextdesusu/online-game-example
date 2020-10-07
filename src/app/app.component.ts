import { Component } from '@angular/core';
import { gameType, gameOption, hostEvent, loginEvent, MessageEvent, RoomSelectedEvent, Room } from "./types";

import Connection from "../connection";
import TicTacToe from "../games/tic-tac-toe";
import PaddleBall from "../games/paddle_ball";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private connection: Connection | null = null;
  private isHost: boolean = false;
  wonBy: string = "";
  currentRoom: any | null = null;
  login: string | null = null;

  canvasParameters = { width: 600, height: 600 };

  gameOptions: Array<gameOption> = [
    { type: gameType.ticTacToe, name: "tic-tac-toe" },
    { type: gameType.paddleBall, name: "paddle ball" },
  ];

  loginEvent(event: loginEvent) {
    this.login = event.login;
    const conn = new Connection(event.login);
    this.connection = conn;
  }

  messageSendEvent(event: MessageEvent) {
    this.connection.sendMessage(event);
  }

  roomSelectedEvent(event: RoomSelectedEvent) {
    this.currentRoom = event.room;
    this.connection.join(this.currentRoom.id);
    this.isHost = false;
  }

  roomHostedEvent(event: hostEvent) {
    this.connection.createRoom(event, (roomId) => {
      this.connection.host(roomId);
      this.currentRoom = {
        ...event,
        id: roomId
      }
    });
    console.log("game is:", this.currentRoom);
    this.isHost = true;
  }

  get canvasText() {
    return this.wonBy === '' ? 'Wait for other player!' : `Winner: ${this.wonBy}`;
  }

  canvasCreationEvent(canvas: HTMLCanvasElement): void {
    const { width } = this.canvasParameters;
    const cb = (arg: string) => {
      console.log("game won by:", arg);
      this.wonBy = arg;
    }
    const args = {
      connection: this.connection,
      canvasNode: canvas,
      size: width,
      endCb: cb
    };
    let currentGame = null;
    console.log("this.currentRoom.type:", this.currentRoom.type)
    switch (this.currentRoom.type) {
      case gameType.ticTacToe:
        currentGame = TicTacToe;
        break;
      case gameType.paddleBall:
        console.log("paddleBall");
        currentGame = PaddleBall;
        break;
      default:
        throw `Unknown game type! ${this.currentRoom.type}`;
    }
    if (this.isHost) {
      currentGame.host(args);
    } else {
      currentGame.join(args);
    }
  }
}
