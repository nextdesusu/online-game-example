import { Component, OnInit } from '@angular/core';
import { gameType, gameOption, hostEvent, MessageEvent } from "./types";

import Connection from "../connection";
import TicTacToe from "../games/tic-tac-toe";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private connection: Connection | null = null;
  private isHost: boolean = false;
  currentRoom: any | null = null;
  login: string | null = null;

  canvasParameters = { width: 600, height: 600 };

  gameOptions: Array<gameOption> = [
    { type: gameType.ticTacToe, name: "tic-tac-toe" }
  ];

  ngOnInit(): void {
  }

  loginEvent(event: any) {
    this.login = event.login;
    const conn = new Connection(event.login);
    this.connection = conn;
  }

  messageSendEvent(event: MessageEvent) {
    console.log("sending msg", event);
    this.connection.sendMessage(event);
  }

  roomSelectedEvent(event: any) {
    this.currentRoom = event;
    this.connection.join(event.id);
    this.isHost = false;
    console.log("room:", this.currentRoom);
    //console.log("roomId:", this.roomId);
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
    console.log("room:", this.currentRoom);
  }

  canvasCreationEvent(canvas: HTMLCanvasElement): void {
    console.log()
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
