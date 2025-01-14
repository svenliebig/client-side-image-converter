import React, { useEffect, useRef } from 'react';

export const CursorEffect = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 blur-3xl transition-all duration-300 ease-out"
    />
  );
};