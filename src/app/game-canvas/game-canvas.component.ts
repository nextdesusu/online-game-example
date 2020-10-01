import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';

type canvasCtxEventEmitter = EventEmitter<CanvasRenderingContext2D>;

@Component({
  selector: 'app-game-canvas',
  templateUrl: './game-canvas.component.html',
  styleUrls: ['./game-canvas.component.css']
})
export class GameCanvasComponent implements OnInit {
  @Input() props: { width: number, height: number };
  @Output() canvasCreation: canvasCtxEventEmitter = new EventEmitter<CanvasRenderingContext2D>();
  @ViewChild("canvasNode", { static: true }) canvasNode: ElementRef;
  constructor() { }

  ngOnInit(): void {
    const canvasNode = this.canvasNode.nativeElement;
    if (canvasNode) {
      const {
        width,
        height
      } = this.props;
      canvasNode.width = width;
      canvasNode.height = height;
      const ctx = canvasNode.getContext('2d');
      this.canvasCreation.emit(ctx);
    } else {
      throw "Unexpected error canvas node is unacessible!";
    }
  }

}
