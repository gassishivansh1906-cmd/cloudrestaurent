export default function SectionTitle({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={center ? 'center mx-auto' : ''} style={{ maxWidth: center ? 720 : 'none', marginBottom: 40 }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle" style={center ? { margin: '0 auto' } : {}}>{subtitle}</p>}
    </div>
  );
}
