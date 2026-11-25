# Código fuente de la app DL02 (rama `fuente`)

La app publicada (rama `main`, GitHub Pages) sale de aquí. Sirve de base para hacer otra app igual (por ejemplo, la del municipio de Santiago, N.L.).

## Estructura
- `tools/` — código y scripts
  - `build_app3.py` — **arma la app**: junta `app3.js` + `icons.js` + `org.js` + `dd.js` + `fis.js` + `v5.js` + `v6.js` + `v7.js` + `v8.js` y los datos de `out/`, y escribe `out/site/` (index.html, app.js, data.js, sw.js, manifest). Correr desde `tools/`: `python3 build_app3.py`.
  - `app3.js` — núcleo: mapa en canvas (secciones, gestos, capas), recorridos, captura de gestorías, almacenamiento local (`localStorage`, clave `dl02v3`).
  - `icons.js` — íconos SVG y reemplazo de emoji.
  - `org.js` — Davidsito (mascota), estructura del equipo, propuestas, hoja inferior arrastrable.
  - `dd.js` — Día D (casillas, conteo, reportes).
  - `fis.js` — Agenda y fiscalización (eventos, gastos, plazos).
  - `v5.js` — usuarios y permisos, Excel sin librerías, buscador, secciones recorridas, vista maestra.
  - `v6.js` — leyenda, casillas georreferenciadas en el mapa, gestorías como tarjetas flotantes, 30 gestorías de prueba.
  - `v7.js` — seguimiento de gestorías (etapas, quién la atiende, bitácora, WhatsApp).
  - `v8.js` — ubicación al levantar gestoría, envío en tiempo real a Google Sheets, llamar/WhatsApp, quién recibe/resuelve, inicio de sesión.
  - `dl02.py`, `shpread.py` — leen la cartografía del INE (`shp/`) y generan `out/dl02_data.json` (secciones del distrito, colonias, etc.).
  - `results.py` — resultados 2024 por sección desde `res/*.xlsx` → `out/dl02_resultados.json`.
  - `plan40.py`, `streets*.py`, `map2.py` — calles (OSM) y plan de recorridos por día → `out/calles_*.json`, `out/dl02_ruta.json`.
  - `mk_mascot.py` — genera `mascot.svg` (usa fotos que NO están en este repo).
  - `shot*.js` — pruebas con Playwright (Chromium).
- `out/` — datos ya procesados del DL02 (JSON) que usa `build_app3.py`.
- `shp/` — cartografía electoral INE de Nuevo León 2024 (SECCION, MUNICIPIO, COLONIA, MANZANA, VIALIDAD, DISTRITO_LOCAL…).
- `res/` — resultados oficiales NL 2024: `NL_AYUN_2024.xlsx` (ayuntamientos) y `NL_DIP_LOC_2024.xlsx` (diputaciones locales).
- `casillas/` — listado INE de ubicación de casillas NL 2024 (PDF) y scripts para leerlo y georreferenciarlo (`casillas_parse2.py` → `casillas_geo.py` → `casillas_pack.py`). Las rutas dentro de los scripts suponen la carpeta raíz de trabajo; ajustarlas.

## Para adaptar a otro territorio (p. ej. municipio de Santiago)
1. En `dl02.py`: filtrar por municipio en vez de distrito local (Santiago = municipio 49 de NL en la cartografía del INE; verificar).
2. En `results.py`: usar `NL_AYUN_2024.xlsx` filtrado a Santiago.
3. Regenerar calles/recorridos con un `export.osm` del municipio (no incluido).
4. Casillas: filtrar el PDF/JSON a las secciones del municipio.
5. Cambiar nombres, colores, candidato, propuestas, estructura (org.js), fechas (fis.js/dd.js), clave de almacenamiento y PIN.
6. Mascota: hacer una nueva para el nuevo candidato.

## Reglas que se mantienen
- No guardar nombres de funcionarios de casilla del PDF del INE (solo domicilios).
- Nunca cargar la lista nominal.
- Las gestorías nunca se condicionan al voto.
- No usar la plataforma de WhatsApp Business para envíos automáticos (su política lo prohíbe a campañas).
