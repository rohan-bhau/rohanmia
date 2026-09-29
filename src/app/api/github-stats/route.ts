import { NextResponse } from 'next/server';
import fallbackContributions from '@/data/github-contributions.json';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Refresh every 60 seconds for near real-time live sync

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    // 1. Fetch user public profile for repos count
    let publicRepos = 60;
    try {
      const userRes = await fetch('https://api.github.com/users/rohan-bhau', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 60 },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (typeof userData?.public_repos === 'number') {
          publicRepos = userData.public_repos;
        }
      }
    } catch (e) {
      console.error('Error fetching GitHub user:', e);
    }

    // 2. Fetch repos to calculate real total stars
    let totalStars = 28;
    try {
      const reposRes = await fetch(
        'https://api.github.com/users/rohan-bhau/repos?per_page=100',
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 60 },
        }
      );
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          totalStars = reposData.reduce(
            (acc: number, r: { stargazers_count?: number }) =>
              acc + (r.stargazers_count || 0),
            0
          );
        }
      }
    } catch (e) {
      console.error('Error fetching GitHub stars:', e);
    }

    // 3. Fetch official GitHub contributions HTML directly from GitHub profile
    let totalContributions = fallbackContributions.total || 1150;
    let contributions = fallbackContributions.contributions;

    try {
      const contribRes = await fetch(
        'https://github.com/users/rohan-bhau/contributions',
        {
          headers,
          next: { revalidate: 60 },
        }
      );

      if (contribRes.ok) {
        const html = await contribRes.text();

        // Extract total from heading
        const totalMatch = html.match(/([\d,]+)\s+contributions\s+in the last year/);
        if (totalMatch) {
          totalContributions = parseInt(totalMatch[1].replace(/,/g, ''), 10);
        }

        // Extract tooltips for exact count per day
        const tooltipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
        const tooltips: Record<string, string> = {};
        let tMatch;
        while ((tMatch = tooltipRegex.exec(html)) !== null) {
          tooltips[tMatch[1]] = tMatch[2].trim();
        }

        // Extract calendar days
        const tdRegex = /<td[^>]*class="ContributionCalendar-day"[^>]*>/g;
        const parsedDays: { date: string; count: number; level: number }[] = [];
        let dMatch;

        while ((dMatch = tdRegex.exec(html)) !== null) {
          const td = dMatch[0];
          const dateMatch = td.match(/data-date="([^"]+)"/);
          const levelMatch = td.match(/data-level="([^"]+)"/);
          const idMatch = td.match(/id="([^"]+)"/);

          if (dateMatch && levelMatch) {
            const date = dateMatch[1];
            const level = parseInt(levelMatch[1], 10);
            const compId = idMatch ? idMatch[1] : '';
            const tip = tooltips[compId] || '';

            let count = 0;
            const countMatch = tip.match(/(\d+)\s+contribution/);
            if (countMatch) {
              count = parseInt(countMatch[1], 10);
            } else if (level > 0) {
              count = level;
            }

            parsedDays.push({ date, count, level });
          }
        }

        if (parsedDays.length > 0) {
          parsedDays.sort((a, b) => a.date.localeCompare(b.date));
          contributions = parsedDays;
        }
      }
    } catch (e) {
      console.error('Error fetching live GitHub contributions:', e);
    }

    return NextResponse.json({
      success: true,
      publicRepos,
      totalStars,
      totalContributions,
      contributions,
    });
  } catch (err) {
    console.error('Failed to process GitHub stats route:', err);
    return NextResponse.json({
      success: false,
      publicRepos: 60,
      totalStars: 28,
      totalContributions: fallbackContributions.total || 1150,
      contributions: fallbackContributions.contributions,
    });
  }
}
