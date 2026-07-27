export default function AdminSidebar({ active, onSelect, open, onClose, isMobile, onLogout }) {
  const items = [
    'Courses', 'Lessons', 'Quizzes', 'Assignments', 'Investiture', 'Students', 'Instructors', 'Results', 'Certificates', 'Profile'
  ];

  if (!open) return null;

  return (
    <>
      {isMobile && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
      )}
      <div style={{
        width: '220px', borderRight: '1px solid var(--line)', padding: '30px 0',
        minHeight: isMobile ? '100vh' : 'calc(100vh - 82px)',
        position: isMobile ? 'fixed' : 'static',
        top: 0, left: 0, background: 'var(--card-bg)', zIndex: 50,
        overflowY: 'auto', flexShrink: 0,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ flex: 1 }}>
          {items.map((item) => (
            <div
              key={item}
              onClick={() => { onSelect(item); if (isMobile) onClose(); }}
              style={{
                padding: '12px 24px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                color: active === item ? 'var(--forest)' : 'var(--ink)',
                borderLeft: active === item ? '3px solid var(--gold)' : '3px solid transparent',
                background: active === item ? 'rgba(27,67,50,0.05)' : 'transparent'
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--line)' }}>
          <button onClick={onLogout} style={{
            background: 'transparent', border: '1.5px solid var(--forest)', color: 'var(--forest-deep)',
            padding: '8px 18px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', width: '100%'
          }}>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}