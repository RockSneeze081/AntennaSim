# AntennaSim

Visualizador 3D del patrón de radiación de antenas de hilo caseras (dipolo, V invertida, vertical a tierra, hilo alimentado en un extremo), pensado para radioaficionados. Editor libre: arrastra los puntos del hilo para darle cualquier forma y ve el lóbulo de ganancia recalcularse en vivo.

Es una herramienta educativa/visual: solo calcula el patrón de radiación (ganancia, ángulo de despegue, relación delante/atrás). No calcula impedancia ni ROE (SWR) — el modelo físico simplificado (corriente asumida sobre el hilo + teoría de imágenes para el suelo) no los daría de forma fiable.

## Desarrollo

```bash
npm install
npm run dev
```

## Tests del motor físico

```bash
npm run test
```

Valida el motor contra resultados conocidos: dipolo de media onda en espacio libre (~2.15 dBi), vertical de cuarto de onda sobre tierra perfecta (~5.15 dBi), V invertida, etc. Ver [`src/physics/__tests__`](src/physics/__tests__).

## Build

```bash
npm run build
```

## Estructura

- `src/physics/` — motor físico puro (sin dependencias de React/Three), ver el plan de diseño para las fórmulas.
- `src/model/` — modelo de datos de la antena y plantillas (dipolo, V invertida, vertical, end-fed).
- `src/worker/` — cálculo del patrón en un Web Worker (grid basto en vivo + grid fino tras soltar).
- `src/state/` — estado global (Zustand).
- `src/components/` — UI: controles, escena 3D (`@react-three/fiber`), cortes polares 2D (SVG).
