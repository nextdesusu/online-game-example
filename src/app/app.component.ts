import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  socket: WebSocket;
  ngOnInit(): void {
    const socket = new WebSocket("wss://127.0.0.1:3001");
    socket.onopen = () => {
      console.log("onopen")
      socket.send("player joined!");
    }
    socket.onmessage = () => {
      console.log("onmessage")
    }
    socket.onerror = () => {
      console.log("onerror")
    }
    socket.onclose = () => {
      console.log("onclose")
    }

    this.socket = socket;
  }
}
