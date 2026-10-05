'use client';

import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa6';
import { ArrowUpRight } from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import defaultContributionData from '@/data/github-contributions.json';

interface DayContribution {
  date: string;
  count: number;
  level: number;
}

interface GithubContributionGraphProps {
  totalContributions?: number;
  contributions?: DayContribution[];
}

export default function GithubContributionGraph({
  totalContributions,
  contributions,
}: GithubContributionGraphProps) {
  const { currentTheme } = useThemeAccent();
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);

  // Use dynamic contributions if provided, otherwise default to local json
  const days: DayContribution[] =
    contributions && contributions.length > 0
      ? contributions
      : defaultContributionData.contributions || [];

  const total = totalContributions ?? defaultContributionData.total ?? 1150;

  // Group days into calendar weeks aligned by weekday (Sunday = row 0, Saturday = row 6)
  const weeks: (DayContribution | null)[][] = [];
  let currentWeek: (DayContribution | null)[] = [];

  if (days.length > 0) {
    // If the first day is not Sunday (0), pad preceding days with null
    const firstDate = new Date(days[0].date);
    const startDayOfWeek = firstDate.getUTCDay(); // 0 = Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (const day of days) {
      const d = new Date(day.date);
      const dayOfWeek = d.getUTCDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
  }

  // Calculate month labels placed precisely over the week where the month begins
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let prevMonth = -1;
  const weekMonthLabels: (string | null)[] = weeks.map((week) => {
    for (const day of week) {
      if (day) {
        const d = new Date(day.date);
        const m = d.getUTCMonth();
        if (m !== prevMonth) {
          prevMonth = m;
          return monthNames[m];
        }
        break;
      }
    }
    return null;
  });

  // Calculate day square color based on level and dynamic theme
  const getSquareStyle = (level: number, count: number) => {
    if (level === 0 || count === 0) {
      return { backgroundColor: '#161b22' };
    }
    if (level === 1) {
      return { backgroundColor: `${currentTheme.primary}45` };
    }
    if (level === 2) {
      return { backgroundColor: `${currentTheme.primary}80` };
    }
    if (level === 3) {
      return { backgroundColor: `${currentTheme.primary}b5` };
    }
    return {
      backgroundColor: currentTheme.primary,
      boxShadow: `0 0 6px ${currentTheme.primary}80`,
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1017]/80 border border-white/10 backdrop-blur-md flex flex-col justify-between h-full space-y-4 relative overflow-hidden group">
      {/* Background Subtle Glow */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 blur-3xl opacity-10 pointer-events-none rounded-full"
        style={{ backgroundColor: currentTheme.primary }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <FaGithub size={18} />
          </div>
          <div>
            <a 
              href="https://github.com/rohan-bhau"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:underline flex items-center gap-1.5"
            >
              <span>@rohan-bhau</span>
              <ArrowUpRight size={13} className="text-neutral-400" />
            </a>
            <p className="text-xs text-neutral-400 font-mono">Contribution Graph</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-white block">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            2026 TOTAL
          </span>
        </div>
      </div>

      {/* Graph Area: Perfectly fitted on Desktop (Zero scrollbar) and smooth hidden-scrollbar scroll on smaller screens */}
      <div className="overflow-x-auto lg:overflow-x-hidden pb-1 pt-0.5 no-scrollbar">
        <div className="min-w-[580px] lg:min-w-0 w-full flex flex-col gap-1.5">
          
          {/* Month Labels Aligned Perfectly with Weeks */}
          <div className="flex justify-between w-full items-center text-[10px] xl:text-[11px] font-mono text-neutral-400 select-none h-4">
            {weeks.map((_, wIdx) => {
              const label = weekMonthLabels[wIdx];
              return (
                <div key={wIdx} className="w-[7.5px] sm:w-[8px] lg:w-[7.5px] min-[1100px]:w-[8.5px] xl:w-[10px] 2xl:w-[11px] relative flex-shrink-0">
                  {label && (
                    <span className="absolute left-0 top-0 whitespace-nowrap">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 53 Columns Grid (7 rows each: Sun-Sat) */}
          <div className="flex justify-between w-full items-center">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[2px] xl:gap-[2.5px] 2xl:gap-[3px] flex-shrink-0">
                {week.map((day, dIdx) => {
                  if (!day) {
                    return (
                      <div
                        key={dIdx}
                        className="size-[7.5px] sm:size-[8px] lg:size-[7.5px] min-[1100px]:size-[8.5px] xl:size-[10px] 2xl:size-[11px] rounded-[2px] sm:rounded-[2.5px] opacity-0 pointer-events-none"
                      />
                    );
                  }

                  return (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={getSquareStyle(day.level, day.count)}
                      className="size-[7.5px] sm:size-[8px] lg:size-[7.5px] min-[1100px]:size-[8.5px] xl:size-[10px] 2xl:size-[11px] rounded-[2px] sm:rounded-[2.5px] cursor-pointer transition-transform hover:scale-125"
                      title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDate(day.date)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-white/5 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <span className="text-neutral-200">
              <strong className="text-white">{hoveredDay.count}</strong> contribution{hoveredDay.count === 1 ? '' : 's'} on {formatDate(hoveredDay.date)}
            </span>
          ) : (
            <span>{total.toLocaleString()} contributions in the last year</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto select-none">
          <span className="text-[11px] text-neutral-500">Less</span>
          <div className="size-2.5 rounded-[2px] bg-[#161b22] border border-white/[0.05]" />
          <div className="size-2.5 rounded-[2px]" style={{ backgroundColor: `${currentTheme.primary}45` }} />
          <div className="size-2.5 rounded-[2px]" style={{ backgroundColor: `${currentTheme.primary}80` }} />
          <div className="size-2.5 rounded-[2px]" style={{ backgroundColor: `${currentTheme.primary}b5` }} />
          <div className="size-2.5 rounded-[2px]" style={{ backgroundColor: currentTheme.primary }} />
          <span className="text-[11px] text-neutral-500">More</span>
        </div>
      </div>

    </div>
  );
}
