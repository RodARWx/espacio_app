import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";
import { EstadoSolicitudVisita } from "@/domain/shared/UbicuoTypes";

export interface PropiedadesSolicitudVisita {
  id: string;
  inmuebleId: string;
  arrendatarioId: string;
  arrendatarioNombre: string;
  propietarioId: string;
  franjaHorariaId: string;
  estado: EstadoSolicitudVisita;
  creadaEnIso: string;
  notaArrendatario?: string;
}

/**
 * Agregado raíz SolicitudVisita.
 * Protege RN-06 y gestiona el ciclo de vida SOLICITADA -> CONFIRMADA / CANCELADA / REALIZADA.
 */
export class SolicitudVisita {
  public readonly id: string;
  public readonly inmuebleId: string;
  public readonly arrendatarioId: string;
  public readonly arrendatarioNombre: string;
  public readonly propietarioId: string;
  public readonly franjaHorariaId: string;
  public estado: EstadoSolicitudVisita;
  public readonly creadaEnIso: string;
  public readonly notaArrendatario?: string;

  constructor(props: PropiedadesSolicitudVisita) {
    if (props.arrendatarioId === props.propietarioId) {
      throw new DomainRuleViolationException(
        "RN-06",
        "Un usuario registrado no puede emitir una SolicitudVisita sobre un Inmueble del cual figure como Propietario titular."
      );
    }

    this.id = props.id;
    this.inmuebleId = props.inmuebleId;
    this.arrendatarioId = props.arrendatarioId;
    this.arrendatarioNombre = props.arrendatarioNombre;
    this.propietarioId = props.propietarioId;
    this.franjaHorariaId = props.franjaHorariaId;
    this.estado = props.estado;
    this.creadaEnIso = props.creadaEnIso;
    this.notaArrendatario = props.notaArrendatario;
  }

  public confirmar(): void {
    if (this.estado !== "SOLICITADA") {
      throw new DomainRuleViolationException(
        "RN-01",
        `Solo una SolicitudVisita en estado SOLICITADA puede confirmarse (estado actual: ${this.estado}).`
      );
    }
    this.estado = "CONFIRMADA";
  }

  public cancelar(): void {
    if (this.estado === "REALIZADA") {
      throw new DomainRuleViolationException(
        "RN-01",
        "No es posible cancelar una SolicitudVisita que ya fue REALIZADA."
      );
    }
    this.estado = "CANCELADA";
  }
}
