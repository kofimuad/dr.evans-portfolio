import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import './CMSDashboard.css';

export default function CMSDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ posts: 0, drafts: 0, papers: 0, projects: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [posts, papers, projects] = await Promise.all([
          api.get('/posts/admin/all'),
          api.get('/papers'),
          api.get('/projects'),
        ]);
        const all = posts.data.posts;
        setStats({
          posts: all.filter(p => p.status === 'published').length,
          drafts: all.filter(p => p.status === 'draft').length,
          papers: papers.data.papers.length,
          projects: projects.data.projects.length,
        });
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const sections = [
    { label: 'Blog Posts', to: '/cms/posts', icon: '✍️', stat: stats.posts, sub: `${stats.drafts} drafts` },
    { label: 'Research Papers', to: '/cms/papers', icon: '📄', stat: stats.papers, sub: 'publications' },
    { label: 'Projects', to: '/cms/projects', icon: '🌲', stat: stats.projects, sub: 'active projects' },
    { label: 'About Page', to: '/cms/about', icon: '📋', stat: null, sub: 'Edit bio, links & education' },
    { label: 'Tweets', to: '/cms/tweets', icon: '𝕏', stat: null, sub: 'Curate social posts' },
  ];

  return (
    <main className="cms-dash">
      <div className="cms-dash__header glass">
        <div className="container-wide cms-dash__header-inner">
          <div>
            <p className="caption">CMS Dashboard</p>
            <h1 className="heading-2">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/" className="btn btn-ghost btn-sm">← View site</Link>
            <button onClick={logout} className="btn btn-ghost btn-sm">Log out</button>
          </div>
        </div>
      </div>

      <div className="container-wide cms-dash__body">
        <div className="cms-dash__grid">
          {sections.map(({ label, to, icon, stat, sub }) => (
            <Link key={to} to={to} className="cms-dash__card glass">
              <div className="cms-dash__card-icon">{icon}</div>
              <div>
                <p className="heading-3">{label}</p>
                <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {stat !== null ? `${stat} ${sub}` : sub}
                </p>
              </div>
              <span className="cms-dash__arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
