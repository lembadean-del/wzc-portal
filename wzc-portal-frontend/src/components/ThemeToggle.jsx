import { useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', next);
    setIsDark(!isDark);
  };

  return (
    <span onClick={toggle} style={{ cursor: 'pointer', fontSize: '1.2rem' }} title="Toggle dark mode">
      {isDark ? '☀️' : '🌙'}
    </span>
  );
}
