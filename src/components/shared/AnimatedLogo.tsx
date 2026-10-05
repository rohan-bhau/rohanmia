'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glow?: boolean;
}

const LOGO_PATH = "M 100.070 49.662 C 100.109 50.123, 99.899 101.224, 99.603 163.219 L 99.065 275.938 108.302 268.219 C 113.383 263.974, 121.242 257.575, 125.768 254 L 133.996 247.500 133.998 163 L 133.999 78.500 174.250 78.813 C 223.518 79.196, 229.020 80.119, 245.222 90.718 C 272.400 108.499, 277.956 149.667, 257.024 178.172 C 250.155 187.526, 241.696 194.417, 198.500 225.845 C 177.600 241.051, 140.554 268.457, 116.175 286.746 C 91.796 305.036, 71.658 320, 71.425 320 C 71.191 320, 70.980 289.738, 70.956 252.750 L 70.912 185.500 59.775 176 C 53.649 170.775, 45.331 163.663, 41.289 160.195 L 33.939 153.889 34.607 323.195 C 34.975 416.313, 35.326 492.573, 35.388 492.663 C 35.449 492.753, 43.375 485.982, 53 477.617 L 70.500 462.407 71 412.286 C 71.275 384.720, 71.725 361.968, 72 361.726 C 89.239 346.586, 162.305 288.737, 208.062 254 C 260.050 214.533, 268.613 207.307, 279.460 193.750 C 319.011 144.318, 301.101 78.521, 242.044 56.292 C 225.194 49.950, 222.939 49.760, 158.750 49.271 C 126.438 49.025, 100.032 49.201, 100.070 49.662 M 256.806 246.300 C 247.074 253.010, 239.086 258.786, 239.056 259.136 C 239.025 259.487, 241.137 260.093, 243.750 260.484 C 282.866 266.336, 310.091 303.629, 302.563 341.046 C 297.256 367.423, 279.814 385.970, 253.500 393.218 C 245.777 395.345, 243.567 395.433, 189.719 395.765 L 133.938 396.108 134.219 368.553 C 134.374 353.398, 134.196 340.999, 133.824 340.999 C 133.121 341, 109.064 360.082, 102.658 365.719 L 99 368.939 99 398.524 L 99 428.109 170.750 427.746 C 249.735 427.346, 250.722 427.278, 270.752 420.875 C 299.783 411.594, 321.944 393.501, 333.467 369.670 C 355.060 325.014, 341.149 274.353, 299.703 246.708 C 290.504 240.573, 278.114 233.974, 275.935 234.050 C 275.146 234.078, 266.538 239.590, 256.806 246.300";

export default function AnimatedLogo({
  size = 24,
  className = '',
  animated = true,
  glow = true,
}: AnimatedLogoProps) {
  const { currentTheme } = useThemeAccent();
  const gradId = React.useId();

  // Width is 361, Height is 525 => Aspect ratio: ~0.688
  const width = Math.round(size * 0.688);
  const height = size;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 361 525"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        style={{
          filter: glow ? `drop-shadow(0 0 6px ${currentTheme.primary}66)` : undefined,
        }}
      >
        <defs>
          {/* Metallic Silver-Chrome Gradient */}
          <linearGradient id={`${gradId}-chrome`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#d1d5db" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="75%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          {/* Theme Accent Gradient */}
          <linearGradient id={`${gradId}-accent`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={currentTheme.primary} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {animated ? (
          <>
            {/* Base subtle guide line */}
            <path
              d={LOGO_PATH}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Continuous SVG Drawing Stroke Animation */}
            <motion.path
              d={LOGO_PATH}
              stroke={`url(#${gradId}-accent)`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={`url(#${gradId}-chrome)`}
              fillRule="evenodd"
              initial={{ pathLength: 0, fillOpacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 1, 0],
                fillOpacity: [0, 0, 0.85, 0.95, 0],
              }}
              transition={{
                duration: 4.2,
                times: [0, 0.55, 0.75, 0.9, 1],
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 0.6,
              }}
            />
          </>
        ) : (
          <path
            d={LOGO_PATH}
            stroke={`url(#${gradId}-accent)`}
            strokeWidth="8"
            fill={`url(#${gradId}-chrome)`}
            fillRule="evenodd"
          />
        )}
      </svg>
    </div>
  );
}
