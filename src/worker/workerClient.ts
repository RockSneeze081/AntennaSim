import type { AntennaConfig, GroundMode, PatternGrid, PatternMetrics, SphericalGrid } from "../physics/types";
import type { PatternRequestMessage, PatternResponseMessage } from "./physicsWorker";

export interface PatternResult {
  pattern: PatternGrid;
  metrics: PatternMetrics;
}

export const COARSE_STEP_DEG = 8;
export const FINE_STEP_DEG = 1.5;
export const FINE_DEBOUNCE_MS = 200;

function makeGrid(ground: GroundMode, stepDeg: number): SphericalGrid {
  const thetaMaxDeg = ground === "perfectGround" ? 90 : 180;
  const thetaSteps = Math.round(thetaMaxDeg / stepDeg) + 1;
  const phiSteps = Math.round(360 / stepDeg);
  return { thetaSteps, phiSteps, thetaMaxDeg };
}

export class PhysicsWorkerClient {
  private worker: Worker;
  private nextId = 0;
  private pending = new Map<number, (res: PatternResult) => void>();

  constructor() {
    this.worker = new Worker(new URL("./physicsWorker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (ev: MessageEvent<PatternResponseMessage>) => {
      const { requestId, pattern, metrics } = ev.data;
      const resolve = this.pending.get(requestId);
      if (resolve) {
        this.pending.delete(requestId);
        resolve({ pattern, metrics });
      }
    };
  }

  private request(config: AntennaConfig, grid: SphericalGrid): Promise<PatternResult> {
    const requestId = this.nextId++;
    return new Promise((resolve) => {
      this.pending.set(requestId, resolve);
      const msg: PatternRequestMessage = { requestId, config, grid };
      this.worker.postMessage(msg);
    });
  }

  requestCoarse(config: AntennaConfig): Promise<PatternResult> {
    return this.request(config, makeGrid(config.ground, COARSE_STEP_DEG));
  }

  requestFine(config: AntennaConfig): Promise<PatternResult> {
    return this.request(config, makeGrid(config.ground, FINE_STEP_DEG));
  }

  terminate() {
    this.worker.terminate();
  }
}

/**
 * Two-tier scheduling (plan A.5): a coarse recompute fires immediately on every call so
 * live-drag feedback never stalls, while a fine recompute is debounced until movement
 * settles. Responses superseded by a newer call before they resolved are dropped.
 */
export function createPatternScheduler(
  client: PhysicsWorkerClient,
  onCoarse: (res: PatternResult) => void,
  onFine: (res: PatternResult) => void,
) {
  let fineTimer: ReturnType<typeof setTimeout> | null = null;
  let coarseToken = 0;
  let fineToken = 0;

  function schedule(config: AntennaConfig) {
    const myCoarseToken = ++coarseToken;
    client.requestCoarse(config).then((res) => {
      if (myCoarseToken === coarseToken) onCoarse(res);
    });

    if (fineTimer) clearTimeout(fineTimer);
    const myFineToken = ++fineToken;
    fineTimer = setTimeout(() => {
      client.requestFine(config).then((res) => {
        if (myFineToken === fineToken) onFine(res);
      });
    }, FINE_DEBOUNCE_MS);
  }

  function dispose() {
    if (fineTimer) clearTimeout(fineTimer);
  }

  return { schedule, dispose };
}
