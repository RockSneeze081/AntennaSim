import { useAntennaStore } from "../../state/useAntennaStore";

export function InfoReadoutPanel() {
  const metrics = useAntennaStore((s) => s.metrics);
  const isRefining = useAntennaStore((s) => s.isRefining);

  return (
    <div className="control-row info-panel">
      <div className="control-row-header">
        <span>Resultado</span>
        {isRefining && <span className="muted-text">calculando…</span>}
      </div>
      {metrics ? (
        <ul className="info-list">
          <li>
            <span>Ganancia pico</span>
            <strong>{metrics.peakGainDbi.toFixed(2)} dBi</strong>
          </li>
          <li>
            <span>Ángulo de despegue</span>
            <strong>{metrics.takeoffAngleDeg.toFixed(0)}°</strong>
          </li>
          <li>
            <span>Relación delante/atrás</span>
            <strong>{metrics.frontToBackDb !== null ? `${metrics.frontToBackDb.toFixed(1)} dB` : "N/A"}</strong>
          </li>
        </ul>
      ) : (
        <p className="muted-text">Calculando el primer patrón…</p>
      )}
      {metrics?.nearDegenerate && (
        <p className="warning-text">
          Aviso: esta geometría está cerca de un caso límite (un brazo cerca de un múltiplo de
          media longitud de onda). El resultado puede ser menos fiable.
        </p>
      )}
      <p className="muted-text disclaimer">
        Herramienta educativa: solo muestra el patrón de radiación. No calcula impedancia ni
        ROE (SWR) — el modelo simplificado no los daría de forma fiable.
      </p>
    </div>
  );
}
