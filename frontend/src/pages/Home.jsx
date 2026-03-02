import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { formatDate, readingTimeLabel } from '../lib/utils';
import './Home.css';

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, postsRes] = await Promise.all([
          api.get('/posts?featured=true&limit=1'),
          api.get('/posts?limit=6'),
        ]);
        setFeatured(featRes.data.posts[0] || null);
        setPosts(postsRes.data.posts.filter((p) => p._id !== featRes.data.posts[0]?._id).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="home">
      {/* Hero */}
      <section className="home__hero section">
        <div className="container">
          <p className="caption fade-up">Wood Science & Forestry Research</p>
          <h1 className="display fade-up-1">
            Understanding the world <em>through wood.</em>
          </h1>
          <p className="body-lg home__hero-sub fade-up-2">
            From ancient forests to modern construction — exploring how wood shapes industry, architecture, and our planet.
          </p>
          <div className="home__hero-actions fade-up-3">
            <Link to="/blog" className="btn btn-primary">Read the blog <ArrowIcon /></Link>
            <Link to="/research" className="btn btn-ghost">View research</Link>
          </div>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="home__featured">
          <div className="container">
            <div className="home__section-header">
              <p className="caption">Featured</p>
            </div>
            <Link to={`/blog/${featured.slug}`} className="home__featured-card glass">
              {featured.coverImage?.url && (
                <div className="home__featured-img">
                  <img src={featured.coverImage.url} alt={featured.title} />
                </div>
              )}
              <div className="home__featured-body">
                <div className="home__featured-meta">
                  {featured.tags?.[0] && <span className="tag">{featured.tags[0]}</span>}
                  <span className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {readingTimeLabel(featured.readingTime)}
                  </span>
                </div>
                <h2 className="heading-1 home__featured-title">{featured.title}</h2>
                <p className="body-lg home__featured-excerpt">{featured.excerpt}</p>
                <div className="home__featured-footer">
                  <span className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(featured.publishedAt)}
                  </span>
                  <span className="btn btn-ghost btn-sm">Read article <ArrowIcon /></span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Recent posts — only show if there are posts or still loading */}
      {(loading || posts.length > 0) && <section className="home__posts section">
        <div className="container">
          <div className="home__section-header">
            <p className="caption">Latest writing</p>
            <Link to="/blog" className="home__see-all">
              View all <ArrowIcon />
            </Link>
          </div>

          {loading ? (
            <div className="home__posts-grid">
              {[1,2,3].map(i => (
                <div key={i} className="home__post-skeleton glass">
                  <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    <div className="skeleton" style={{ height: 20, width: '85%' }} />
                    <div className="skeleton" style={{ height: 14, width: '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home__posts-grid">
              {posts.map((post, i) => (
                <Link
                  key={post._id}
                  to={`/blog/${post.slug}`}
                  className={`home__post-card glass fade-up-${i % 3 + 1}`}
                >
                  {post.coverImage?.url && (
                    <div className="home__post-img">
                      <img src={post.coverImage.url} alt={post.title} />
                    </div>
                  )}
                  <div className="home__post-body">
                    <div className="home__post-meta">
                      {post.tags?.[0] && <span className="tag">{post.tags[0]}</span>}
                    </div>
                    <h3 className="heading-3 home__post-title">{post.title}</h3>
                    <p className="body-sm home__post-excerpt">{post.excerpt}</p>
                    <div className="home__post-footer">
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                        {formatDate(post.publishedAt)}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                        {readingTimeLabel(post.readingTime)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>}

      {/* CTA strip */}
      <section className="home__cta">
        <div className="container">
          <div className="home__cta-card glass">
            <div className="home__cta-text">
              <h3 className="heading-2">Explore the research</h3>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                Peer-reviewed papers on wood science, forestry, and industrialization.
              </p>
            </div>
            <Link to="/research" className="btn btn-primary">
              View papers <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
