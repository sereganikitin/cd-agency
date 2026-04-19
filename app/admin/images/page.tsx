import { SITE_IMAGE_SLOTS, getAllSiteImages } from "@/lib/db";
import { ImagesManager } from "./images-manager";

export const dynamic = "force-dynamic";

export default function AdminImagesPage() {
  const current = getAllSiteImages();
  const items = SITE_IMAGE_SLOTS.map((def) => ({
    ...def,
    url: current.find((c) => c.slot === def.slot)?.url || def.default,
    isDefault: current.find((c) => c.slot === def.slot)?.isDefault ?? true,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Картинки сайта</h1>
        <p className="mt-2 text-white/60">
          Замените стандартные иллюстрации. Пока слот пуст — показывается дефолтная SVG-заглушка.
        </p>
      </div>
      <ImagesManager initial={items} />
    </div>
  );
}
