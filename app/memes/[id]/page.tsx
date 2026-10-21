import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import DeleteButton from "@/app/components/DeleteButton";
import { deleteMeme, updateMeme } from "../actions";

export default async function EditMeme({
                                           params,
                                           searchParams,
                                       }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
    const { id } = await params;
    const { error } = await searchParams;
    const supabase = await requireAdmin();
    if (!supabase) return null;
    const { data: e } = await supabase.from("entries").select("*").eq("id", Number(id)).maybeSingle();

    if (!e) {
        return (
            <Window url="admin.humorproject.com/memes" className="narrow">
                <p className="label">Meme not found.</p>
                <Link href="/memes" className="btn">← Back</Link>
            </Window>
        );
    }

    return (
        <Window url={`admin.humorproject.com/memes/${e.id}`} className="narrow">
            <h1 className="label title">Edit meme #{e.id}:</h1>
            <img src={e.meme_url} alt="" className="edit-preview" />
            <form action={updateMeme.bind(null, e.id)} className="form">
                <label><span className="label">Meme image URL:</span>
                    <input name="meme_url" defaultValue={e.meme_url} className="field admin-field" required />
                </label>
                <label><span className="label">Caption:</span>
                    <input name="caption" defaultValue={e.caption} className="field admin-field" required />
                </label>
                <label><span className="label">Song title:</span>
                    <input name="song_title" defaultValue={e.song_title} className="field admin-field" required />
                </label>
                <label><span className="label">Artist:</span>
                    <input name="song_artist" defaultValue={e.song_artist} className="field admin-field" required />
                </label>
                <label><span className="label">Album cover URL:</span>
                    <input name="image_url" defaultValue={e.image_url} className="field admin-field" required />
                </label>
                <label><span className="label">AI prompt used:</span>
                    <textarea name="ai_prompt" defaultValue={e.ai_prompt} className="field admin-field" rows={5} />
                </label>
                {error && <p className="error">{error}</p>}
                <button className="btn btn-primary">Save changes</button>
            </form>
            <form action={deleteMeme.bind(null, e.id)} className="actions">
                <DeleteButton label="Delete this meme" />
            </form>
        </Window>
    );
}