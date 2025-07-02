# NestJS Valkey health-check module

Valkey health-check module for NestJS applications.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  - [Module Import](#module-import)
  - [Health Check Controller Example](#health-check-controller-example)
- [API Reference](#api-reference)
- [Related Packages](#related-packages)
- [License](#license)

## Description

This module provides health check indicators for Valkey (Redis fork)
instances in NestJS applications.

The module uses:
- `@nestjs/terminus` for health check infrastructure
- `iovalkey` for Valkey/Redis client communication

It supports both standalone Valkey/Redis instances and cluster configurations,
allowing you to monitor the health of your cache layer within your NestJS application.

## Installation

```bash
npm install @toxicoder/nestjs-valkey-health
```

### Prerequisites

This module has the following peer dependencies that need to be installed in your project:

```bash
npm install @nestjs/common @nestjs/core @nestjs/terminus
```

You'll also need a Valkey/Redis client. This module is designed to work with `iovalkey`.

## Usage

### Module Import

```typescript
import { Module } from '@nestjs/common';
import { ValkeyHealthModule } from '@toxicoder/nestjs-valkey-health';

@Module({
  imports: [
    ValkeyHealthModule,
    // other modules...
  ],
})
export class AppModule {}
```

### Health Check Controller Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ValkeyHealthIndicator } from '@toxicoder/nestjs-valkey-health';
import { ValkeyService } from '@toxicoder/nestjs-valkey'; // Recommended companion package

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private valkeyHealth: ValkeyHealthIndicator,
    private valkeyService: ValkeyService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.valkeyHealth.checkHealth('valkey', {
        type: 'redis',
        client: this.valkeyService.getClient(),
        timeout: 1000, // optional, defaults to 1000ms
      }),
    ]);
  }
}
```

## API Reference

### ValkeyHealthIndicator

The main service that provides health check functionality.

#### checkHealth(key: string, options: ValkeyHealthConfig): Promise<HealthIndicatorResult>

Performs a health check on a Valkey/Redis instance.

Parameters:
- `key`: The name of the health check indicator
- `options`: Configuration options
  - For standalone instances:
    ```typescript
    {
      type: 'single',
      client: ValkeyClient, // IoValkey instance
      timeout?: number, // optional timeout in ms, defaults to 1000
      memoryThreshold?: number // optional memory threshold
    }
    ```
  - For cluster instances:
    ```typescript
    {
      type: 'cluster',
      client: ValkeyCluster, // Cluster instance
      timeout?: number // optional timeout in ms, defaults to 1000
    }
    ```

## Related Packages

It is recommended to use this module with [@toxicoder/nestjs-valkey](https://www.npmjs.com/package/@toxicoder/nestjs-valkey),
which provides a convenient way to inject and use Valkey clients
in your NestJS application.

## License

ISC
