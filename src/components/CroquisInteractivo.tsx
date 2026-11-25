"use client";

import { CroquisReferencial } from "@/domain/gestion-verificacion/CroquisReferencial";

interface Props {
  croquis: CroquisReferencial;
  areaTotalM2: number;
  largoM: number;
  anchoM: number;
}

export function CroquisInteractivo({ croquis, areaTotalM2, largoM, anchoM }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#F5F7FA] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#20A69A]">
            CroquisReferencial
          </span>
          <h4 className="text-sm font-bold text-[#17324D]">
            Distribución Espacial ({largoM}m × {anchoM}m · {areaTotalM2} m² útiles)
          </h4>
        </div>
        <span className="rounded-full bg-[#17324D]/10 px-2.5 py-1 text-xs font-medium text-[#17324D]">
          Escala referencial
        </span>
      </div>

      <div className="relative h-56 w-full overflow-hidden rounded-lg border-2 border-[#17324D] bg-white shadow-inner">
        {croquis.zonas.map((zona, idx) => (
          <div
            key={`${zona.etiqueta}-${idx}`}
            style={{
              left: `${zona.xPorcentaje}%`,
              top: `${zona.yPorcentaje}%`,
              width: `${zona.anchoPorcentaje}%`,
              height: `${zona.altoPorcentaje}%`,
            }}
            className="absolute flex flex-col items-center justify-center rounded border border-[#20A69A] bg-[#20A69A]/10 p-1.5 text-center transition-colors hover:bg-[#20A69A]/20"
          >
            <span className="text-xs font-bold leading-tight text-[#17324D]">
              {zona.etiqueta}
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-[#6C7A89]">
              {zona.medidaTexto}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#6C7A89]">
        {croquis.descripcionDistribucion}
      </p>
    </div>
  );
}
