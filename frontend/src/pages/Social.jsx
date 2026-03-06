import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import './Social.css';

const TWITTER_HANDLE = '_TheRead1';

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Renders a single oEmbed tweet card
function TweetEmbed({ tweet }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !tweet.oEmbed?.html) return;
    // Inject the oEmbed HTML
    ref.current.innerHTML = tweet.oEmbed.html;
    // Ask Twitter's widget script to render it
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(ref.current);
    }
  }, [tweet.oEmbed?.html]);

  if (!tweet.oEmbed?.html) {
    // Fallback if oEmbed wasn't cached yet — just show a link
    return (
      <a
        href={tweet.tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tweet-link-fallback glass"
      >
        <XIcon />
        <span className="body-sm">View tweet ↗</span>
      </a>
    );
  }

  return (
    <div
      ref={ref}
      className={`tweet-embed-wrapper ${tweet.pinned ? 'tweet-embed-wrapper--pinned' : ''}`}
    />
  );
}

// Load Twitter widget script once
function useTwitterScript() {
  useEffect(() => {
    if (window.twttr) return;
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.head.appendChild(script);
  }, []);
}

export default function Social() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  useTwitterScript();

  useEffect(() => {
    api.get('/tweets')
      .then(({ data }) => setTweets(data.tweets || []))
      .catch(() => setTweets([]))
      .finally(() => setLoading(false));
  }, []);

  const pinned = tweets.filter(t => t.pinned);
  const rest = tweets.filter(t => !t.pinned);

  return (
    <main className="social-page">
      <section className="social-page__hero section">
        <div className="container">
          <p className="caption fade-up">Social</p>
          <h1 className="heading-1 fade-up-1">Thoughts from theRead</h1>
          <p className="body-lg fade-up-2" style={{ color: 'var(--text-secondary)', maxWidth: 500, marginTop: 12 }}>
            Selected posts and threads from{' '}
            <a href={`https://twitter.com/${TWITTER_HANDLE}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              @{TWITTER_HANDLE}
            </a> on X.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="social-page__grid fade-up-1">

            {/* Feed */}
            <div>
              {loading ? (
                <div className="tweets-grid">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="tweet-skeleton glass">
                      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div className="skeleton" style={{ height: 12, width: '50%' }} />
                          <div className="skeleton" style={{ height: 10, width: '30%' }} />
                        </div>
                      </div>
                      <div className="skeleton" style={{ height: 13, width: '100%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 13, width: '75%' }} />
                    </div>
                  ))}
                </div>
              ) : tweets.length === 0 ? (
                <div className="social-page__empty glass">
                  <div className="social-page__empty-icon"><XIcon /></div>
                  <p className="body" style={{ fontWeight: 500 }}>@{TWITTER_HANDLE}</p>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 280, textAlign: 'center' }}>
                    No posts added yet. Check back soon or follow directly on X.
                  </p>
                  <a href={`https://twitter.com/${TWITTER_HANDLE}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 20 }}>
                    Follow on X ↗
                  </a>
                </div>
              ) : (
                <>
                  {pinned.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <p className="caption" style={{ marginBottom: 16 }}>📌 Pinned</p>
                      <div className="tweets-grid">
                        {pinned.map(tweet => <TweetEmbed key={tweet._id} tweet={tweet} />)}
                      </div>
                    </div>
                  )}
                  {rest.length > 0 && (
                    <div>
                      {pinned.length > 0 && <p className="caption" style={{ marginBottom: 16 }}>Recent posts</p>}
                      <div className="tweets-grid">
                        {rest.map(tweet => <TweetEmbed key={tweet._id} tweet={tweet} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="social-page__side">
              <div className="glass social-page__info-card">
                <p className="caption" style={{ marginBottom: 12 }}>About</p>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Follow along for field updates, research threads, and thoughts on wood science, forestry, and sustainable construction.
                </p>
                <a href={`https://twitter.com/${TWITTER_HANDLE}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
                  Follow on X
                </a>
              </div>
              <div className="glass social-page__info-card">
                <p className="caption" style={{ marginBottom: 12 }}>Topics discussed</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Wood Science', 'Forestry', 'Construction', 'Industrialization', 'Sustainability', 'Research'].map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
