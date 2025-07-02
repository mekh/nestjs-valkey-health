import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { ValkeyHealthIndicator } from './valkey-health.indicator';

@Module({
  imports: [TerminusModule],
  providers: [ValkeyHealthIndicator],
  exports: [ValkeyHealthIndicator],
})
export class ValkeyHealthModule {}
