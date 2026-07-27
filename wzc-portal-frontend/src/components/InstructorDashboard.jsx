import { useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import InstructorSidebar from './InstructorSidebar';
import ThemeToggle from './ThemeToggle';
import InstructorCoursesPanel from './InstructorCoursesPanel';
import LessonsPanel from './LessonsPanel';
import QuizzesPanel from './QuizzesPanel';
import AssignmentsPanel from './AssignmentsPanel';
import ResultsPanel from './ResultsPanel';
import ProfilePanel from './ProfilePanel';

export default function InstructorDashboard({ user, onLogout }) {
  const [active, setActive] = useState('My Courses');
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
              Instructor
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div style={{ display: 'flex' }}>
        <InstructorSidebar
          active={active}
          onSelect={setActive}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          onLogout={onLogout}
        />
        {active === 'My Courses' && <InstructorCoursesPanel user={user} />}
        {active === 'Lessons' && <LessonsPanel />}
        {active === 'Quizzes' && <QuizzesPanel />}
        {active === 'Assignments' && <AssignmentsPanel />}
        {active === 'Results' && <ResultsPanel />}
        {active === 'Profile' && <ProfilePanel user={user} />}
      </div>
    </div>
  );
}