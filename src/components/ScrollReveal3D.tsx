import React, { useEffect, useRef, useState } from 'react';

interface ScrollReveal3DProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const HIDDEN_STYLES: Record<string, React.CSSProperties> = {
  up: {
    opacity: 0,
    transform: 'perspective(1200px) translateY(80px) rotateX(8deg) scale(0.92)',
    filter: 'blur(6px)',
  },
  down: {
    opacity: 0,
    transform: 'perspective(1200px) translateY(-60px) rotateX(-6deg) scale(0.94)',
    filter: 'blur(5px)',
  },
  left: {
    opacity: 0,
    transform: 'perspective(1200px) translateX(80px) rotateY(-8deg) scale(0.93)',
    filter: 'blur(5px)',
  },
  right: {
    opacity: 0,
    transform: 'perspective(1200px) translateX(-80px) rotateY(8deg) scale(0.93)',
    filter: 'blur(5px)',
  },
};

const VISIBLE_STYLE: React.CSSProperties = {
  opacity: 1,
  transform: 'perspective(1200px) translateY(0) translateX(0) rotateX(0) rotateY(0) scale(1)',
  filter: 'blur(0px)',
};

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

    // ponytail: SSR / old-browser fallback — just show
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
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseStyle: React.CSSProperties = {
    ...(isVisible ? VISIBLE_STYLE : HIDDEN_STYLES[direction] || HIDDEN_STYLES.up),
    transformStyle: 'preserve-3d' as const,
    transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: 'opacity, transform, filter',
  };

  return (
    <div ref={domRef} style={baseStyle} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal3D;
