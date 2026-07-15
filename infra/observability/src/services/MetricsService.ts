import { Logger } from "@logtape/logtape";

export class MetricsService {
  private logger: Logger;

  constructor(logFactory: Logger) {
    this.logger = logFactory.getChild("MetricsService");
  }
}
