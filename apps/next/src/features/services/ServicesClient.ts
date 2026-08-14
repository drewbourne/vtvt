import { EventMapHandlers, MapWithCallbacks } from "@fbt/primitives";
import { Logger } from "@logtape/logtape";
import {
  ServiceInfo,
  ServiceStats,
  NatsConnection,
  ServiceIdentity,
  ServiceClient,
} from "nats";

export interface ServicesEventMap {
  onPing: {
    type: "fbt.ui.services.ping";
    value: ServiceIdentity;
  };
  onInfo: {
    type: "fbt.ui.services.info";
    value: ServiceInfo;
  };
  onStats: {
    type: "fbt.ui.services.stats";
    value: ServiceStats;
  };
}

type ServiceInfoKey = "ping" | "info" | "stats";

export class ServicesClient {
  private nc?: NatsConnection;
  private sc?: ServiceClient;

  private ping = new Map<string, ServiceIdentity>();
  private info = new Map<string, ServiceInfo>();
  private stats = new Map<string, ServiceStats>();

  private subs = new MapWithCallbacks<
    ServiceInfoKey,
    EventMapHandlers<ServicesEventMap>
  >({
    onFirstAdded: () => this.start(),

    onFirstAddedForKey: (key: ServiceInfoKey) => this.startForKey(key),

    onAdded: (
      key: ServiceInfoKey,
      handlers: EventMapHandlers<ServicesEventMap>,
    ) => this.callWithLatestForKey(key, handlers),
  });

  constructor(
    private logger: Logger,
    private natsConnection: Promise<NatsConnection>,
  ) {}

  async subscribe(handlers: EventMapHandlers<ServicesEventMap>) {
    if ("onPing" in handlers) {
      await this.subs.add("ping", handlers);
    }

    if ("onInfo" in handlers) {
      await this.subs.add("info", handlers);
    }

    if ("onStats" in handlers) {
      await this.subs.add("stats", handlers);
    }

    return () => {
      if ("onPing" in handlers) {
        this.subs.remove("ping", handlers);
      }

      if ("onInfo" in handlers) {
        this.subs.remove("info", handlers);
      }

      if ("onStats" in handlers) {
        this.subs.remove("stats", handlers);
      }
    };
  }

  private async start() {
    this.nc = await this.natsConnection;
    this.sc = this.nc.services.client();
  }

  private async startForKey(key: ServiceInfoKey) {
    if (key === "ping") this.startPing();

    if (key === "info") this.startInfo();

    if (key === "stats") this.startStats();
  }

  private async stopForKey(key: ServiceInfoKey) {}

  private async startPing() {
    this.updatePing();

    const timeoutId = setInterval(() => this.updatePing(), 15_000);

    this.stopPing = () => clearInterval(timeoutId);
  }

  private stopPing: () => void = () => {};

  async updatePing() {
    const iter = await this.sc!.ping();

    for await (const si of iter) {
      this.ping.set(si.name, si);

      for (const handlers of this.subs.values("ping")) {
        handlers.onPing?.({
          type: "fbt.ui.services.ping",
          value: si,
        });
      }
    }
  }

  private async startInfo() {
    this.updateInfo();

    const timeoutId = setInterval(() => this.updateInfo(), 15_000);

    this.stopInfo = () => clearInterval(timeoutId);
  }

  private stopInfo: () => void = () => {};

  async updateInfo() {
    const iter = await this.sc!.info();

    for await (const si of iter) {
      this.info.set(si.name, si);

      for (const handlers of this.subs.values("info")) {
        handlers.onInfo?.({
          type: "fbt.ui.services.info",
          value: si,
        });
      }
    }
  }

  private async startStats() {
    this.updateStats();

    const timeoutId = setInterval(() => this.updateStats(), 15_000);

    this.stopStats = () => clearInterval(timeoutId);
  }

  private stopStats: () => void = () => {};

  async updateStats() {
    const iter = await this.sc!.stats();

    for await (const si of iter) {
      this.stats.set(si.name, si);

      for (const handlers of this.subs.values("stats")) {
        handlers.onStats?.({
          type: "fbt.ui.services.stats",
          value: si,
        });
      }
    }
  }

  callWithLatestForKey(
    key: ServiceInfoKey,
    handlers: EventMapHandlers<ServicesEventMap>,
  ) {
    if (key === "ping") {
      const values = this.ping.values();
      for (const value of values) {
        handlers.onPing?.({
          type: "fbt.ui.services.ping",
          value,
        });
      }
    }

    if (key === "info") {
      const values = this.info.values();
      for (const value of values) {
        handlers.onInfo?.({
          type: "fbt.ui.services.info",
          value,
        });
      }
    }

    if (key === "stats") {
      const values = this.stats.values();
      for (const value of values) {
        handlers.onStats?.({
          type: "fbt.ui.services.stats",
          value,
        });
      }
    }
  }
}
