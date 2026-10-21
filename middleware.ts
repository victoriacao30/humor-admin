import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    const path = request.nextUrl.pathname;
    if (path.startsWith("/login") || path.startsWith("/auth")) return response;

    const redirectToLogin = (denied: boolean) => {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = denied ? "?denied=1" : "";
        const redirect = NextResponse.redirect(url);
        response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
        return redirect;
    };

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return redirectToLogin(false);

    const { data: profile } = await supabase.from("profiles").select("is_superadmin").eq("id", user.id).single();
    if (!profile?.is_superadmin) return redirectToLogin(true);

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
