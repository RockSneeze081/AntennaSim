import "./App.css";
import { BandSelector } from "./components/controls/BandSelector";
import { PresetPicker } from "./components/controls/PresetPicker";
import { GroundToggle } from "./components/controls/GroundToggle";
import { ParamsPanel } from "./components/controls/ParamsPanel";
import { WireEditorControls } from "./components/controls/WireEditorControls";
import { InfoReadoutPanel } from "./components/controls/InfoReadoutPanel";
import { WireEditorScene } from "./components/scene3d/WireEditorScene";
import { AzimuthCutPlot } from "./components/plots2d/AzimuthCutPlot";
import { ElevationCutPlot } from "./components/plots2d/ElevationCutPlot";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AntennaSim</h1>
        <p className="muted-text">Visualiza en 3D el patrón de radiación de antenas de hilo caseras</p>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <PresetPicker />
          <BandSelector />
          <GroundToggle />
          <ParamsPanel />
          <WireEditorControls />
          <InfoReadoutPanel />
        </aside>

        <main className="scene-container">
          <WireEditorScene />
        </main>

        <aside className="plots-panel">
          <AzimuthCutPlot />
          <ElevationCutPlot />
        </aside>
      </div>
    </div>
  );
}

export default App;
