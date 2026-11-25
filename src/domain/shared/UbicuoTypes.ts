export type RolActor = "ARRENDATARIO" | "PROPIETARIO" | "ADMINISTRADOR";

export type TipoInmueble = "VIVIENDA" | "COMERCIAL";

export type EstadoPublicacion =
  | "BORRADOR"
  | "EN_REVISION"
  | "PUBLICADO"
  | "VERIFICADO"
  | "PAUSADO";

export type EstadoSolicitudVisita =
  | "SOLICITADA"
  | "CONFIRMADA"
  | "CANCELADA"
  | "REALIZADA";

export interface CoordenadasGeo {
  latitud: number;
  longitud: number;
}

export interface ContactoDirecto {
  nombreCompleto: string;
  telefono: string;
  correoElectronico: string;
}

export interface VerificacionAnunciante {
  propietarioId: string;
  documentoIdentidad: string;
  identidadComprobada: boolean;
  esPublicidadComercialExterna: boolean;
  observacionAuditoria?: string;
}

export interface CodigoQR {
  token: string;
  urlDirecta: string;
}
