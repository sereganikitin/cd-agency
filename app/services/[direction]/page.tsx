import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTIONS,
  getDirection,
  getSiteImageUrl,
  listCaseTypes,
  listCases,
} from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: { direction: string };
  searchParams: { type?: string };
};

export async function generateMetadata({ params }: { params: { direction: string } }) {
  const dir = getDirection(params.direction);
  if (!dir) return {};
  return {
    title: `${dir.title} — Carpe Diem Agency`,
    description: dir.tagline,
  };
}

export default function ServiceDirectionPage({ params, searchParams }: Props) {
  const dir = getDirection(params.direction);
  if (!dir) notFound();

  const allCases = listCases(dir.slug);
  const types = listCaseTypes(dir.slug);
  const activeType = searchParams.type || "";
  const filtered = activeType
    ? allCases.filter((c) => c.type_slug === activeType)
    : allCases;

  const heroImg = getSiteImageUrl(dir.imageSlot);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/70 via-midnight/85 to-midnight" />
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-20 md:pt-20 md:pb-28">
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span>›</span>
            <Link href="/#services" className="hover:text-white">Направления</Link>
            <span>›</span>
            <span className="text-white">{dir.title}</span>
          </nav>
          <span className="chip">Направление {dir.kicker}</span>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl">
            {dir.title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-ember md:text-2xl">{dir.tagline}</p>
          <p className="mt-4 max-w-3xl text-white/70">{dir.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#contact" className="btn-primary">
              Запросить смету →
            </Link>
            <Link href="/gallery" className="btn-ghost">
              Вся галерея
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip">Кейсы</span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Проекты в направлении <span className="text-ember">{dir.title}</span>
            </h2>
          </div>
          <div className="text-sm text-white/50">
            Всего: <span className="text-white">{filtered.length}</span>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-2">
          <FilterPill href={`/services/${dir.slug}`} active={!activeType}>
            Все ({allCases.length})
          </FilterPill>
          {types.map((t) => (
            <FilterPill
              key={t.slug}
              href={`/services/${dir.slug}?type=${encodeURIComponent(t.slug)}`}
              active={activeType === t.slug}
            >
              {t.title} ({t.count})
            </FilterPill>
          ))}
        </nav>

        {filtered.length === 0 ? (
          <div className="mt-12 card p-12 text-center">
            <h3 className="font-display text-2xl">Кейсы скоро появятся.</h3>
            <p className="mt-2 text-white/60">
              Мы работаем над проектами в этом направлении — свяжитесь с нами, чтобы стать первым.
            </p>
            <Link href="/#contact" className="btn-primary mt-6">
              Обсудить проект →
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-graphite/40 transition hover:border-ember/50"
              >
                {c.link_url ? (
                  <a href={c.link_url} target="_blank" rel="noreferrer" className="block">
                    <CaseContent c={c} />
                  </a>
                ) : (
                  <CaseContent c={c} />
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-graphite/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-3xl md:text-4xl">Другие направления</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {DIRECTIONS.filter((d) => d.slug !== dir.slug).map((d) => (
              <Link
                key={d.slug}
                href={`/services/${d.slug}`}
                className="card group p-6 transition hover:border-ember/50"
              >
                <div className="text-xs text-ember">{d.kicker}</div>
                <div className="mt-2 font-display text-2xl">{d.title}</div>
                <div className="mt-2 text-sm text-white/60">{d.tagline}</div>
                <span className="mt-4 inline-block text-ember transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CaseContent({ c }: { c: { title: string; description: string | null; image_url: string; type_title: string; link_url: string | null } }) {
  return (
    <>
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={c.image_url}
          alt={c.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="space-y-3 p-5">
        <span className="chip">{c.type_title}</span>
        <h3 className="font-display text-2xl">{c.title}</h3>
        {c.description && <p className="text-sm text-white/60 line-clamp-3">{c.description}</p>}
        {c.link_url && (
          <span className="inline-flex items-center gap-1 text-sm text-ember">
            Открыть кейс →
          </span>
        )}
      </div>
    </>
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
          ? "rounded-full bg-ember px-4 py-2 text-sm font-medium text-midnight shadow-glow"
          : "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-ember/60 hover:text-white"
      }
    >
      {children}
    </Link>
  );
}
