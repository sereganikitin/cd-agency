import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || "./data/cd.db";

let _db: DatabaseSync | null = null;

export function getDb() {
  if (_db) return _db;

  const resolved = path.resolve(process.cwd(), DB_PATH);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });

  const db = new DatabaseSync(resolved);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      message TEXT,
      source TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      handled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS site_images (
      slot TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction TEXT NOT NULL,
      type_slug TEXT NOT NULL,
      type_title TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS direction_benefits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_works_section ON works(section_id);
    CREATE INDEX IF NOT EXISTS idx_works_position ON works(position);
    CREATE INDEX IF NOT EXISTS idx_sections_position ON sections(position);
    CREATE INDEX IF NOT EXISTS idx_cases_direction ON cases(direction);
    CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(direction, type_slug);
    CREATE INDEX IF NOT EXISTS idx_benefits_direction ON direction_benefits(direction, position);
  `);

  seedBenefitsIfEmpty(db);

  _db = db;
  return db;
}

function seedBenefitsIfEmpty(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM direction_benefits").get() as { c: number };
  if (count.c > 0) return;
  const insert = db.prepare(
    "INSERT INTO direction_benefits (direction, title, description, position) VALUES (?, ?, ?, ?)"
  );
  for (const [direction, items] of Object.entries(DEFAULT_BENEFITS)) {
    items.forEach((b, i) => insert.run(direction, b.title, b.description, i));
  }
}

const DEFAULT_BENEFITS: Record<string, { title: string; description: string }[]> = {
  web: [
    {
      title: "Бесшовный путь клиента",
      description:
        "Каждый экран ведёт к следующему шагу: от первого впечатления до нажатия «Купить». Без провалов и тупиков — структура строится на реальном пользовательском сценарии.",
    },
    {
      title: "Скорость загрузки меньше 2 секунд",
      description:
        "Оптимизируем изображения, код и сеть, разгружаем критический путь. Сайт открывается быстрее, чем у посетителя успевает уйти внимание.",
    },
    {
      title: "Адаптив под любое устройство",
      description:
        "Один дизайн, который безупречно работает на мобильном, планшете, десктопе и широких мониторах. Тестируем на реальной технике, а не только в симуляторе.",
    },
    {
      title: "SEO-готовность из коробки",
      description:
        "Семантическая вёрстка, метаданные, Open Graph, Schema.org, карта сайта и robots.txt. Поисковики индексируют корректно с первого же обхода.",
    },
    {
      title: "Интеграции без костылей",
      description:
        "CRM, платёжные системы, 1С, аналитика, чаты, email-маркетинг — всё подключено и работает в единой логике. Заявка из формы сразу в нужной системе.",
    },
    {
      title: "Удобная админка",
      description:
        "Вы сами меняете тексты, картинки, цены и статьи без помощи разработчика. Интерфейс, который не требует обучения и мануала на 50 страниц.",
    },
    {
      title: "Безопасность и SSL",
      description:
        "HTTPS, защита от XSS и CSRF, rate-limiting на формах, регулярные бэкапы. Данные клиентов — в безопасности с первого дня.",
    },
    {
      title: "Аналитика и A/B-тесты",
      description:
        "Яндекс.Метрика, Google Analytics 4, heatmaps и запись сессий. Вы видите, как пользователи ведут себя, и принимаете решения на цифрах, а не на ощущениях.",
    },
    {
      title: "Поддержка после запуска",
      description:
        "Исправляем баги, обновляем зависимости, консультируем по развитию. Сайт живёт и растёт вместе с вашим бизнесом, а не превращается в заброшенный артефакт.",
    },
  ],
  smm: [
    {
      title: "Контент-стратегия под ваши цели",
      description:
        "Разбираем рынок, ЦА и конкурентов, формулируем tone of voice. На выходе — план постов на месяц вперёд, а не «в духе вдохновения».",
    },
    {
      title: "Реактивные форматы",
      description:
        "Рилсы, шортсы, стикеры, мемы. Ловим тренды в первые часы и встраиваем ваш бренд в актуальный разговор — пока конкуренты только думают.",
    },
    {
      title: "Единый визуальный код",
      description:
        "Лента выглядит как целое произведение, а не случайный набор картинок. Узнаваемый стиль усиливает бренд и помогает запоминанию.",
    },
    {
      title: "Комьюнити-менеджмент",
      description:
        "Отвечаем на комментарии и DM в tone of voice бренда. Сложные случаи эскалируем вам за минуты, а не «завтра разберёмся».",
    },
    {
      title: "Инфлюэнс-маркетинг",
      description:
        "Находим блогеров с живой аудиторией, а не с накрученными ботами. Договариваемся, проводим кампании под ключ и измеряем эффект.",
    },
    {
      title: "Аналитика охватов и ER",
      description:
        "Еженедельный отчёт: что сработало, что нет, что усилим. Никаких отчётов в стиле «всё хорошо» — только цифры и выводы.",
    },
    {
      title: "Оперативная реакция на повестку",
      description:
        "Ваш бренд встраивается в инфоповоды за часы, а не за недели согласований. Пока актуально — мы уже в эфире.",
    },
    {
      title: "Таргет в связке с контентом",
      description:
        "Лучшие органические посты превращаются в платные объявления. Аудитории и бюджеты — под KPI, а не «потратить и посмотреть».",
    },
  ],
  performance: [
    {
      title: "Медиаплан под KPI",
      description:
        "Не «освоить бюджет», а попасть в конкретный CPA или ROAS. Планируем кампании под ваши бизнес-метрики, а не под абстрактные показы.",
    },
    {
      title: "Контекст и таргет в связке",
      description:
        "Яндекс.Директ, Google Ads, ВКонтакте, myTarget, Telegram Ads. Работаем там, где живёт ваша аудитория, а не там, где модно.",
    },
    {
      title: "Сквозная аналитика",
      description:
        "Связываем клики, заявки, продажи и LTV в единую цепочку. Видим не «дешёвый клик», а реальную маржу с канала — решение за цифрами.",
    },
    {
      title: "Постоянные A/B-тесты",
      description:
        "Тестируем креативы, заголовки, посадочные, аудитории. То, что сработало вчера, оптимизируется завтра — без «застывших» кампаний.",
    },
    {
      title: "Работа с 1P-данными",
      description:
        "Собираем аудитории из CRM, строим lookalike, настраиваем ретаргетинг. Ваши реальные продажи обучают ваши же кампании.",
    },
    {
      title: "Programmatic и динамика",
      description:
        "Баннеры подстраиваются под сегмент аудитории и товар в корзине. Генерируются налету вместо одного универсального шаблона.",
    },
    {
      title: "Прозрачная отчётность",
      description:
        "Дашборд в реальном времени и еженедельная сводка. Видно каждый рубль и что он принёс — никаких «по итогам квартала всё расскажем».",
    },
    {
      title: "Защита от скликивания",
      description:
        "Фильтры ботов, анализ аномалий трафика, автоматическое исключение невалидных источников. Бюджет уходит на реальных клиентов.",
    },
  ],
  branding: [
    {
      title: "Позиционирование и миссия",
      description:
        "Отвечаем на вопрос «зачем мы существуем» и делаем ответ понятным сотруднику, клиенту, партнёру и журналисту за один приём.",
    },
    {
      title: "Нейминг и слоган",
      description:
        "Имя, которое легко произносится, запоминается и защищается юридически. Слоган — не украшение, а сжатая до одной фразы история бренда.",
    },
    {
      title: "Логотип — цифра и витрина",
      description:
        "Векторная система с адаптивными версиями под соцсети, деловую документацию, наружку и сувенирку. Работает везде — от аватарки до билборда.",
    },
    {
      title: "Фирменная палитра и типографика",
      description:
        "Цвета и шрифты с правилами сочетаний и иерархии. Одинаково хорошо смотрятся и в презентации для инвестора, и в stories.",
    },
    {
      title: "Tone of Voice",
      description:
        "Гайд «как мы говорим» — уверенно, тепло, с лёгкой иронией. С примерами good/bad на реальных фрагментах постов, писем и объявлений.",
    },
    {
      title: "Brand Guidelines PDF",
      description:
        "Всё вышеперечисленное собрано в один документ. Подрядчики открывают и делают правильно — без ваших пересказов «как мы обычно».",
    },
    {
      title: "Шаблоны для команды",
      description:
        "Презентации, соцсети, email-подписи, визитки, коммерческие предложения. Команда перестаёт изобретать дизайн каждый раз с нуля.",
    },
    {
      title: "Ребрендинг с continuity",
      description:
        "Если переходите с существующей идентичности — сохраняем знакомые якоря. Аудитория видит «новое, но наше», а не «кого-то другого».",
    },
  ],
};

export type DirectionBenefit = {
  id: number;
  direction: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
};

export function listBenefits(direction: string): DirectionBenefit[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM direction_benefits WHERE direction = ? ORDER BY position ASC, id ASC"
    )
    .all(direction) as unknown as DirectionBenefit[];
  return plainAll(rows);
}

export type Section = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
};

export type Work = {
  id: number;
  section_id: number;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: number;
  created_at: string;
};

export type Lead = {
  id: number;
  name: string;
  contact: string;
  message: string | null;
  source: string | null;
  created_at: string;
  handled: number;
};

function plain<T extends Record<string, any>>(row: T | undefined): T | undefined {
  return row ? ({ ...row } as T) : undefined;
}

function plainAll<T extends Record<string, any>>(rows: T[]): T[] {
  return rows.map((r) => ({ ...r }));
}

export function listSections(): Section[] {
  const rows = getDb()
    .prepare("SELECT * FROM sections ORDER BY position ASC, id ASC")
    .all() as unknown as Section[];
  return plainAll(rows);
}

export function getSectionBySlug(slug: string): Section | undefined {
  return plain(
    getDb().prepare("SELECT * FROM sections WHERE slug = ?").get(slug) as
      | Section
      | undefined
  );
}

export type WorkRow = Work & { section_slug: string; section_title: string };

export function listWorks(sectionId?: number): WorkRow[] {
  const db = getDb();
  const rows = sectionId
    ? (db
        .prepare(
          `SELECT w.*, s.slug AS section_slug, s.title AS section_title
           FROM works w JOIN sections s ON s.id = w.section_id
           WHERE w.section_id = ?
           ORDER BY w.position ASC, w.id DESC`
        )
        .all(sectionId) as unknown as WorkRow[])
    : (db
        .prepare(
          `SELECT w.*, s.slug AS section_slug, s.title AS section_title
           FROM works w JOIN sections s ON s.id = w.section_id
           ORDER BY w.position ASC, w.id DESC`
        )
        .all() as unknown as WorkRow[]);
  return plainAll(rows);
}

export function listLeads(): Lead[] {
  const rows = getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as unknown as Lead[];
  return plainAll(rows);
}

export type Direction = {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  description: string;
  imageSlot: string;
};

export const DIRECTIONS: Direction[] = [
  {
    slug: "smm",
    kicker: "01",
    title: "SMM & Контент",
    tagline: "Контент, который заставляет остановить скролл.",
    description:
      "Реактивные форматы, рилсы, комьюнити-менеджмент и инфлюэнс-маркетинг. Мы ловим момент в ленте и превращаем его в охваты, сохранения и лиды.",
    imageSlot: "service-1",
  },
  {
    slug: "web",
    kicker: "02",
    title: "Web-разработка",
    tagline: "Платформы, где путь от интереса до покупки — секунды.",
    description:
      "Лендинги, корпоративные сайты, e-commerce, сервисы на Next.js. Performance-бюджет, интеграции, аналитика и A/B-тесты на уровне «по умолчанию».",
    imageSlot: "service-2",
  },
  {
    slug: "performance",
    kicker: "03",
    title: "Performance-маркетинг",
    tagline: "Находим аудиторию в момент её готовности к действию.",
    description:
      "Контекст, таргет, programmatic. Управляем бюджетом на результат: CPA, ROAS, LTV. Сквозная аналитика и прозрачная отчётность без воды.",
    imageSlot: "service-3",
  },
  {
    slug: "branding",
    kicker: "04",
    title: "Брендинг",
    tagline: "Визуальный код, который запоминают с первого касания.",
    description:
      "Стратегия, нейминг, логотип, гайдлайны, tone of voice. Собираем узнаваемую систему, которая работает от поста в соцсетях до вывески на витрине.",
    imageSlot: "service-4",
  },
];

export function getDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}

export type Case = {
  id: number;
  direction: string;
  type_slug: string;
  type_title: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: number;
  created_at: string;
};

export function listCases(direction?: string): Case[] {
  const db = getDb();
  const rows = direction
    ? (db
        .prepare(
          "SELECT * FROM cases WHERE direction = ? ORDER BY position ASC, id DESC"
        )
        .all(direction) as unknown as Case[])
    : (db
        .prepare("SELECT * FROM cases ORDER BY direction ASC, position ASC, id DESC")
        .all() as unknown as Case[]);
  return plainAll(rows);
}

export function listCaseTypes(direction: string): { slug: string; title: string; count: number }[] {
  const rows = getDb()
    .prepare(
      `SELECT type_slug AS slug, type_title AS title, COUNT(*) AS count
       FROM cases WHERE direction = ?
       GROUP BY type_slug, type_title
       ORDER BY title ASC`
    )
    .all(direction) as unknown as { slug: string; title: string; count: number }[];
  return plainAll(rows);
}

export const SITE_IMAGE_SLOTS: { slot: string; title: string; description: string; default: string; aspect: string }[] = [
  { slot: "hero", title: "Hero — фон главного экрана", description: "Появляется как фон первого экрана на главной.", default: "/defaults/hero.svg", aspect: "16/9" },
  { slot: "about", title: "Блок «Точка касания»", description: "Иллюстрация для блока между ценностями и галереей.", default: "/defaults/about.svg", aspect: "3/2" },
  { slot: "service-1", title: "Карточка: SMM & Контент", description: "Иллюстрация для первой услуги.", default: "/defaults/service-1.svg", aspect: "4/3" },
  { slot: "service-2", title: "Карточка: Web-разработка", description: "Иллюстрация для второй услуги.", default: "/defaults/service-2.svg", aspect: "4/3" },
  { slot: "service-3", title: "Карточка: Performance", description: "Иллюстрация для третьей услуги.", default: "/defaults/service-3.svg", aspect: "4/3" },
  { slot: "service-4", title: "Карточка: Брендинг", description: "Иллюстрация для четвёртой услуги.", default: "/defaults/service-4.svg", aspect: "4/3" },
  { slot: "cta", title: "Блок «Контакты»", description: "Баннер над формой заявки.", default: "/defaults/cta.svg", aspect: "2/1" },
];

export function getSiteImageUrl(slot: string): string {
  const row = getDb().prepare("SELECT url FROM site_images WHERE slot = ?").get(slot) as
    | { url: string }
    | undefined;
  if (row?.url) return row.url;
  const def = SITE_IMAGE_SLOTS.find((s) => s.slot === slot);
  return def?.default || "/defaults/hero.svg";
}

export function getAllSiteImages(): { slot: string; url: string; isDefault: boolean }[] {
  const db = getDb();
  return SITE_IMAGE_SLOTS.map((def) => {
    const row = db.prepare("SELECT url FROM site_images WHERE slot = ?").get(def.slot) as
      | { url: string }
      | undefined;
    return {
      slot: def.slot,
      url: row?.url || def.default,
      isDefault: !row?.url,
    };
  });
}

export function setSiteImage(slot: string, url: string) {
  getDb()
    .prepare(
      `INSERT INTO site_images (slot, url, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(slot) DO UPDATE SET url = excluded.url, updated_at = datetime('now')`
    )
    .run(slot, url);
}

export function resetSiteImage(slot: string) {
  getDb().prepare("DELETE FROM site_images WHERE slot = ?").run(slot);
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `section-${Date.now()}`;
}
