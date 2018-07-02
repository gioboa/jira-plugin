export interface Command<T = void> {
  id: string;

  run(...args: any[]): T | Promise<T>;
}
