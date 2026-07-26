import { computePattern, extractMetrics } from "../physics/metrics";
import type { AntennaConfig, PatternGrid, PatternMetrics, SphericalGrid } from "../physics/types";

export interface PatternRequestMessage {
  requestId: number;
  config: AntennaConfig;
  grid: SphericalGrid;
}

export interface PatternResponseMessage {
  requestId: number;
  pattern: PatternGrid;
  metrics: PatternMetrics;
}

/** Minimal typed view of the dedicated-worker global scope, avoiding a webworker/dom lib clash. */
interface WorkerScope {
  onmessage: ((ev: MessageEvent<PatternRequestMessage>) => void) | null;
  postMessage: (msg: PatternResponseMessage, transfer: Transferable[]) => void;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = (ev) => {
  const { requestId, config, grid } = ev.data;
  const { pattern, nearDegenerate } = computePattern(config, grid);
  const metrics = extractMetrics(pattern, nearDegenerate);
  ctx.postMessage({ requestId, pattern, metrics }, [pattern.gainDbi.buffer]);
};
