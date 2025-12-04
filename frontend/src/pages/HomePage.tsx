import React from "react";
import { Link } from "react-router-dom";
import "../css/HomePage.css";

const HomePage: React.FC = () => {
  return (
    <section className="hero text-center">
      <div className="hero-content">
        <h1 className="hero-title">The simpler way to manage homecare</h1>
        <p className="hero-text">
          Helping you manage home visits, schedules, and support — all in one place designed for caregivers and patients alike.
        </p>

        {/* Services features */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="bi bi-calendar-check text-secondary"></i></div>
            <h5 className="feature-title">Easy Scheduling</h5>
            <p className="feature-text">Book and manage appointments easily. Real-time availability updates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-heart text-secondary"></i>
            </div>
            <h5 className="feature-title">Patient-Centered</h5>
            <p className="feature-text">Personalized care plans for each client's unique needs.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-shield-lock text-secondary"></i>
            </div>
            <h5 className="feature-title">Secure & Private</h5>
            <p className="feature-text">End-to-end encryption for all sensitive data.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-clock-history text-secondary"></i>
            </div>
            <h5 className="feature-title">24/7 Access</h5>
            <p className="feature-text">Access your schedule and info anytime, anywhere.</p>
          </div>
        </div>

        {/* Call-to-action buttons */}
        <div className="hero-buttons">
          <Link className="cta" to="/register">
            Get Started <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;