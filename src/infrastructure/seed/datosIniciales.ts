import { FranjaHoraria } from "@/domain/agendamiento-visitas/FranjaHoraria";
import { SolicitudVisita } from "@/domain/agendamiento-visitas/SolicitudVisita";
import { CroquisReferencial } from "@/domain/gestion-verificacion/CroquisReferencial";
import { DimensionReferencial } from "@/domain/gestion-verificacion/DimensionReferencial";
import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";

export const CENTRO_LA_CAROLINA = {
  latitud: -0.180653,
  longitud: -78.484942,
};

export function crearCatalogoInicial(): Inmueble[] {
  return [
    new Inmueble({
      id: "inm-carolina-01",
      titulo: "Local Esquinero Iluminado · Ideal Peluquería o Estudio",
      descripcion:
        "Local en planta baja con vitrina a la calle, instalaciones hidráulicas listas para lavacabezas, baño privado y bodega.",
      tipoInmueble: "COMERCIAL",
      canonMensualUsd: 550,
      sector: "La Carolina, Quito",
      direccion: "Av. de los Shyris N34-120 y Portugal",
      coordenadas: { latitud: -0.1798, longitud: -78.4832 },
      propietarioId: "prop-demo",
      contactoPropietario: {
        nombreCompleto: "Elena Vásquez",
        telefono: "+593 99 412 8890",
        correoElectronico: "elena.vasquez@espacio.ec",
      },
      banoPropio: true,
      amenidades: ["Baño privado", "Agua caliente", "Vitrina frontal", "Medidor 220V"],
      actividadSugerida: "Peluquería / Barbería / Estética",
      imagenesUrl: [],
      dimensionReferencial: new DimensionReferencial({
        areaUtilM2: 58,
        largoM: 10.0,
        anchoM: 5.8,
        ambientes: [
          { nombre: "Salón principal (3 puestos)", largoM: 6.5, anchoM: 5.8, areaM2: 37.7 },
          { nombre: "Zona lavado y espera", largoM: 2.5, anchoM: 4.8, areaM2: 12.0 },
          { nombre: "Baño privado + bodega", largoM: 2.3, anchoM: 3.6, areaM2: 8.3 },
        ],
      }),
      croquisReferencial: new CroquisReferencial({
        descripcionDistribucion:
          "Acceso directo desde vereda hacia salón principal de 37.7 m², zona técnica de lavado al centro y baño privado al fondo.",
        zonas: [
          {
            etiqueta: "Salón Principal",
            xPorcentaje: 4,
            yPorcentaje: 8,
            anchoPorcentaje: 56,
            altoPorcentaje: 84,
            medidaTexto: "6.5m × 5.8m (37.7 m²)",
          },
          {
            etiqueta: "Lavado / Espera",
            xPorcentaje: 62,
            yPorcentaje: 8,
            anchoPorcentaje: 34,
            altoPorcentaje: 44,
            medidaTexto: "2.5m × 4.8m (12.0 m²)",
          },
          {
            etiqueta: "Baño + Bodega",
            xPorcentaje: 62,
            yPorcentaje: 55,
            anchoPorcentaje: 34,
            altoPorcentaje: 37,
            medidaTexto: "2.3m × 3.6m (8.3 m²)",
          },
        ],
      }),
      verificacionAnunciante: {
        propietarioId: "prop-demo",
        documentoIdentidad: "1718456920",
        identidadComprobada: true,
        esPublicidadComercialExterna: false,
      },
      estadoPublicacion: "VERIFICADO",
      codigoQR: {
        token: "ESP-CAR-01",
        urlDirecta: "/?inmueble=inm-carolina-01",
      },
    }),

    new Inmueble({
      id: "inm-inaquito-02",
      titulo: "Departamento Funcional 2 Dormitorios · Vista Parque",
      descripcion:
        "Departamento luminoso con sala-comedor amplia, cocina abierta estilo americano, 2 dormitorios y baño completo.",
      tipoInmueble: "VIVIENDA",
      canonMensualUsd: 490,
      sector: "Iñaquito, Quito",
      direccion: "Av. Naciones Unidas y Núñez de Vela",
      coordenadas: { latitud: -0.1742, longitud: -78.4865 },
      propietarioId: "prop-otro-1",
      contactoPropietario: {
        nombreCompleto: "Marco Villalba",
        telefono: "+593 98 765 1122",
        correoElectronico: "marco.villalba@espacio.ec",
      },
      banoPropio: true,
      amenidades: ["Baño privado", "Parqueadero", "Guardianía 24h", "Área de lavado"],
      actividadSugerida: "Vivienda familiar / Pareja",
      imagenesUrl: [],
      dimensionReferencial: new DimensionReferencial({
        areaUtilM2: 72,
        largoM: 12.0,
        anchoM: 6.0,
        ambientes: [
          { nombre: "Sala / Comedor", largoM: 6.0, anchoM: 4.5, areaM2: 27.0 },
          { nombre: "Dormitorio Máster", largoM: 4.0, anchoM: 3.8, areaM2: 15.2 },
          { nombre: "Dormitorio 2 + Estudio", largoM: 3.8, anchoM: 3.5, areaM2: 13.3 },
          { nombre: "Cocina + Baño", largoM: 4.5, anchoM: 3.6, areaM2: 16.5 },
        ],
      }),
      croquisReferencial: new CroquisReferencial({
        descripcionDistribucion:
          "Distribución rectangular con zona social al frente y dos dormitorios independientes hacia el ala tranquila.",
        zonas: [
          {
            etiqueta: "Sala / Comedor",
            xPorcentaje: 4,
            yPorcentaje: 8,
            anchoPorcentaje: 46,
            altoPorcentaje: 52,
            medidaTexto: "6.0m × 4.5m (27 m²)",
          },
          {
            etiqueta: "Cocina + Baño",
            xPorcentaje: 4,
            yPorcentaje: 63,
            anchoPorcentaje: 46,
            altoPorcentaje: 29,
            medidaTexto: "4.5m × 3.6m (16.5 m²)",
          },
          {
            etiqueta: "Dorm. Máster",
            xPorcentaje: 53,
            yPorcentaje: 8,
            anchoPorcentaje: 43,
            altoPorcentaje: 42,
            medidaTexto: "4.0m × 3.8m (15.2 m²)",
          },
          {
            etiqueta: "Dorm. 2",
            xPorcentaje: 53,
            yPorcentaje: 53,
            anchoPorcentaje: 43,
            altoPorcentaje: 39,
            medidaTexto: "3.8m × 3.5m (13.3 m²)",
          },
        ],
      }),
      verificacionAnunciante: {
        propietarioId: "prop-otro-1",
        documentoIdentidad: "1709988776",
        identidadComprobada: true,
        esPublicidadComercialExterna: false,
      },
      estadoPublicacion: "VERIFICADO",
      codigoQR: {
        token: "ESP-INA-02",
        urlDirecta: "/?inmueble=inm-inaquito-02",
      },
    }),

    new Inmueble({
      id: "inm-carolina-03",
      titulo: "Local Comercial Planta Libre · Zona Financiera",
      descripcion:
        "Espacio versátil cerca del Quicentro Shopping, ideal para cafetería de especialidad, showroom o peluquería boutique.",
      tipoInmueble: "COMERCIAL",
      canonMensualUsd: 575,
      sector: "La Carolina, Quito",
      direccion: "Av. Eloy Alfaro N35-44 y Bélgica",
      coordenadas: { latitud: -0.1835, longitud: -78.4819 },
      propietarioId: "prop-otro-2",
      contactoPropietario: {
        nombreCompleto: "Gabriela Paredes",
        telefono: "+593 99 301 4455",
        correoElectronico: "gabriela.p@espacio.ec",
      },
      banoPropio: true,
      amenidades: ["Baño privado", "Acceso silla de ruedas", "Fibra óptica"],
      actividadSugerida: "Cafetería / Peluquería / Oficina",
      imagenesUrl: [],
      dimensionReferencial: new DimensionReferencial({
        areaUtilM2: 64,
        largoM: 8.0,
        anchoM: 8.0,
        ambientes: [
          { nombre: "Planta abierta", largoM: 8.0, anchoM: 6.2, areaM2: 49.6 },
          { nombre: "Baño + Despensa", largoM: 4.0, anchoM: 3.6, areaM2: 14.4 },
        ],
      }),
      croquisReferencial: new CroquisReferencial({
        descripcionDistribucion:
          "Planta cuadrada simétrica de 8m × 8m sin columnas centrales, perfecta para modulación libre.",
        zonas: [
          {
            etiqueta: "Planta Abierta",
            xPorcentaje: 4,
            yPorcentaje: 8,
            anchoPorcentaje: 68,
            altoPorcentaje: 84,
            medidaTexto: "8.0m × 6.2m (49.6 m²)",
          },
          {
            etiqueta: "Baño + Despensa",
            xPorcentaje: 74,
            yPorcentaje: 8,
            anchoPorcentaje: 22,
            altoPorcentaje: 84,
            medidaTexto: "4.0m × 3.6m (14.4 m²)",
          },
        ],
      }),
      verificacionAnunciante: {
        propietarioId: "prop-otro-2",
        documentoIdentidad: "1722334455",
        identidadComprobada: true,
        esPublicidadComercialExterna: false,
      },
      estadoPublicacion: "PUBLICADO",
      codigoQR: {
        token: "ESP-CAR-03",
        urlDirecta: "/?inmueble=inm-carolina-03",
      },
    }),

    new Inmueble({
      id: "inm-floresta-04",
      titulo: "Suite Estudio Creativo · La Floresta",
      descripcion:
        "Suite con excelente iluminación natural, ideal para vivienda unipersonal o estudio de diseño.",
      tipoInmueble: "VIVIENDA",
      canonMensualUsd: 420,
      sector: "La Floresta, Quito",
      direccion: "Calle Andalucía N24-110 y Salazar",
      coordenadas: { latitud: -0.2035, longitud: -78.4852 },
      propietarioId: "prop-demo",
      contactoPropietario: {
        nombreCompleto: "Elena Vásquez",
        telefono: "+593 99 412 8890",
        correoElectronico: "elena.vasquez@espacio.ec",
      },
      banoPropio: true,
      amenidades: ["Baño privado", "Balcón", "Cocina equipada"],
      actividadSugerida: "Vivienda / Home Office",
      imagenesUrl: [],
      dimensionReferencial: new DimensionReferencial({
        areaUtilM2: 46,
        largoM: 9.2,
        anchoM: 5.0,
        ambientes: [
          { nombre: "Ambiente integrado", largoM: 7.0, anchoM: 5.0, areaM2: 35.0 },
          { nombre: "Baño + Clóset", largoM: 2.2, anchoM: 5.0, areaM2: 11.0 },
        ],
      }),
      croquisReferencial: new CroquisReferencial({
        descripcionDistribucion:
          "Loft lineal con ventanal panorámico hacia el oriente y núcleo húmedo compacto.",
        zonas: [
          {
            etiqueta: "Ambiente Integrado",
            xPorcentaje: 4,
            yPorcentaje: 10,
            anchoPorcentaje: 68,
            altoPorcentaje: 80,
            medidaTexto: "7.0m × 5.0m (35 m²)",
          },
          {
            etiqueta: "Baño + Clóset",
            xPorcentaje: 74,
            yPorcentaje: 10,
            anchoPorcentaje: 22,
            altoPorcentaje: 80,
            medidaTexto: "2.2m × 5.0m (11 m²)",
          },
        ],
      }),
      verificacionAnunciante: {
        propietarioId: "prop-demo",
        documentoIdentidad: "1718456920",
        identidadComprobada: true,
        esPublicidadComercialExterna: false,
      },
      estadoPublicacion: "EN_REVISION",
      codigoQR: {
        token: "ESP-FLO-04",
        urlDirecta: "/?inmueble=inm-floresta-04",
      },
    }),
  ];
}

export function crearFranjasIniciales(): FranjaHoraria[] {
  return [
    new FranjaHoraria({
      id: "fr-101",
      inmuebleId: "inm-carolina-01",
      fechaIso: "2026-11-28",
      horaInicio: "10:00",
      horaFin: "11:00",
      bloqueada: false,
    }),
    new FranjaHoraria({
      id: "fr-102",
      inmuebleId: "inm-carolina-01",
      fechaIso: "2026-11-28",
      horaInicio: "15:00",
      horaFin: "16:00",
      bloqueada: false,
    }),
    new FranjaHoraria({
      id: "fr-201",
      inmuebleId: "inm-inaquito-02",
      fechaIso: "2026-11-29",
      horaInicio: "11:00",
      horaFin: "12:00",
      bloqueada: false,
    }),
    new FranjaHoraria({
      id: "fr-301",
      inmuebleId: "inm-carolina-03",
      fechaIso: "2026-11-29",
      horaInicio: "16:00",
      horaFin: "17:00",
      bloqueada: false,
    }),
  ];
}

export function crearSolicitudesIniciales(): SolicitudVisita[] {
  return [
    new SolicitudVisita({
      id: "sol-demo-1",
      inmuebleId: "inm-carolina-01",
      arrendatarioId: "arr-otro",
      arrendatarioNombre: "Valeria Andrade (Emprendedora)",
      propietarioId: "prop-demo",
      franjaHorariaId: "fr-102",
      estado: "SOLICITADA",
      creadaEnIso: "2026-11-25T09:00:00Z",
      notaArrendatario: "Busco local para peluquería con 3 estaciones y baño propio.",
    }),
  ];
}
