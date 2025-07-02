import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { HealthIndicatorSession } from '@nestjs/terminus/dist/health-indicator/health-indicator.service';

import {
  ValkeyClient,
  ValkeyCluster,
  ValkeyHealthConfig,
} from './valkey.interfaces';

@Injectable()
export class ValkeyHealthIndicator {
  private readonly logger = new Logger(ValkeyHealthIndicator.name);

  constructor(private readonly indicator: HealthIndicatorService) {}

  async checkHealth(
    key: string,
    options: ValkeyHealthConfig,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.indicator.check(key);

    let res: HealthIndicatorResult;

    try {
      res = await this.isHealthy(options, indicator);
    } catch (error: any) {
      const { stack, message } = error as Error;

      this.logger.error(`Valkey health check failed: ${message}`, stack);

      res = indicator.down({ message });
    }

    return res;
  }

  private async isHealthy(
    options: ValkeyHealthConfig,
    indicator: HealthIndicatorSession,
  ): Promise<HealthIndicatorResult> {
    const { type, client, timeout = 1000 } = options;

    const startTime = Date.now();

    const pingPromise = type === 'single'
      ? this.checkSingle.bind(this, client)
      : this.checkCluster.bind(this, client);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(`Valkey health check timed out after ${timeout}ms`),
          ),
        timeout,
      );
    });

    await Promise.race([pingPromise, timeoutPromise]);

    const responseTime = Date.now() - startTime;

    return indicator.up({ responseTime: `${responseTime}ms` });
  }

  private async checkSingle(client: ValkeyClient): Promise<void> {
    await client.ping();
  }

  private async checkCluster(client: ValkeyCluster): Promise<void> {
    const res = await client.cluster('INFO');

    if (!res.includes('cluster_state:ok')) {
      throw new Error('Cluster state is not ok');
    }
  }
}
