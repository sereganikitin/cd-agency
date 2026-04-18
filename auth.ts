import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;

        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        if (email === adminEmail.toLowerCase() && password === adminPassword) {
          return { id: "admin", email: adminEmail, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        return !!auth?.user;
      }
      return true;
    },
  },
});
