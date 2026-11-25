import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";
import {
  CodigoQR,
  ContactoDirecto,
  CoordenadasGeo,
  EstadoPublicacion,
  RolActor,
  TipoInmueble,
  VerificacionAnunciante,
} from "@/domain/shared/UbicuoTypes";
import { CroquisReferencial } from "./CroquisReferencial";
import { DimensionReferencial } from "./DimensionReferencial";

export interface PropiedadesInmueble {
  id: string;
  titulo: string;
  descripcion: string;
  tipoInmueble: TipoInmueble;
  canonMensualUsd: number;
  sector: string;
  direccion: string;
  coordenadas: CoordenadasGeo;
  propietarioId: string;
  contactoPropietario: ContactoDirecto;
  banoPropio: boolean;
  amenidades: string[];
  actividadSugerida?: string;
  imagenesUrl: string[];
  dimensionReferencial?: DimensionReferencial;
  croquisReferencial?: CroquisReferencial;
  verificacionAnunciante: VerificacionAnunciante;
  estadoPublicacion: EstadoPublicacion;
  codigoQR: CodigoQR;
}

/**
 * Agregado raíz Inmueble.
 * Protege las invariantes RN-03, RN-04, RN-07 y RN-09.
 */
export class Inmueble {
  public readonly id: string;
  public titulo: string;
  public descripcion: string;
  public readonly tipoInmueble: TipoInmueble;
  public canonMensualUsd: number;
  public sector: string;
  public direccion: string;
  public readonly coordenadas: CoordenadasGeo;
  public readonly propietarioId: string;
  public readonly contactoPropietario: ContactoDirecto;
  public readonly banoPropio: boolean;
  public readonly amenidades: string[];
  public readonly actividadSugerida?: string;
  public readonly imagenesUrl: string[];
  public dimensionReferencial?: DimensionReferencial;
  public croquisReferencial?: CroquisReferencial;
  public verificacionAnunciante: VerificacionAnunciante;
  public estadoPublicacion: EstadoPublicacion;
  public readonly codigoQR: CodigoQR;

  constructor(props: PropiedadesInmueble) {
    this.id = props.id;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.tipoInmueble = props.tipoInmueble;
    this.canonMensualUsd = props.canonMensualUsd;
    this.sector = props.sector;
    this.direccion = props.direccion;
    this.coordenadas = props.coordenadas;
    this.propietarioId = props.propietarioId;
    this.contactoPropietario = props.contactoPropietario;
    this.banoPropio = props.banoPropio;
    this.amenidades = [...props.amenidades];
    this.actividadSugerida = props.actividadSugerida;
    this.imagenesUrl = [...props.imagenesUrl];
    this.dimensionReferencial = props.dimensionReferencial;
    this.croquisReferencial = props.croquisReferencial;
    this.verificacionAnunciante = { ...props.verificacionAnunciante };
    this.estadoPublicacion = props.estadoPublicacion;
    this.codigoQR = { ...props.codigoQR };
  }

  /**
   * RN-03 & RN-09: Solo permite pasar a PUBLICADO si posee DimensionReferencial,
   * CroquisReferencial, identidad comprobada y no es publicidad comercial externa.
   */
  public publicar(): void {
    if (this.verificacionAnunciante.esPublicidadComercialExterna) {
      throw new DomainRuleViolationException(
        "RN-09",
        "No se permite publicar un Inmueble con fines de propaganda comercial externa o spam."
      );
    }

    if (!this.verificacionAnunciante.identidadComprobada) {
      throw new DomainRuleViolationException(
        "RN-09",
        "No se permite publicar un Inmueble sin la previa comprobación de identidad del Propietario titular."
      );
    }

    if (!this.dimensionReferencial || this.dimensionReferencial.areaUtilM2 <= 0) {
      throw new DomainRuleViolationException(
        "RN-03",
        "No se permite pasar un Inmueble al estado PUBLICADO si carece de área total útil en m² y dimensiones por ambiente."
      );
    }

    if (!this.croquisReferencial) {
      throw new DomainRuleViolationException(
        "RN-03",
        "No se permite pasar un Inmueble al estado PUBLICADO si carece de CroquisReferencial."
      );
    }

    this.estadoPublicacion = "PUBLICADO";
  }

  /**
   * RN-04: Un Propietario no puede alterar las dimensiones ni la dirección
   * de un Inmueble mientras existan visitas en estado CONFIRMADA pendientes.
   */
  public actualizarEspecificacionesEspaciales(params: {
    nuevaDimension?: DimensionReferencial;
    nuevaDireccion?: string;
    tieneVisitasConfirmadasPendientes: boolean;
  }): void {
    if (params.tieneVisitasConfirmadasPendientes) {
      throw new DomainRuleViolationException(
        "RN-04",
        "Un Propietario no puede alterar las dimensiones ni la dirección de un Inmueble mientras existan SolicitudVisita en estado CONFIRMADA pendientes."
      );
    }

    if (params.nuevaDimension) {
      this.dimensionReferencial = params.nuevaDimension;
    }
    if (params.nuevaDireccion && params.nuevaDireccion.trim()) {
      this.direccion = params.nuevaDireccion.trim();
    }
  }

  /**
   * RN-07: Solo un Administrador puede asignar el distintivo VERIFICADO
   * tras comprobar documentalmente la correspondencia física de las medidas.
   */
  public verificarPorAdministrador(rolEjecutor: RolActor): void {
    if (rolEjecutor !== "ADMINISTRADOR") {
      throw new DomainRuleViolationException(
        "RN-07",
        "Solo un Administrador puede asignar el distintivo de VERIFICADO tras comprobar documentalmente la correspondencia de las medidas."
      );
    }

    if (this.verificacionAnunciante.esPublicidadComercialExterna) {
      throw new DomainRuleViolationException(
        "RN-09",
        "No se puede verificar un Inmueble marcado como publicidad comercial externa."
      );
    }

    this.verificacionAnunciante = {
      ...this.verificacionAnunciante,
      identidadComprobada: true,
    };

    if (!this.dimensionReferencial || !this.croquisReferencial) {
      throw new DomainRuleViolationException(
        "RN-03",
        "El Inmueble debe contar con DimensionReferencial y CroquisReferencial antes de ser VERIFICADO."
      );
    }

    this.estadoPublicacion = "VERIFICADO";
  }

  public pausarPorSpam(rolEjecutor: RolActor, motivo: string): void {
    if (rolEjecutor !== "ADMINISTRADOR") {
      throw new DomainRuleViolationException(
        "RN-07",
        "Solo un Administrador puede pausar una publicación por auditoría."
      );
    }
    this.verificacionAnunciante = {
      ...this.verificacionAnunciante,
      esPublicidadComercialExterna: true,
      observacionAuditoria: motivo,
    };
    this.estadoPublicacion = "PAUSADO";
  }

  public get precioPorM2Util(): number {
    if (!this.dimensionReferencial) return 0;
    return Number((this.canonMensualUsd / this.dimensionReferencial.areaUtilM2).toFixed(2));
  }
}
