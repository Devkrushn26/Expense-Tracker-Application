import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Log each matched request
    console.log(`[middleware] ${pathname} — ${new Date().toISOString()}`);

    // Check for user_session cookie
    const session = request.cookies.get("user_session");

    if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("error", "session_required");
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Only apply to these routes
export const config = {
    matcher: ["/expenses/:path*", "/add/:path*", "/budget/:path*"],
};
