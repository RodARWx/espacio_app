import { describe, expect, it } from "vitest";
import { AgendaService } from "@/domain/agendamiento-visitas/AgendaService";
import { FranjaHoraria } from "@/domain/agendamiento-visitas/FranjaHoraria";
import { SolicitudVisita } from "@/domain/agendamiento-visitas/SolicitudVisita";
import { BusquedaGeoespacialService } from "@/domain/busqueda-catalogo/BusquedaGeoespacialService";
import { ComparadorEspacialService } from "@/domain/busqueda-catalogo/ComparadorEspacialService";
import { CroquisReferencial } from "@/domain/gestion-verificacion/CroquisReferencial";
import { DimensionReferencial } from "@/domain/gestion-verificacion/DimensionReferencial";
import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";

function crearDimensionEjemplo(): DimensionReferencial {
  return new DimensionReferencial({
    areaUtilM2: 58,
    largoM: 10,
    anchoM: 5.8,
    ambientes: [
      { nombre: "Área principal", largoM: 7.5, anchoM: 5.8, areaM2: 43.5 },
      { nombre: "Baño privado", largoM: 2.5, anchoM: 2.0, areaM2: 5.0 },
    ],
  });
}

function crearCroquisEjemplo(): CroquisReferencial {
  return new CroquisReferencial({
    descripcionDistribucion: "Planta libre con recepción frontal y baño privado al fondo.",
    zonas: [
      {
        etiqueta: "Área de atención",
        xPorcentaje: 5,
        yPorcentaje: 10,
        anchoPorcentaje: 65,
        altoPorcentaje: 80,
        medidaTexto: "7.5m × 5.8m",
      },
      {
        etiqueta: "Baño",
        xPorcentaje: 72,
        yPorcentaje: 10,
        anchoPorcentaje: 23,
        altoPorcentaje: 35,
        medidaTexto: "2.5m × 2.0m",
      },
    ],
  });
}

function crearInmuebleBase(overrides: Partial<ConstructorParameters<typeof Inmueble>[0]> = {}): Inmueble {
  return new Inmueble({
    id: "inm-test-1",
    titulo: "Local comercial La Carolina",
    descripcion: "Ideal para peluquería o estudio",
    tipoInmueble: "COMERCIAL",
    canonMensualUsd: 550,
    sector: "La Carolina, Quito",
    direccion: "Av. Amazonas y República",
    coordenadas: { latitud: -0.180653, longitud: -78.484942 },
    propietarioId: "prop-1",
    contactoPropietario: {
      nombreCompleto: "Carlos Mendoza",
      telefono: "0991234567",
      correoElectronico: "carlos@espacio.ec",
    },
    banoPropio: true,
    amenidades: ["Agua potable", "Medidor independiente"],
    imagenesUrl: [],
    dimensionReferencial: crearDimensionEjemplo(),
    croquisReferencial: crearCroquisEjemplo(),
    verificacionAnunciante: {
      propietarioId: "prop-1",
      documentoIdentidad: "1712345678",
      identidadComprobada: true,
      esPublicidadComercialExterna: false,
    },
    estadoPublicacion: "BORRADOR",
    codigoQR: {
      token: "QR-TEST-01",
      urlDirecta: "/?inmueble=inm-test-1",
    },
    ...overrides,
  });
}

describe("Invariantes de Dominio ESPACIO (RN-01 a RN-10)", () => {
  it("RN-01: No permite confirmar dos SolicitudVisita que compartan o solapen la misma FranjaHoraria", () => {
    const agenda = new AgendaService();
    const franjaA = new FranjaHoraria({
      id: "fr-1",
      inmuebleId: "inm-1",
      fechaIso: "2026-12-01",
      horaInicio: "10:00",
      horaFin: "11:00",
      bloqueada: false,
    });
    const franjaSolapada = new FranjaHoraria({
      id: "fr-2",
      inmuebleId: "inm-1",
      fechaIso: "2026-12-01",
      horaInicio: "10:30",
      horaFin: "11:30",
      bloqueada: false,
    });

    const sol1 = new SolicitudVisita({
      id: "sol-1",
      inmuebleId: "inm-1",
      arrendatarioId: "arr-1",
      arrendatarioNombre: "Lucía",
      propietarioId: "prop-1",
      franjaHorariaId: "fr-1",
      estado: "CONFIRMADA",
      creadaEnIso: "2026-11-30T10:00:00Z",
    });

    const sol2 = new SolicitudVisita({
      id: "sol-2",
      inmuebleId: "inm-1",
      arrendatarioId: "arr-2",
      arrendatarioNombre: "Mateo",
      propietarioId: "prop-1",
      franjaHorariaId: "fr-2",
      estado: "SOLICITADA",
      creadaEnIso: "2026-11-30T11:00:00Z",
    });

    expect(() =>
      agenda.confirmarSolicitudVisita({
        solicitudObjetivo: sol2,
        franjaObjetivo: franjaSolapada,
        todasLasSolicitudes: [sol1, sol2],
        todasLasFranjas: [franjaA, franjaSolapada],
      })
    ).toThrow(DomainRuleViolationException);
  });

  it("RN-02: Impide agendar una SolicitudVisita con menos de 2 horas de anticipación", () => {
    const agenda = new AgendaService();
    const inmueble = crearInmuebleBase({ estadoPublicacion: "VERIFICADO" });
    const ahora = new Date("2026-12-01T09:00:00");
    const franjaCercana = new FranjaHoraria({
      id: "fr-cercana",
      inmuebleId: inmueble.id,
      fechaIso: "2026-12-01",
      horaInicio: "10:30",
      horaFin: "11:30",
      bloqueada: false,
    });

    expect(() =>
      agenda.crearSolicitudVisita({
        id: "sol-rn02",
        inmueble,
        arrendatarioId: "arr-1",
        arrendatarioNombre: "Lucía",
        franjaHoraria: franjaCercana,
        solicitudesExistentes: [],
        ahora,
      })
    ).toThrow(DomainRuleViolationException);
  });

  it("RN-03: Impide pasar un Inmueble a PUBLICADO sin DimensionReferencial o CroquisReferencial", () => {
    const sinCroquis = crearInmuebleBase({ croquisReferencial: undefined });
    expect(() => sinCroquis.publicar()).toThrow(DomainRuleViolationException);

    const sinDimension = crearInmuebleBase({ dimensionReferencial: undefined });
    expect(() => sinDimension.publicar()).toThrow(DomainRuleViolationException);
  });

  it("RN-04: Impide alterar dimensiones o dirección mientras existan visitas CONFIRMADA pendientes", () => {
    const inmueble = crearInmuebleBase({ estadoPublicacion: "PUBLICADO" });
    expect(() =>
      inmueble.actualizarEspecificacionesEspaciales({
        nuevaDireccion: "Otra dirección 123",
        tieneVisitasConfirmadasPendientes: true,
      })
    ).toThrow(DomainRuleViolationException);
  });

  it("RN-05: Solo revela datos de contacto cuando SolicitudVisita pasa a CONFIRMADA", () => {
    const agenda = new AgendaService();
    const inmueble = crearInmuebleBase({ estadoPublicacion: "VERIFICADO" });
    const solicitud = new SolicitudVisita({
      id: "sol-rn05",
      inmuebleId: inmueble.id,
      arrendatarioId: "arr-1",
      arrendatarioNombre: "Lucía",
      propietarioId: inmueble.propietarioId,
      franjaHorariaId: "fr-1",
      estado: "SOLICITADA",
      creadaEnIso: "2026-11-30T10:00:00Z",
    });

    expect(agenda.obtenerContactoSiConfirmada(solicitud, inmueble)).toBeNull();
    solicitud.confirmar();
    expect(agenda.obtenerContactoSiConfirmada(solicitud, inmueble)).toEqual(
      inmueble.contactoPropietario
    );
  });

  it("RN-06: Impide que el Propietario solicite visita sobre su propio Inmueble", () => {
    expect(
      () =>
        new SolicitudVisita({
          id: "sol-rn06",
          inmuebleId: "inm-1",
          arrendatarioId: "prop-1",
          arrendatarioNombre: "Carlos",
          propietarioId: "prop-1",
          franjaHorariaId: "fr-1",
          estado: "SOLICITADA",
          creadaEnIso: "2026-11-30T10:00:00Z",
        })
    ).toThrow(DomainRuleViolationException);
  });

  it("RN-07: Solo un Administrador puede asignar el estado VERIFICADO", () => {
    const inmueble = crearInmuebleBase({ estadoPublicacion: "EN_REVISION" });
    expect(() => inmueble.verificarPorAdministrador("PROPIETARIO")).toThrow(
      DomainRuleViolationException
    );
    inmueble.verificarPorAdministrador("ADMINISTRADOR");
    expect(inmueble.estadoPublicacion).toBe("VERIFICADO");
  });

  it("RN-08: Impide a un Arrendatario mantener más de 3 SolicitudVisita en estado SOLICITADA", () => {
    const agenda = new AgendaService();
    const inmueble = crearInmuebleBase({ estadoPublicacion: "VERIFICADO" });
    const ahora = new Date("2026-12-01T06:00:00");
    const franja = new FranjaHoraria({
      id: "fr-4",
      inmuebleId: inmueble.id,
      fechaIso: "2026-12-01",
      horaInicio: "14:00",
      horaFin: "15:00",
      bloqueada: false,
    });

    const activas = [1, 2, 3].map(
      (n) =>
        new SolicitudVisita({
          id: `sol-${n}`,
          inmuebleId: `inm-${n}`,
          arrendatarioId: "arr-1",
          arrendatarioNombre: "Lucía",
          propietarioId: "prop-otro",
          franjaHorariaId: `fr-${n}`,
          estado: "SOLICITADA",
          creadaEnIso: ahora.toISOString(),
        })
    );

    expect(() =>
      agenda.crearSolicitudVisita({
        id: "sol-4",
        inmueble,
        arrendatarioId: "arr-1",
        arrendatarioNombre: "Lucía",
        franjaHoraria: franja,
        solicitudesExistentes: activas,
        ahora,
      })
    ).toThrow(DomainRuleViolationException);
  });

  it("RN-09: Impide publicar publicidad comercial externa o sin identidad comprobada", () => {
    const spam = crearInmuebleBase({
      verificacionAnunciante: {
        propietarioId: "prop-1",
        documentoIdentidad: "1712345678",
        identidadComprobada: true,
        esPublicidadComercialExterna: true,
      },
    });
    expect(() => spam.publicar()).toThrow(DomainRuleViolationException);

    const sinIdentidad = crearInmuebleBase({
      verificacionAnunciante: {
        propietarioId: "prop-1",
        documentoIdentidad: "1712345678",
        identidadComprobada: false,
        esPublicidadComercialExterna: false,
      },
    });
    expect(() => sinIdentidad.publicar()).toThrow(DomainRuleViolationException);
  });

  it("RN-10: Impide despachar más de 10 Inmueble por lote en BusquedaGeoespacialService", () => {
    const busqueda = new BusquedaGeoespacialService();
    const inmueble = crearInmuebleBase({ estadoPublicacion: "VERIFICADO" });

    expect(() =>
      busqueda.buscar([inmueble], {
        centro: { latitud: -0.180653, longitud: -78.484942 },
        radioMetros: 5000,
        pagina: 1,
        tamanoLote: 11,
      })
    ).toThrow(DomainRuleViolationException);
  });

  it("CU-02: ComparadorEspacialService calcula métricas lado a lado", () => {
    const comparador = new ComparadorEspacialService();
    const a = crearInmuebleBase({ id: "inm-a", canonMensualUsd: 550 });
    const b = crearInmuebleBase({ id: "inm-b", canonMensualUsd: 620 });
    const res = comparador.comparar(a, b);
    expect(res.mejorRelacionPrecioM2Id).toBe("inm-a");
    expect(res.diferenciaPrecioUsd).toBe(70);
  });
});
