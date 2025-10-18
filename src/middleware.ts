import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ============================================
// RATE LIMITING SETUP
// ============================================

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Create new entry if doesn't exist or is expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: resetTime,
    };
  }

  // Increment count
  entry.count++;

  const success = entry.count <= config.requests;
  const remaining = Math.max(0, config.requests - entry.count);

  return {
    success,
    limit: config.requests,
    remaining,
    reset: entry.resetTime,
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip rate limiting for static files
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js)$/);

  // RATE LIMITING
  if (!isStaticFile) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    let config: RateLimitConfig = {
      requests: 100,
      windowMs: 60 * 1000,
    };

    let identifier = ip;

    if (pathname.includes("/signin") || pathname.includes("/login")) {
      config = {
        requests: 20,
        windowMs: 60 * 1000,
      };
    }

    if (pathname.includes("/signup") || pathname.includes("/register")) {
      config = {
        requests: 15,
        windowMs: 60 * 60 * 1000,
      };
    }

    if (pathname.startsWith("/api/")) {
      config = {
        requests: 200,
        windowMs: 60 * 1000,
      };
      identifier = `${ip}:${pathname}`;
    }

    const { success, limit, reset, remaining } = checkRateLimit(
      identifier,
      config
    );

    if (!success) {
      const response = NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());
      response.headers.set(
        "Retry-After",
        Math.ceil((reset - Date.now()) / 1000).toString()
      );

      return response;
    }
  }

  // ============================================
  // SUPABASE AUTH (runs second)
  // ============================================
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = [
    "/decks",
    "/archenemy",
    "/game",
    "/profile",
    "/deck-builder",
    "/popular-cards",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Redirect to signin if accessing protected route without auth
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/signin", request.url);
    // Use pathname instead of encoding it
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if already authenticated and trying to access auth pages
  const authPaths = ["/signin", "/signup"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/decks", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
