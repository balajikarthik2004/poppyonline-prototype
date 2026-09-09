/**
 * Simulates network latency for mock service calls so loading states are
 * exercised the same way they will be once a real API sits behind this layer.
 */
export function simulateDelay(value, minMs = 150, maxMs = 400) {
  const ms = Math.round(minMs + Math.random() * (maxMs - minMs))
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
