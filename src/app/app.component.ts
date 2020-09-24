import { Component, OnInit } from '@angular/core';
import { gameType, gameOption } from "./types";
//import { initConnection, establishedConnection } from "../connection";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private roomId: string | null = null;
  login: string | null = null;

  gameOptions: Array<gameOption> = [
    { type: gameType.ticTacToe, name: "tic-tac-toe" }
  ];

  ngOnInit(): void {
  }

  loginEvent(event: any) {
    this.login = event.login;
    console.log("login:", this.login);
  }

  roomSelectedEvent(event: string) {
    this.roomId = event;
    console.log("roomId:", this.roomId);
  }
}
