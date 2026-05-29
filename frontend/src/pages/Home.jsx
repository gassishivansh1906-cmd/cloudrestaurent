import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import SectionTitle from '../components/SectionTitle.jsx';
import { useCart } from '../context/CartContext.jsx';

const features = [
  { icon: '📋', title: 'Smart Menu Management', desc: 'Create, categorize and update your menu in real time across every channel.' },
  { icon: '📅', title: 'Online Reservations', desc: 'Let guests book a table 24/7 with instant confirmation and reminders.' },
  { icon: '🛍️', title: 'Online Ordering', desc: 'Take orders directly from your site with a built-in cart and checkout.' },
  { icon: '📊', title: 'Owner Dashboard', desc: 'See orders, reservations and messages in one powerful admin console.' },
  { icon: '🔐', title: 'Secure Accounts', desc: 'JWT-based auth keeps customer and admin data safe by default.' },
  { icon: '☁️', title: 'Cloud Native', desc: 'Dockerized and deployed to AWS with automated CI/CD pipelines.' },
];

const steps = [
  { n: '01', t: 'Sign up', d: 'Create your restaurant account in seconds.' },
  { n: '02', t: 'Build your menu', d: 'Add dishes, photos, prices and categories.' },
  { n: '03', t: 'Go live', d: 'Share your link and start taking orders & bookings.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const { add } = useCart();

  useEffect(() => {
    api.getMenu('?featured=true').then(setFeatured).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <span className="badge badge-primary">🚀 The all-in-one restaurant platform</span>
          <h1>Run your restaurant <span className="text-gradient">in the cloud</span>.</h1>
          <p>
            CloudRestaurant gives you a beautiful website, online ordering, reservations and a
            powerful dashboard — everything you need to grow your restaurant online.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Start free trial</Link>
            <Link to="/menu" className="btn btn-outline">Explore the menu</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-sm">
        <div className="container">
          <div className="grid grid-4">
            {[['12k+', 'Orders served'], ['1.5k', 'Restaurants'], ['99.9%', 'Uptime'], ['4.9★', 'Avg rating']].map(([num, label]) => (
              <div className="stat card" key={label}>
                <div className="num">{num}</div>
                <div className="label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Everything you need"
            title="One platform to power your restaurant"
            subtitle="From the first click to the final bite, CloudRestaurant handles the digital side so you can focus on the food."
          />
          <div className="grid grid-3">
            {features.map((f) => (
              <div className="card feature" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured menu */}
      {featured.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-soft)' }}>
          <div className="container">
            <SectionTitle eyebrow="Chef's picks" title="Featured dishes" subtitle="A taste of what your customers can order online." />
            <div className="grid grid-4">
              {featured.slice(0, 4).map((item) => (
                <div className="card menu-card" key={item.Id}>
                  {item.ImageUrl && <img src={item.ImageUrl} alt={item.Name} />}
                  <div className="body">
                    <div className="row">
                      <h3 style={{ fontSize: 18 }}>{item.Name}</h3>
                      <span className="price">${Number(item.Price).toFixed(2)}</span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>{item.Description}</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 'auto' }} onClick={() => add(item)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="center" style={{ marginTop: 30 }}>
              <Link to="/menu" className="btn btn-outline">View full menu</Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="How it works" title="Live in three simple steps" />
          <div className="grid grid-3">
            {steps.map((s) => (
              <div className="card feature" key={s.n}>
                <div className="text-gradient" style={{ fontSize: 38, fontWeight: 800 }}>{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, #2b2320, #211b18)' }}>
            <h2 className="section-title">Ready to bring your restaurant online?</h2>
            <p className="section-subtitle mx-auto" style={{ marginBottom: 24 }}>
              Join thousands of restaurants growing with CloudRestaurant.
            </p>
            <Link to="/register" className="btn btn-primary">Create your account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
