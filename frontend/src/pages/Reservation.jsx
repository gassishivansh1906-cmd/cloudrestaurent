import { useState } from 'react';
import { api } from '../api/client.js';

const empty = { customerName: '', email: '', phone: '', partySize: 2, reserveDate: '', reserveTime: '19:00', notes: '' };

export default function Reservation() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      await api.createReservation(form);
      setStatus({ type: 'success', msg: 'Reservation requested! We will confirm by email shortly.' });
      setForm(empty);
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
          <span className="eyebrow">Book a table</span>
          <h1 className="section-title">Reservations</h1>
          <p className="section-subtitle mx-auto">Reserve your spot in just a few clicks.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="card" style={{ padding: 32 }}>
            {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
            <form onSubmit={submit}>
              <div className="grid grid-2">
                <div className="field">
                  <label>Full name</label>
                  <input className="input" name="customerName" value={form.customerName} onChange={update} required />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="input" name="phone" value={form.phone} onChange={update} required />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={update} required />
              </div>
              <div className="grid grid-3">
                <div className="field">
                  <label>Guests</label>
                  <input className="input" type="number" min="1" max="30" name="partySize" value={form.partySize} onChange={update} required />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input className="input" type="date" name="reserveDate" value={form.reserveDate} onChange={update} required />
                </div>
                <div className="field">
                  <label>Time</label>
                  <input className="input" type="time" name="reserveTime" value={form.reserveTime} onChange={update} required />
                </div>
              </div>
              <div className="field">
                <label>Special requests (optional)</label>
                <textarea className="textarea" name="notes" value={form.notes} onChange={update} placeholder="Allergies, occasion, seating preference..." />
              </div>
              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Booking...' : 'Request reservation'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
