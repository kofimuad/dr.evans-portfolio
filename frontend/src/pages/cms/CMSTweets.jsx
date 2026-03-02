import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import '../cms/CMSList.css';
import '../cms/CMSForm.css';

export default function CMSTweets() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/tweets');
      setTweets(data.tweets);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setAdding(true);
    try {
      await api.post('/tweets', { tweetUrl: url.trim() });
      setUrl('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add tweet');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this tweet?')) return;
    await api.delete(`/tweets/${id}`);
    load();
  };

  const handlePin = async (id) => {
    await api.patch(`/tweets/${id}/pin`);
    load();
  };

  return (
    <main className="cms-list">
      <div className="cms-list__header">
        <div>
          <Link to="/cms" className="cms-list__back">← Dashboard</Link>
          <h1 className="heading-2" style={{ marginTop: 8 }}>Curated Tweets</h1>
        </div>
        <Link to="/social" target="_blank" className="btn btn-ghost btn-sm">Preview ↗</Link>
      </div>

      <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Paste any tweet or X post URL below to add it to the Social page. These will display as embedded cards.
      </p>

      {/* Add tweet form */}
      <form onSubmit={handleAdd} className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <p className="caption" style={{ marginBottom: 16 }}>Add a tweet</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="cms-form__input"
            style={{ flex: 1, minWidth: 280 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://twitter.com/_TheRead1/status/123456789"
            type="url"
          />
          <button type="submit" className="btn btn-primary" disabled={adding || !url.trim()}>
            {adding ? 'Adding…' : 'Add tweet'}
          </button>
        </div>
        {error && (
          <p style={{ color: '#e05555', fontSize: '0.85rem', marginTop: 10 }}>{error}</p>
        )}
        <p className="body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 10 }}>
          Works with both twitter.com and x.com URLs. Go to any tweet → click the share icon → Copy link.
        </p>
      </form>

      {/* Tweet list */}
      {loading ? (
        <div className="cms-list__skeleton">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-sm)' }} />)}
        </div>
      ) : tweets.length === 0 ? (
        <div className="glass cms-list__empty">No tweets added yet. Paste a tweet URL above to get started.</div>
      ) : (
        <div className="cms-list__table glass">
          {tweets.map(tweet => (
            <div key={tweet._id} className="cms-list__row">
              <div className="cms-list__row-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tweet.pinned && <span className="tag">📌 Pinned</span>}
                  <span className="body-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {tweet.oEmbed?.authorName ? `@${tweet.oEmbed.authorName}` : ''}
                  </span>
                </div>
                <p className="cms-list__row-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  {tweet.tweetUrl}
                </p>
                {tweet.oEmbed?.html && (
                  <p className="body-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    ✓ Embed cached
                  </p>
                )}
              </div>
              <div className="cms-list__row-actions">
                <a href={tweet.tweetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  View ↗
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => handlePin(tweet._id)}>
                  {tweet.pinned ? 'Unpin' : '📌 Pin'}
                </button>
                <button className="btn btn-ghost btn-sm cms-list__delete" onClick={() => handleDelete(tweet._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
