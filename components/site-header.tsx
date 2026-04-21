import Link from "next/link";
import { Logo } from "./logo";
import { DIRECTIONS } from "@/lib/db";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="font-display text-xl tracking-tight">
            Crab <span className="text-brand">Digital</span> Agency
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <Link href="/#services" className="hover:text-white">Услуги</Link>

          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-white focus:text-white focus:outline-none"
            >
              Кейсы
              <span className="text-white/40 transition group-hover:text-white group-hover:rotate-180 group-focus-within:rotate-180 inline-block">▾</span>
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="min-w-[240px] rounded-xl border border-white/10 bg-midnight/95 p-2 shadow-2xl backdrop-blur-xl">
                {DIRECTIONS.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/services/${d.slug}`}
                    className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    <span>{d.title}</span>
                    <span className="text-xs text-white/30">{d.kicker}</span>
                  </Link>
                ))}
                <div className="my-1 h-px bg-white/10" />
                <Link
                  href="/gallery"
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-brand hover:bg-white/5"
                >
                  <span>Все кейсы</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/#about" className="hover:text-white">О нас</Link>
          <Link href="/#contact" className="hover:text-white">Контакты</Link>
        </nav>
        <Link href="/#contact" className="btn-primary hidden md:inline-flex text-sm py-2 px-4">
          Начать проект
        </Link>
      </div>
    </header>
  );
}
