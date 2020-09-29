import { Component, OnInit } from '@angular/core';
import { gameType, gameOption, hostEvent } from "./types";
import Connection from "../connection";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private connection: Connection | null = null;
  roomId: string | null = null;
  login: string | null = null;

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

  roomSelectedEvent(event: string) {
    this.roomId = event;
    this.connection.join(event);
    //console.log("roomId:", this.roomId);
  }

  roomHostedEvent(event: hostEvent) {
    this.connection.createRoom(event, (roomId) => {
      this.roomId = roomId;
      this.connection.host(roomId);
    });
  }
}
