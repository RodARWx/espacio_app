import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";

export interface ZonaCroquis {
  etiqueta: string;
  xPorcentaje: number;
  yPorcentaje: number;
  anchoPorcentaje: number;
  altoPorcentaje: number;
  medidaTexto: string;
}

/**
 * Value Object que representa el plano o esquema visual simplificado
 * de la distribución física y funcional de los ambientes del Inmueble.
 */
export class CroquisReferencial {
  public readonly descripcionDistribucion: string;
  public readonly zonas: readonly ZonaCroquis[];
  public readonly urlPlanoOpcional?: string;

  constructor(params: {
    descripcionDistribucion: string;
    zonas: ZonaCroquis[];
    urlPlanoOpcional?: string;
  }) {
    if (!params.descripcionDistribucion.trim()) {
      throw new DomainRuleViolationException(
        "RN-03",
        "El CroquisReferencial requiere una descripción de la distribución espacial."
      );
    }

    if (!params.zonas || params.zonas.length === 0) {
      throw new DomainRuleViolationException(
        "RN-03",
        "El CroquisReferencial debe contener al menos una zona trazada."
      );
    }

    this.descripcionDistribucion = params.descripcionDistribucion.trim();
    this.zonas = Object.freeze(params.zonas.map((z) => ({ ...z })));
    this.urlPlanoOpcional = params.urlPlanoOpcional;
  }
}
