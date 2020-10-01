import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-join-menu',
  templateUrl: './join-menu.component.html',
  styleUrls: ['./join-menu.component.css']
})
export class JoinMenuComponent {
  @Input() rooms: Array<any>;
  @Output() roomJoinEvent: EventEmitter<string> = new EventEmitter<any>();
  constructor() { }

  onClick(event: any): void {
    const id: any | null = event.target.getAttribute("data-room-id");
    if (id === null) return;
    const room = this.rooms.find((room) => room.id === id);
    if (room) {
      this.roomJoinEvent.emit(room);
    }
  }
}
