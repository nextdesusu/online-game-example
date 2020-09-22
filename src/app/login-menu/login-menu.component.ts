import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.css']
})
export class LoginMenuComponent implements OnInit {
  mlabel = "login";
  constructor() {}

  ngOnInit(): void {
  }

  getInput(event: any) {
    console.log("get input:", event);
  }

}
