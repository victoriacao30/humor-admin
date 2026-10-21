"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";

function fields(form: FormData) {
    const get = (k: string) => String(form.get(k) ?? "").trim();
    return {
        caption: get("caption"),
        meme_url: get("meme_url"),
        image_url: get("image_url"),
        song_title: get("song_title"),
        song_artist: get("song_artist"),
        ai_prompt: get("ai_prompt") || "Created in admin panel",
    };
}

export async function createMeme(form: FormData) {
    const supabase = await requireAdmin();
    if (!supabase) redirect("/login?denied=1");
    const { error } = await supabase.from("entries").insert({
        ...fields(form),
        user_id: String(form.get("user_id")),
        battle_date: String(form.get("battle_date")),
        daily_prompt: "What are you listening to right now?",
    });
    if (error) redirect(`/memes/new?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/memes");
    redirect("/memes");
}

export async function updateMeme(id: number, form: FormData) {
    const supabase = await requireAdmin();
    if (!supabase) redirect("/login?denied=1");
    const { error } = await supabase.from("entries").update(fields(form)).eq("id", id);
    if (error) redirect(`/memes/${id}?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/memes");
    redirect("/memes");
}

export async function deleteMeme(id: number) {
    const supabase = await requireAdmin();
    if (!supabase) redirect("/login?denied=1");
    await supabase.from("entries").delete().eq("id", id);
    revalidatePath("/memes");
}
