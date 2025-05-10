export interface OutputInterface {
  outputMessage<T>(message: string, object?: T): Promise<void>;
  outputImage(imageBuffer: Buffer, description: string): Promise<void>;
}
