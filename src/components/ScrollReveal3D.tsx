import React, { useEffect, useRef, useState } from 'react';

interface ScrollReveal3DProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollReveal3D: React.FC<ScrollReveal3DProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransformClass = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0 translate-x-0 rotate-x-0 rotate-y-0 scale-100';
    }
    switch (direction) {
      case 'left':
        return 'opacity-20 translate-x-10 rotate-y-3 scale-[0.98]';
      case 'right':
        return 'opacity-20 -translate-x-10 -rotate-y-3 scale-[0.98]';
      case 'down':
        return 'opacity-20 -translate-y-10 -rotate-x-3 scale-[0.98]';
      case 'up':
      default:
        return 'opacity-20 translate-y-12 rotate-x-3 scale-[0.98]';
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-transform ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal3D;
