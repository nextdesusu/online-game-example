import { gameArgs, strCb } from "../types";

interface Point {
  x: number;
  y: number;
}

const enum paddleState {
  stand,
  goingLeft,
  goingRight
}

const PADDLE_SIZE: Point = { x: 100, y: 20 };
const BALL_RADIUS = 20;

export default class PaddleBall {
  private selfP: Point;
  private opP: Point;
  private ballPos: Point;
  private ctx: CanvasRenderingContext2D;
  private boardSize: number;
  private endCb: strCb;
  private selfPState: paddleState;
  private isHost: boolean;
  constructor(ctx: CanvasRenderingContext2D, boardSize: number, endCb: strCb, isHost: boolean) {
    this.ctx = ctx;
    this.boardSize = boardSize;
    this.endCb = endCb;
    this.selfPState = paddleState.stand;
    this.isHost = isHost;

    const middle = Math.floor(boardSize / 2);
    const clientX = boardSize - PADDLE_SIZE.x;
    const clientY = boardSize - PADDLE_SIZE.y;

    this.ballPos = { x: middle, y: middle };
    if (isHost) {
      this.selfP = { x: 0, y: 0};
      this.opP = { x: clientX, y: clientY };
    } else {
      this.selfP = { x: clientX, y: clientY };
      this.opP = { x: 0, y: 0};
    }
  }

  static host({connection, canvasNode, size, endCb}: gameArgs) {
    console.log("host node:", canvasNode);
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall(ctx, size, endCb, true);

    canvasNode.addEventListener("click", (event: any) => {
      /*
      const data = JSON.stringify(game.state);
      connection.sendGameData(data);
      */
    });

    connection.setGameDataCb((gameData: any) => {
      /*
      const parsed = JSON.parse(gameData.data);
      if (!parsed) return;
      const [x, y] = parsed;
      game.makeMove(x, y);
      const data = JSON.stringify(game.state);
      connection.sendGameData(data);
      */
    });

    game.start();
  }

  static join({connection, canvasNode, size, endCb}: gameArgs) {
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall(ctx, size, endCb, false);

    canvasNode.addEventListener("click", (event: any) => {
      /*
      const data = JSON.stringify([x, y]);
      connection.sendGameData(data);
      */
    });

    connection.setGameDataCb((gameData: any) => {
      //apply host respsone
    });

    game.start();
  }

  start() {
    this.update();
  }

  private drawBall() {
    const { x, y } = this.ballPos;
    this.ctx.fillStyle = "red";
    this.ctx.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }

  private drawPaddles() {
    this.ctx.fillStyle = "blue";

    const { x, y } = this.selfP;
    const endX = x + PADDLE_SIZE.x;
    const endY = y + PADDLE_SIZE.y;
    this.ctx.fillRect(x, y, endX, endY);

    const opX = this.opP.x;
    const opY = this.opP.y;
    const opEndX = opX + PADDLE_SIZE.x;
    const opEndY = opY + PADDLE_SIZE.y;
    this.ctx.fillRect(opX, opY, opEndX, opEndY);
  }


  private update() {
    const s = this.boardSize;
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(0, 0, s, s);

    this.drawPaddles();
    this.drawBall();
  }
}
