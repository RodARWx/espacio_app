import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";

export interface ResultadoComparacionEspacial {
  inmuebleA: Inmueble;
  inmuebleB: Inmueble;
  precioPorM2A: number;
  precioPorM2B: number;
  mejorRelacionPrecioM2Id: string;
  mayorSuperficieUtilId: string;
  diferenciaAreaM2: number;
  diferenciaPrecioUsd: number;
}

/**
 * Motor de comparación multidimensional del Subdominio CORE (CU-02).
 * Contrasta métricas espaciales lado a lado entre exactamente 2 Inmueble.
 */
export class ComparadorEspacialService {
  public comparar(inmuebleA: Inmueble, inmuebleB: Inmueble): ResultadoComparacionEspacial {
    if (inmuebleA.id === inmuebleB.id) {
      throw new DomainRuleViolationException(
        "RN-03",
        "Debe seleccionar dos Inmueble distintos para ejecutar la comparación técnica lado a lado."
      );
    }

    const areaA = inmuebleA.dimensionReferencial?.areaUtilM2 ?? 0;
    const areaB = inmuebleB.dimensionReferencial?.areaUtilM2 ?? 0;
    const precioPorM2A = inmuebleA.precioPorM2Util;
    const precioPorM2B = inmuebleB.precioPorM2Util;

    return {
      inmuebleA,
      inmuebleB,
      precioPorM2A,
      precioPorM2B,
      mejorRelacionPrecioM2Id: precioPorM2A <= precioPorM2B ? inmuebleA.id : inmuebleB.id,
      mayorSuperficieUtilId: areaA >= areaB ? inmuebleA.id : inmuebleB.id,
      diferenciaAreaM2: Number(Math.abs(areaA - areaB).toFixed(2)),
      diferenciaPrecioUsd: Number(Math.abs(inmuebleA.canonMensualUsd - inmuebleB.canonMensualUsd).toFixed(2)),
    };
  }
}
