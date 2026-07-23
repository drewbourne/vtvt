import { Logger } from "@logtape/logtape";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { subMinutes } from "date-fns";
import { authLoginKey } from "@fbt/topstepx-api/gateway";
import { client } from "@fbt/topstepx-api/gateway-client";
import { TopstepCredentials } from "../models/TopstepCredentials.js";
import { RedisService } from "@fbt/redis";

export class TopstepAuthService {
  private refreshing?: Promise<void>;

  private token?: string;
  private jwt?: JwtPayload;
  private exp?: Date;

  private tokenCacheKey = "fbt.topstep.auth.token";

  constructor(
    private credentials: TopstepCredentials,
    private logger: Logger,
    private redis: RedisService,
  ) {}

  async getToken(): Promise<string> {
    this.logger.debug("getToken");

    if (this.shouldRefresh()) {
      await this.refreshToken();
    }

    return this.token!;
  }

  private hasToken() {
    return !!this.token;
  }

  private isTokenExpired() {
    return !this.exp || subMinutes(this.exp, 1) < new Date();
  }

  private shouldRefresh() {
    return !this.hasToken() || !this.isTokenExpired();
  }

  async refreshToken(): Promise<void> {
    this.logger.debug("refreshToken");

    // this.metrics.inc("topstep_token_refresh_count");

    if (this.refreshing) return this.refreshing;

    this.refreshing = (async () => {
      this.logger.debug("refreshing");

      if (this.isTokenExpired()) {
        await this.clearTokenFromCache();
      }

      const { token, jwt, expDate } = await this.fetchToken();

      this.token = token;
      this.jwt = jwt;
      this.exp = expDate;

      this.refreshing = undefined;
    })();

    await this.refreshing;
  }

  private async fetchToken() {
    let tokenSource = "cache";
    let token = await this.fetchTokenFromCache();

    if (!token) {
      tokenSource = "fetch";
      token = await this.fetchTokenWithCredentials();
    }

    const jwt = jwtDecode(token);
    const { exp } = jwt;
    let expDate =
      typeof exp === "number" ? new Date((exp ?? 0) * 1000) : undefined;

    if (expDate) {
      this.storeTokenInCache(token, expDate);
    }

    this.logger.debug("fetchToken", { tokenSource });

    return { token, jwt, exp, expDate };
  }

  private async fetchTokenFromCache() {
    const redis = await this.redis.getClient();
    const token = await redis.get(this.tokenCacheKey);

    this.logger.debug("fetchTokenFromCache", {
      state: !!token ? "hit" : "miss",
    });

    return token;
  }

  private async storeTokenInCache(token: string, expDate: Date) {
    this.logger.debug("storeTokenInCache", { expDate });

    const redis = await this.redis.getClient();
    await redis.set(this.tokenCacheKey, token, {
      expiration: { type: "EXAT", value: expDate.getTime() },
    });
  }

  private async clearTokenFromCache() {
    this.logger.debug("clearTokenFromCache");

    const redis = await this.redis.getClient();
    await redis.del(this.tokenCacheKey);
  }

  private async fetchTokenWithCredentials() {
    this.logger.debug("fetchTokenWithCredentials");

    const result = await authLoginKey({
      client,
      responseValidator: undefined,
      body: {
        userName: this.credentials.username,
        apiKey: this.credentials.apiKey,
      },
    });

    if (result.data?.success) {
      return result.data.token!;
    } else {
      this.logger.error(`fetchTokenWithCredentials result.error`, {
        error: result.error,
        errorCode: result.data?.errorCode,
        errorMessage: result.data?.errorMessage,
      });

      throw new Error(
        `TopstepAuthService fetchTokenWithCredentials result.error ${result.error}`,
      );
    }
  }
}
