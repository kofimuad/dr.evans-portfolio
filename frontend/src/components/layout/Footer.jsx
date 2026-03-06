import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container-wide">
        <div className="footer__brand">
          <span className="footer__icon">🌲</span>
          <span className="footer__name">Evans Antwi Adjei</span>
          <p className="footer__tagline">Understanding our environmental footprint through life cycle assessment.</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <span className="footer__col-title">Navigate</span>
            <Link to="/">Home</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/research">Research & Projects</Link>
            <Link to="/social">Social</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-title">CMS</span>
            <Link to="/cms/login">Login</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom container-wide">
        <span>© {new Date().getFullYear()} Evans Antwi Adjei. All rights reserved.</span>
      </div>
    </footer>
  );
}
