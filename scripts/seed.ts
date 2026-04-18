import { getDb, slugify } from "../lib/db";

const db = getDb();

const demoSections = [
  { title: "SMM & контент", description: "Контент, который останавливает скролл." },
  { title: "Web-разработка", description: "Платформы, где путь от интереса до покупки — секунды." },
  { title: "Performance", description: "Находим аудиторию в момент её готовности к действию." },
  { title: "Брендинг", description: "Визуальный код, который запоминают с первого касания." },
];

const insertSection = db.prepare(
  "INSERT OR IGNORE INTO sections (slug, title, description, position) VALUES (?, ?, ?, ?)"
);

demoSections.forEach((s, i) => {
  insertSection.run(slugify(s.title), s.title, s.description, i);
});

const sections = db
  .prepare("SELECT id, slug FROM sections")
  .all() as unknown as { id: number; slug: string }[];

const placeholders = [
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1400&q=80",
  "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=1400&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80",
  "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1400&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&q=80",
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1400&q=80",
];

const insertWork = db.prepare(
  "INSERT INTO works (section_id, title, description, image_url, position) VALUES (?, ?, ?, ?, ?)"
);

const existing = db.prepare("SELECT COUNT(*) as c FROM works").get() as { c: number };
if (existing.c === 0) {
  sections.forEach((section, si) => {
    for (let i = 0; i < 3; i++) {
      insertWork.run(
        section.id,
        `Кейс ${si + 1}.${i + 1}`,
        "Короткий рассказ о кейсе: задача, решение, результат в цифрах.",
        placeholders[(si * 3 + i) % placeholders.length],
        i
      );
    }
  });
  console.log("Seeded demo sections and works.");
} else {
  console.log("Works already present, skipping works seed.");
}

console.log("Done.");
