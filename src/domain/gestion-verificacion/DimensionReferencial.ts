import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";

export interface AmbienteEspacial {
  nombre: string;
  largoM: number;
  anchoM: number;
  areaM2: number;
}

/**
 * Value Object que encapsula las mediciones cuantitativas verificables
 * de un Inmueble (área total útil en m², largo, ancho y desglose por ambientes).
 */
export class DimensionReferencial {
  public readonly areaUtilM2: number;
  public readonly largoM: number;
  public readonly anchoM: number;
  public readonly ambientes: readonly AmbienteEspacial[];

  constructor(params: {
    areaUtilM2: number;
    largoM: number;
    anchoM: number;
    ambientes: AmbienteEspacial[];
  }) {
    if (params.areaUtilM2 <= 0 || params.largoM <= 0 || params.anchoM <= 0) {
      throw new DomainRuleViolationException(
        "RN-03",
        "Las dimensiones generales del Inmueble (área útil, largo y ancho) deben ser mayores a 0."
      );
    }

    if (!params.ambientes || params.ambientes.length === 0) {
      throw new DomainRuleViolationException(
        "RN-03",
        "El Inmueble debe incluir al menos un ambiente con sus medidas para calcular la DimensionReferencial."
      );
    }

    for (const ambiente of params.ambientes) {
      if (ambiente.largoM <= 0 || ambiente.anchoM <= 0 || ambiente.areaM2 <= 0) {
        throw new DomainRuleViolationException(
          "RN-03",
          `El ambiente "${ambiente.nombre}" debe tener dimensiones positivas.`
        );
      }
    }

    this.areaUtilM2 = Number(params.areaUtilM2.toFixed(2));
    this.largoM = Number(params.largoM.toFixed(2));
    this.anchoM = Number(params.anchoM.toFixed(2));
    this.ambientes = Object.freeze(params.ambientes.map((a) => ({ ...a })));
  }
}
