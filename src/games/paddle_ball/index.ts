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

const UPDATE_TIME = 10;

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

interface gameScore {
  host: number;
  client: number;
}

interface dataToApply {
  ballPos: Point;
  hostP: Point;
  clientP: Point;
  score: gameScore;
}

export default class PaddleBall {
  private connection: Connection;
  private selfPaddle: Paddle;
  private opPaddle: Paddle;
  private ball: Ball;
  private ctx: CanvasRenderingContext2D;
  private boardSize: number;
  private isHost: boolean;
  private score: gameScore;
  private endCb: strCb;
  constructor({ connection, ctx, boardSize, isHost, endCb }: PaddleBallArgs) {
    this.connection = connection;
    this.ctx = ctx;
    this.boardSize = boardSize;
    this.endCb = endCb;

    this.score = { host: 0, client: 0 };
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

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.keyCode === KEYS.LEFT) {
        game.setSPaddleState(paddleState.goingLeft);
      } else if (event.keyCode === KEYS.RIGHT) {
        game.setSPaddleState(paddleState.goingRight);
      }
    });
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.keyCode === KEYS.LEFT || event.keyCode === KEYS.RIGHT) {
        game.selfPaddle.state = paddleState.stand;
      }
    })

    connection.setGameDataCb((gameData: { key: string, data: any }) => {
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

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.keyCode === KEYS.LEFT) {
        connection.sendGameData(String(paddleState.goingLeft));
      } else if (event.keyCode === KEYS.RIGHT) {
        connection.sendGameData(String(paddleState.goingRight));
      }
    });
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.keyCode === KEYS.LEFT || event.keyCode === KEYS.RIGHT) {
        connection.sendGameData(String(paddleState.stand));
      }
    })

    connection.setGameDataCb((gameData: { key: string, data: any }) => {
      //apply host response
      const data = JSON.parse(gameData.data);
      if (data) {
        game.applyGameData(data);
      }
    });

    game.start();
  }

  applyGameData(gameData: dataToApply) {
    const { ballPos, hostP, clientP, score } = gameData;
    this.ball.pos = ballPos;
    this.selfPaddle.pos = clientP;
    this.opPaddle.pos = hostP;
    this.score = score;
  }

  start() {
    let time = Date.now();
    const cb = () => {
      const now = Date.now();
      if (now - time > UPDATE_TIME) {
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
    if (paddle.state === paddleState.goingLeft) {
      if (paddle.pos.x > 0) {
        paddle.pos.x -= PADDLE_SPEED;
      }
    } else if (paddle.state === paddleState.goingRight) {
      if ((paddle.pos.x + PADDLE_SIZE.width) < this.boardSize) {
        paddle.pos.x += PADDLE_SPEED;
      }
    }
  }

  private paddleVsBall(paddle: Paddle): boolean {
    const { x, y } = paddle.pos;
    const { width, height } = PADDLE_SIZE;
    const ballX = this.ball.pos.x;
    const ballY = this.ball.pos.y;

    let testX = ballX;
    let testY = ballY;

    // which edge is closest?
    if (ballX < x) testX = x;      // test left edge
    else if (ballX > x + width) testX = x + width;   // right edge
    if (ballY < y) testY = y;      // top edge
    else if (ballY > y + height) testY = y + height;   // bottom edge

    // get distance from closest edges
    const distX = ballX - testX;
    const distY = ballY - testY;
    const distance = Math.sqrt((distX * distX) + (distY * distY));
    // if the distance is less than the radius, collision!
    if (distance <= BALL_RADIUS) {
      return true;
    }
    return false;
  }

  private moveBall() {
    const { vel } = this.ball;
    this.ball.pos.x += BALL_SPEED * vel.x;
    this.ball.pos.y += BALL_SPEED * vel.y;
  }

  private handleCollisions(): void {
    const { vel, pos } = this.ball;

    if (this.paddleVsBall(this.selfPaddle) || this.paddleVsBall(this.opPaddle)) {
      vel.y *= -1;
    }

    if (pos.y + BALL_RADIUS > this.boardSize) {
      vel.y = -1;
      this.score.host += 1;
    }
    if (pos.y - BALL_RADIUS < 0) {
      vel.y = 1;
      this.score.client += 1;
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
      clientP: this.opPaddle.pos,
      score: this.score
    });
  }

  private showScore(): void {
    const p1 = this.isHost ? "You" : "Oponent";
    const p2 = this.isHost ? "Oponent" : "You";
    const text = `${p1}: ${this.score.host} ${p2}: ${this.score.client}`;
    const textPos = Math.round(this.boardSize / 2);
    this.ctx.fillText(text, textPos, textPos);
  }

  private update() {
    const { client, host } = this.score;
    if (client > 4 || host > 4) {
      console.log("end cb called");
      this.endCb(client > 4 ? "client" : "host");
    }

    if (this.isHost) {
      this.moveAll();
      this.handleCollisions();
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

    this.showScore();
  }
}
