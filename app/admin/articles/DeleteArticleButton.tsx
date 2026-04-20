'use client';

import { deleteArticleAction } from './actions';

export default function DeleteArticleButton({ id }: { id: string }) {
  return (
    <form action={deleteArticleAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
        onClick={(e) => {
          if (!confirm('Naozaj chceš zmazať tento článok?')) e.preventDefault();
        }}
      >
        Zmazať článok
      </button>
    </form>
  );
}
