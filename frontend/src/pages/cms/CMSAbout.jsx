import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import './CMSList.css';
import './CMSForm.css';
import './CMSAbout.css';

const EMPTY = {
  heading: '',
  name: '',
  role: '',
  bio: '',
  email: '',
  googleScholar: '',
  twitter: '',
  avatar: '',
  education: [],
  interests: '',
};

export default function CMSAbout() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    api.get('/pages/about')
      .then(({ data }) => {
        const c = data.page.content || {};
        setForm({
          heading: c.heading || '',
          name: c.name || '',
          role: c.role || '',
          bio: c.bio || '',
          email: c.email || '',
          googleScholar: c.googleScholar || '',
          twitter: c.twitter || '',
          avatar: c.avatar || '',
          education: c.education || [],
          interests: c.interests?.join(', ') || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/media/upload', formData);
      set('avatar', data.url);
    } catch {
      alert('Photo upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const addEducation = () =>
    setForm(f => ({ ...f, education: [...f.education, { degree: '', institution: '', year: '' }] }));

  const updateEdu = (i, field, val) =>
    setForm(f => {
      const edu = [...f.education];
      edu[i] = { ...edu[i], [field]: val };
      return { ...f, education: edu };
    });

  const removeEdu = (i) =>
    setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: 'About',
        content: {
          ...form,
          interests: form.interests.split(',').map(i => i.trim()).filter(Boolean),
        },
      };
      await api.put('/pages/about', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <main className="cms-list">
      <div className="cms-list__skeleton" style={{ marginTop: 40 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-sm)' }} />)}
      </div>
    </main>
  );

  return (
    <main className="cms-list">
      <div className="cms-list__header">
        <div>
          <Link to="/cms" className="cms-list__back">← Dashboard</Link>
          <h1 className="heading-2" style={{ marginTop: 8 }}>Edit About Page</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>✓ Saved!</span>}
          <Link to="/about" target="_blank" className="btn btn-ghost btn-sm">Preview ↗</Link>
        </div>
      </div>

      <form onSubmit={handleSave}>

        {/* Profile photo + identity */}
        <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <p className="caption" style={{ marginBottom: 20 }}>Profile Photo & Identity</p>
          <div className="cms-about__photo-row">
            {/* Avatar preview + upload */}
            <div className="cms-about__avatar-upload">
              <div className="cms-about__avatar-preview">
                {form.avatar ? (
                  <img src={form.avatar} alt="Profile" />
                ) : (
                  <div className="cms-about__avatar-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <label className="btn btn-ghost btn-sm cms-about__upload-btn">
                {avatarUploading ? 'Uploading…' : form.avatar ? 'Change photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={avatarUploading}
                />
              </label>
              {form.avatar && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#e05555' }} onClick={() => set('avatar', '')}>
                  Remove
                </button>
              )}
            </div>

            {/* Identity fields */}
            <div className="cms-form__grid" style={{ flex: 1 }}>
              <div className="cms-form__field">
                <label className="cms-form__label">Page heading</label>
                <input className="cms-form__input" value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="About Me" />
              </div>
              <div className="cms-form__field">
                <label className="cms-form__label">Full name</label>
                <input className="cms-form__input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Evans Adjei" />
              </div>
              <div className="cms-form__field cms-form__field--full">
                <label className="cms-form__label">Role / title</label>
                <input className="cms-form__input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Wood Science Researcher" />
              </div>
              <div className="cms-form__field cms-form__field--full">
                <label className="cms-form__label">Bio</label>
                <textarea className="cms-form__input" rows={5} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Write a short bio about yourself..." />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & links */}
        <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <p className="caption" style={{ marginBottom: 20 }}>Contact & Links</p>
          <div className="cms-form__grid">
            <div className="cms-form__field">
              <label className="cms-form__label">Email</label>
              <input className="cms-form__input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@university.edu" />
            </div>
            <div className="cms-form__field">
              <label className="cms-form__label">Twitter / X handle</label>
              <input className="cms-form__input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="_TheRead1 (no @)" />
            </div>
            <div className="cms-form__field cms-form__field--full">
              <label className="cms-form__label">Google Scholar URL</label>
              <input className="cms-form__input" value={form.googleScholar} onChange={e => set('googleScholar', e.target.value)} placeholder="https://scholar.google.com/..." />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p className="caption">Education</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addEducation}>+ Add</button>
          </div>
          {form.education.length === 0 ? (
            <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>No education entries yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {form.education.map((edu, i) => (
                <div key={i} className="cms-about__edu-row">
                  <div className="cms-form__grid" style={{ flex: 1 }}>
                    <div className="cms-form__field cms-form__field--full">
                      <label className="cms-form__label">Degree</label>
                      <input className="cms-form__input" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="PhD in Wood Science" />
                    </div>
                    <div className="cms-form__field">
                      <label className="cms-form__label">Institution</label>
                      <input className="cms-form__input" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="University of..." />
                    </div>
                    <div className="cms-form__field">
                      <label className="cms-form__label">Year</label>
                      <input className="cms-form__input" value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} placeholder="2018" />
                    </div>
                  </div>
                  <button type="button" className="cms-about__remove-btn" onClick={() => removeEdu(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Research interests */}
        <div className="glass" style={{ padding: 28, marginBottom: 28 }}>
          <p className="caption" style={{ marginBottom: 20 }}>Research Interests</p>
          <div className="cms-form__field">
            <label className="cms-form__label">Interests (comma separated)</label>
            <input className="cms-form__input" value={form.interests} onChange={e => set('interests', e.target.value)} placeholder="Wood anatomy, Sustainable forestry, Construction materials..." />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Link to="/about" target="_blank" className="btn btn-ghost">Preview page ↗</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  );
}
