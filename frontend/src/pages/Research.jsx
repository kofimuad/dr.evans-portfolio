import { useEffect, useState } from 'react';
import api from '../lib/api';
import './Research.css';

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function Research() {
  const [papers, setPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [papersRes, projectsRes] = await Promise.all([
          api.get('/papers'),
          api.get('/projects'),
        ]);
        setPapers(papersRes.data.papers);
        setProjects(projectsRes.data.projects);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Group papers by year
  const papersByYear = papers.reduce((acc, paper) => {
    if (!acc[paper.year]) acc[paper.year] = [];
    acc[paper.year].push(paper);
    return acc;
  }, {});
  const years = Object.keys(papersByYear).sort((a, b) => b - a);

  return (
    <main className="research-page">
      <section className="research-page__hero section">
        <div className="container">
          <p className="caption fade-up">Academia</p>
          <h1 className="heading-1 fade-up-1">Research & Projects</h1>
          <p className="body-lg fade-up-2" style={{ color: 'var(--text-secondary)', maxWidth: 520, marginTop: 12 }}>
            Peer-reviewed publications, ongoing research, and forestry projects exploring wood's role in our world.
          </p>
        </div>
      </section>

      {/* Papers */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="heading-2 research-page__section-title fade-up">Publications</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} className="glass" style={{ padding: 24 }}>
                  <div className="skeleton" style={{ height: 20, width: '75%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%' }} />
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="glass research-page__empty">No publications yet.</div>
          ) : (
            years.map(year => (
              <div key={year} className="research-page__year-group fade-up">
                <p className="research-page__year caption">{year}</p>
                <div className="research-page__papers">
                  {papersByYear[year].map(paper => (
                    <a
                      key={paper._id}
                      href={paper.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="research-page__paper glass"
                    >
                      <div className="research-page__paper-body">
                        <h3 className="research-page__paper-title">{paper.title}</h3>
                        <p className="research-page__paper-authors body-sm">
                          {paper.authors?.join(', ')}
                          {paper.journal && <> · <em>{paper.journal}</em></>}
                        </p>
                        {paper.abstract && (
                          <p className="research-page__paper-abstract body-sm">{paper.abstract}</p>
                        )}
                        {paper.tags?.length > 0 && (
                          <div className="research-page__paper-tags">
                            {paper.tags.map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="research-page__paper-link">
                        <ExternalIcon />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="heading-2 research-page__section-title fade-up">Projects</h2>
            <div className="research-page__projects-grid">
              {projects.map((project, i) => (
                <div key={project._id} className={`research-page__project glass fade-up-${(i % 3) + 1}`}>
                  {project.coverImage?.url && (
                    <div className="research-page__project-img">
                      <img src={project.coverImage.url} alt={project.title} />
                    </div>
                  )}
                  <div className="research-page__project-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <h3 className="heading-3">{project.title}</h3>
                      <span className={`research-page__status research-page__status--${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="body-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {project.description}
                    </p>
                    {project.tags?.length > 0 && (
                      <div className="research-page__paper-tags">
                        {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    )}
                    {project.externalLink && (
                      <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                        View project <ExternalIcon />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
