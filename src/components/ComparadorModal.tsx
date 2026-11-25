"use client";

import { ComparadorEspacialService } from "@/domain/busqueda-catalogo/ComparadorEspacialService";
import { Inmueble } from "@/domain/gestion-verificacion/Inmueble";
import { CheckCircle2, Ruler, Scale, X } from "lucide-react";

interface Props {
  inmuebleA: Inmueble;
  inmuebleB: Inmueble;
  onCerrar: () => void;
}

const comparador = new ComparadorEspacialService();

export function ComparadorModal({ inmuebleA, inmuebleB, onCerrar }: Props) {
  const resultado = comparador.comparar(inmuebleA, inmuebleB);
  const pares = [inmuebleA, inmuebleB];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17324D]/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#20A69A]" />
            <div>
              <h3 className="text-lg font-bold text-[#17324D]">
                Comparador Técnico Lado a Lado
              </h3>
              <p className="text-xs text-[#6C7A89]">
                CU-02 · Contraste multidimensional de precio/m² útil y ambientes
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-[#6C7A89] hover:bg-[#F5F7FA] hover:text-[#17324D]"
            aria-label="Cerrar comparador"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl bg-[#F5F7FA] p-3 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2 text-[#17324D]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#20A69A]" />
            <span>
              <strong>Mejor relación $/m²:</strong>{" "}
              {resultado.mejorRelacionPrecioM2Id === inmuebleA.id
                ? inmuebleA.titulo
                : inmuebleB.titulo}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#17324D]">
            <Ruler className="h-4 w-4 shrink-0 text-[#17324D]" />
            <span>
              <strong>Diferencia de superficie:</strong> {resultado.diferenciaAreaM2} m² (
              ${resultado.diferenciaPrecioUsd}/mes)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pares.map((inm) => {
            const esMejorPrecioM2 = resultado.mejorRelacionPrecioM2Id === inm.id;
            const esMayorArea = resultado.mayorSuperficieUtilId === inm.id;

            return (
              <div
                key={inm.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#17324D] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {inm.tipoInmueble}
                    </span>
                    {esMejorPrecioM2 && (
                      <span className="rounded-full bg-[#20A69A]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#20A69A]">
                        Mejor $/m²
                      </span>
                    )}
                    {esMayorArea && (
                      <span className="rounded-full bg-[#E67E22]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#E67E22]">
                        Mayor área útil
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-[#17324D]">{inm.titulo}</h4>
                  <p className="mt-0.5 text-xs text-[#6C7A89]">{inm.sector}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6C7A89]">Canon mensual</span>
                      <span className="font-bold text-[#20A69A]">
                        ${inm.canonMensualUsd}/mes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C7A89]">Área total útil</span>
                      <span className="font-semibold text-[#17324D]">
                        {inm.dimensionReferencial?.areaUtilM2 ?? 0} m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C7A89]">Relación $/m² útil</span>
                      <span className="font-semibold text-[#17324D]">
                        ${inm.precioPorM2Util}/m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C7A89]">Medidas generales</span>
                      <span className="font-medium text-[#17324D]">
                        {inm.dimensionReferencial?.largoM}m ×{" "}
                        {inm.dimensionReferencial?.anchoM}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C7A89]">Baño propio</span>
                      <span className="font-medium text-[#17324D]">
                        {inm.banoPropio ? "Sí" : "Compartido"}
                      </span>
                    </div>
                  </div>

                  {inm.dimensionReferencial && (
                    <div className="mt-4">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6C7A89]">
                        Ambientes ({inm.dimensionReferencial.ambientes.length})
                      </p>
                      <ul className="space-y-1">
                        {inm.dimensionReferencial.ambientes.map((amb, i) => (
                          <li
                            key={i}
                            className="flex justify-between rounded bg-[#F5F7FA] px-2 py-1 text-xs"
                          >
                            <span className="text-[#17324D]">{amb.nombre}</span>
                            <span className="font-medium text-[#6C7A89]">
                              {amb.areaM2} m²
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
