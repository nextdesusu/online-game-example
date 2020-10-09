import Connection from "../connection";

export type strCb = (arg: string) => void;

export const enum KEYS {
  LEFT = 37,
  RIGHT = 39
}

export interface gameArgs {
  connection: Connection;
  canvasNode: HTMLCanvasElement;
  size: number;
  endCb: strCb;
}
