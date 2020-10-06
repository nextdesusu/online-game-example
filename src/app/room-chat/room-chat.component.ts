import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MessageEvent } from "../types";

interface RoomChatProps {
  messages: Array<any>;
  disabled?: boolean;
}

@Component({
  selector: 'app-room-chat',
  templateUrl: './room-chat.component.html',
  styleUrls: ['./room-chat.component.css']
})
export class RoomChatComponent {
  private message: string = "";
  @Input() props: RoomChatProps;
  @Output() onMessageSend: EventEmitter<MessageEvent> = new EventEmitter<MessageEvent>();
  constructor() { }
  getInput(event: any): void {
    this.message = event.value;
  }
  submit(): void {
    const text = this.message.trim();
    if (text !== "") {
      this.onMessageSend.emit({
        text,
        date: new Date()
      });
    }
    this.message = "";
  }
}
