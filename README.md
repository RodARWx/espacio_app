# ESPACIO — Plataforma de Búsqueda, Comparación y Agendamiento de Inmuebles

> *No busques solamente un inmueble. Encuentra el espacio que realmente necesitas.*

Proyecto de **Arquitectura de Software** (Séptimo Semestre · Ingeniería en Sistemas de Información · UCE).

## Arquitectura y Lenguaje Ubicuo (DDD)

El sistema sigue **Domain-Driven Design (DDD)** con separación estricta entre:
- **Subdominio Core (`src/domain/busqueda-catalogo`)**: Búsqueda geoespacial por radio de proximidad con carga paginada (máx. 10 `Inmueble` por lote, `RN-10`) y comparador técnico lado a lado (`ComparadorEspacialService`).
- **Subdominio de Soporte (`src/domain/agendamiento-visitas`)**: Gestión concurrente de `SolicitudVisita` y `FranjaHoraria` (`RN-01`, `RN-02`, `RN-05`, `RN-06`, `RN-08`).
- **Gestión y Verificación (`src/domain/gestion-verificacion`)**: Agregado `Inmueble`, `DimensionReferencial`, `CroquisReferencial`, `VerificacionAnunciante` y auditoría administrativa (`RN-03`, `RN-04`, `RN-07`, `RN-09`).

## Comandos

```bash
npm install
npm run dev
npm test
npm run build
```
