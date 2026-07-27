import { useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from './ThemeToggle';
import CoursesPanel from './CoursesPanel';
import LessonsPanel from './LessonsPanel';
import QuizzesPanel from './QuizzesPanel';
import AssignmentsPanel from './AssignmentsPanel';
import InvestiturePanel from './InvestiturePanel';
import StudentsPanel from './StudentsPanel';
import InstructorsPanel from './InstructorsPanel';
import ResultsPanel from './ResultsPanel';
import CertificatesPanel from './CertificatesPanel';
import ProfilePanel from './ProfilePanel';

export default function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState('Courses');
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div>
      <div style={{ padding: '20px 5vw', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: 'pointer', fontSize: '1.3rem', color: 'var(--forest-deep)', lineHeight: 1 }}
            title={sidebarOpen ? 'Hide menu' : 'Show menu'}
          >
            ☰
          </span>
          <div>
            <strong style={{ color: 'var(--forest-deep)' }}>{user.full_name}</strong>
            <span style={{ color: 'var(--sage)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginLeft: '10px' }}>
              Administrator
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div style={{ display: 'flex' }}>
        <AdminSidebar
          active={active}
          onSelect={setActive}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          onLogout={onLogout}
        />
        {active === 'Courses' && <CoursesPanel />}
        {active === 'Lessons' && <LessonsPanel />}
        {active === 'Quizzes' && <QuizzesPanel />}
        {active === 'Assignments' && <AssignmentsPanel />}
        {active === 'Investiture' && <InvestiturePanel />}
        {active === 'Students' && <StudentsPanel />}
        {active === 'Instructors' && <InstructorsPanel />}
        {active === 'Results' && <ResultsPanel />}
        {active === 'Certificates' && <CertificatesPanel />}
        {active === 'Profile' && <ProfilePanel user={user} />}
      </div>
    </div>
  );
}