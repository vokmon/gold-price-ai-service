export interface OutputInterface {
  outputMessage<T>(message: string, object?: T): Promise<void>;
}
