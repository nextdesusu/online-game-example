type TicTacToeState = [
  Figure, Figure, Figure,
  Figure, Figure, Figure,
  Figure, Figure, Figure
];

const enum Figure {
  e,
  x,
  o
};

const getInitialState = (): any => new Array(9).fill(Figure.e);

export default class TicTacToe {
  private _state: TicTacToeState = getInitialState();
  private _currentFigure: Figure = Figure.x;
  private ctx: any;
  private size: number;
  private cellSize: number;
  constructor(ctx, size) {
    this.ctx = ctx;
    this.size = size;
    this.cellSize = Math.floor(size / 9);
    this.redrawCtx();
  }

  isOver(): boolean {
    return false;
  }

  private redrawCtx(): void {
    let xMult = 0, yMult = 0;
    this.ctx.strokeStyle = "black";
    this.ctx.fillStyle = "white";
    for (const fgr of this._state) {
      const xStart = xMult * this.cellSize;
      const xEnd = (xMult + 1) * this.cellSize;
      const yStart = yMult * this.cellSize;
      const yEnd = (yMult + 1) * this.cellSize;

      this.ctx.rect(xStart, yStart, xEnd, yEnd);
      this.ctx.stroke();
    }
  }

  get state() {
    return this._state;
  }

  get currentFigure() {
    return this._currentFigure;
  }

  makeMove(x: number, y: number): boolean {
    const stateValue = this._state[y * 3 + x];
    if (stateValue !== Figure.e) return false;
    const figure = this._currentFigure;
    this._state[y * 3 + x] = figure;
    this._currentFigure = figure === Figure.x ? Figure.o : Figure.x;
    this.redrawCtx();
    return true;
  }
}
