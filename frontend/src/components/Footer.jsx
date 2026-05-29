import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <img className="brand-mark" src="/favicon.svg" alt="" />
              Cloud<span className="text-gradient">Restaurant</span>
            </div>
            <p style={{ color: 'var(--muted)', maxWidth: 320 }}>
              The all-in-one SaaS platform that helps restaurants manage menus,
              reservations and online orders from a single dashboard.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <Link to="/menu">Menu</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/reservation">Reservations</Link>
            <Link to="/cart">Online Ordering</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Login</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:hello@cloudrestaurant.io">hello@cloudrestaurant.io</a>
            <a href="tel:+10000000000">+1 (000) 000-0000</a>
            <span style={{ color: 'var(--muted)' }}>123 Flavor Street, Foodie City</span>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} CloudRestaurant. All rights reserved. Built as a full-stack SaaS demo.
        </div>
      </div>
    </footer>
  );
}
