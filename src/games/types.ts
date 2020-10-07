import Connection from "../connection";

export type strCb = (arg: string) => void;

export interface gameArgs {
  connection: Connection;
  canvasNode: HTMLCanvasElement;
  size: number;
  endCb: strCb;
}
