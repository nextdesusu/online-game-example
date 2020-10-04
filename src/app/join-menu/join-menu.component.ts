import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Room, RoomSelectedEvent } from "../types";

@Component({
  selector: 'app-join-menu',
  templateUrl: './join-menu.component.html',
  styleUrls: ['./join-menu.component.css']
})
export class JoinMenuComponent {
  @Input() rooms: Array<Room>;
  @Output() roomJoinEvent: EventEmitter<RoomSelectedEvent> = new EventEmitter<RoomSelectedEvent>();
  constructor() { }

  onClick(event: any): void {
    const id: string | null = event.target.getAttribute("data-room-id");
    if (id === null) return;
    const room = this.rooms.find((room: Room) => room.id === id);
    if (room) {
      this.roomJoinEvent.emit({ room });
    }
  }
}
