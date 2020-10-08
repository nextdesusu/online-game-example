import { gameArgs, strCb } from "../types";

const KEY_LEFT = 37;
const KEY_RIGHT = 39;

interface Point {
  x: number;
  y: number;
}

const enum paddleState {
  stand,
  goingLeft,
  goingRight
}

interface Paddle {
  pos: Point;
  state: paddleState;
}

interface Ball {
  pos: Point;
  vel: Point;
}
const enum ballDirections {
  up = -1,
  down = 1,
}
const rand = () => Math.random() > .5 ? ballDirections.up : ballDirections.down;

const PADDLE_SIZE: Point = Object.freeze({ x: 50, y: 20 });
const PADDLE_SPEED = 2;

const BALL_RADIUS = 20;
const BALL_SPEED = 1;

export default class PaddleBall {
  private selfPaddle: Paddle;
  private opPaddle: Paddle;
  private ball: Ball;
  private ctx: CanvasRenderingContext2D;
  private boardSize: number;
  private endCb: strCb;
  private isHost: boolean;
  constructor(ctx: CanvasRenderingContext2D, boardSize: number, endCb: strCb, isHost: boolean) {
    this.ctx = ctx;
    this.boardSize = boardSize;
    this.endCb = endCb;
    this.isHost = isHost;

    const middle = Math.floor(boardSize / 2);
    const paddleMiddle = middle - Math.floor(PADDLE_SIZE.x / 2);
    const bottomY = boardSize - PADDLE_SIZE.y;

    this.ball = { pos: { x: middle, y: middle }, vel: { x: rand(), y: rand() } };
    const startP: Point = { x: paddleMiddle, y: 0 };
    const endPos: Point = { x: paddleMiddle, y: bottomY };
    const startS: paddleState = paddleState.stand;
    if (isHost) {
      this.selfPaddle = { pos: startP, state: startS };
      this.opPaddle = { pos: endPos, state: startS };
    } else {
      this.opPaddle = { pos: startP, state: startS };
      this.selfPaddle = { pos: endPos, state: startS };
    }
  }

  static host({ connection, canvasNode, size, endCb }: gameArgs) {
    console.log("host node:", canvasNode);
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall(ctx, size, endCb, true);

    document.addEventListener("keydown", (event: any) => {
      console.log("join event:", event);
      if (event.keyCode === KEY_LEFT) {
        game.setSPaddleState(paddleState.goingLeft);
      } else if (event.keyCode === KEY_RIGHT) {
        game.setSPaddleState(paddleState.goingRight);
      }
    });
    document.addEventListener("keyup", (event: any) => {
      if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
        game.selfPaddle.state = paddleState.stand;
      }
    })

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

  static join({ connection, canvasNode, size, endCb }: gameArgs) {
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall(ctx, size, endCb, false);

    document.addEventListener("keydown", (event: any) => {
      console.log("join event:", event);
      if (event.keyCode === KEY_LEFT) {
        connection.sendGameData(String(paddleState.goingLeft));
      } else if (event.keyCode === KEY_RIGHT) {
        connection.sendGameData(String(paddleState.goingRight));
      }
    });
    document.addEventListener("keyup", (event: any) => {
      if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
        connection.sendGameData(String(paddleState.stand));
      }
    })

    connection.setGameDataCb((gameData: any) => {
      //apply host response
      game.applyGameData(gameData);
    });

    game.start();
  }

  applyGameData(gameData: any) {
    const { ballPos, hostP, clientP } = gameData;
    this.ball.pos = ballPos;
    this.selfPaddle = clientP;
    this.opPaddle = hostP;
  }

  start() {
    const ms100 = 100;
    let time = Date.now();
    const cb = () => {
      const now = Date.now();
      if (now - time > ms100) {
        this.update();
        time = now;
      }
      window.requestAnimationFrame(cb);
    }
    window.requestAnimationFrame(cb);
  }

  private drawBall() {
    const { x, y } = this.ball.pos;
    this.ctx.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }

  private drawPaddle(paddle: Paddle) {
    const { x, y } = paddle.pos;
    const endX = x + PADDLE_SIZE.x;
    const endY = y + PADDLE_SIZE.y;
    //console.log("drawPaddle:", x, y, endX, endY);
    this.ctx.fillRect(x, y, endX, endY);
  }

  setSPaddleState(ps: paddleState) {
    this.selfPaddle.state = ps;
  }

  private movePaddle(paddle: Paddle) {
    if (paddle.state === paddleState.goingLeft) {
      if (paddle.pos.x > 0.1) {
        paddle.pos.x -= PADDLE_SPEED;
      }
    } else if (paddle.state === paddleState.goingRight) {
      if ((paddle.pos.x + PADDLE_SIZE.x) < this.boardSize) {
        paddle.pos.x += PADDLE_SPEED;
      }
    }
  }

  private moveBall() {
    const { vel } = this.ball;
    this.ball.pos.x += BALL_SPEED * vel.x;
    this.ball.pos.y += BALL_SPEED * vel.y;

    if ((vel.x + BALL_RADIUS) > this.boardSize || (vel.x - BALL_RADIUS) < 0) {
      vel.x *= -1;
    }
  }

  private moveAll() {
    this.movePaddle(this.selfPaddle);
    this.movePaddle(this.opPaddle);
    this.moveBall();
  }


  private update() {
    if (this.isHost) {
      this.moveAll();
    }

    const s = this.boardSize;

    this.ctx.fillStyle = "gray";
    this.ctx.clearRect(0, 0, s, s);
    this.ctx.fillRect(0, 0, s, s);

    this.ctx.fillStyle = "blue";
    this.drawPaddle(this.selfPaddle);
    this.drawPaddle(this.opPaddle);

    this.ctx.fillStyle = "red";
    this.drawBall();
  }
}
