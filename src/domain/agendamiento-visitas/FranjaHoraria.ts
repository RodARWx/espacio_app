import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";

export interface PropiedadesFranjaHoraria {
  id: string;
  inmuebleId: string;
  fechaIso: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  bloqueada: boolean;
}

/**
 * Entidad FranjaHoraria: intervalo de tiempo delimitado configurado por el Propietario
 * en el calendario para visitas presenciales. Protege RN-02.
 */
export class FranjaHoraria {
  public readonly id: string;
  public readonly inmuebleId: string;
  public readonly fechaIso: string;
  public readonly horaInicio: string;
  public readonly horaFin: string;
  public bloqueada: boolean;

  constructor(props: PropiedadesFranjaHoraria) {
    this.id = props.id;
    this.inmuebleId = props.inmuebleId;
    this.fechaIso = props.fechaIso;
    this.horaInicio = props.horaInicio;
    this.horaFin = props.horaFin;
    this.bloqueada = props.bloqueada;
  }

  public obtenerFechaHoraInicio(): Date {
    return new Date(`${this.fechaIso}T${this.horaInicio}:00`);
  }

  public obtenerFechaHoraFin(): Date {
    return new Date(`${this.fechaIso}T${this.horaFin}:00`);
  }

  /**
   * RN-02: Un Arrendatario no puede agendar una SolicitudVisita
   * con menos de 2 horas de anticipación a la FranjaHoraria elegida.
   */
  public validarAnticipacionMinima(ahora: Date = new Date()): void {
    const inicio = this.obtenerFechaHoraInicio();
    const diferenciaHoras = (inicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    if (diferenciaHoras < 2) {
      throw new DomainRuleViolationException(
        "RN-02",
        "Un Arrendatario no puede agendar una SolicitudVisita con menos de 2 horas de anticipación a la FranjaHoraria elegida."
      );
    }
  }

  public seSolapaCon(otra: FranjaHoraria): boolean {
    if (this.fechaIso !== otra.fechaIso || this.inmuebleId !== otra.inmuebleId) {
      return false;
    }
    const inicioA = this.obtenerFechaHoraInicio().getTime();
    const finA = this.obtenerFechaHoraFin().getTime();
    const inicioB = otra.obtenerFechaHoraInicio().getTime();
    const finB = otra.obtenerFechaHoraFin().getTime();
    return inicioA < finB && inicioB < finA;
  }
}
