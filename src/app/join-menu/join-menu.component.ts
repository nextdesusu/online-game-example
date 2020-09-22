import { Component, OnInit, Input } from '@angular/core';

interface JoinMenuProps {
  rooms: Array<any>;
  menuJoinCb: () => void;
}

@Component({
  selector: 'app-join-menu',
  templateUrl: './join-menu.component.html',
  styleUrls: ['./join-menu.component.css']
})
export class JoinMenuComponent implements OnInit {
  @Input() props: JoinMenuProps;
  constructor() { }

  ngOnInit(): void {
  }

}
