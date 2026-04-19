import Link from "next/link";
import { listSections, listWorks, getSectionBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { section?: string };
};

export default async function GalleryPage({ searchParams }: Props) {
  const activeSlug = searchParams.section;

  const sections = listSections();
  const activeSection = activeSlug ? getSectionBySlug(activeSlug) : undefined;
  const works = listWorks(activeSection?.id);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip">Галерея</span>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-balance">
            {activeSection ? (
              <>
                Раздел: <span className="text-ember">{activeSection.title}</span>
              </>
            ) : (
              <>
                Все <span className="text-ember">точки касания</span>
              </>
            )}
          </h1>
          {activeSection?.description && (
            <p className="mt-3 max-w-2xl text-white/60">{activeSection.description}</p>
          )}
        </div>
        <div className="text-sm text-white/50">
          Работ: <span className="text-white">{works.length}</span>
        </div>
      </div>

      <nav className="mt-10 flex flex-wrap gap-2">
        <FilterPill href="/gallery" active={!activeSlug}>
          Все
        </FilterPill>
        {sections.map((s) => (
          <FilterPill key={s.id} href={`/gallery?section=${s.slug}`} active={activeSlug === s.slug}>
            {s.title}
          </FilterPill>
        ))}
      </nav>

      {works.length === 0 ? (
        <div className="mt-16 card p-14 text-center">
          <div className="font-display text-2xl">Здесь пока пусто.</div>
          <p className="mt-2 text-white/60">
            Добавьте первые работы в{" "}
            <Link href="/admin" className="text-ember underline">
              админке
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {works.map((w) => (
            <article
              key={w.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-graphite/40"
            >
              <img
                src={w.image_url}
                alt={w.title}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent opacity-90" />
              <div className="relative p-5">
                <span className="chip">{w.section_title}</span>
                <h3 className="mt-3 font-display text-2xl">{w.title}</h3>
                {w.description && (
                  <p className="mt-2 text-sm text-white/60">{w.description}</p>
                )}
                {w.link_url && (
                  <a
                    href={w.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-ember hover:text-spark"
                  >
                    Открыть кейс →
                  </a>
                )}
              </div>
            </article>
          ))}
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
          ? "rounded-full bg-ember px-4 py-2 text-sm font-medium text-midnight shadow-glow"
          : "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-ember/60 hover:text-white"
      }
    >
      {children}
    </Link>
  );
}
