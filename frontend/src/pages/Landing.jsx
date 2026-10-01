import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    title: 'Encrypted by default',
    description: 'Every file is protected the moment it reaches CloudVault, so your documents stay private end to end.',
  },
  {
    title: 'Access from anywhere',
    description: 'Log in from any device to reach your documents, without carrying drives or emailing files to yourself.',
  },
  {
    title: 'You stay in control',
    description: 'Only you can see your documents. Nothing is shared or exposed unless you choose to share it.',
  },
];

function Landing() {
  return (
    <div>
      <Navbar />

      <section className="hero">
        <h1 className="hero-title">A secure home for your documents</h1>
        <p className="hero-subtitle">
          CloudVault keeps your files encrypted, organized, and accessible only to you —
          wherever you need them.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="hero-btn-primary">Create your account</Link>
          <Link to="/login" className="hero-btn-secondary">Log in</Link>
        </div>
      </section>

      <section className="features">
        {features.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing;