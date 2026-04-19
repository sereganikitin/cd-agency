import Link from "next/link";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <div className="mx-auto max-w-md px-6 py-16">{children}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="font-display text-3xl">
            Carpe Diem <span className="text-ember">Admin</span>
          </Link>
          <p className="mt-1 text-sm text-white/50">
            Управление галереей, разделами и заявками
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-graphite/50 p-1 text-sm">
          <AdminLink href="/admin">Обзор</AdminLink>
          <AdminLink href="/admin/sections">Разделы</AdminLink>
          <AdminLink href="/admin/works">Работы</AdminLink>
          <AdminLink href="/admin/cases">Кейсы</AdminLink>
          <AdminLink href="/admin/images">Картинки</AdminLink>
          <AdminLink href="/admin/leads">Заявки</AdminLink>
          <Link href="/" className="px-3 py-1.5 text-white/60 hover:text-white">
            ↗ На сайт
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="rounded-full bg-ember/90 px-3 py-1.5 text-midnight hover:bg-ember">
              Выйти
            </button>
          </form>
        </nav>
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-white/70 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
