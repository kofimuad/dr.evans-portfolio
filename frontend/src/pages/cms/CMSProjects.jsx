import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import './CMSList.css';
import './CMSForm.css';

const EMPTY_PROJECT = {
  title: '',
  description: '',
  tags: '',
  status: 'ongoing',
  externalLink: '',
  featured: false,
  coverImage: { url: '', publicId: '' },
};

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState(initial.coverImage?.url || '');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return alert('Title and description are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cms-form glass">
      <div className="cms-form__grid">
        <div className="cms-form__field cms-form__field--full">
          <label className="cms-form__label">Title *</label>
          <input className="cms-form__input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project title" required />
        </div>

        <div className="cms-form__field cms-form__field--full">
          <label className="cms-form__label">Description *</label>
          <textarea className="cms-form__input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this project about?" required />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Status</label>
          <select className="cms-form__input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">External link</label>
          <input className="cms-form__input" value={form.externalLink} onChange={e => set('externalLink', e.target.value)} placeholder="https://..." />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Tags (comma separated)</label>
          <input className="cms-form__input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="forestry, wood, construction" />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Cover image</label>
          {coverPreview && <img src={coverPreview} alt="Cover" className="cms-form__cover-preview" />}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="cms-form__file-input" />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label cms-form__check-label">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            Featured project
          </label>
        </div>
      </div>

      <div className="cms-form__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save project'}
        </button>
      </div>
    </form>
  );
}

export default function CMSProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (payload) => {
    try {
      if (mode === 'new') {
        await api.post('/projects', payload);
      } else {
        await api.put(`/projects/${mode.editing._id}`, payload);
      }
      setMode(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  const editInitial = (p) => ({
    title: p.title,
    description: p.description,
    tags: p.tags?.join(', ') || '',
    status: p.status,
    externalLink: p.externalLink || '',
    featured: p.featured,
    coverImage: p.coverImage || { url: '', publicId: '' },
  });

  return (
    <main className="cms-list">
      <div className="cms-list__header">
        <div>
          <Link to="/cms" className="cms-list__back">← Dashboard</Link>
          <h1 className="heading-2" style={{ marginTop: 8 }}>Projects</h1>
        </div>
        {!mode && (
          <button className="btn btn-primary" onClick={() => setMode('new')}>+ Add project</button>
        )}
      </div>

      {mode && (
        <ProjectForm
          initial={mode === 'new' ? EMPTY_PROJECT : editInitial(mode.editing)}
          onSave={handleSave}
          onCancel={() => setMode(null)}
        />
      )}

      {loading ? (
        <div className="cms-list__skeleton">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-sm)' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass cms-list__empty">No projects yet. <button className="cms-list__link-btn" onClick={() => setMode('new')}>Add one →</button></div>
      ) : (
        <div className="cms-list__table glass">
          {projects.map(project => (
            <div key={project._id} className="cms-list__row">
              <div className="cms-list__row-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`cms-list__status cms-list__status--${project.status === 'ongoing' ? 'published' : 'draft'}`}>
                    {project.status}
                  </span>
                  {project.featured && <span className="tag">Featured</span>}
                </div>
                <p className="cms-list__row-title">{project.title}</p>
                <p className="body-sm" style={{ color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                  {project.description}
                </p>
              </div>
              <div className="cms-list__row-actions">
                {project.externalLink && (
                  <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View ↗</a>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setMode({ editing: project })}>Edit</button>
                <button className="btn btn-ghost btn-sm cms-list__delete" onClick={() => handleDelete(project._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
