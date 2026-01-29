import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

// 1. Настройки локализации
const intlMiddleware = createMiddleware({
  locales: ['ru', 'kk', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always' // Всегда добавлять префикс (/ru)
});

// 2. Защита админки
const isProtectedRoute = createRouteMatcher(['/:locale/admin(.*)']);
const ADMIN_IDS = (process.env.ADMIN_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const ADMIN_ROLE = "admin";

export default clerkMiddleware(async (auth, req) => {
  // Если это админка - проверяем права
  if (isProtectedRoute(req)) {
    await auth.protect();
    const { userId, sessionClaims } = await auth();
    const publicRole = sessionClaims?.publicMetadata?.role as string | undefined;
    const privateRole = sessionClaims?.privateMetadata?.role as string | undefined;
    const role = publicRole ?? privateRole;
    const isAdminByRole = role === ADMIN_ROLE;
    const isAdminById = !!userId && ADMIN_IDS.includes(userId);

    if (!isAdminByRole && !isAdminById) {
      const locale = req.nextUrl.pathname.split("/")[1] || "ru";
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/403`;
      return NextResponse.redirect(url);
    }
  }

  // Для всех остальных случаев запускаем переводчик
  return intlMiddleware(req);
});

export const config = {
  // Matcher ловит ВСЕ страницы, кроме статики
  matcher: [
    // Важно: эта регулярка должна ловить корень "/"
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
