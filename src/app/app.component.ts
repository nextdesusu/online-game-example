import { Component } from '@angular/core';
import { gameType, gameOption, hostEvent, loginEvent, MessageEvent, RoomSelectedEvent, Room } from "./types";

import Connection from "../connection";
import TicTacToe from "../games/tic-tac-toe";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private connection: Connection | null = null;
  private isHost: boolean = false;
  currentRoom: any | null = null;
  login: string | null = null;

  canvasParameters = { width: 600, height: 600 };

  gameOptions: Array<gameOption> = [
    { type: gameType.ticTacToe, name: "tic-tac-toe" }
  ];

  loginEvent(event: loginEvent) {
    this.login = event.login;
    const conn = new Connection(event.login);
    this.connection = conn;
  }

  messageSendEvent(event: MessageEvent) {
    console.log("sending msg", event);
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
    this.isHost = true;
  }

  canvasCreationEvent(canvas: HTMLCanvasElement): void {
    const { width } = this.canvasParameters;
    switch (this.currentRoom.type) {
      case gameType.ticTacToe:
        if (this.isHost) {
          return TicTacToe.host(this.connection, canvas, width);
        } else {
          return TicTacToe.join(this.connection, canvas, width);
        }
      default:
        throw `Unknown game type! ${this.currentRoom.type}`;
    }
  }
}
