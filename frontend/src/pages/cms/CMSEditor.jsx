import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import './CMSEditor.css';

// Toolbar button component
const ToolBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    className={`editor-toolbar__btn ${active ? 'editor-toolbar__btn--active' : ''}`}
    onClick={onClick}
    title={title}
  >
    {children}
  </button>
);

function Toolbar({ editor }) {
  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const { data } = await api.post('/media/upload', formData);
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (err) {
        alert('Image upload failed');
      }
    };
    input.click();
  };

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="editor-toolbar glass">
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolBtn>
      <div className="editor-toolbar__divider" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></ToolBtn>
      <div className="editor-toolbar__divider" />
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">"</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code">{`</>`}</ToolBtn>
      <div className="editor-toolbar__divider" />
      <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Link">🔗</ToolBtn>
      <ToolBtn onClick={addImage} title="Upload image">🖼</ToolBtn>
      <div className="editor-toolbar__divider" />
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
    </div>
  );
}

export default function CMSEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    tags: '',
    status: 'draft',
    featured: false,
    coverImage: { url: '', publicId: '' },
  });
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content: '',
  });

  // Load existing post
  useEffect(() => {
    if (!isNew && editor) {
      api.get(`/posts/admin/${id}`).then(({ data }) => {
        const p = data.post;
        setForm({
          title: p.title,
          excerpt: p.excerpt,
          tags: p.tags?.join(', ') || '',
          status: p.status,
          featured: p.featured,
          coverImage: p.coverImage || { url: '', publicId: '' },
        });
        setCoverPreview(p.coverImage?.url || '');
        editor.commands.setContent(p.content);
      }).catch(() => navigate('/cms/posts'));
    }
  }, [id, editor, isNew, navigate]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/media/upload', formData);
      setForm(f => ({ ...f, coverImage: { url: data.url, publicId: data.publicId } }));
      setCoverPreview(data.url);
    } catch { alert('Cover upload failed'); }
  };

  const handleSave = async (status) => {
    if (!form.title.trim()) return alert('Please add a title');
    if (!editor.getText().trim()) return alert('Post content is empty');

    setSaving(true);
    const payload = {
      ...form,
      status,
      content: editor.getHTML(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        const { data } = await api.post('/posts', payload);
        navigate(`/cms/posts/${data.post._id}`);
      } else {
        await api.put(`/posts/${id}`, payload);
      }
      alert(`Post ${status === 'published' ? 'published' : 'saved as draft'}!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cms-editor">
      {/* Top bar */}
      <div className="cms-editor__topbar glass">
        <Link to="/cms/posts" className="btn btn-ghost btn-sm">← Posts</Link>
        <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
          {isNew ? 'New post' : 'Editing post'}
        </p>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleSave('draft')} disabled={saving}>
            Save draft
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleSave('published')} disabled={saving}>
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="cms-editor__layout container-wide">
        {/* Main editor */}
        <div className="cms-editor__main">
          <input
            className="cms-editor__title-input"
            placeholder="Post title…"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <Toolbar editor={editor} />
          <div className="cms-editor__content glass">
            <EditorContent editor={editor} className="cms-editor__tiptap" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="cms-editor__sidebar">
          <div className="glass cms-editor__sidebar-card">
            <p className="caption" style={{ marginBottom: 16 }}>Post settings</p>

            <div className="cms-editor__field">
              <label className="cms-editor__label">Excerpt</label>
              <textarea
                className="cms-editor__input"
                rows={3}
                placeholder="Short summary…"
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div className="cms-editor__field">
              <label className="cms-editor__label">Tags (comma separated)</label>
              <input
                className="cms-editor__input"
                placeholder="forestry, wood, construction"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div className="cms-editor__field">
              <label className="cms-editor__label">Cover image</label>
              {coverPreview && (
                <img src={coverPreview} alt="Cover" className="cms-editor__cover-preview" />
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="cms-editor__file-input" />
            </div>

            <div className="cms-editor__check">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              />
              <label htmlFor="featured" className="cms-editor__label">Featured post</label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
