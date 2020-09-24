import { Component, Output, Input, EventEmitter } from '@angular/core';
import { onInputEvent, InputProps } from "../types";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Output() onInput: EventEmitter<onInputEvent> = new EventEmitter<onInputEvent>();
  @Input() props: InputProps;
  errored: boolean = false;
  constructor() { }
  getInput(event: any) {
    const text: string = event.target.value;
    const regExp = this.props?.pattern ? `^${this.props.pattern}$` : "";
    if (text.match(regExp)) {
      this.errored = false;
      this.onInput.emit({
        passedCheck: true,
        value: text
      });
    } else {
      this.errored = true;
      this.onInput.emit({
        passedCheck: false,
        value: text
      });
    }
  }

}
