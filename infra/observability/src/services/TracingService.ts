import { Logger } from "@logtape/logtape";

export class TracingService {
  private logger: Logger;

  constructor(logFactory: Logger) {
    this.logger = logFactory.getChild("TracingService");
  }
}
