import { Component, Output, Input, EventEmitter } from '@angular/core';
import { gameType, hostEvent, gameOption, onInputEvent } from "../types";

@Component({
  selector: 'app-host-menu',
  templateUrl: './host-menu.component.html',
  styleUrls: ['./host-menu.component.css']
})
export class HostMenuComponent {
  private input: string = "";
  private id: gameType = gameType.ticTacToe;
  @Input() gameOptions: Array<gameOption>;
  @Output() roomHostedEvent: EventEmitter<hostEvent> = new EventEmitter<hostEvent>();
  constructor() { }
  getInput(event: onInputEvent) {
    if (event.passedCheck) {
      this.input = event.value;
    }
  }

}
