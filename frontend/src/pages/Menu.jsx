import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const [added, setAdded] = useState(null);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getMenu()])
      .then(([cats, menu]) => {
        setCategories(cats);
        setItems(menu);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = active === 'all' ? items : items.filter((i) => i.CategoryId === active);

  function handleAdd(item) {
    add(item);
    setAdded(item.Id);
    setTimeout(() => setAdded(null), 1200);
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Taste the experience</span>
          <h1 className="section-title">Our Menu</h1>
          <p className="section-subtitle mx-auto">Freshly prepared dishes, available to order online.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="dash-tabs center" style={{ justifyContent: 'center' }}>
            <button className={`dash-tab ${active === 'all' ? 'active' : ''}`} onClick={() => setActive('all')}>
              All
            </button>
            {categories.map((c) => (
              <button key={c.Id} className={`dash-tab ${active === c.Id ? 'active' : ''}`} onClick={() => setActive(c.Id)}>
                {c.Name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="center"><span className="spinner" /></div>
          ) : visible.length === 0 ? (
            <p className="center" style={{ color: 'var(--muted)' }}>No items found in this category.</p>
          ) : (
            <div className="grid grid-3">
              {visible.map((item) => (
                <div className="card menu-card" key={item.Id}>
                  {item.ImageUrl && <img src={item.ImageUrl} alt={item.Name} />}
                  <div className="body">
                    <div className="row">
                      <h3 style={{ fontSize: 19 }}>{item.Name}</h3>
                      <span className="price">${Number(item.Price).toFixed(2)}</span>
                    </div>
                    <span className="badge badge-muted" style={{ alignSelf: 'flex-start' }}>{item.CategoryName}</span>
                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>{item.Description}</p>
                    <button
                      className={`btn btn-sm ${added === item.Id ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ marginTop: 'auto' }}
                      onClick={() => handleAdd(item)}
                    >
                      {added === item.Id ? '✓ Added' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
