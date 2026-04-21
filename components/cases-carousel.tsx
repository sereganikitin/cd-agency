"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Case, Direction } from "@/lib/db";

export function CasesCarousel({
  cases,
  directions,
}: {
  cases: Case[];
  directions: Direction[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [cases.length]);

  function scrollByCard(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 md:flex">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className="pointer-events-auto rounded-full border border-white/15 bg-graphite/60 px-3 py-1.5 text-sm text-white/80 backdrop-blur transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Предыдущие"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className="pointer-events-auto rounded-full border border-white/15 bg-graphite/60 px-3 py-1.5 text-sm text-white/80 backdrop-blur transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Следующие"
        >
          →
        </button>
      </div>

      <div
        ref={ref}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cases.map((c) => {
          const dir = directions.find((d) => d.slug === c.direction);
          return (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              data-card
              className="group snap-start shrink-0 w-[86%] sm:w-[58%] md:w-[44%] lg:w-[33%] overflow-hidden rounded-2xl border border-white/10 bg-graphite/40 transition hover:border-white/30"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image_url}
                  alt={c.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="space-y-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {dir && <span className="chip">{dir.title}</span>}
                  <span className="chip border-brand/40 text-brand">{c.type_title}</span>
                </div>
                <h3 className="font-display text-xl">{c.title}</h3>
                {c.description && (
                  <p className="text-sm text-white/60 line-clamp-2">{c.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
