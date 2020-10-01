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
  private context2D: CanvasRenderingContext2D | null = null;
  currentRoom: any | null = null;
  login: string | null = null;

  canvasParameters: { width: 500, height: 500 };

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
    console.log("room:", this.currentRoom);
  }

  canvasCreationEvent(ctx: CanvasRenderingContext2D): void {
    this.context2D = ctx;
    console.log("canvas created", ctx);
  }
}
