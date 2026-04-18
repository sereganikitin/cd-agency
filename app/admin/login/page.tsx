import { LoginForm } from "./login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="card p-8">
      <h1 className="font-display text-3xl">Вход в админку</h1>
      <p className="mt-2 text-sm text-white/60">
        Только для сотрудников агентства.
      </p>
      <LoginForm />
    </div>
  );
}
