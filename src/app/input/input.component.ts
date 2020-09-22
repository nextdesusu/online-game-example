import { Component, Input, Output, EventEmitter } from '@angular/core';

interface InputComponentProps {
  label: string;
}

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']

})
export class InputComponent {
  @Input() props: InputComponentProps;
  @Output() inputEvent: EventEmitter<string> = new EventEmitter<string>();
  constructor() { }

  getInput(event: any) {
    this.inputEvent.emit(event.target.value);
  }
}
