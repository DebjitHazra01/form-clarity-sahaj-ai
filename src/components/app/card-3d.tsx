'use client';

import React from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  enableGlare?: boolean;
}

/**
 * Clean 2D Accessible Card Container (SFIC - Citizen Friendly)
 * Replaces 3D physics tilt with stable, high-contrast, accessible 2D layout.
 */
export function Card3D({
  children,
  className = '',
}: Card3DProps) {
  return (
    <div
      className={`relative w-full rounded-2xl bg-card border border-border/80 shadow-md transition-shadow hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
