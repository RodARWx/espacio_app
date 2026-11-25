import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";
import { ContactoDirecto } from "@/domain/shared/UbicuoTypes";
import { FranjaHoraria } from "./FranjaHoraria";
import { SolicitudVisita } from "./SolicitudVisita";

/**
 * Servicio de Dominio AgendaService & ContactoService.
 * Protege RN-01, RN-02, RN-05, RN-06 y RN-08.
 */
export class AgendaService {
  public static readonly MAX_SOLICITUDES_ACTIVAS_POR_ARRENDATARIO = 3;

  public crearSolicitudVisita(params: {
    id: string;
    inmueble: Inmueble;
    arrendatarioId: string;
    arrendatarioNombre: string;
    franjaHoraria: FranjaHoraria;
    solicitudesExistentes: SolicitudVisita[];
    notaArrendatario?: string;
    ahora?: Date;
  }): SolicitudVisita {
    const {
      id,
      inmueble,
      arrendatarioId,
      arrendatarioNombre,
      franjaHoraria,
      solicitudesExistentes,
      notaArrendatario,
      ahora = new Date(),
    } = params;

    if (franjaHoraria.bloqueada) {
      throw new DomainRuleViolationException(
        "RN-01",
        "La FranjaHoraria seleccionada ya se encuentra bloqueada por otra visita confirmada."
      );
    }

    // RN-02: Mínimo 2 horas de anticipación
    franjaHoraria.validarAnticipacionMinima(ahora);

    // RN-08: Máximo 3 SolicitudVisita en estado SOLICITADA concurrentemente por Arrendatario
    const activasDelArrendatario = solicitudesExistentes.filter(
      (s) => s.arrendatarioId === arrendatarioId && s.estado === "SOLICITADA"
    );
    if (activasDelArrendatario.length >= AgendaService.MAX_SOLICITUDES_ACTIVAS_POR_ARRENDATARIO) {
      throw new DomainRuleViolationException(
        "RN-08",
        "Un Arrendatario no puede mantener activas más de 3 SolicitudVisita en estado SOLICITADA concurrentemente sin confirmación."
      );
    }

    // RN-06: El Propietario no puede solicitar visita sobre su propio Inmueble
    return new SolicitudVisita({
      id,
      inmuebleId: inmueble.id,
      arrendatarioId,
      arrendatarioNombre,
      propietarioId: inmueble.propietarioId,
      franjaHorariaId: franjaHoraria.id,
      estado: "SOLICITADA",
      creadaEnIso: ahora.toISOString(),
      notaArrendatario,
    });
  }

  /**
   * RN-01: Impide confirmar dos SolicitudVisita para el mismo Inmueble
   * que compartan o solapen la misma FranjaHoraria.
   */
  public confirmarSolicitudVisita(params: {
    solicitudObjetivo: SolicitudVisita;
    franjaObjetivo: FranjaHoraria;
    todasLasSolicitudes: SolicitudVisita[];
    todasLasFranjas: FranjaHoraria[];
  }): void {
    const { solicitudObjetivo, franjaObjetivo, todasLasSolicitudes, todasLasFranjas } = params;

    const conflicto = todasLasSolicitudes.some((otraSolicitud) => {
      if (otraSolicitud.id === solicitudObjetivo.id) return false;
      if (otraSolicitud.inmuebleId !== solicitudObjetivo.inmuebleId) return false;
      if (otraSolicitud.estado !== "CONFIRMADA") return false;

      const otraFranja = todasLasFranjas.find((f) => f.id === otraSolicitud.franjaHorariaId);
      if (!otraFranja) return false;
      return franjaObjetivo.id === otraFranja.id || franjaObjetivo.seSolapaCon(otraFranja);
    });

    if (conflicto) {
      throw new DomainRuleViolationException(
        "RN-01",
        "No se permite confirmar dos SolicitudVisita para el mismo Inmueble que compartan o solapen la misma FranjaHoraria."
      );
    }

    solicitudObjetivo.confirmar();
    franjaObjetivo.bloqueada = true;
  }

  /**
   * RN-05: Solo tras la transición de SolicitudVisita a CONFIRMADA
   * se permite revelar los datos de contacto directo entre Arrendatario y Propietario.
   */
  public obtenerContactoSiConfirmada(
    solicitud: SolicitudVisita,
    inmueble: Inmueble
  ): ContactoDirecto | null {
    if (solicitud.estado !== "CONFIRMADA" && solicitud.estado !== "REALIZADA") {
      return null;
    }
    return inmueble.contactoPropietario;
  }
}
