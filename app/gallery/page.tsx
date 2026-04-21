import Link from "next/link";
import { DIRECTIONS, getDirection, listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { direction?: string };
};

export default function GalleryPage({ searchParams }: Props) {
  const activeSlug = searchParams.direction;
  const activeDirection = activeSlug ? getDirection(activeSlug) : undefined;
  const cases = listCases(activeDirection?.slug);
  const totalAll = activeSlug ? listCases().length : cases.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip">Кейсы</span>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-balance">
            {activeDirection ? (
              <>
                Кейсы: <span className="text-brand">{activeDirection.title}</span>
              </>
            ) : (
              <>
                Все <span className="text-brand">зацепленные</span> проекты
              </>
            )}
          </h1>
          {activeDirection?.description && (
            <p className="mt-3 max-w-2xl text-white/60">{activeDirection.description}</p>
          )}
        </div>
        <div className="text-sm text-white/50">
          Кейсов: <span className="text-white">{cases.length}</span>
        </div>
      </div>

      <nav className="mt-10 flex flex-wrap gap-2">
        <FilterPill href="/gallery" active={!activeSlug}>
          Все ({totalAll})
        </FilterPill>
        {DIRECTIONS.map((d) => {
          const count = listCases(d.slug).length;
          return (
            <FilterPill
              key={d.slug}
              href={`/gallery?direction=${d.slug}`}
              active={activeSlug === d.slug}
            >
              {d.title} ({count})
            </FilterPill>
          );
        })}
      </nav>

      {cases.length === 0 ? (
        <div className="mt-16 card p-14 text-center">
          <div className="font-display text-2xl">Кейсы скоро появятся.</div>
          <p className="mt-2 text-white/60">
            Работаем над проектами — свяжитесь с нами, чтобы стать первым в этом разделе.
          </p>
          <Link href="/#contact" className="btn-primary mt-6">
            Обсудить проект →
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => {
            const dir = DIRECTIONS.find((d) => d.slug === c.direction);
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-graphite/40 transition hover:border-white/30"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image_url}
                    alt={c.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {dir && <span className="chip">{dir.title}</span>}
                    <span className="chip border-brand/40 text-brand">{c.type_title}</span>
                  </div>
                  <h3 className="font-display text-2xl">{c.title}</h3>
                  {c.description && (
                    <p className="text-sm text-white/60 line-clamp-3">{c.description}</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm text-white/70 transition group-hover:translate-x-1 group-hover:text-clean">
                    Открыть кейс →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-clean px-4 py-2 text-sm font-medium text-midnight"
          : "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-white/40 hover:text-white"
      }
    >
      {children}
    </Link>
  );
}
