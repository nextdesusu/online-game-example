import { gameArgs, strCb, KEYS } from "../types";
import Connection from 'src/connection';

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

const enum PADDLE_BALL_COLORS {
  BALL = "red",
  PADDLE = "blue",
  FIELD = "gray",
}

const rand = () => Math.random() > .5 ? -1 : 1;

const PADDLE_SIZE = Object.freeze({ width: 150, height: 20 });
const PADDLE_SPEED = 2;

const BALL_RADIUS = 20;
const BALL_SPEED = 1;

interface PaddleBallArgs {
  connection: Connection;
  ctx: CanvasRenderingContext2D;
  boardSize: number;
  isHost: boolean;
  endCb: strCb;
}

export default class PaddleBall {
  private connection: Connection;
  private selfPaddle: Paddle;
  private opPaddle: Paddle;
  private ball: Ball;
  private ctx: CanvasRenderingContext2D;
  private boardSize: number;
  private isHost: boolean;
  private endCb: strCb;
  constructor({ connection, ctx, boardSize, isHost, endCb }: PaddleBallArgs) {
    this.connection = connection;
    this.ctx = ctx;
    this.boardSize = boardSize;
    this.endCb = endCb;
    this.isHost = isHost;

    const middle = Math.floor(boardSize / 2);
    const paddleMiddle = middle - Math.floor(PADDLE_SIZE.width / 2);
    const bottomY = boardSize - PADDLE_SIZE.height;

    this.ball = { pos: { x: middle, y: middle }, vel: { x: rand(), y: rand() } };
    const startP: Point = { x: paddleMiddle, y: 0 };
    const endPos: Point = { x: paddleMiddle, y: bottomY };
    const startS: paddleState = paddleState.stand;
    if (isHost) {
      this.selfPaddle = { pos: startP, state: startS };
      this.opPaddle = { pos: endPos, state: startS };
    } else {
      this.selfPaddle = { pos: endPos, state: startS };
      this.opPaddle = { pos: startP, state: startS };
    }
  }

  static host({ connection, canvasNode, size, endCb }: gameArgs) {
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall({
      connection,
      ctx,
      boardSize: size,
      endCb,
      isHost: true
    });

    document.addEventListener("keydown", (event: any) => {
      if (event.keyCode === KEYS.LEFT) {
        game.setSPaddleState(paddleState.goingLeft);
      } else if (event.keyCode === KEYS.RIGHT) {
        game.setSPaddleState(paddleState.goingRight);
      }
    });
    document.addEventListener("keyup", (event: any) => {
      if (event.keyCode === KEYS.LEFT || event.keyCode === KEYS.RIGHT) {
        game.selfPaddle.state = paddleState.stand;
      }
    })

    connection.setGameDataCb((gameData: any) => {
      const pState = Number(gameData.data);
      game.setOpPaddleState(pState);
    });

    game.start();
  }

  static join({ connection, canvasNode, size, endCb }: gameArgs) {
    const ctx = canvasNode.getContext("2d");
    const game = new PaddleBall({
      connection,
      ctx,
      boardSize: size,
      endCb,
      isHost: false
    });

    document.addEventListener("keydown", (event: any) => {
      if (event.keyCode === KEYS.LEFT) {
        connection.sendGameData(String(paddleState.goingLeft));
      } else if (event.keyCode === KEYS.RIGHT) {
        connection.sendGameData(String(paddleState.goingRight));
      }
    });
    document.addEventListener("keyup", (event: any) => {
      if (event.keyCode === KEYS.LEFT || event.keyCode === KEYS.RIGHT) {
        connection.sendGameData(String(paddleState.stand));
      }
    })

    connection.setGameDataCb((gameData: any) => {
      //apply host response
      const data = JSON.parse(gameData.data);
      if (data) {
        game.applyGameData(gameData);
      }
    });

    game.start();
  }

  applyGameData(gameData: any) {
    console.log("applying data:", gameData)
    const { ballPos, hostP, clientP } = gameData;
    this.ball.pos = ballPos;
    this.selfPaddle.pos = clientP;
    this.opPaddle.pos = hostP;
  }

  start() {
    const ms10 = 10;
    let time = Date.now();
    const cb = () => {
      const now = Date.now();
      if (now - time > ms10) {
        this.update();
        time = now;
      }
      window.requestAnimationFrame(cb);
    }
    window.requestAnimationFrame(cb);
  }

  private drawBall() {
    const { x, y } = this.ball.pos;
    this.ctx.beginPath();
    this.ctx.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }

  private drawPaddle(paddle: Paddle) {
    const { x, y } = paddle.pos;
    this.ctx.fillRect(x, y, PADDLE_SIZE.width, PADDLE_SIZE.height);
  }

  setSPaddleState(ps: paddleState) {
    this.selfPaddle.state = ps;
  }

  setOpPaddleState(ps: paddleState) {
    this.opPaddle.state = ps;
  }

  private movePaddle(paddle: Paddle) {
    if (this.opPaddle.state !== 0) {
      console.log("opPaddle.state:", this.opPaddle.state);
    }
    if (paddle.state === paddleState.goingLeft) {
      if (paddle === this.opPaddle) {
        console.log("moving left opPaddle:", this.opPaddle);
      }
      if (paddle.pos.x > 0.1) {
        paddle.pos.x -= PADDLE_SPEED;
      }
    } else if (paddle.state === paddleState.goingRight) {
      if (paddle === this.opPaddle) {
        console.log("moving right opPaddle:", this.opPaddle);
      }
      if ((paddle.pos.x + PADDLE_SIZE.width) < this.boardSize) {
        paddle.pos.x += PADDLE_SPEED;
      }
    }
  }

  private moveBall() {
    const { vel, pos } = this.ball;
    this.ball.pos.x += BALL_SPEED * vel.x;
    this.ball.pos.y += BALL_SPEED * vel.y;

    if ((pos.y + BALL_RADIUS) > this.boardSize || (pos.y - BALL_RADIUS) < 0) {
      vel.y *= -1;
    }
    if ((pos.x + BALL_RADIUS) > this.boardSize || (pos.x - BALL_RADIUS) < 0) {
      vel.x *= -1;
    }
  }

  private moveAll() {
    this.movePaddle(this.selfPaddle);
    this.movePaddle(this.opPaddle);
    this.moveBall();
  }

  private get currentGameData(): string {
    return JSON.stringify({
      ballPos: this.ball.pos,
      hostP: this.selfPaddle.pos,
      clientP: this.opPaddle.pos
    });
  }


  private update() {
    if (this.isHost) {
      this.moveAll();
      if (this.connection.connectionEstablished) {
        this.connection.sendGameData(this.currentGameData);
      }
    }

    const s = this.boardSize;
    this.ctx.clearRect(0, 0, s, s);

    this.ctx.fillStyle = PADDLE_BALL_COLORS.FIELD;
    this.ctx.fillRect(0, 0, s, s);

    this.ctx.fillStyle = PADDLE_BALL_COLORS.PADDLE;
    this.drawPaddle(this.selfPaddle);
    this.drawPaddle(this.opPaddle);

    this.ctx.fillStyle = PADDLE_BALL_COLORS.BALL;
    this.drawBall();
  }
}
