export default function Navbar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 6vw', borderBottom: '1px solid var(--line)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px', height: '38px', background: 'var(--forest)',
          clipPath: 'polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)'
        }} />
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          WZC MasterGuide
          <span style={{
            display: 'block', fontSize: '0.68rem', color: 'var(--sage)',
            fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>Learning Portal</span>
        </div>
      </div>
    </nav>
  );
}
