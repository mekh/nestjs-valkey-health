import IoValkey, { Cluster } from 'iovalkey';

export type ValkeyClient = IoValkey;
export type ValkeyCluster = Cluster;

export type ValkeyHealthConfig =
  | {
    type: 'single';
    client: ValkeyClient;
    timeout?: number;
    memoryThreshold?: number;
  }
  | {
    type: 'cluster';
    client: ValkeyCluster;
    timeout?: number;
  };
