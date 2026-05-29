import { useState } from 'react';
import { api } from '../api/client.js';

const empty = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
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
      const res = await api.sendContact(form);
      setStatus({ type: 'success', msg: res.message });
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
          <span className="eyebrow">Get in touch</span>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle mx-auto">Questions, feedback or bookings — we'd love to hear from you.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <div>
              <h3 style={{ marginBottom: 16 }}>Visit us</h3>
              {[
                ['📍 Address', '123 Flavor Street, Foodie City, 10001'],
                ['📞 Phone', '+1 (000) 000-0000'],
                ['✉️ Email', 'hello@cloudrestaurant.io'],
                ['🕒 Hours', 'Mon–Sun · 11:00 AM – 11:00 PM'],
              ].map(([k, v]) => (
                <div className="card" key={k} style={{ padding: 18, marginBottom: 14 }}>
                  <strong>{k}</strong>
                  <p style={{ color: 'var(--muted)' }}>{v}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 32 }}>
              {status.msg && <div className={`alert alert-${status.type}`}>{status.msg}</div>}
              <form onSubmit={submit}>
                <div className="field">
                  <label>Name</label>
                  <input className="input" name="name" value={form.name} onChange={update} required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="input" type="email" name="email" value={form.email} onChange={update} required />
                </div>
                <div className="field">
                  <label>Subject</label>
                  <input className="input" name="subject" value={form.subject} onChange={update} />
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea className="textarea" name="message" value={form.message} onChange={update} required />
                </div>
                <button className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Sending...' : 'Send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
