import { Component, OnInit } from '@angular/core';
import { initConnection, establishedConnection } from "../connection";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    const connection: establishedConnection = initConnection(`User: ${Math.random().toString()}`);
    connection.socket.on("connect", () => {
      connection.socket.emit("game-roomsRequest");
    });
    connection.socket.on("game-roomsRequestFullfilled", (data) => {
      console.log("rooms:", data.rooms);
    });
  }
}
