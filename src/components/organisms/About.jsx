import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/use.store.js";
import "./About.css";

const AboutPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const stats = [
    {
      number: "50K+",
      label: "Cybersecurity Professionals Trained",
      icon: "🎓",
    },
    { number: "1M+", label: "Threat Scenarios Simulated", icon: "🎯" },
    { number: "95%", label: "User Security Awareness Improvement", icon: "📈" },
    { number: "24/7", label: "Real-time Threat Intelligence", icon: "🛡️" },
  ];

  const features = [
    {
      icon: "🎮",
      title: "Gamified Learning",
      description:
        "Transform complex security concepts into engaging challenges and missions",
    },
    {
      icon: "🔍",
      title: "Real-World Scenarios",
      description:
        "Learn through authentic threat simulations based on actual cyber attacks",
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description:
        "Monitor your growth with detailed analytics and skill assessments",
    },
    {
      icon: "🤖",
      title: "AI-Powered Coaching",
      description: "Get personalized guidance from our CyberSage AI assistant",
    },
    {
      icon: "🌐",
      title: "Community Defense",
      description:
        "Join forces with other learners in collaborative security exercises",
    },
    {
      icon: "🔄",
      title: "Continuous Updates",
      description: "Stay current with evolving threats and defense strategies",
    },
  ];

  return (
    <div className="about-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo" onClick={() => navigate("/")}>
              CyberSage
            </div>
            <div className="nav-right">
              {user && (
                <div className="user-points">
                  <span className="points-badge">{user.points} XP</span>
                </div>
              )}
              <ul className="nav-links">
                <li>
                  <a className="font-hero" onClick={() => navigate("/")}>
                    Home
                  </a>
                </li>
                <li>
                  <a
                    className="font-hero"
                    onClick={() => navigate("/quiz")}
                  >
                    Quiz
                  </a>
                </li>
                <li>
                  <a className="font-hero active">About</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Forging the Next Generation of
                <span> Cyber Guardians</span>
              </h1>
              <p className="hero-subtitle">
                At CyberSage, we believe that effective cybersecurity education
                should be
                <strong> engaging, practical, and continuously evolving</strong>
                . Our mission is to transform how people learn digital defense
                through immersive, game-based experiences.
              </p>
            </div>
            <div className="hero-visual">
              <div className="cyber-orb">
                <div className="orb-core"></div>
                <div className="orb-ring"></div>
                <div className="orb-particles">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="particle"
                      style={{ "--i": i }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-card">
            <div className="mission-header">
              <h2>Why CyberSage Exists</h2>
              <div className="mission-icon">🎯</div>
            </div>
            <div className="mission-content">
              <p>
                In an era where{" "}
                <strong>
                  cyber threats evolve faster than traditional education
                </strong>
                , we saw the need for a learning platform that keeps pace with
                both technology and human psychology. CyberSage was born from
                the realization that the best defense comes from understanding,
                not just memorization.
              </p>
              <div className="mission-principles">
                <div className="principle">
                  <span className="principle-icon">⚡</span>
                  <div>
                    <h4>Learn by Doing</h4>
                    <p>
                      Hands-on experience beats theoretical knowledge in
                      cybersecurity
                    </p>
                  </div>
                </div>
                <div className="principle">
                  <span className="principle-icon">🛡️</span>
                  <div>
                    <h4>Stay Relevant</h4>
                    <p>
                      Continuous learning against real-world, evolving threats
                    </p>
                  </div>
                </div>
                <div className="principle">
                  <span className="principle-icon">🌍</span>
                  <div>
                    <h4>Build Community</h4>
                    <p>
                      Collective defense is stronger than individual protection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Digital Footprint</h2>
            <p>Measuring success through enhanced cyber resilience</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number font-hero">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>The CyberSage Difference</h2>
            <p>What sets our approach apart in cybersecurity education</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title font-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Begin Your Cyber Journey?</h2>
              <p>
                Join thousands of learners transforming their cybersecurity
                skills through immersive, game-based education. Your first
                mission awaits.
              </p>
              <div className="cta-buttons">
                <button
                  className="cta-button primary"
                  onClick={() => navigate("/quiz")}
                >
                  Start Learning Now
                </button>
                <button
                  className="cta-button secondary"
                  onClick={() => navigate("/")}
                >
                  Explore Features
                </button>
              </div>
            </div>
            <div className="cta-visual">
              <div className="floating-shield">🛡️</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
