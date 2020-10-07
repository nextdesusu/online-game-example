import { gameArgs, strCb } from "../types";

const enum Figure {
  e,
  x,
  o
};

type TicTacToeRow = [Figure, Figure, Figure];

type TicTacToeState = [
  TicTacToeRow,
  TicTacToeRow,
  TicTacToeRow
];

const getRow = (): TicTacToeRow => [Figure.e, Figure.e, Figure.e];
const getInitialState = (): TicTacToeState => [getRow(), getRow(), getRow()];

export default class TicTacToe {
  private _state: TicTacToeState = getInitialState();
  private _currentFigure: Figure = Figure.x;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private _cellSize: number;
  private _winner: Figure = Figure.e;
  private endCb: strCb;
  constructor(ctx, size, endCb) {
    this.ctx = ctx;
    this.size = size;
    this._cellSize = Math.floor(size / 3);
    this.endCb = endCb;
  }

  get winner(): Figure {
    return this._winner;
  }

  get state() {
    return this._state;
  }

  get currentFigure() {
    return this._currentFigure;
  }

  get cellSize() {
    return this._cellSize;
  }

  static host({connection, canvasNode, size, endCb}: gameArgs): void {
    console.log("host node:", canvasNode);
    const ctx = canvasNode.getContext("2d");
    const game = new TicTacToe(ctx, size, endCb);
    const hostFigure = Figure.x;

    canvasNode.addEventListener("click", (event: any) => {
      if (game.currentFigure !== hostFigure) return;
      const x = Math.floor(event.offsetX / game.cellSize) % size;
      const y = Math.floor(event.offsetY / game.cellSize) % size;
      console.log("host x: " + x + " y: " + y);
      game.makeMove(x, y);
      const data = JSON.stringify(game.state);
      connection.sendGameData(data);
    });

    connection.setGameDataCb((gameData: any) => {
      if (game.currentFigure === hostFigure) return;
      console.log("tictactoe host: gameData", gameData);
      const parsed = JSON.parse(gameData.data);
      if (!parsed) return;
      const [x, y] = parsed;
      game.makeMove(x, y);
      const data = JSON.stringify(game.state);
      connection.sendGameData(data);
    });

    game.start();
  }

  static join({connection, canvasNode, size, endCb}: gameArgs): void {
    const ctx = canvasNode.getContext("2d");
    const game = new TicTacToe(ctx, size, endCb);
    const clientFigure = Figure.o;

    canvasNode.addEventListener("click", (event: any) => {
      if (game.currentFigure !== clientFigure) return;
      const x = Math.floor(event.offsetX / game.cellSize) % size;
      const y = Math.floor(event.offsetY / game.cellSize) % size;
      const data = JSON.stringify([x, y]);
      connection.sendGameData(data);
    });

    connection.setGameDataCb((gameData: any) => {
      console.log("tictactoe join: gameData", gameData);
      const parsed = JSON.parse(gameData.data);
      if (!parsed) return;
      game.applyHostReponse(parsed);
    });

    game.start();
  }

  start() {
    this.redrawCtx();
  }

  private checkForWinner(): void {
    if (this._winner !== Figure.e) return;
    const board = this._state;
    for (let i = 0; i < 3; i += 1) {
      if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        this._winner = board[i][0];
      }
      if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
        this._winner = board[0][i];
      }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      this._winner = board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      this._winner = board[0][2];
    }
    if (this._winner !== Figure.e) {
      this.endCb(this._winner === Figure.x ? "x" : "o");
    }
  }

  private drawX(xStart, yStart, xEnd, yEnd, padding) {
    this.ctx.strokeStyle = "blue";
    this.ctx.beginPath();

    this.ctx.moveTo(xStart + padding, yStart + padding);
    this.ctx.lineTo(xEnd - padding, yEnd - padding);

    this.ctx.moveTo(xEnd - padding, yStart + padding);
    this.ctx.lineTo(xStart + padding, yEnd - padding);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private drawO(x, y, radius) {
    this.ctx.strokeStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private redrawCtx(): void {
    const padding = 10;
    const radius = Math.floor(this.cellSize / 2) - padding;

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.size, this.size);
    for (let y = 0; y < this._state.length; y += 1) {
      const row = this._state[y];
      for (let x = 0; x < row.length; x += 1) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "black";
        const xStart = x * this.cellSize;
        const xEnd = (x + 1) * this.cellSize;
        const yStart = y * this.cellSize;
        const yEnd = (y + 1) * this.cellSize;
        this.ctx.rect(xStart, yStart, xEnd, yEnd);
        this.ctx.stroke();
        this.ctx.closePath();

        const figure = this._state[x][y];
        this.ctx.lineWidth = 3;
        switch (figure) {
          case Figure.x:
            this.drawX(xStart, yStart, xEnd, yEnd, padding);
            break;
          case Figure.o:
            const middleX = Math.floor((xEnd + xStart) / 2);
            const middleY = Math.floor((yEnd + yStart) / 2);
            this.drawO(middleX, middleY, radius);
            break;
          default:
            continue;
        }
      }
    }
  }

  private endTurn(): void {
    if (!this._winner) {
      this._currentFigure = this._currentFigure === Figure.x ? Figure.o : Figure.x;
      this.checkForWinner();
    }
  }

  applyHostReponse(state: TicTacToeState) {
    this._state = state;
    this.endTurn()
    this.redrawCtx();
    console.log("getHostReponse:", state)
  }

  makeMove(i: number, j: number): boolean {
    const stateValue = this._state[i][j];
    if (stateValue !== Figure.e) return false;
    this._state[i][j] = this._currentFigure;
    this.endTurn();
    this.redrawCtx();
    return true;
  }

  flush() {
    console.log("randomizig...");
    const rf = () => Math.random() > 0.5 ? Figure.x : Figure.o;

    for (let i = 0; i < this._state.length; i += 1) {
      this._state[i] = [rf(), rf(), rf()];
    }
  }
}
