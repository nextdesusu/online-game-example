import { User } from "../connection";

export enum gameType {
  ticTacToe,
}

export interface hostEvent {
  type: gameType;
  name: string;
}

export interface loginEvent {
  login: string;
  isCorrect: true;
}

export interface gameOption {
  name: string;
  type: gameType;
}

export interface onInputEvent {
  passedCheck: boolean;
  value: string;
}

export interface InputProps {
  placeholder?: string;
  pattern?: string;
}

export interface Message {
  text: string;
  date: Date;
}

export type MessageEvent = Message;
