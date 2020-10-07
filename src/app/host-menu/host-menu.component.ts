import { Component, Output, Input, EventEmitter } from '@angular/core';
import { gameType, hostEvent, gameOption, onInputEvent } from "../types";

@Component({
  selector: 'app-host-menu',
  templateUrl: './host-menu.component.html',
  styleUrls: ['./host-menu.component.css']
})
export class HostMenuComponent {
  private input: string = "";
  private gameId: gameType = gameType.ticTacToe;
  @Input() gameOptions: Array<gameOption>;
  @Output() roomHostedEvent: EventEmitter<hostEvent> = new EventEmitter<hostEvent>();
  errored: boolean = true;
  constructor() { }
  getInput(event: onInputEvent) {
    if (event.passedCheck) {
      this.input = event.value;
      this.errored = false;
    } else {
      this.errored = true;
    }
  }

  getName(event: any) {
    this.gameId = Number(event.target.value);
    console.log("gameId:", this.gameId);
  }

  onClick() {
    this.roomHostedEvent.emit({
      name: this.input,
      type: this.gameId
    });
  }

}
