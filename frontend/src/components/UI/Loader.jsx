import React, { useEffect, useRef } from 'react';
import { animate, svg, utils } from 'animejs';

const MorphPolygon = () => {
  const path1Ref = useRef(null);
  const path2Ref = useRef(null);
  const animationRef = useRef(null);

  // Generate random polygon points
  const generatePoints = (cx = 56, cy = 56) => {
    const total = utils.random(4, 64);
    const r1 = utils.random(4, 40);
    const r2 = 40;
    const isOdd = n => n % 2;
    let points = '';
    const l = isOdd(total) ? total + 1 : total;
    for (let i = 0; i < l; i++) {
      const r = isOdd(i) ? r1 : r2;
      const a = (2 * Math.PI * i / l) - Math.PI / 2;
      const x = cx + utils.round(r * Math.cos(a), 0);
      const y = cy + utils.round(r * Math.sin(a), 0);
      points += `${x},${y} `;
    }
    return points;
  };

  // Initial points (circle-ish)
  const initialPoints = () => {
    let points = '';
    for (let i = 0; i < 12; i++) {
      const a = (2 * Math.PI * i / 12) - Math.PI / 2;
      const x = 56 + Math.round(40 * Math.cos(a));
      const y = 56 + Math.round(40 * Math.sin(a));
      points += `${x},${y} `;
    }
    return points;
  };

  useEffect(() => {
    const $path1 = path1Ref.current;
    const $path2 = path2Ref.current;
    if (!$path1 || !$path2) return;

    let cancelled = false;

    function animateRandomPoints() {
      if (cancelled) return;
      utils.set($path2, { points: generatePoints() });
      animationRef.current = animate($path1, {
        points: svg.morphTo($path2),
        ease: 'inOutCirc',
        duration: 500,
        onComplete: animateRandomPoints,
      });
    }

    animateRandomPoints();

    return () => {
      cancelled = true;
      if (animationRef.current && animationRef.current.pause) {
        animationRef.current.pause();
      }
    };
  }, []);

  return (
    <svg viewBox="0 0 112 112" width="64" height="64" className="overflow-visible">
      <defs>
        <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-primary)" />
          <stop offset="50%" stopColor="var(--accent-tertiary)" />
          <stop offset="100%" stopColor="var(--accent-secondary)" />
        </linearGradient>
      </defs>
      <polygon
        ref={path1Ref}
        points={initialPoints()}
        fill="none"
        stroke="url(#loaderGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        ref={path2Ref}
        points={initialPoints()}
        fill="none"
        stroke="transparent"
        style={{ display: 'none' }}
      />
    </svg>
  );
};

const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <MorphPolygon />
      <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">Cargando...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] bg-opacity-90 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      {loaderContent}
    </div>
  );
};

export default Loader;
