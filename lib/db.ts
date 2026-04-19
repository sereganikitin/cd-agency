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

    CREATE INDEX IF NOT EXISTS idx_works_section ON works(section_id);
    CREATE INDEX IF NOT EXISTS idx_works_position ON works(position);
    CREATE INDEX IF NOT EXISTS idx_sections_position ON sections(position);
  `);

  _db = db;
  return db;
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

export function listSections(): Section[] {
  return getDb()
    .prepare("SELECT * FROM sections ORDER BY position ASC, id ASC")
    .all() as unknown as Section[];
}

export function getSectionBySlug(slug: string): Section | undefined {
  return getDb().prepare("SELECT * FROM sections WHERE slug = ?").get(slug) as
    | Section
    | undefined;
}

export type WorkRow = Work & { section_slug: string; section_title: string };

export function listWorks(sectionId?: number): WorkRow[] {
  const db = getDb();
  if (sectionId) {
    return db
      .prepare(
        `SELECT w.*, s.slug AS section_slug, s.title AS section_title
         FROM works w JOIN sections s ON s.id = w.section_id
         WHERE w.section_id = ?
         ORDER BY w.position ASC, w.id DESC`
      )
      .all(sectionId) as unknown as WorkRow[];
  }
  return db
    .prepare(
      `SELECT w.*, s.slug AS section_slug, s.title AS section_title
       FROM works w JOIN sections s ON s.id = w.section_id
       ORDER BY w.position ASC, w.id DESC`
    )
    .all() as unknown as WorkRow[];
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
