import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-midnight">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-display text-xl italic">
              Carpe Diem <span className="text-ember">Agency</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Агентство быстрых и точных коммуникаций. Мы не ждём идеального момента — мы создаём его здесь и сейчас.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/50">Навигация</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-ember">Главная</Link></li>
            <li><Link href="/gallery" className="hover:text-ember">Галерея</Link></li>
            <li><Link href="/#services" className="hover:text-ember">Услуги</Link></li>
            <li><Link href="/#contact" className="hover:text-ember">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/50">Связь</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="mailto:hello@carpediem.agency" className="hover:text-ember">hello@carpediem.agency</a></li>
            <li><a href="https://t.me/carpediem_agency" className="hover:text-ember">@carpediem_agency</a></li>
            <li><Link href="/admin" className="text-white/40 hover:text-white/70">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/40 md:flex-row">
          <span>© {new Date().getFullYear()} Carpe Diem Agency. Все права защищены.</span>
          <span className="font-display italic">Успеть вовремя. Стать легендой.</span>
        </div>
      </div>
    </footer>
  );
}
