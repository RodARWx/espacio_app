import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";
import { CoordenadasGeo, TipoInmueble } from "@/domain/shared/UbicuoTypes";

export interface FiltroGeoespacial {
  centro: CoordenadasGeo;
  radioMetros: number;
  tipoInmueble?: TipoInmueble | "TODOS";
  precioMaximoUsd?: number;
  areaMinimaM2?: number;
  soloBanoPropio?: boolean;
  soloVerificados?: boolean;
  textoBusqueda?: string;
  pagina: number;
  tamanoLote: number;
}

export interface InmuebleConDistancia {
  inmueble: Inmueble;
  distanciaMetros: number;
}

export interface ResultadoCargaPaginada {
  inmuebles: InmuebleConDistancia[];
  totalCoincidencias: number;
  paginaActual: number;
  totalPaginas: number;
  tamanoLote: number;
}

/**
 * Servicio de Dominio del Subdominio CORE: BusquedaGeoespacialService.
 * Protege la invariante RN-10 (máximo 10 Inmueble por lote y filtro por radio geoespacial).
 */
export class BusquedaGeoespacialService {
  public static readonly MAX_INMUEBLES_POR_LOTE = 10;

  public calcularDistanciaMetros(a: CoordenadasGeo, b: CoordenadasGeo): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitud - a.latitud);
    const dLon = toRad(b.longitud - a.longitud);
    const lat1 = toRad(a.latitud);
    const lat2 = toRad(b.latitud);

    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return Math.round(R * c);
  }

  public buscar(
    catalogo: Inmueble[],
    filtro: FiltroGeoespacial
  ): ResultadoCargaPaginada {
    if (filtro.tamanoLote <= 0 || filtro.tamanoLote > BusquedaGeoespacialService.MAX_INMUEBLES_POR_LOTE) {
      throw new DomainRuleViolationException(
        "RN-10",
        `La consulta del catálogo no puede despachar más de ${BusquedaGeoespacialService.MAX_INMUEBLES_POR_LOTE} Inmueble por lote (solicitado: ${filtro.tamanoLote}).`
      );
    }

    if (filtro.radioMetros <= 0) {
      throw new DomainRuleViolationException(
        "RN-10",
        "El FiltroGeoespacial requiere un radio de proximidad métrica mayor a 0."
      );
    }

    const visibles = catalogo.filter(
      (inm) => inm.estadoPublicacion === "PUBLICADO" || inm.estadoPublicacion === "VERIFICADO"
    );

    const conDistancia = visibles
      .map((inmueble) => ({
        inmueble,
        distanciaMetros: this.calcularDistanciaMetros(filtro.centro, inmueble.coordenadas),
      }))
      .filter(({ inmueble, distanciaMetros }) => {
        if (distanciaMetros > filtro.radioMetros) return false;
        if (filtro.tipoInmueble && filtro.tipoInmueble !== "TODOS" && inmueble.tipoInmueble !== filtro.tipoInmueble) {
          return false;
        }
        if (filtro.precioMaximoUsd !== undefined && inmueble.canonMensualUsd > filtro.precioMaximoUsd) {
          return false;
        }
        if (
          filtro.areaMinimaM2 !== undefined &&
          (inmueble.dimensionReferencial?.areaUtilM2 ?? 0) < filtro.areaMinimaM2
        ) {
          return false;
        }
        if (filtro.soloBanoPropio && !inmueble.banoPropio) {
          return false;
        }
        if (filtro.soloVerificados && inmueble.estadoPublicacion !== "VERIFICADO") {
          return false;
        }
        if (filtro.textoBusqueda && filtro.textoBusqueda.trim()) {
          const q = filtro.textoBusqueda.trim().toLowerCase();
          const texto = `${inmueble.titulo} ${inmueble.sector} ${inmueble.descripcion} ${inmueble.actividadSugerida ?? ""}`.toLowerCase();
          if (!texto.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanciaMetros - b.distanciaMetros);

    const totalCoincidencias = conDistancia.length;
    const totalPaginas = Math.max(1, Math.ceil(totalCoincidencias / filtro.tamanoLote));
    const paginaSegura = Math.min(Math.max(1, filtro.pagina), totalPaginas);
    const inicio = (paginaSegura - 1) * filtro.tamanoLote;

    return {
      inmuebles: conDistancia.slice(inicio, inicio + filtro.tamanoLote),
      totalCoincidencias,
      paginaActual: paginaSegura,
      totalPaginas,
      tamanoLote: filtro.tamanoLote,
    };
  }
}
