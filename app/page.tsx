import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { CasesCarousel } from "@/components/cases-carousel";
import { DIRECTIONS, getSiteImageUrl, listFeaturedCases } from "@/lib/db";

export const dynamic = "force-dynamic";

const values = [
  {
    title: "Стойкость",
    body: "Крепкий панцирь стратегии: кампании выдерживают смену алгоритмов, экономические циклы и капризы рынка.",
  },
  {
    title: "Трансформация",
    body: "Как краб сбрасывает панцирь, чтобы расти — так бренд обновляется, не теряя себя. Рост без паники и без страха потерять узнаваемость.",
  },
  {
    title: "Цепкость",
    body: "Клешни держат задачу, пока она не решена. Не выпускаем клиента из внимания — от первого созвона до постлонча.",
  },
  {
    title: "Чувство стихии",
    body: "Краб чувствует луну и прилив. Мы чувствуем нерв рынка, тренды соцсетей и изменения алгоритмов — и двигаемся вовремя.",
  },
];

const services = DIRECTIONS.map((d) => ({
  kicker: d.kicker,
  title: d.title,
  body: d.tagline,
  slot: d.imageSlot,
  href: `/services/${d.slug}`,
}));

const manifesto = [
  "Цепляй тренды",
  "Держи рынок",
  "Crab Digital",
  "Расти не теряя формы",
  "Меняй оболочку",
  "Загребай удачу",
];

const crabSymbols = [
  {
    title: "Стойкость и защита",
    body: "Крепкий панцирь — символ упорства, решимости и надёжной защиты бренда от рыночных невзгод.",
  },
  {
    title: "Возрождение и трансформация",
    body: "Способность сбрасывать панцирь при линьке — символ обновления, роста и умения начинать заново.",
  },
  {
    title: "Достаток и удача",
    body: "В японской культуре нэцкэ краб «загребает» богатство и успех. Мы переносим этот жест в digital.",
  },
  {
    title: "Стихия воды и луны",
    body: "Краб чувствует приливы и лунные циклы. Как и мы — перемены настроений аудитории и волн спроса.",
  },
  {
    title: "Знак зодиака",
    body: "Символ Рака: ретроградное движение солнца после летнего солнцестояния. Точка, где привычное меняется.",
  },
];

export default async function HomePage() {
  const featured = listFeaturedCases(12);
  const heroImg = getSiteImageUrl("hero");
  const aboutImg = getSiteImageUrl("about");
  const ctaImg = getSiteImageUrl("cta");
  const serviceImgs = services.map((s) => getSiteImageUrl(s.slot));

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/70 via-midnight/90 to-midnight" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-28 md:pb-36">
          <div className="chip">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-clean" />
            Crab Digital Agency · 2026
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-balance md:text-7xl lg:text-8xl">
            Цепляем тренды. <br />
            <span className="text-brand">Держим</span> рынок.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70 md:text-xl">
            Digital-агентство полного цикла с панцирем стратегии и цепкими клешнями исполнения. Помогаем брендам расти, меняясь, — и удерживать внимание аудитории в любом приливе.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="#contact" className="btn-primary">
              Обсудить проект →
            </Link>
            <Link href="/gallery" className="btn-ghost">
              Посмотреть работы
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { k: "< 24 ч", v: "реакция на бриф" },
              { k: "×3.4", v: "средний рост CTR" },
              { k: "12+", v: "вертикалей в портфеле" },
              { k: "100%", v: "прозрачная отчётность" },
            ].map((s) => (
              <div key={s.v} className="card p-5">
                <div className="font-display text-3xl text-clean">{s.k}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border-y border-white/10 bg-midnight/60 py-5">
          <div className="flex w-max animate-ticker gap-10 whitespace-nowrap font-display text-2xl text-white/50">
            {[...manifesto, ...manifesto, ...manifesto].map((m, i) => (
              <span key={i} className="flex items-center gap-10">
                <span>{m}</span>
                <span className="text-clean">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="chip">Направления</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
              Четыре направления. <span className="text-clean">Один панцирь.</span>
            </h2>
          </div>
          <p className="hidden max-w-md text-sm text-white/60 md:block">
            Сайт, контент и реклама — это единый поток. Мы стираем границы между разработкой и креативом.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {services.map((s, i) => (
            <Link
              key={s.title}
              href={s.href}
              className="card group relative overflow-hidden transition hover:border-white/30"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={serviceImgs[i]}
                  alt={s.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <span className="font-display text-sm text-white/60">{s.kicker}</span>
                  <span className="text-white/40 transition group-hover:translate-x-1 group-hover:text-clean">→</span>
                </div>
                <h3 className="mt-4 font-display text-3xl">{s.title}</h3>
                <p className="mt-3 text-sm text-white/60">{s.body}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 opacity-0 transition group-hover:opacity-100">
                  Смотреть кейсы →
                </div>
                <div className="hairline mt-8 shimmer animate-shimmer" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="values" className="border-y border-white/10 bg-graphite/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <span className="chip">Ценности</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
            Что у нас в <span className="text-clean">панцире.</span>
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.title} className="relative">
                <div className="font-display text-6xl text-white/15">0{i + 1}</div>
                <h3 className="mt-2 font-display text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm text-white/60">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div className="md:sticky md:top-24">
            <span className="chip">О нас</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
              Почему краб.
            </h2>
            <p className="mt-4 text-white/70">
              Мы выбрали краба не как картинку, а как рабочую метафору. Пять смыслов этого символа — это пять принципов, которыми мы руководствуемся каждый день.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <img src={aboutImg} alt="Crab Digital Agency" className="aspect-[3/2] w-full object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            {crabSymbols.map((s, i) => (
              <div
                key={s.title}
                className="card p-6 transition hover:border-white/30"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-4xl text-white/25">0{i + 1}</span>
                  <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
                </div>
                <p className="mt-3 pl-14 text-white/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip">Кейсы</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
              Работы, которые мы <span className="text-clean">зацепили.</span>
            </h2>
          </div>
          <Link href="/gallery" className="btn-ghost">
            Посмотреть все →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="mt-10 card p-10 text-center text-white/60">
            На главной пока нет кейсов. Отметьте нужные галочкой «Выводить на главную»{" "}
            <Link href="/admin/cases" className="text-clean underline">в админке</Link>.
          </div>
        ) : (
          <div className="mt-10">
            <CasesCarousel cases={featured} directions={DIRECTIONS} />
          </div>
        )}
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="card relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${ctaImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent" />
          <div className="relative grid gap-10 p-8 md:grid-cols-2 md:p-14">
            <div>
              <span className="chip">Контакты</span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
                Расскажите о задаче — <span className="text-clean">зацепимся за 24 часа.</span>
              </h2>
              <p className="mt-4 text-white/70">
                Оставьте заявку — подберём подход и соберём команду под ваш проект. Без длинных бриф-пингов и водянистых предложений.
              </p>
              <div className="mt-8 space-y-2 text-sm text-white/80">
                <div>✉ <a href="mailto:hello@crab.agency" className="hover:text-clean">hello@crab.agency</a></div>
                <div>✦ <a href="https://t.me/crab_digital_agency" className="hover:text-clean">@crab_digital_agency</a></div>
              </div>
            </div>
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
