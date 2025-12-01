import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
    const url = req.url;
    const res = await fetch(`${req.nextUrl.origin}/api/server/auth/verify`, {
        method: "GET",
        headers: {
            cookie: req.headers.get("cookie") || "",
        },
    });

    const data = await res.json();
    if (res.status !== 200) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (url.startsWith(`${req.nextUrl.origin}/admin`)) {
        if (data.role !== "Admin") {
            return NextResponse.redirect(new URL("/index", req.url));
        }
    } else {
        if (data.role === "Admin") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/index/:path*"
    ]
}