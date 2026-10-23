"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";

export async function setAdmin(userId: string, value: boolean) {
    const supabase = await requireAdmin();
    if (!supabase) redirect("/login?denied=1");
    const { error } = await supabase.rpc("set_admin", { p_user: userId, p_value: value });
    revalidatePath("/users");
    if (error) redirect(`/users?msg=${encodeURIComponent(error.message)}`);
}

export async function adminByEmail(form: FormData) {
    const supabase = await requireAdmin();
    if (!supabase) redirect("/login?denied=1");
    const email = String(form.get("email") ?? "").trim();
    if (!email) redirect("/users");
    const { data, error } = await supabase.rpc("set_admin_by_email", { p_email: email });
    revalidatePath("/users");
    const msg = error
        ? error.message
        : data === "invited"
            ? `${email} hasn't signed in yet. They'll become an admin the moment they do.`
            : `${email} is now an admin.`;
    redirect(`/users?msg=${encodeURIComponent(msg)}`);
}
