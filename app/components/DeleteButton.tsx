"use client";

export default function DeleteButton({ label = "Delete" }: { label?: string }) {
    return (
        <button
            type="submit"
            className="btn btn-sm danger-btn"
            onClick={(e) => {
                if (!confirm("Delete this post? Its votes will be deleted too. This can't be undone.")) e.preventDefault();
            }}
        >
            {label}
        </button>
    );
}
