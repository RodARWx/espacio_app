"use client";

import { ComparadorModal } from "@/components/ComparadorModal";
import { CroquisInteractivo } from "@/components/CroquisInteractivo";
import { AgendaService } from "@/domain/agendamiento-visitas/AgendaService";
import { FranjaHoraria } from "@/domain/agendamiento-visitas/FranjaHoraria";
import { SolicitudVisita } from "@/domain/agendamiento-visitas/SolicitudVisita";
import { BusquedaGeoespacialService } from "@/domain/busqueda-catalogo/BusquedaGeoespacialService";
import { CroquisReferencial } from "@/domain/gestion-verificacion/CroquisReferencial";
import { DimensionReferencial } from "@/domain/gestion-verificacion/DimensionReferencial";
import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { DomainRuleViolationException } from "@/domain/shared/DomainRuleViolationException";
import { RolActor, TipoInmueble } from "@/domain/shared/UbicuoTypes";
import {
  CENTRO_LA_CAROLINA,
  crearCatalogoInicial,
  crearFranjasIniciales,
  crearSolicitudesIniciales,
} from "@/infrastructure/seed/datosIniciales";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Phone,
  PlusCircle,
  QrCode,
  Ruler,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const busquedaService = new BusquedaGeoespacialService();
const agendaService = new AgendaService();

type PasoArrendatario = "BUSQUEDA" | "FICHA" | "ENCAJE" | "COMPARAR";

export default function EspacioHome() {
  const [rolActual, setRolActual] = useState<RolActor>("ARRENDATARIO");
  const [pasoActual, setPasoActual] = useState<PasoArrendatario>("BUSQUEDA");
  const [inmuebles, setInmuebles] = useState<Inmueble[]>(() => crearCatalogoInicial());
  const [franjas, setFranjas] = useState<FranjaHoraria[]>(() => crearFranjasIniciales());
  const [solicitudes, setSolicitudes] = useState<SolicitudVisita[]>(() =>
    crearSolicitudesIniciales()
  );

  // Filtros dimensionales y geoespaciales (Figma 01 + RN-10)
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoInmueble | "TODOS">("TODOS");
  const [precioMaximo, setPrecioMaximo] = useState<number>(650);
  const [areaMinima, setAreaMinima] = useState<number>(40);
  const [anchoMinimo, setAnchoMinimo] = useState<number>(4);
  const [largoMinimo, setLargoMinimo] = useState<number>(6);
  const [radioMetros, setRadioMetros] = useState<number>(5000);
  const [soloBanoPropio, setSoloBanoPropio] = useState<boolean>(false);
  const [soloVerificados, setSoloVerificados] = useState<boolean>(false);
  const [pagina, setPagina] = useState<number>(1);

  // FichaInmueble, Comparador y QR
  const [fichaSeleccionadaId, setFichaSeleccionadaId] = useState<string>("inm-carolina-01");
  const [compararIds, setCompararIds] = useState<string[]>([
    "inm-carolina-01",
    "inm-inaquito-02",
  ]);
  const [mostrarComparadorModal, setMostrarComparadorModal] = useState<boolean>(false);
  const [qrInput, setQrInput] = useState<string>("");
  const [mostrarQrModal, setMostrarQrModal] = useState<boolean>(false);

  // Herramienta 03 Encaje Espacial (Space-Fit de Figma)
  const [equipoLargoM, setEquipoLargoM] = useState<number>(7.0);
  const [equipoAnchoM, setEquipoAnchoM] = useState<number>(4.5);
  const [incluirHolgura, setIncluirHolgura] = useState<boolean>(true);

  const [alertaDominio, setAlertaDominio] = useState<{
    tipo: "ok" | "error";
    mensaje: string;
  } | null>(null);

  // Formulario CU-01 Propietario
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoSector, setNuevoSector] = useState("La Carolina, Quito");
  const [nuevoTipo, setNuevoTipo] = useState<TipoInmueble>("COMERCIAL");
  const [nuevoCanon, setNuevoCanon] = useState(520);
  const [nuevaArea, setNuevaArea] = useState(55);
  const [nuevoLargo, setNuevoLargo] = useState(11);
  const [nuevoAncho, setNuevoAncho] = useState(5);
  const [esSpamPrueba, setEsSpamPrueba] = useState(false);

  const resultadoBusqueda = useMemo(() => {
    const base = busquedaService.buscar(inmuebles, {
      centro: CENTRO_LA_CAROLINA,
      radioMetros,
      tipoInmueble: tipoFiltro,
      precioMaximoUsd: precioMaximo,
      areaMinimaM2: areaMinima,
      soloBanoPropio,
      soloVerificados,
      textoBusqueda,
      pagina,
      tamanoLote: 10, // RN-10
    });

    const filtradosDimensionales = base.inmuebles.filter(({ inmueble }) => {
      const dim = inmueble.dimensionReferencial;
      if (!dim) return false;
      return dim.largoM >= largoMinimo && dim.anchoM >= anchoMinimo;
    });

    return {
      ...base,
      inmuebles: filtradosDimensionales,
      totalCoincidencias: filtradosDimensionales.length,
    };
  }, [
    inmuebles,
    radioMetros,
    tipoFiltro,
    precioMaximo,
    areaMinima,
    anchoMinimo,
    largoMinimo,
    soloBanoPropio,
    soloVerificados,
    textoBusqueda,
    pagina,
  ]);

  const fichaSeleccionada = useMemo(
    () => inmuebles.find((i) => i.id === fichaSeleccionadaId) ?? inmuebles[0],
    [inmuebles, fichaSeleccionadaId]
  );

  const franjasFicha = useMemo(
    () => franjas.filter((f) => f.inmuebleId === fichaSeleccionada?.id),
    [franjas, fichaSeleccionada]
  );

  const solicitudesArrendatarioActual = useMemo(
    () => solicitudes.filter((s) => s.arrendatarioId === "arr-sebastian"),
    [solicitudes]
  );

  const solicitudesPropietarioActual = useMemo(
    () => solicitudes.filter((s) => s.propietarioId === "prop-demo"),
    [solicitudes]
  );

  // Cálculo Encaje Espacial (Space-Fit)
  const evaluacionEncaje = useMemo(() => {
    const dim = fichaSeleccionada?.dimensionReferencial;
    const holgura = incluirHolgura ? 0.5 : 0;
    const largoReq = Number((equipoLargoM + holgura).toFixed(2));
    const anchoReq = Number((equipoAnchoM + holgura).toFixed(2));
    const largoDisp = dim?.largoM ?? 0;
    const anchoDisp = dim?.anchoM ?? 0;
    const margenLargo = Number((largoDisp - largoReq).toFixed(2));
    const margenAncho = Number((anchoDisp - anchoReq).toFixed(2));
    const encaja = margenLargo >= 0 && margenAncho >= 0;

    return { largoReq, anchoReq, largoDisp, anchoDisp, margenLargo, margenAncho, encaja };
  }, [fichaSeleccionada, equipoLargoM, equipoAnchoM, incluirHolgura]);

  const toggleComparar = (id: string) => {
    setCompararIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleSolicitarVisita = (franja: FranjaHoraria) => {
    if (!fichaSeleccionada) return;
    try {
      const nuevaSolicitud = agendaService.crearSolicitudVisita({
        id: `sol-${Date.now()}`,
        inmueble: fichaSeleccionada,
        arrendatarioId: "arr-sebastian",
        arrendatarioNombre: "Sebastián (Arrendatario)",
        franjaHoraria: franja,
        solicitudesExistentes: solicitudes,
        notaArrendatario: "Interesado en verificar medidas reales y distribución.",
      });
      setSolicitudes((prev) => [nuevaSolicitud, ...prev]);
      setAlertaDominio({
        tipo: "ok",
        mensaje: `SolicitudVisita emitida en estado SOLICITADA para ${franja.fechaIso} (${franja.horaInicio}-${franja.horaFin}). Contacto oculto hasta confirmación (RN-05).`,
      });
    } catch (err) {
      if (err instanceof DomainRuleViolationException) {
        setAlertaDominio({ tipo: "error", mensaje: err.message });
      }
    }
  };

  const handleConfirmarVisita = (solicitud: SolicitudVisita) => {
    const franja = franjas.find((f) => f.id === solicitud.franjaHorariaId);
    if (!franja) return;
    try {
      agendaService.confirmarSolicitudVisita({
        solicitudObjetivo: solicitud,
        franjaObjetivo: franja,
        todasLasSolicitudes: solicitudes,
        todasLasFranjas: franjas,
      });
      setSolicitudes([...solicitudes]);
      setFranjas([...franjas]);
      setAlertaDominio({
        tipo: "ok",
        mensaje:
          "SolicitudVisita CONFIRMADA (RN-01). FranjaHoraria bloqueada y datos de contacto liberados (RN-05).",
      });
    } catch (err) {
      if (err instanceof DomainRuleViolationException) {
        setAlertaDominio({ tipo: "error", mensaje: err.message });
      }
    }
  };

  const handlePublicarInmueble = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dimension = new DimensionReferencial({
        areaUtilM2: nuevaArea,
        largoM: nuevoLargo,
        anchoM: nuevoAncho,
        ambientes: [
          {
            nombre: "Área principal",
            largoM: Number((nuevoLargo * 0.75).toFixed(1)),
            anchoM: nuevoAncho,
            areaM2: Number((nuevaArea * 0.75).toFixed(1)),
          },
          {
            nombre: "Baño + Servicio",
            largoM: Number((nuevoLargo * 0.25).toFixed(1)),
            anchoM: nuevoAncho,
            areaM2: Number((nuevaArea * 0.25).toFixed(1)),
          },
        ],
      });

      const croquis = new CroquisReferencial({
        descripcionDistribucion:
          "Distribución generada desde registro técnico del Propietario con medidas verificables.",
        zonas: [
          {
            etiqueta: "Área Principal",
            xPorcentaje: 5,
            yPorcentaje: 10,
            anchoPorcentaje: 64,
            altoPorcentaje: 80,
            medidaTexto: `${Number((nuevaArea * 0.75).toFixed(1))} m²`,
          },
          {
            etiqueta: "Baño + Servicio",
            xPorcentaje: 71,
            yPorcentaje: 10,
            anchoPorcentaje: 24,
            altoPorcentaje: 80,
            medidaTexto: `${Number((nuevaArea * 0.25).toFixed(1))} m²`,
          },
        ],
      });

      const nuevoId = `inm-${Date.now()}`;
      const nuevo = new Inmueble({
        id: nuevoId,
        titulo: nuevoTitulo || "Nuevo Espacio en Arriendo",
        descripcion: "Publicado desde módulo CU-01 con especificación espacial completa.",
        tipoInmueble: nuevoTipo,
        canonMensualUsd: nuevoCanon,
        sector: nuevoSector,
        direccion: "Sector La Carolina, Quito",
        coordenadas: { latitud: -0.181, longitud: -78.484 },
        propietarioId: "prop-demo",
        contactoPropietario: {
          nombreCompleto: "Elena Vásquez",
          telefono: "+593 99 412 8890",
          correoElectronico: "elena.vasquez@espacio.ec",
        },
        banoPropio: true,
        amenidades: ["Baño privado", "Dimensiones verificables"],
        imagenesUrl: [],
        dimensionReferencial: dimension,
        croquisReferencial: croquis,
        verificacionAnunciante: {
          propietarioId: "prop-demo",
          documentoIdentidad: "1718456920",
          identidadComprobada: true,
          esPublicidadComercialExterna: esSpamPrueba,
        },
        estadoPublicacion: "EN_REVISION",
        codigoQR: {
          token: `ESP-${nuevoId.slice(-4)}`,
          urlDirecta: `/?inmueble=${nuevoId}`,
        },
      });

      if (esSpamPrueba) {
        nuevo.publicar();
      }

      setInmuebles((prev) => [nuevo, ...prev]);
      setFranjas((prev) => [
        ...prev,
        new FranjaHoraria({
          id: `fr-${Date.now()}`,
          inmuebleId: nuevoId,
          fechaIso: "2026-11-30",
          horaInicio: "10:00",
          horaFin: "11:00",
          bloqueada: false,
        }),
      ]);
      setNuevoTitulo("");
      setAlertaDominio({
        tipo: "ok",
        mensaje:
          "Inmueble registrado en estado EN_REVISION con DimensionReferencial, CroquisReferencial y FranjaHoraria (CU-01).",
      });
    } catch (err) {
      if (err instanceof DomainRuleViolationException) {
        setAlertaDominio({ tipo: "error", mensaje: err.message });
      }
    }
  };

  const handleVerificarAdmin = (inmueble: Inmueble) => {
    try {
      inmueble.verificarPorAdministrador(rolActual);
      setInmuebles([...inmuebles]);
      setAlertaDominio({
        tipo: "ok",
        mensaje: `Inmueble "${inmueble.titulo}" marcado como VERIFICADO por Administrador (RN-07).`,
      });
    } catch (err) {
      if (err instanceof DomainRuleViolationException) {
        setAlertaDominio({ tipo: "error", mensaje: err.message });
      }
    }
  };

  const handlePausarSpamAdmin = (inmueble: Inmueble) => {
    try {
      inmueble.pausarPorSpam(
        rolActual,
        "Bloqueado por filtro anti-publicidad comercial externa (RN-09)."
      );
      setInmuebles([...inmuebles]);
      setAlertaDominio({
        tipo: "ok",
        mensaje: `Publicación "${inmueble.titulo}" pausada por auditoría (RN-09).`,
      });
    } catch (err) {
      if (err instanceof DomainRuleViolationException) {
        setAlertaDominio({ tipo: "error", mensaje: err.message });
      }
    }
  };

  const handleBuscarPorQr = () => {
    const token = qrInput.trim().toUpperCase();
    const encontrado = inmuebles.find(
      (i) => i.codigoQR.token.toUpperCase() === token || i.id === qrInput.trim()
    );
    if (encontrado) {
      setFichaSeleccionadaId(encontrado.id);
      setMostrarQrModal(false);
      setRolActual("ARRENDATARIO");
      setPasoActual("FICHA");
      setAlertaDominio({
        tipo: "ok",
        mensaje: `CodigoQR ${encontrado.codigoQR.token} escaneado: FichaInmueble cargada directamente.`,
      });
    } else {
      setAlertaDominio({
        tipo: "error",
        mensaje: "CodigoQR no encontrado. Prueba con ESP-CAR-01 o ESP-INA-02.",
      });
    }
  };

  const parComparacion = useMemo(() => {
    if (compararIds.length !== 2) return null;
    const a = inmuebles.find((i) => i.id === compararIds[0]);
    const b = inmuebles.find((i) => i.id === compararIds[1]);
    return a && b ? { a, b } : null;
  }, [compararIds, inmuebles]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Header Figma-inspired: Barra superior #17324D con buscador global y roles */}
      <header className="sticky top-0 z-30 bg-[#17324D] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#20A69A] font-bold text-white">
              E
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">ESPACIO</h1>
              <p className="hidden text-[11px] text-slate-300 sm:block">
                Ecuador · Medidas reales antes de visitar
              </p>
            </div>
          </div>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
            <input
              type="text"
              value={textoBusqueda}
              onChange={(e) => {
                setTextoBusqueda(e.target.value);
                setRolActual("ARRENDATARIO");
                setPasoActual("BUSQUEDA");
                setPagina(1);
              }}
              placeholder="Buscar inmuebles, sectores o referencias (ej. La Carolina, peluquería)..."
              className="w-full rounded-lg border border-white/15 bg-white/10 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-300 outline-none focus:border-[#20A69A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMostrarQrModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              <QrCode className="h-4 w-4 text-[#20A69A]" />
              CodigoQR
            </button>

            <div className="flex rounded-lg bg-[#0f2336] p-1 text-xs">
              {(["ARRENDATARIO", "PROPIETARIO", "ADMINISTRADOR"] as RolActor[]).map((rol) => (
                <button
                  key={rol}
                  onClick={() => setRolActual(rol)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    rolActual === rol
                      ? "bg-[#20A69A] text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {rol === "ARRENDATARIO"
                    ? "Arrendatario"
                    : rol === "PROPIETARIO"
                    ? "Propietario"
                    : "Admin"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Barra de pasos Figma (01 Búsqueda · 02 Ficha Técnica · 03 Encaje Espacial · 04 Comparar) */}
        {rolActual === "ARRENDATARIO" && (
          <div className="border-t border-slate-200 bg-white text-[#17324D]">
            <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 text-xs">
              {(
                [
                  { id: "BUSQUEDA", num: "01", label: "Búsqueda" },
                  { id: "FICHA", num: "02", label: "FichaInmueble" },
                  { id: "ENCAJE", num: "03", label: "Encaje Espacial" },
                  { id: "COMPARAR", num: "04", label: `Comparar (${compararIds.length}/2)` },
                ] as const
              ).map((step) => {
                const activo = pasoActual === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setPasoActual(step.id)}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-1.5 font-semibold transition-colors ${
                      activo
                        ? "border-[#20A69A] text-[#17324D]"
                        : "border-transparent text-[#6C7A89] hover:text-[#17324D]"
                    }`}
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] ${
                        activo
                          ? "bg-[#20A69A]/15 text-[#20A69A]"
                          : "bg-slate-100 text-[#6C7A89]"
                      }`}
                    >
                      {step.num}
                    </span>
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6">
        {alertaDominio && (
          <div
            className={`mb-4 flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs shadow-xs ${
              alertaDominio.tipo === "ok"
                ? "border-[#20A69A]/40 bg-[#20A69A]/10 text-[#17324D]"
                : "border-[#E67E22]/50 bg-[#E67E22]/10 text-[#17324D]"
            }`}
          >
            <div className="flex items-start gap-2">
              {alertaDominio.tipo === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#20A69A]" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E67E22]" />
              )}
              <span className="font-medium">{alertaDominio.mensaje}</span>
            </div>
            <button onClick={() => setAlertaDominio(null)} aria-label="Cerrar alerta">
              <X className="h-4 w-4 text-[#6C7A89]" />
            </button>
          </div>
        )}

        {/* 01 BÚSQUEDA (Layout Figma: Sidebar Dimensional + Grid de Tarjetas) */}
        {rolActual === "ARRENDATARIO" && pasoActual === "BUSQUEDA" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20A69A]">
                  Catálogo de Inmuebles · Quito
                </span>
                <h2 className="text-2xl font-bold text-[#17324D]">
                  Encuentra el espacio que realmente necesitas.
                </h2>
                <p className="text-xs text-[#6C7A89]">
                  Busca por dimensiones útiles reales y radio geoespacial (máx. 10 por lote · RN-10).
                </p>
              </div>
              {compararIds.length === 2 && (
                <button
                  onClick={() => setPasoActual("COMPARAR")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#17324D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1f4266]"
                >
                  <Scale className="h-4 w-4 text-[#20A69A]" />
                  Ir al Comparador (2)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Sidebar izquierdo: Filtros Dimensionales (Figma 01) */}
              <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-3 h-fit">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#17324D]">
                    <SlidersHorizontal className="h-4 w-4 text-[#20A69A]" />
                    Filtros dimensionales
                  </span>
                  <button
                    onClick={() => {
                      setTextoBusqueda("");
                      setTipoFiltro("TODOS");
                      setPrecioMaximo(650);
                      setAreaMinima(40);
                      setAnchoMinimo(4);
                      setLargoMinimo(6);
                      setSoloBanoPropio(false);
                      setSoloVerificados(false);
                    }}
                    className="text-[11px] font-semibold text-[#20A69A] hover:underline"
                  >
                    Reiniciar
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#6C7A89]">
                    Tipo de Inmueble
                  </label>
                  <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value as TipoInmueble | "TODOS")}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-2 text-xs text-[#17324D]"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="COMERCIAL">Comercial (Local)</option>
                    <option value="VIVIENDA">Vivienda</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#6C7A89]">
                      Ancho mín (m)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={anchoMinimo}
                      onChange={(e) => setAnchoMinimo(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-[#6C7A89]">
                      Largo mín (m)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={largoMinimo}
                      onChange={(e) => setLargoMinimo(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex justify-between text-[11px] font-semibold text-[#6C7A89]">
                    <span>Área mínima</span>
                    <strong className="text-[#17324D]">{areaMinima} m²</strong>
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={areaMinima}
                    onChange={(e) => setAreaMinima(Number(e.target.value))}
                    className="w-full accent-[#20A69A]"
                  />
                </div>

                <div>
                  <label className="mb-1 flex justify-between text-[11px] font-semibold text-[#6C7A89]">
                    <span>Canon mensual máx</span>
                    <strong className="text-[#20A69A]">${precioMaximo}</strong>
                  </label>
                  <input
                    type="range"
                    min={300}
                    max={1000}
                    step={25}
                    value={precioMaximo}
                    onChange={(e) => setPrecioMaximo(Number(e.target.value))}
                    className="w-full accent-[#20A69A]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#6C7A89]">
                    Radio desde La Carolina
                  </label>
                  <select
                    value={radioMetros}
                    onChange={(e) => setRadioMetros(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-2 text-xs"
                  >
                    <option value={1000}>1 km</option>
                    <option value={3000}>3 km</option>
                    <option value={5000}>5 km</option>
                    <option value={15000}>15 km</option>
                  </select>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-[#17324D]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={soloBanoPropio}
                      onChange={(e) => setSoloBanoPropio(e.target.checked)}
                      className="accent-[#20A69A]"
                    />
                    Baño propio indispensable
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={soloVerificados}
                      onChange={(e) => setSoloVerificados(e.target.checked)}
                      className="accent-[#20A69A]"
                    />
                    Solo sello VERIFICADO
                  </label>
                </div>
              </aside>

              {/* Grid de Tarjetas (Figma 01) */}
              <div className="lg:col-span-9">
                <p className="mb-3 text-xs font-semibold text-[#6C7A89]">
                  <strong>{resultadoBusqueda.totalCoincidencias}</strong> espacios cumplen tus
                  dimensiones
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {resultadoBusqueda.inmuebles.map(({ inmueble, distanciaMetros }) => {
                    const enComparador = compararIds.includes(inmueble.id);
                    const dim = inmueble.dimensionReferencial;

                    return (
                      <article
                        key={inmueble.id}
                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
                      >
                        {/* Cabecera visual estilo Figma con badges */}
                        <div className="relative flex h-28 flex-col justify-between bg-gradient-to-br from-[#17324D] to-[#234d75] p-3 text-white">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#17324D]">
                              Croquis 2D
                            </span>
                            {inmueble.estadoPublicacion === "VERIFICADO" ? (
                              <span className="flex items-center gap-1 rounded-full bg-[#20A69A] px-2 py-0.5 text-[10px] font-bold text-white">
                                <ShieldCheck className="h-3 w-3" /> VERIFICADO
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                                {inmueble.estadoPublicacion}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-200">
                            <span>{inmueble.tipoInmueble}</span>
                            <span>QR: {inmueble.codigoQR.token}</span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-[#17324D] leading-snug">
                                {inmueble.titulo}
                              </h3>
                              <button
                                onClick={() => {
                                  setFichaSeleccionadaId(inmueble.id);
                                  setPasoActual("FICHA");
                                }}
                                className="rounded-full p-1 text-[#17324D] hover:bg-[#F5F7FA]"
                                aria-label="Abrir ficha"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-[#6C7A89]">
                              <span>
                                {dim?.largoM} × {dim?.anchoM} m
                              </span>
                              <span className="font-semibold text-[#17324D]">
                                {dim?.areaUtilM2} m² útiles
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="flex items-center gap-1 text-[11px] text-[#6C7A89]">
                              <MapPin className="h-3.5 w-3.5 text-[#20A69A]" />
                              {inmueble.sector} ({distanciaMetros}m)
                            </span>
                            <span className="text-sm font-bold text-[#20A69A]">
                              ${inmueble.canonMensualUsd}
                              <span className="text-[11px] font-normal text-[#6C7A89]">/mes</span>
                            </span>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setFichaSeleccionadaId(inmueble.id);
                                setPasoActual("FICHA");
                              }}
                              className="flex-1 rounded-lg bg-[#17324D] py-1.5 text-xs font-semibold text-white hover:bg-[#1f4266]"
                            >
                              Ver Ficha
                            </button>
                            <button
                              onClick={() => toggleComparar(inmueble.id)}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                enComparador
                                  ? "bg-[#20A69A] text-white"
                                  : "bg-[#F5F7FA] text-[#17324D] hover:bg-slate-200"
                              }`}
                            >
                              {enComparador ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 02 FICHA TÉCNICA (Figma 02: Croquis 2D + Especificaciones + FranjaHoraria) */}
        {rolActual === "ARRENDATARIO" && pasoActual === "FICHA" && fichaSeleccionada && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20A69A]">
                    FichaInmueble · {fichaSeleccionada.codigoQR.token}
                  </span>
                  <h2 className="mt-0.5 text-xl font-bold text-[#17324D]">
                    {fichaSeleccionada.titulo}
                  </h2>
                  <p className="text-xs text-[#6C7A89]">
                    {fichaSeleccionada.direccion} · {fichaSeleccionada.sector}
                  </p>
                </div>
                <button
                  onClick={() => setPasoActual("ENCAJE")}
                  className="flex items-center gap-1.5 rounded-lg bg-[#17324D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f4266]"
                >
                  <Box className="h-4 w-4 text-[#20A69A]" />
                  Evaluar Encaje Espacial
                </button>
              </div>

              {fichaSeleccionada.croquisReferencial &&
                fichaSeleccionada.dimensionReferencial && (
                  <CroquisInteractivo
                    croquis={fichaSeleccionada.croquisReferencial}
                    areaTotalM2={fichaSeleccionada.dimensionReferencial.areaUtilM2}
                    largoM={fichaSeleccionada.dimensionReferencial.largoM}
                    anchoM={fichaSeleccionada.dimensionReferencial.anchoM}
                  />
                )}

              {fichaSeleccionada.dimensionReferencial && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#17324D]">
                    Especificaciones Técnicas (DimensionReferencial)
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {fichaSeleccionada.dimensionReferencial.ambientes.map((amb, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F5F7FA] px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-[#17324D]">{amb.nombre}</span>
                        <span className="font-semibold text-[#20A69A]">
                          {amb.largoM}m × {amb.anchoM}m ({amb.areaM2} m²)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha Figma 02: Precio + FranjaHoraria */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6C7A89]">
                  Canon Mensual
                </p>
                <p className="mt-1 text-3xl font-bold text-[#20A69A]">
                  ${fichaSeleccionada.canonMensualUsd}
                  <span className="text-sm font-normal text-[#6C7A89]">/mes</span>
                </p>
                <p className="mt-1 text-xs text-[#6C7A89]">
                  Relación espacial: <strong>${fichaSeleccionada.precioPorM2Util} / m² útil</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-[#20A69A]" />
                  <h4 className="text-sm font-bold text-[#17324D]">
                    Agendar Visita (FranjaHoraria)
                  </h4>
                </div>

                <div className="space-y-2">
                  {franjasFicha.map((fr) => (
                    <button
                      key={fr.id}
                      disabled={fr.bloqueada}
                      onClick={() => handleSolicitarVisita(fr)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        fr.bloqueada
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                          : "border-[#20A69A] bg-[#20A69A]/10 text-[#17324D] hover:bg-[#20A69A] hover:text-white"
                      }`}
                    >
                      {fr.fechaIso} · {fr.horaInicio} - {fr.horaFin}{" "}
                      {fr.bloqueada ? "(Ocupada)" : ""}
                    </button>
                  ))}
                </div>

                {solicitudesArrendatarioActual.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-semibold text-[#6C7A89]">
                      Tus SolicitudVisita ({solicitudesArrendatarioActual.length}/3 RN-08)
                    </p>
                    {solicitudesArrendatarioActual.map((sol) => {
                      const inm = inmuebles.find((i) => i.id === sol.inmuebleId);
                      const contacto = inm
                        ? agendaService.obtenerContactoSiConfirmada(sol, inm)
                        : null;
                      return (
                        <div
                          key={sol.id}
                          className="rounded-lg bg-[#F5F7FA] p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#17324D]">{inm?.sector}</span>
                            <span className="rounded bg-[#17324D] px-2 py-0.5 text-[10px] text-white">
                              {sol.estado}
                            </span>
                          </div>
                          {contacto ? (
                            <p className="mt-1 flex items-center gap-1 font-semibold text-[#20A69A]">
                              <Phone className="h-3 w-3" /> {contacto.nombreCompleto}:{" "}
                              {contacto.telefono}
                            </p>
                          ) : (
                            <p className="mt-1 text-[11px] text-[#6C7A89]">
                              Contacto oculto hasta confirmación (RN-05)
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 03 ENCAJE ESPACIAL / SPACE-FIT (Figma 03) */}
        {rolActual === "ARRENDATARIO" && pasoActual === "ENCAJE" && fichaSeleccionada && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#20A69A]">
                Herramienta de Factibilidad
              </span>
              <h2 className="text-2xl font-bold text-[#17324D]">
                ¿Entran tus equipos o mobiliario en este Inmueble?
              </h2>
              <p className="text-xs text-[#6C7A89]">
                Compara las dimensiones de tus estaciones o mobiliario contra{" "}
                <strong>{fichaSeleccionada.titulo}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#17324D]">
                  Dimensiones requeridas (ej. puestos de peluquería)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-[#6C7A89]">Largo requerido (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={equipoLargoM}
                      onChange={(e) => setEquipoLargoM(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#6C7A89]">Ancho requerido (m)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={equipoAnchoM}
                      onChange={(e) => setEquipoAnchoM(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#17324D]">
                  <input
                    type="checkbox"
                    checked={incluirHolgura}
                    onChange={(e) => setIncluirHolgura(e.target.checked)}
                    className="accent-[#20A69A]"
                  />
                  Incluir 0.5 m de margen de circulación e instalación
                </label>
              </div>

              <div
                className={`rounded-2xl border-2 bg-white p-5 shadow-xs ${
                  evaluacionEncaje.encaja ? "border-[#20A69A]" : "border-[#E67E22]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6C7A89]">
                    Resultado Instantáneo
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      evaluacionEncaje.encaja
                        ? "bg-[#20A69A]/15 text-[#20A69A]"
                        : "bg-[#E67E22]/15 text-[#E67E22]"
                    }`}
                  >
                    {evaluacionEncaje.encaja ? "ENCAJA" : "NO ENCAJA"}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-[#17324D]">
                  {evaluacionEncaje.encaja
                    ? "Este espacio se ajusta a tus requerimientos."
                    : "El espacio disponible es menor al requerido."}
                </h3>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 text-xs">
                  <div className="grid grid-cols-4 bg-[#F5F7FA] px-3 py-2 font-semibold text-[#6C7A89]">
                    <span>Dimensión</span>
                    <span>Requerido</span>
                    <span>Disponible</span>
                    <span>Margen</span>
                  </div>
                  <div className="grid grid-cols-4 border-t border-slate-100 px-3 py-2">
                    <span className="font-medium">Largo</span>
                    <span>{evaluacionEncaje.largoReq} m</span>
                    <span>{evaluacionEncaje.largoDisp} m</span>
                    <span
                      className={`font-bold ${
                        evaluacionEncaje.margenLargo >= 0 ? "text-[#20A69A]" : "text-[#E67E22]"
                      }`}
                    >
                      {evaluacionEncaje.margenLargo >= 0 ? "+" : ""}
                      {evaluacionEncaje.margenLargo} m
                    </span>
                  </div>
                  <div className="grid grid-cols-4 border-t border-slate-100 px-3 py-2">
                    <span className="font-medium">Ancho</span>
                    <span>{evaluacionEncaje.anchoReq} m</span>
                    <span>{evaluacionEncaje.anchoDisp} m</span>
                    <span
                      className={`font-bold ${
                        evaluacionEncaje.margenAncho >= 0 ? "text-[#20A69A]" : "text-[#E67E22]"
                      }`}
                    >
                      {evaluacionEncaje.margenAncho >= 0 ? "+" : ""}
                      {evaluacionEncaje.margenAncho} m
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPasoActual("COMPARAR")}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#17324D] hover:bg-[#F5F7FA]"
                  >
                    Comparar alternativas
                  </button>
                  <button
                    onClick={() => setPasoActual("FICHA")}
                    className="rounded-lg bg-[#17324D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f4266]"
                  >
                    Agendar Visita →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 04 COMPARAR (Figma 04) */}
        {rolActual === "ARRENDATARIO" && pasoActual === "COMPARAR" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-[#17324D]">
                  Comparador Técnico Lado a Lado
                </h2>
                <p className="text-xs text-[#6C7A89]">
                  Revisa métricas físicas y económicas de dos Inmueble antes de visitar.
                </p>
              </div>
              {parComparacion && (
                <button
                  onClick={() => setMostrarComparadorModal(true)}
                  className="rounded-lg bg-[#20A69A] px-3.5 py-2 text-xs font-bold text-white"
                >
                  Abrir vista detallada
                </button>
              )}
            </div>

            {!parComparacion ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-[#6C7A89]">
                Selecciona 2 Inmueble desde la pestaña <strong>01 Búsqueda</strong> con el botón{" "}
                <code>+</code> para compararlos aquí.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-[#F5F7FA]">
                    <tr>
                      <th className="p-4 font-semibold text-[#6C7A89]">Atributo</th>
                      <th className="p-4 font-bold text-[#17324D]">
                        {parComparacion.a.titulo}
                      </th>
                      <th className="p-4 font-bold text-[#17324D]">
                        {parComparacion.b.titulo}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-4 text-[#6C7A89]">Dimensiones generales</td>
                      <td className="p-4 font-medium">
                        {parComparacion.a.dimensionReferencial?.largoM} ×{" "}
                        {parComparacion.a.dimensionReferencial?.anchoM} m
                      </td>
                      <td className="p-4 font-medium">
                        {parComparacion.b.dimensionReferencial?.largoM} ×{" "}
                        {parComparacion.b.dimensionReferencial?.anchoM} m
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#6C7A89]">Área útil</td>
                      <td className="p-4 font-semibold">
                        {parComparacion.a.dimensionReferencial?.areaUtilM2} m²
                      </td>
                      <td className="p-4 font-semibold">
                        {parComparacion.b.dimensionReferencial?.areaUtilM2} m²
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#6C7A89]">Canon mensual</td>
                      <td className="p-4 font-bold text-[#20A69A]">
                        ${parComparacion.a.canonMensualUsd}/mes
                      </td>
                      <td className="p-4 font-bold text-[#20A69A]">
                        ${parComparacion.b.canonMensualUsd}/mes
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#6C7A89]">Relación $/m² útil</td>
                      <td className="p-4 font-semibold">
                        ${parComparacion.a.precioPorM2Util}/m²
                      </td>
                      <td className="p-4 font-semibold">
                        ${parComparacion.b.precioPorM2Util}/m²
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#6C7A89]">Baño propio</td>
                      <td className="p-4">{parComparacion.a.banoPropio ? "Sí" : "No"}</td>
                      <td className="p-4">{parComparacion.b.banoPropio ? "Sí" : "No"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VISTA PROPIETARIO: CU-01 Publicar Inmueble + Confirmar Visitas */}
        {rolActual === "PROPIETARIO" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <form
              onSubmit={handlePublicarInmueble}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#20A69A]" />
                <h2 className="text-base font-bold text-[#17324D]">
                  CU-01 · Publicar Inmueble con DimensionReferencial
                </h2>
              </div>

              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Título (ej. Local Comercial La Carolina)"
                className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-xs"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as TipoInmueble)}
                  className="rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-xs"
                >
                  <option value="COMERCIAL">COMERCIAL</option>
                  <option value="VIVIENDA">VIVIENDA</option>
                </select>
                <input
                  type="text"
                  value={nuevoSector}
                  onChange={(e) => setNuevoSector(e.target.value)}
                  placeholder="Sector"
                  className="rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] text-[#6C7A89]">Canon ($)</label>
                  <input
                    type="number"
                    value={nuevoCanon}
                    onChange={(e) => setNuevoCanon(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6C7A89]">Área útil (m²)</label>
                  <input
                    type="number"
                    value={nuevaArea}
                    onChange={(e) => setNuevaArea(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6C7A89]">Largo (m)</label>
                  <input
                    type="number"
                    value={nuevoLargo}
                    onChange={(e) => setNuevoLargo(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6C7A89]">Ancho (m)</label>
                  <input
                    type="number"
                    value={nuevoAncho}
                    onChange={(e) => setNuevoAncho(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#6C7A89]">
                <input
                  type="checkbox"
                  checked={esSpamPrueba}
                  onChange={(e) => setEsSpamPrueba(e.target.checked)}
                  className="accent-[#E67E22]"
                />
                Simular publicidad comercial externa (dispara invariante RN-09)
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#20A69A] py-2.5 text-xs font-bold text-white hover:bg-[#198f84]"
              >
                Registrar Inmueble para Revisión
              </button>
            </form>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#17324D]" />
                <h2 className="text-base font-bold text-[#17324D]">
                  Solicitudes de Visita Recibidas (CU-03 · RN-01)
                </h2>
              </div>

              {solicitudesPropietarioActual.map((sol) => {
                const inm = inmuebles.find((i) => i.id === sol.inmuebleId);
                const fr = franjas.find((f) => f.id === sol.franjaHorariaId);
                return (
                  <div
                    key={sol.id}
                    className="rounded-xl border border-slate-200 bg-[#F5F7FA] p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#17324D]">{sol.arrendatarioNombre}</span>
                      <span className="rounded-full bg-[#17324D] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        {sol.estado}
                      </span>
                    </div>
                    <p className="mt-1 text-[#6C7A89]">
                      {inm?.titulo} · {fr?.fechaIso} ({fr?.horaInicio} - {fr?.horaFin})
                    </p>
                    {sol.notaArrendatario && (
                      <p className="mt-1 italic text-[#6C7A89]">
                        &ldquo;{sol.notaArrendatario}&rdquo;
                      </p>
                    )}
                    {sol.estado === "SOLICITADA" && (
                      <button
                        onClick={() => handleConfirmarVisita(sol)}
                        className="mt-2.5 rounded-lg bg-[#20A69A] px-3 py-1.5 font-semibold text-white hover:bg-[#198f84]"
                      >
                        Confirmar FranjaHoraria
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* VISTA ADMINISTRADOR: CU-04 Moderación y Estado Verificado */}
        {rolActual === "ADMINISTRADOR" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#E67E22]" />
              <div>
                <h2 className="text-base font-bold text-[#17324D]">
                  CU-04 · Auditoría de Verificación y Filtro Anti-Spam (RN-07, RN-09)
                </h2>
                <p className="text-xs text-[#6C7A89]">
                  Solo el Administrador puede asignar el sello VERIFICADO o pausar spam.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {inmuebles.map((inm) => (
                <div
                  key={inm.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#E67E22]/15 px-2.5 py-0.5 font-bold text-[#E67E22]">
                        {inm.estadoPublicacion}
                      </span>
                      <span className="text-[#6C7A89]">
                        CI Propietario: {inm.verificacionAnunciante.documentoIdentidad}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-[#17324D]">{inm.titulo}</h3>
                    <p className="mt-1 text-[#6C7A89]">
                      {inm.sector} · {inm.dimensionReferencial?.areaUtilM2} m² · $
                      {inm.canonMensualUsd}/mes
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleVerificarAdmin(inm)}
                      className="rounded-lg bg-[#20A69A] px-3 py-1.5 font-semibold text-white hover:bg-[#198f84]"
                    >
                      Aprobar VERIFICADO
                    </button>
                    <button
                      onClick={() => handlePausarSpamAdmin(inm)}
                      className="rounded-lg border border-[#E67E22] px-3 py-1.5 font-semibold text-[#E67E22] hover:bg-[#E67E22]/10"
                    >
                      Pausar (Spam)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {mostrarComparadorModal && parComparacion && (
        <ComparadorModal
          inmuebleA={parComparacion.a}
          inmuebleB={parComparacion.b}
          onCerrar={() => setMostrarComparadorModal(false)}
        />
      )}

      {mostrarQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17324D]/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17324D]">
                Acceso Rápido por CodigoQR (CU-02)
              </h3>
              <button onClick={() => setMostrarQrModal(false)}>
                <X className="h-4 w-4 text-[#6C7A89]" />
              </button>
            </div>
            <p className="mb-3 text-xs text-[#6C7A89]">
              Ingresa el código QR del letrero físico en el inmueble (ej.{" "}
              <code>ESP-CAR-01</code> o <code>ESP-INA-02</code>).
            </p>
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="ESP-CAR-01"
              className="mb-3 w-full rounded-lg border border-slate-200 bg-[#F5F7FA] px-3 py-2 text-xs uppercase"
            />
            <button
              onClick={handleBuscarPorQr}
              className="w-full rounded-xl bg-[#20A69A] py-2 text-xs font-bold text-white hover:bg-[#198f84]"
            >
              Abrir FichaInmueble
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
