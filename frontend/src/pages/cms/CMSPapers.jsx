import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import './CMSList.css';
import './CMSForm.css';

const EMPTY_PAPER = {
  title: '',
  authors: '',
  journal: '',
  year: new Date().getFullYear(),
  abstract: '',
  doi: '',
  externalUrl: '',
  tags: '',
  featured: false,
};

function PaperForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.externalUrl.trim()) return alert('Title and URL are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        year: Number(form.year),
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
          <input className="cms-form__input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Paper title" required />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Authors (comma separated)</label>
          <input className="cms-form__input" value={form.authors} onChange={e => set('authors', e.target.value)} placeholder="Dr. Silva, J. Doe" />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Journal</label>
          <input className="cms-form__input" value={form.journal} onChange={e => set('journal', e.target.value)} placeholder="Nature, Forest Ecology..." />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Year *</label>
          <input className="cms-form__input" type="number" value={form.year} onChange={e => set('year', e.target.value)} min="1900" max="2100" required />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">DOI</label>
          <input className="cms-form__input" value={form.doi} onChange={e => set('doi', e.target.value)} placeholder="10.1000/xyz123" />
        </div>

        <div className="cms-form__field cms-form__field--full">
          <label className="cms-form__label">External URL *</label>
          <input className="cms-form__input" value={form.externalUrl} onChange={e => set('externalUrl', e.target.value)} placeholder="https://..." required />
        </div>

        <div className="cms-form__field cms-form__field--full">
          <label className="cms-form__label">Abstract</label>
          <textarea className="cms-form__input" rows={3} value={form.abstract} onChange={e => set('abstract', e.target.value)} placeholder="Brief summary..." />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label">Tags (comma separated)</label>
          <input className="cms-form__input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="forestry, wood, ecology" />
        </div>

        <div className="cms-form__field">
          <label className="cms-form__label cms-form__check-label">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            Featured paper
          </label>
        </div>
      </div>

      <div className="cms-form__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save paper'}
        </button>
      </div>
    </form>
  );
}

export default function CMSPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // null | 'new' | { editing: paper }

  const load = async () => {
    try {
      const { data } = await api.get('/papers');
      setPapers(data.papers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (payload) => {
    try {
      if (mode === 'new') {
        await api.post('/papers', payload);
      } else {
        await api.put(`/papers/${mode.editing._id}`, payload);
      }
      setMode(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this paper?')) return;
    await api.delete(`/papers/${id}`);
    load();
  };

  const editInitial = (paper) => ({
    title: paper.title,
    authors: paper.authors?.join(', ') || '',
    journal: paper.journal || '',
    year: paper.year,
    abstract: paper.abstract || '',
    doi: paper.doi || '',
    externalUrl: paper.externalUrl,
    tags: paper.tags?.join(', ') || '',
    featured: paper.featured,
  });

  return (
    <main className="cms-list">
      <div className="cms-list__header">
        <div>
          <Link to="/cms" className="cms-list__back">← Dashboard</Link>
          <h1 className="heading-2" style={{ marginTop: 8 }}>Research Papers</h1>
        </div>
        {!mode && (
          <button className="btn btn-primary" onClick={() => setMode('new')}>+ Add paper</button>
        )}
      </div>

      {mode && (
        <PaperForm
          initial={mode === 'new' ? EMPTY_PAPER : editInitial(mode.editing)}
          onSave={handleSave}
          onCancel={() => setMode(null)}
        />
      )}

      {loading ? (
        <div className="cms-list__skeleton">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-sm)' }} />)}
        </div>
      ) : papers.length === 0 ? (
        <div className="glass cms-list__empty">No papers yet. <button className="cms-list__link-btn" onClick={() => setMode('new')}>Add one →</button></div>
      ) : (
        <div className="cms-list__table glass">
          {papers.map(paper => (
            <div key={paper._id} className="cms-list__row">
              <div className="cms-list__row-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="caption">{paper.year}</span>
                  {paper.featured && <span className="tag">Featured</span>}
                </div>
                <p className="cms-list__row-title">{paper.title}</p>
                <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {paper.authors?.join(', ')}{paper.journal ? ` · ${paper.journal}` : ''}
                </p>
              </div>
              <div className="cms-list__row-actions">
                <a href={paper.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">View ↗</a>
                <button className="btn btn-ghost btn-sm" onClick={() => setMode({ editing: paper })}>Edit</button>
                <button className="btn btn-ghost btn-sm cms-list__delete" onClick={() => handleDelete(paper._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
