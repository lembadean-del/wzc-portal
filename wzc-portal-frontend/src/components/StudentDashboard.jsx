import { useState } from 'react';
import StudentCourses from './StudentCourses';
import StudentLessons from './StudentLessons';
import StudentInvestiture from './StudentInvestiture';
import ProfilePanel from './ProfilePanel';
import ThemeToggle from './ThemeToggle';

export default function StudentDashboard({ user, onLogout }) {
  const [openCourseId, setOpenCourseId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const initials = user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div style={{ padding: '20px 6vw', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          onClick={() => { setShowProfile(true); setOpenCourseId(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          {user.photo_url ? (
            <img src={user.photo_url} alt={user.full_name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              {initials}
            </div>
          )}
          <div>
            <strong style={{ color: 'var(--forest-deep)' }}>{user.full_name}</strong>
            <span style={{ color: 'var(--sage)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginLeft: '10px' }}>
              Student
            </span>
          </div>
        </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
  <ThemeToggle />
  <button onClick={onLogout} style={{
    background: 'transparent', border: '1.5px solid var(--forest)', color: 'var(--forest-deep)',
    padding: '8px 18px', borderRadius: '2px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
  }}>
    Log Out
  </button>
</div>
      </div>

      {showProfile ? (
        <ProfilePanel user={user} />
      ) : openCourseId ? (
        <StudentLessons courseId={openCourseId} onBack={() => setOpenCourseId(null)} />
      ) : (
        <>
          <StudentInvestiture />
          <StudentCourses onOpenCourse={setOpenCourseId} />
        </>
      )}
    </div>
  );
}
