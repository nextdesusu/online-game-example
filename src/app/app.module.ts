import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameCanvasComponent } from './game-canvas/game-canvas.component';
import { InputComponent } from './input/input.component';
import { ButtonComponent } from './button/button.component';
import { HostMenuComponent } from './host-menu/host-menu.component';
import { JoinMenuComponent } from './join-menu/join-menu.component';
import { LoginMenuComponent } from './login-menu/login-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    GameCanvasComponent,
    InputComponent,
    ButtonComponent,
    HostMenuComponent,
    JoinMenuComponent,
    LoginMenuComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
