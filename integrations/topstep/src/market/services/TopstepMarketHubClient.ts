import { Logger } from "@logtape/logtape";
import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { TopstepAuthService } from "../../auth/services/TopstepAuthService.js";

export class TopstepMarketHubClient {
  private pendingConnection: Promise<HubConnection> | null = null;
  private connection: HubConnection | null = null;

  constructor(
    private logger: Logger,
    private authService: TopstepAuthService,
  ) {}

  async connect(): Promise<HubConnection> {
    if (this.pendingConnection) return this.pendingConnection;

    this.pendingConnection = new Promise(async (resolve, reject) => {
      try {
        const token = await this.authService.getToken();
        this.connection = this.createConnection(token);

        await this.connection.start();

        this.logger.info("connected", {
          connectionId: this.connection.connectionId,
          state: this.connection.state,
        });

        resolve(this.connection);
      } catch (error) {
        this.logger.error("connect error", { error });

        this.pendingConnection = null;
        this.connection = null;
        reject(error);
      }
    });

    return this.pendingConnection;
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    await this.connection.stop();
  }

  private createConnection(token: string): HubConnection {
    const hubURL = `https://rtc.topstepx.com/hubs/market`;
    const url = `${hubURL}?access_token=${token}`;

    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.onreconnecting((error) => {
      if (error) {
        this.logger.error("reconnecting error", { error });
      } else {
        this.logger.info("reconnecting");
      }
    });

    connection.onreconnected((connectionId) => {
      this.logger.info("reconnected", { connectionId });
    });

    connection.onclose(async (error) => {
      if (this.isAuthError(error)) {
        await this.authService.refreshToken();
        this.connection = null;
        await this.connect();
      }
    });

    return connection;
  }

  private isAuthError(error?: { message: string }) {
    return (
      error?.message?.includes("401") ||
      error?.message?.includes("Unauthorized")
    );
  }
}
