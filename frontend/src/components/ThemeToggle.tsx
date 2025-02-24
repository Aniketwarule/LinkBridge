import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-full bg-gradient-to-r from-primary to-accent dark:from-purple-600 dark:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FaSun className="w-5 h-5 animate-spin-slow" />
      ) : (
        <FaMoon className="w-5 h-5 animate-bounce-slow" />
      )}
    </button>
  );
};

export default ThemeToggle;