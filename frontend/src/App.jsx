import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Research from './pages/Research';
import Social from './pages/Social';
import About from './pages/About';

import CMSLogin from './pages/cms/CMSLogin';
import CMSDashboard from './pages/cms/CMSDashboard';
import CMSPosts from './pages/cms/CMSPosts';
import CMSEditor from './pages/cms/CMSEditor';
import CMSPapers from './pages/cms/CMSPapers';
import CMSProjects from './pages/cms/CMSProjects';
import CMSAbout from './pages/cms/CMSAbout';
import CMSTweets from './pages/cms/CMSTweets';

import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh' }} />;
  return isAuth ? children : <Navigate to="/cms/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
      <Route path="/research" element={<PublicLayout><Research /></PublicLayout>} />
      <Route path="/social" element={<PublicLayout><Social /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />

      {/* Redirect old /projects URL to /research */}
      <Route path="/projects" element={<Navigate to="/research" replace />} />

      <Route path="/cms/login" element={<CMSLogin />} />
      <Route path="/cms" element={<ProtectedRoute><CMSDashboard /></ProtectedRoute>} />
      <Route path="/cms/posts" element={<ProtectedRoute><CMSPosts /></ProtectedRoute>} />
      <Route path="/cms/posts/new" element={<ProtectedRoute><CMSEditor /></ProtectedRoute>} />
      <Route path="/cms/posts/:id" element={<ProtectedRoute><CMSEditor /></ProtectedRoute>} />
      <Route path="/cms/papers" element={<ProtectedRoute><CMSPapers /></ProtectedRoute>} />
      <Route path="/cms/projects" element={<ProtectedRoute><CMSProjects /></ProtectedRoute>} />
      <Route path="/cms/about" element={<ProtectedRoute><CMSAbout /></ProtectedRoute>} />
      <Route path="/cms/tweets" element={<ProtectedRoute><CMSTweets /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
