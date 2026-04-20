import Link from "next/link";
import { Logo } from "./logo";

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
          <Link href="/gallery" className="hover:text-white">Галерея</Link>
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
