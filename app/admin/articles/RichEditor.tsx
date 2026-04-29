'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={[
        'flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors',
        active
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100',
        disabled ? 'pointer-events-none opacity-30' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-slate-700" />;
}

export default function RichEditor({ name, defaultValue = '', placeholder }: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: {},
        codeBlock: {},
        blockquote: {},
        bulletList: {},
        orderedList: {},
        horizontalRule: {},
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-emerald-400 underline' },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'editor-image' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Začnite písať obsah…',
        emptyEditorClass: 'is-editor-empty',
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: false,
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none min-h-[320px] focus:outline-none px-5 py-4',
      },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hiddenRef.current.value = (editor.storage as any).markdown?.getMarkdown() ?? '';
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && defaultValue && editor.isEmpty) {
      editor.commands.setContent(defaultValue);
    }
  }, [editor, defaultValue]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL odkazu', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const uploadAndInsertImage = useCallback(async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'articles');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload zlyhal');
      const data = await res.json();
      editor?.chain().focus().setImage({ src: data.url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } catch (err) {
      alert('Upload obrázka zlyhal: ' + (err instanceof Error ? err.message : 'Neznáma chyba'));
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }, [editor]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialMarkdown = (editor?.storage as any)?.markdown?.getMarkdown() ?? defaultValue;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 focus-within:border-emerald-500 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-800 bg-slate-900/80 px-2 py-1.5">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          title="Nadpis H2"
        >
          <span className="font-bold leading-none">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          title="Nadpis H3"
        >
          <span className="font-bold leading-none text-xs">H3</span>
        </ToolbarButton>

        <Divider />

        {/* Inline */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          title="Tučné (Ctrl+B)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          title="Kurzíva (Ctrl+I)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive('strike')}
          title="Prečiarknuté"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4C9 4 7.5 6 7.5 8C7.5 11 10 12 12 12"/><path d="M8 18C8 18 9.5 20 12 20C15 20 16.5 18 16.5 16C16.5 13 14 12 12 12"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          active={editor?.isActive('code')}
          title="Inline kód"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={setLink}
          active={editor?.isActive('link')}
          title="Odkaz"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          title="Zoznam s odrážkami"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          title="Číslovaný zoznam"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 10H6" stroke="currentColor" strokeWidth="1.5"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Block */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive('blockquote')}
          title="Citácia"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive('codeBlock')}
          title="Blok kódu"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Oddeľovač"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Image upload */}
        <ToolbarButton
          onClick={() => imgInputRef.current?.click()}
          disabled={imgUploading}
          title={imgUploading ? 'Nahrávam obrázok…' : 'Vložiť obrázok'}
        >
          {imgUploading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          )}
        </ToolbarButton>

        <Divider />

        {/* History */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Späť (Ctrl+Z)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Dopredu (Ctrl+Y)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Hidden inputs */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialMarkdown} />
      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadAndInsertImage(f);
        }}
      />

      <style>{`
        .tiptap.ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #64748b;
          pointer-events: none;
          height: 0;
        }
        .tiptap.ProseMirror:focus { outline: none; }
        .tiptap.ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #f1f5f9; }
        .tiptap.ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.4rem; color: #e2e8f0; }
        .tiptap.ProseMirror h4 { font-size: 1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.3rem; color: #cbd5e1; }
        .tiptap.ProseMirror p { margin-bottom: 0.75rem; color: #cbd5e1; line-height: 1.7; }
        .tiptap.ProseMirror strong { color: #f1f5f9; font-weight: 700; }
        .tiptap.ProseMirror em { color: #e2e8f0; }
        .tiptap.ProseMirror s { color: #94a3b8; }
        .tiptap.ProseMirror code { background: #1e293b; color: #34d399; padding: 0.15em 0.4em; border-radius: 0.3rem; font-size: 0.875em; font-family: ui-monospace, monospace; }
        .tiptap.ProseMirror pre { background: #0f172a; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
        .tiptap.ProseMirror pre code { background: none; color: #94a3b8; padding: 0; }
        .tiptap.ProseMirror blockquote { border-left: 3px solid #10b981; padding-left: 1rem; color: #94a3b8; font-style: italic; margin-bottom: 0.75rem; }
        .tiptap.ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #cbd5e1; }
        .tiptap.ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #cbd5e1; }
        .tiptap.ProseMirror li { margin-bottom: 0.25rem; }
        .tiptap.ProseMirror hr { border: none; border-top: 1px solid #334155; margin: 1.5rem 0; }
        .tiptap.ProseMirror a { color: #34d399; text-decoration: underline; }
        .tiptap.ProseMirror img.editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
          border: 1px solid #1e293b;
          display: block;
        }
        .tiptap.ProseMirror img.editor-image.ProseMirror-selectednode {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
