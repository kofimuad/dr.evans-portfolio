import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import './CMSList.css';

export default function CMSPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const url = filter !== 'all' ? `/posts/admin/all?status=${filter}` : '/posts/admin/all';
      const { data } = await api.get(url);
      setPosts(data.posts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${id}`);
    load();
  };

  const toggleFeatured = async (id) => {
    await api.patch(`/posts/${id}/featured`);
    load();
  };

  return (
    <main className="cms-list">
      <div className="cms-list__header">
        <div>
          <Link to="/cms" className="cms-list__back">← Dashboard</Link>
          <h1 className="heading-2" style={{ marginTop: 8 }}>Blog Posts</h1>
        </div>
        <Link to="/cms/posts/new" className="btn btn-primary">+ New post</Link>
      </div>

      <div className="cms-list__filters">
        {['all', 'published', 'draft'].map(f => (
          <button key={f} className={`blog-page__tag-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cms-list__skeleton">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-sm)' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass cms-list__empty">No posts yet. <Link to="/cms/posts/new">Write one →</Link></div>
      ) : (
        <div className="cms-list__table glass">
          {posts.map(post => (
            <div key={post._id} className="cms-list__row">
              <div className="cms-list__row-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`cms-list__status cms-list__status--${post.status}`}>{post.status}</span>
                  {post.featured && <span className="tag">Featured</span>}
                </div>
                <p className="cms-list__row-title">{post.title}</p>
                <p className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {post.status === 'published' ? formatDate(post.publishedAt) : `Updated ${formatDate(post.updatedAt)}`}
                </p>
              </div>
              <div className="cms-list__row-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => toggleFeatured(post._id)}>
                  {post.featured ? '★ Unfeature' : '☆ Feature'}
                </button>
                <Link to={`/cms/posts/${post._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                <button className="btn btn-ghost btn-sm cms-list__delete" onClick={() => deletePost(post._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
