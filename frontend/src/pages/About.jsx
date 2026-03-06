import { useEffect, useState } from 'react';
import api from '../lib/api';
import './About.css';

export default function About() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get('/pages/about').then(({ data }) => setPage(data.page)).catch(() => {});
  }, []);

  const content = page?.content || {};

  return (
    <main className="about-page">
      <section className="about-page__hero section">
        <div className="container">
          <div className="about-page__layout">
            <div className="about-page__text fade-up">
              <p className="caption">About</p>
              <h1 className="heading-1 about-page__name">
                {content.heading || 'About Me'}
              </h1>
              <p className="body-lg about-page__bio">
                {content.bio || 'Researcher at the intersection of wood science, forestry, and industrial application.'}
              </p>

              {content.education?.length > 0 && (
                <div className="about-page__section">
                  <p className="caption" style={{ marginBottom: 16 }}>Education</p>
                  {content.education.map((edu, i) => (
                    <div key={i} className="about-page__edu-item">
                      <p className="body" style={{ fontWeight: 500 }}>{edu.degree}</p>
                      <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>{edu.institution} · {edu.year}</p>
                    </div>
                  ))}
                </div>
              )}

              {content.interests?.length > 0 && (
                <div className="about-page__section">
                  <p className="caption" style={{ marginBottom: 16 }}>Research interests</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {content.interests.map(i => <span key={i} className="tag">{i}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="about-page__card-col fade-up-2">
              <div className="glass about-page__profile-card">
                {content.avatar ? (
                  <img src={content.avatar} alt={content.name || 'Profile photo'} className="about-page__avatar" />
                ) : (
                  <div className="about-page__avatar-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                      Add photo in CMS
                    </p>
                  </div>
                )}
                <p className="heading-3" style={{ textAlign: 'center' }}>{content.name || 'Evans Antwi Adjei'}</p>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {content.role || 'Wood Science Researcher'}
                </p>
                <div className="about-page__links">
                  {content.email && (
                    <a href={`mailto:${content.email}`} className="btn btn-ghost btn-sm">Email</a>
                  )}
                  {content.googleScholar && (
                    <a href={content.googleScholar} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Google Scholar</a>
                  )}
                  {content.twitter && (
                    <a href={`https://twitter.com/${content.twitter}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Twitter / X</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
