import { requireAdmin } from "@/lib/supabase-server";
import Window from "@/app/components/Window";
import { createMeme } from "../actions";

export default async function NewMeme({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    const supabase = await requireAdmin();
    if (!supabase) return null;
    const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name").order("first_name");
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

    return (
        <Window url="admin.humorproject.com/memes/new" className="narrow">
            <h1 className="label title">New meme:</h1>
            <form action={createMeme} className="form">
                <label><span className="label">Posted by:</span>
                    <select name="user_id" className="field admin-field" required>
                        {(profiles ?? []).map((p) => (
                            <option key={p.id} value={p.id}>{`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.id}</option>
                        ))}
                    </select>
                </label>
                <label><span className="label">Battle date:</span>
                    <input type="date" name="battle_date" defaultValue={today} className="field admin-field" required />
                </label>
                <label><span className="label">Meme image URL:</span>
                    <input name="meme_url" className="field admin-field" placeholder="https://i.imgflip.com/..." required />
                </label>
                <label><span className="label">Caption (what's happening):</span>
                    <input name="caption" className="field admin-field" required />
                </label>
                <label><span className="label">Song title:</span>
                    <input name="song_title" className="field admin-field" required />
                </label>
                <label><span className="label">Artist:</span>
                    <input name="song_artist" className="field admin-field" required />
                </label>
                <label><span className="label">Album cover URL:</span>
                    <input name="image_url" className="field admin-field" required />
                </label>
                <label><span className="label">AI prompt used (optional):</span>
                    <textarea name="ai_prompt" className="field admin-field" rows={3} />
                </label>
                {error && <p className="error">{error}</p>}
                <button className="btn btn-primary">Create meme →</button>
            </form>
        </Window>
    );
}
