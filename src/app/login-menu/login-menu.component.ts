import { Component, Output, EventEmitter } from '@angular/core';
import { loginEvent, onInputEvent } from "../types";

//const LOGIN_CHECK = /^\w{4,9}$/;

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.css']
})
export class LoginMenuComponent {
  mlabel: string = "login";
  errored: boolean = true;
  private loginValue: string = "";

  @Output() loginEvent: EventEmitter<loginEvent> = new EventEmitter<loginEvent>();

  constructor() { }

  getInput(event: onInputEvent): void {
    if (event.passedCheck) {
      this.errored = false;
      this.loginValue = event.value;
    } else {
      this.errored = true;
    }
  }

  submit() {
    if (!this.errored) {
      this.loginEvent.emit({
        login: this.loginValue,
        isCorrect: true
      });
    }
  }

  isErrored() {
    return this.errored;
  }
}
