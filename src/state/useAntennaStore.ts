import { create } from "zustand";
import type { AntennaDocument } from "../model/antennaModel";
import { createDefaultDocument, createDocumentFromPreset } from "../model/antennaModel";
import type { AntennaConfig, GroundMode, PatternGrid, PatternMetrics, Vec3 } from "../physics/types";
import { getPresetById } from "../model/presets";
import { addVertexOnLongestSegment, moveVertex, removeVertex, setFeedVertex } from "../model/wireEditing";
import { PhysicsWorkerClient, createPatternScheduler } from "../worker/workerClient";
import { BANDS } from "../physics/constants";

export type EditorMode = "move" | "delete" | "feed";

interface AntennaState {
  document: AntennaDocument;
  pattern: PatternGrid | null;
  metrics: PatternMetrics | null;
  /** True right after the coarse (live-drag) grid lands, while the finer grid is still pending. */
  isRefining: boolean;
  /** Free-form wire editor interaction mode: drag to move, click to delete, or click to set feed. */
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;

  setBand: (bandId: string) => void;
  setPreset: (presetId: string) => void;
  setParam: (key: string, value: number) => void;
  setGround: (ground: GroundMode) => void;
  /** Drags vertex `index` to a new physics position; keeps the feedpoint attached to its vertex. */
  moveWireVertex: (index: number, newPos: Vec3) => void;
  addWireVertex: () => void;
  removeWireVertex: (index: number) => void;
  setFeedVertexIndex: (index: number) => void;
}

const client = new PhysicsWorkerClient();

function configFromDocument(doc: AntennaDocument): AntennaConfig {
  return { wire: doc.wire, frequencyHz: doc.frequencyHz, ground: doc.ground };
}

export const useAntennaStore = create<AntennaState>((set, get) => {
  const scheduler = createPatternScheduler(
    client,
    (res) => set({ pattern: res.pattern, metrics: res.metrics, isRefining: true }),
    (res) => set({ pattern: res.pattern, metrics: res.metrics, isRefining: false }),
  );

  function recompute() {
    scheduler.schedule(configFromDocument(get().document));
  }

  queueMicrotask(recompute);

  return {
    document: createDefaultDocument(),
    pattern: null,
    metrics: null,
    isRefining: true,
    editorMode: "move",
    setEditorMode: (mode) => set({ editorMode: mode }),

    setBand: (bandId) => {
      const band = BANDS.find((b) => b.id === bandId);
      if (!band) return;
      const doc = get().document;
      const presetId = doc.wireSource.kind === "preset" ? doc.wireSource.presetId : "dipole";
      set({ document: createDocumentFromPreset(presetId, band.defaultFreqHz) });
      recompute();
    },

    setPreset: (presetId) => {
      const doc = get().document;
      set({ document: createDocumentFromPreset(presetId, doc.frequencyHz) });
      recompute();
    },

    setParam: (key, value) => {
      const doc = get().document;
      if (doc.wireSource.kind !== "preset") return;
      const preset = getPresetById(doc.wireSource.presetId);
      if (!preset) return;
      const params = { ...doc.wireSource.params, [key]: value };
      const wire = preset.generate(params);
      set({ document: { ...doc, wire, wireSource: { kind: "preset", presetId: preset.id, params } } });
      recompute();
    },

    setGround: (ground) => {
      set((state) => ({ document: { ...state.document, ground } }));
      recompute();
    },

    moveWireVertex: (index, newPos) => {
      set((state) => ({
        document: {
          ...state.document,
          wire: moveVertex(state.document.wire, state.document.feedVertexIndex, index, newPos),
          wireSource: { kind: "custom" },
        },
      }));
      recompute();
    },

    addWireVertex: () => {
      set((state) => {
        const { wire, feedVertexIndex } = addVertexOnLongestSegment(state.document.wire, state.document.feedVertexIndex);
        return { document: { ...state.document, wire, feedVertexIndex, wireSource: { kind: "custom" } } };
      });
      recompute();
    },

    removeWireVertex: (index) => {
      set((state) => {
        const { wire, feedVertexIndex } = removeVertex(state.document.wire, state.document.feedVertexIndex, index);
        return { document: { ...state.document, wire, feedVertexIndex, wireSource: { kind: "custom" } } };
      });
      recompute();
    },

    setFeedVertexIndex: (index) => {
      set((state) => ({
        document: {
          ...state.document,
          wire: setFeedVertex(state.document.wire, index),
          feedVertexIndex: index,
          wireSource: { kind: "custom" },
        },
      }));
      recompute();
    },
  };
});
