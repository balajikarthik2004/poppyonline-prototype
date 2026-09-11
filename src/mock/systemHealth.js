/**
 * Deterministic Simulated Enterprise System Telemetry.
 * Clear architecture positioned behind a replaceable service provider for Phase 7 backend swap-in.
 */

export const systemHealthMetrics = {
  status: 'Healthy',
  overallUptimePct: 99.98,
  lastSyncTimestamp: new Date().toISOString(),
  activeUserSessions: 42,
  averageLatencyMs: 24,
  errorRatePct: 0.02,
  totalRequestsToday: 184520,
  failedRequestsToday: 38,
  services: [
    {
      name: 'Core API Gateway',
      type: 'GraphQL / REST Router',
      status: 'Operational',
      latencyMs: 18,
      uptimePct: 99.99,
      cluster: 'Node Cluster - Primary',
    },
    {
      name: 'PostgreSQL Enterprise Cluster',
      type: 'Relational Master DB',
      status: 'Operational',
      latencyMs: 8,
      uptimePct: 100.0,
      cluster: 'Multi-AZ Primary + Read Replica',
    },
    {
      name: 'Redis In-Memory State Cache',
      type: 'Session & Permission Cache',
      status: 'Operational',
      latencyMs: 2,
      uptimePct: 99.99,
      cluster: 'Redis Cluster 7.2 (6 nodes)',
    },
    {
      name: 'MQTT IoT Telemetry Hub',
      type: 'Shop Floor & Energy Stream',
      status: 'Operational',
      latencyMs: 14,
      uptimePct: 99.95,
      cluster: 'EMQX Edge Broker (Units I-IV)',
    },
    {
      name: 'Audit Log Append Pipeline',
      type: 'Immutable Event Journal',
      status: 'Operational',
      latencyMs: 12,
      uptimePct: 100.0,
      cluster: 'WORM Compliant Event Stream',
    },
    {
      name: 'RBAC Policy Engine',
      type: 'Local Governance Policy Layer',
      status: 'Active (Prototype Local)',
      latencyMs: 1,
      uptimePct: 100.0,
      cluster: 'Frontend Replaceable Layer (Phase 6)',
    },
  ],
  telemetryStream: [
    { time: '18:00', latency: 22, requests: 1420, cpuLoadPct: 34, memoryPct: 48 },
    { time: '18:05', latency: 24, requests: 1580, cpuLoadPct: 36, memoryPct: 48 },
    { time: '18:10', latency: 28, requests: 1890, cpuLoadPct: 41, memoryPct: 50 },
    { time: '18:15', latency: 23, requests: 1650, cpuLoadPct: 35, memoryPct: 49 },
    { time: '18:20', latency: 21, requests: 1490, cpuLoadPct: 33, memoryPct: 49 },
    { time: '18:25', latency: 26, requests: 1720, cpuLoadPct: 38, memoryPct: 51 },
    { time: '18:30', latency: 24, requests: 1610, cpuLoadPct: 36, memoryPct: 50 },
  ],
}
