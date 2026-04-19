import { getDb, slugify } from "../lib/db";

const db = getDb();

const CASE = {
  direction: "web",
  type_title: "Миграция сайта",
  title: "PrimeResin — миграция со старого MoDX на WordPress",
  description:
    "У клиента был устаревший сайт на MoDX: медленный, с ограниченной редакторской панелью и без мобильной вёрстки. Задача — собрать полностью новый сайт на WordPress и перенести всё без потерь. Перенесли весь контент (товары, статьи блога, страницы услуг), базы данных, комментарии под записями с привязкой к авторам и датам. Сохранили ссылочную массу: настроили 301-редиректы со всех старых URL-ов, обновили sitemap.xml, передали SEO-сигналы в Search Console. В результате клиент получил современную платформу на WordPress с удобной админкой, адаптивом и загрузкой <2 сек — без проседания позиций в поиске.",
  image_url: "/defaults/case-primeresin.svg",
  link_url: "https://primeresin.ru/",
};

const existing = db
  .prepare("SELECT id FROM cases WHERE link_url = ? OR title = ?")
  .get(CASE.link_url, CASE.title) as { id: number } | undefined;

if (existing) {
  console.log(`✓ Кейс уже существует (id=${existing.id}). Обновляю поля.`);
  db.prepare(
    `UPDATE cases SET direction = ?, type_slug = ?, type_title = ?, title = ?, description = ?, image_url = ?, link_url = ?
     WHERE id = ?`
  ).run(
    CASE.direction,
    slugify(CASE.type_title),
    CASE.type_title,
    CASE.title,
    CASE.description,
    CASE.image_url,
    CASE.link_url,
    existing.id
  );
} else {
  const positionRow = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM cases WHERE direction = ?")
    .get(CASE.direction) as { p: number };

  const info = db
    .prepare(
      `INSERT INTO cases (direction, type_slug, type_title, title, description, image_url, link_url, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      CASE.direction,
      slugify(CASE.type_title),
      CASE.type_title,
      CASE.title,
      CASE.description,
      CASE.image_url,
      CASE.link_url,
      positionRow.p
    );
  console.log(`✓ Кейс добавлен (id=${info.lastInsertRowid}).`);
}

console.log("Готово. Откройте /services/web, чтобы увидеть.");
