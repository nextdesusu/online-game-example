import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameCanvasComponent } from './game-canvas/game-canvas.component';
import { HostMenuComponent } from './host-menu/host-menu.component';
import { JoinMenuComponent } from './join-menu/join-menu.component';
import { LoginMenuComponent } from './login-menu/login-menu.component';
import { InputComponent } from './input/input.component';
import { RoomChatComponent } from './room-chat/room-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    GameCanvasComponent,
    HostMenuComponent,
    JoinMenuComponent,
    LoginMenuComponent,
    InputComponent,
    RoomChatComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
