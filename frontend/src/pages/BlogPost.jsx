import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { formatDate, readingTimeLabel } from '../lib/utils';
import './BlogPost.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/posts/slug/${slug}`);
        setPost(data.post);
      } catch (e) {
        if (e.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <main className="blog-post">
      <div className="container blog-post__container">
        <div className="skeleton" style={{ height: 40, width: '70%', marginTop: 120 }} />
        <div className="skeleton" style={{ height: 20, width: '40%', marginTop: 16 }} />
        <div className="skeleton" style={{ height: 400, marginTop: 32, borderRadius: 'var(--radius-lg)' }} />
      </div>
    </main>
  );

  if (notFound) return (
    <main className="blog-post">
      <div className="container blog-post__container">
        <div className="blog-post__not-found glass">
          <h2 className="heading-2">Post not found</h2>
          <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 16 }}>← Back to blog</Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="blog-post">
      <article className="container blog-post__container">
        {/* Back */}
        <Link to="/blog" className="blog-post__back fade-up">
          ← Back to blog
        </Link>

        {/* Header */}
        <header className="blog-post__header fade-up-1">
          <div className="blog-post__meta">
            {post.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
            <span className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
              {formatDate(post.publishedAt)} · {readingTimeLabel(post.readingTime)}
            </span>
          </div>
          <h1 className="blog-post__title">{post.title}</h1>
          {post.excerpt && (
            <p className="blog-post__excerpt body-lg">{post.excerpt}</p>
          )}
          {post.author && (
            <div className="blog-post__author">
              {post.author.avatar && (
                <img src={post.author.avatar} alt={post.author.name} className="blog-post__author-avatar" />
              )}
              <span className="body-sm">{post.author.name}</span>
            </div>
          )}
        </header>

        {/* Cover image */}
        {post.coverImage?.url && (
          <div className="blog-post__cover fade-up-2">
            <img src={post.coverImage.url} alt={post.title} />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-post__content prose fade-up-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
