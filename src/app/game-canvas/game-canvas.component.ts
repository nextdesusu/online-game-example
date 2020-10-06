import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';

type canvasCtxEventEmitter = EventEmitter<HTMLCanvasElement>;

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.css']
})
export class GameCanvasComponent implements OnInit {
  @Input() props: { width: number, height: number, isOverlapped: boolean };
  @Output() canvasCreation: canvasCtxEventEmitter = new EventEmitter<HTMLCanvasElement>();
  @ViewChild("canvasNode", { static: true }) canvasNode: ElementRef;
  constructor() { }

  ngOnInit(): void {
    const canvasNode = this.canvasNode.nativeElement;
    console.log("props:", this.props);
    if (canvasNode) {
      const {
        width,
        height
      } = this.props;
      canvasNode.width = width;
      canvasNode.height = height;
      this.canvasCreation.emit(canvasNode);
    } else {
      throw "Unexpected error canvas node is unacessible!";
    }
  }

}
