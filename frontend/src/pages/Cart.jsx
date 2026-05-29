import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Cart() {
  const { items, setQuantity, remove, total, clear } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ customerName: user?.name || '', email: user?.email || '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  async function checkout(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const payload = {
        customerName: form.customerName,
        email: form.email,
        items: items.map((i) => ({ menuItemId: i.Id, quantity: i.quantity })),
      };
      const order = await api.createOrder(payload);
      setStatus({ type: 'success', msg: `Order #${order.Id} placed! Total $${Number(order.TotalAmount).toFixed(2)}.` });
      clear();
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Your order</span>
          <h1 className="section-title">Cart & Checkout</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}

          {items.length === 0 ? (
            <div className="card center" style={{ padding: 48 }}>
              <h3>Your cart is empty</h3>
              <p style={{ color: 'var(--muted)', margin: '10px 0 20px' }}>Add some delicious dishes from our menu.</p>
              <Link to="/menu" className="btn btn-primary">Browse menu</Link>
            </div>
          ) : (
            <div className="grid grid-2" style={{ alignItems: 'start' }}>
              <div className="card" style={{ padding: 24 }}>
                {items.map((i) => (
                  <div className="cart-row" key={i.Id}>
                    {i.ImageUrl && <img src={i.ImageUrl} alt={i.Name} />}
                    <div style={{ flex: 1 }}>
                      <strong>{i.Name}</strong>
                      <div style={{ color: 'var(--accent)' }}>${Number(i.Price).toFixed(2)}</div>
                    </div>
                    <div className="qty">
                      <button onClick={() => setQuantity(i.Id, i.quantity - 1)}>−</button>
                      <span>{i.quantity}</span>
                      <button onClick={() => setQuantity(i.Id, i.quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(i.Id)}>✕</button>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Order summary</h3>
                <div className="cart-row" style={{ borderBottom: 'none' }}>
                  <span style={{ flex: 1 }}>Total</span>
                  <span className="price">${total.toFixed(2)}</span>
                </div>
                <form onSubmit={checkout}>
                  <div className="field">
                    <label>Name</label>
                    <input className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
