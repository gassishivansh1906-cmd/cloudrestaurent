import SectionTitle from '../components/SectionTitle.jsx';

const team = [
  { name: 'Aria Romano', role: 'Head Chef', img: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400' },
  { name: 'Marcus Lee', role: 'Restaurant Manager', img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400' },
  { name: 'Sofia Patel', role: 'Pastry Chef', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
  { name: 'David Kim', role: 'Sommelier', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
];

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1 className="section-title">About CloudRestaurant</h1>
          <p className="section-subtitle mx-auto">Great food, served with great technology.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900"
              alt="Restaurant interior"
              style={{ borderRadius: 'var(--radius)' }}
            />
            <div>
              <SectionTitle
                center={false}
                eyebrow="Since 2024"
                title="A modern restaurant, powered by the cloud"
                subtitle="We started CloudRestaurant with one belief: running a restaurant shouldn't mean juggling ten different tools."
              />
              <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
                From farm-fresh ingredients to a seamless digital experience, every detail is crafted
                with care. Our platform brings menus, reservations and online ordering together so
                owners can focus on what they do best — delighting guests.
              </p>
              <p style={{ color: 'var(--muted)' }}>
                Built on a fully containerized, cloud-native stack, CloudRestaurant scales with you
                whether you serve 50 or 5,000 guests a day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid grid-3">
            {[
              { icon: '🌱', t: 'Fresh & local', d: 'We source seasonal ingredients from local farms every morning.' },
              { icon: '👨‍🍳', t: 'Crafted with care', d: 'Award-winning chefs bring passion to every plate.' },
              { icon: '💚', t: 'Sustainable', d: 'Eco-friendly packaging and zero-waste kitchen practices.' },
            ].map((v) => (
              <div className="card feature" key={v.t}>
                <div className="icon">{v.icon}</div>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="The people" title="Meet our team" />
          <div className="grid grid-4">
            {team.map((m) => (
              <div className="card" key={m.name}>
                <img src={m.img} alt={m.name} style={{ height: 240, objectFit: 'cover', width: '100%' }} />
                <div style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 18 }}>{m.name}</h3>
                  <p style={{ color: 'var(--accent)' }}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
