import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { formatDate, readingTimeLabel } from '../lib/utils';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const url = activeTag ? `/posts?tag=${activeTag}&limit=20` : '/posts?limit=20';
        const { data } = await api.get(url);
        setPosts(data.posts);
        if (!activeTag) {
          const tags = [...new Set(data.posts.flatMap(p => p.tags || []))];
          setAllTags(tags);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [activeTag]);

  return (
    <main className="blog-page">
      <section className="blog-page__hero section">
        <div className="container">
          <p className="caption fade-up">Writing</p>
          <h1 className="heading-1 fade-up-1">Field Notes & Research</h1>
          <p className="body-lg fade-up-2" style={{ color: 'var(--text-secondary)', maxWidth: 500, marginTop: 12 }}>
            Long-form writing on wood science, forestry, construction, and industrialization.
          </p>

          {allTags.length > 0 && (
            <div className="blog-page__tags fade-up-3">
              <button
                className={`blog-page__tag-btn ${!activeTag ? 'active' : ''}`}
                onClick={() => setActiveTag(null)}
              >All</button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`blog-page__tag-btn ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => setActiveTag(tag)}
                >{tag}</button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {loading ? (
            <div className="blog-page__grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="blog-page__skeleton glass">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: '35%' }} />
                    <div className="skeleton" style={{ height: 22, width: '90%' }} />
                    <div className="skeleton" style={{ height: 14, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-page__empty glass">
              <p>No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="blog-page__grid">
              {posts.map((post, i) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className="blog-page__card glass"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {post.coverImage?.url && (
                    <div className="blog-page__card-img">
                      <img src={post.coverImage.url} alt={post.title} />
                    </div>
                  )}
                  <div className="blog-page__card-body">
                    <div className="blog-page__card-meta">
                      {post.tags?.[0] && <span className="tag">{post.tags[0]}</span>}
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                        {readingTimeLabel(post.readingTime)}
                      </span>
                    </div>
                    <h2 className="heading-3 blog-page__card-title">{post.title}</h2>
                    <p className="blog-page__card-excerpt">{post.excerpt}</p>
                    <p className="blog-page__card-date">{formatDate(post.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
