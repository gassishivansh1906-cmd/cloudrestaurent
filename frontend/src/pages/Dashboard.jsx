import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = ['Overview', 'Orders', 'Reservations', 'Messages', 'Menu'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      const [o, r, m, items, cats] = await Promise.all([
        api.getOrders(),
        api.getReservations(),
        api.getMessages(),
        api.getMenu(),
        api.getCategories(),
      ]);
      setOrders(o);
      setReservations(r);
      setMessages(m);
      setMenu(items);
      setCategories(cats);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const revenue = orders.reduce((s, o) => s + Number(o.TotalAmount), 0);

  async function setResStatus(id, status) {
    await api.updateReservation(id, status);
    loadAll();
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <span className="eyebrow">Admin console</span>
          <h1 className="section-title" style={{ margin: '6px 0' }}>Welcome, {user?.name}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stat-cards">
          {[
            ['Orders', orders.length],
            ['Revenue', `$${revenue.toFixed(2)}`],
            ['Reservations', reservations.length],
            ['Messages', messages.length],
          ].map(([label, val]) => (
            <div className="card stat" key={label}>
              <div className="num">{val}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>

        <div className="dash-tabs">
          {TABS.map((t) => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
          {tab === 'Overview' && (
            <p style={{ color: 'var(--muted)' }}>
              You have {orders.length} orders, {reservations.length} reservations and {messages.length} unread messages.
              Use the tabs above to manage each area of your restaurant.
            </p>
          )}

          {tab === 'Orders' && (
            <table className="table">
              <thead><tr><th>#</th><th>Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.Id}>
                    <td>{o.Id}</td><td>{o.CustomerName}</td><td>{o.Email}</td>
                    <td>${Number(o.TotalAmount).toFixed(2)}</td>
                    <td><span className="badge badge-primary">{o.Status}</span></td>
                    <td>{new Date(o.CreatedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>No orders yet.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Reservations' && (
            <table className="table">
              <thead><tr><th>Name</th><th>Party</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.Id}>
                    <td>{r.CustomerName}</td><td>{r.PartySize}</td>
                    <td>{new Date(r.ReserveDate).toLocaleDateString()}</td><td>{r.ReserveTime}</td>
                    <td><span className="badge badge-muted">{r.Status}</span></td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setResStatus(r.Id, 'confirmed')}>Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setResStatus(r.Id, 'cancelled')}>Cancel</button>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>No reservations yet.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Messages' && (
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th></tr></thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.Id}>
                    <td>{m.Name}</td><td>{m.Email}</td><td>{m.Subject}</td><td>{m.Message}</td>
                    <td>{new Date(m.CreatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {messages.length === 0 && <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>No messages yet.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Menu' && <MenuManager menu={menu} categories={categories} onChange={loadAll} />}
        </div>
      </div>
    </section>
  );
}

function MenuManager({ menu, categories, onChange }) {
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', price: '', imageUrl: '', isFeatured: false });
  const [error, setError] = useState('');

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createMenuItem(form);
      setForm({ categoryId: '', name: '', description: '', price: '', imageUrl: '', isFeatured: false });
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  async function del(id) {
    await api.deleteMenuItem(id);
    onChange();
  }

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      <form onSubmit={add}>
        <h3 style={{ marginBottom: 14 }}>Add menu item</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Category</label>
          <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select...</option>
            {categories.map((c) => <option key={c.Id} value={c.Id}>{c.Name}</option>)}
          </select>
        </div>
        <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="field"><label>Price</label><input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
        <div className="field"><label>Image URL</label><input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
        <label style={{ display: 'flex', gap: 8, marginBottom: 16, color: 'var(--muted)' }}>
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured on homepage
        </label>
        <button className="btn btn-primary btn-block">Add item</button>
      </form>

      <div>
        <h3 style={{ marginBottom: 14 }}>Current items ({menu.length})</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Cat</th><th>Price</th><th></th></tr></thead>
          <tbody>
            {menu.map((m) => (
              <tr key={m.Id}>
                <td>{m.Name}</td><td>{m.CategoryName}</td><td>${Number(m.Price).toFixed(2)}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => del(m.Id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
