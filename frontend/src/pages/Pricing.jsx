import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle.jsx';

const plans = [
  {
    name: 'Starter',
    price: 0,
    tagline: 'For new restaurants getting online',
    features: ['1 location', 'Digital menu', 'Up to 50 orders/mo', 'Email support'],
    cta: 'Start free',
    popular: false,
  },
  {
    name: 'Growth',
    price: 49,
    tagline: 'For busy restaurants ready to scale',
    features: ['3 locations', 'Online ordering + cart', 'Unlimited reservations', 'Owner dashboard', 'Priority support'],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 149,
    tagline: 'For chains and franchises',
    features: ['Unlimited locations', 'Custom domain', 'Advanced analytics', 'API access', 'Dedicated manager'],
    cta: 'Contact sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Simple pricing</span>
          <h1 className="section-title">Plans that grow with you</h1>
          <p className="section-subtitle mx-auto">No hidden fees. Cancel anytime.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {plans.map((p) => (
              <div className={`card plan ${p.popular ? 'popular' : ''}`} key={p.name}>
                {p.popular && <span className="badge badge-primary" style={{ position: 'absolute', top: 18, right: 18 }}>Most popular</span>}
                <span className="eyebrow">{p.name}</span>
                <div className="amount">
                  ${p.price}<span>/mo</span>
                </div>
                <p style={{ color: 'var(--muted)' }}>{p.tagline}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Link to="/register" className={`btn btn-block ${p.popular ? 'btn-primary' : 'btn-outline'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="center" style={{ marginTop: 40, color: 'var(--muted)' }}>
            Need something custom? <Link to="/contact" style={{ color: 'var(--accent)' }}>Talk to our team →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
