import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { sendGuestbookConfirmationEmail } from '@/lib/email';
import { insertEntry, deleteEntryById } from '@/lib/postgres';
import { getGuestbookData, isDevIdentityMode } from '@/lib/guestbook';
import { auth } from '@/auth';

const GuestbookSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  message: z.string().min(2).max(100),
  avatar: z.string().optional(),
  provider: z.string().default('google')
});

/**
 * Determine automatic card theme based on message content and deterministic hash
 * No manual color picking needed — feels natural, smart, and dynamic!
 */
import { GuestbookTheme } from '@/data/guestbook';

export function determineTheme(message: string): GuestbookTheme {
  const lower = message.toLowerCase();

  // 1. CRIMSON (Passion, Love, Affection OR Critical/Anger feedback)
  const crimsonKeywords = [
    'love', 'valobasha', 'valobashi', 'heart', '❤️', 'beautiful', 'sweet', 'crush', 'adore', 'favourite', 'favorite', 'romantic',
    'bad', 'kharap', 'hate', 'ugly', 'worst', 'baje', 'bekar', 'bug', 'error', 'broken', 'rubbish', 'faltu', 'chhi', 'poor', 'trash', 'boring', 'horrible', 'disappoint', '😭', '💔', '😡'
  ];

  // 2. EMERALD (Speed, High Performance, Fire, Energy, Growth)
  const emeraldKeywords = [
    'fire', '🔥', 'agoon', 'fast', 'speed', 'rapid', 'quick', 'swift', 'performance', 'lightspeed', '60fps', 'smooth', 'ultra',
    'lit', 'wild', 'crazy', 'insane', 'blast', 'boma', 'fatafati', 'dhaka', 'khela', 'topper', 'hype', '⚡', '🚀', 'rocket', 'win', 'future', 'green'
  ];

  // 3. SAPPHIRE (Engineering, Code, Systems, Architecture, Logic, Terminal)
  const sapphireKeywords = [
    'architecture', 'stack', 'system', 'code', 'scale', 'database', 'api', 'backend', 'frontend', 'fullstack', 'nextjs', 'react', 'typescript', 'node', 'postgres', 'microservice', 'concurrency', 'async', 'logic', 'server', 'algorithm', 'dev', 'engineer', 'structure', 'cyber', 'matrix', 'complex', 'robust', 'solid', 'pro', 'terminal', 'blue', 'linux', 'docker'
  ];

  // 4. AMBER (Golden Praise, Inspiration, Greatness, Celebration)
  const amberKeywords = [
    'great', 'good', 'bhalo', 'awesome', 'super', 'inspiration', 'work', 'darun', 'chomok', 'legend', 'goat', 'boss', 'king', 'epic', 'star', 'stellar', 'brilliant', 'fantastic', 'outstanding', 'proud', 'masterpiece', 'salute', 'hatsoff', 'bhai', 'op', 'jossh', 'sera', 'mast', 'mindblowing', '10/10', 'gold', 'golden', 'glow', '✨', '⭐', '🌟', '🏆', '🎉', '👏', 'cheers'
  ];

  // 5. VIOLET (Creative, Aesthetics, UI/UX, Design, Art, Elegance)
  const violetKeywords = [
    'creative', 'design', 'ui', 'ux', 'aesthetic', 'art', 'vibes', 'magic', 'wonder', 'purple', 'dark', 'editorial', 'luxury', 'fancy', 'chill', 'peace', 'deep', 'poetry', 'look', 'feel', 'motion', 'animation', 'framer', 'style', 'portfolio', 'impressive'
  ];

  // 6. TEAL (Cloud, Flow, Ocean, Modern Web)
  const tealKeywords = [
    'clean', 'flow', 'ocean', 'stream', 'cloud', 'modern', 'breeze', 'aqua', 'marine', 'fresh', 'water', 'wave', 'teal', 'cyan', 'smoothness'
  ];

  // 7. ROSE (Delicate, Warmth, Bloom, Cute)
  const roseKeywords = [
    'cute', 'pretty', 'shine', 'sparkle', 'bloom', 'rose', 'pink', 'magenta', 'gorgeous', 'soft', 'cozy'
  ];

  // 8. SLATE (Monochrome, Minimalist, Classic, Studio)
  const slateKeywords = [
    'minimal', 'simple', 'monochrome', 'slate', 'noir', 'classic', 'raw', 'calm', 'quiet', 'zen'
  ];

  const scores: Record<GuestbookTheme, number> = {
    crimson: 0,
    emerald: 0,
    sapphire: 0,
    amber: 0,
    violet: 0,
    teal: 0,
    rose: 0,
    slate: 0
  };

  crimsonKeywords.forEach(k => { if (lower.includes(k)) scores.crimson += 1; });
  emeraldKeywords.forEach(k => { if (lower.includes(k)) scores.emerald += 1; });
  sapphireKeywords.forEach(k => { if (lower.includes(k)) scores.sapphire += 1; });
  amberKeywords.forEach(k => { if (lower.includes(k)) scores.amber += 1; });
  violetKeywords.forEach(k => { if (lower.includes(k)) scores.violet += 1; });
  tealKeywords.forEach(k => { if (lower.includes(k)) scores.teal += 1; });
  roseKeywords.forEach(k => { if (lower.includes(k)) scores.rose += 1; });
  slateKeywords.forEach(k => { if (lower.includes(k)) scores.slate += 1; });

  let highestTheme: GuestbookTheme = 'violet';
  let highestScore = 0;

  (Object.keys(scores) as GuestbookTheme[]).forEach((theme) => {
    if (scores[theme] > highestScore) {
      highestScore = scores[theme];
      highestTheme = theme;
    }
  });

  if (highestScore > 0) {
    return highestTheme;
  }

  // Deterministic fallback based on char codes across all 8 themes
  const allThemes: GuestbookTheme[] = [
    'emerald', 'sapphire', 'amber', 'rose', 'teal', 'crimson', 'slate', 'violet'
  ];
  let sum = 0;
  for (let i = 0; i < message.length; i++) {
    sum += message.charCodeAt(i);
  }
  return allThemes[sum % allThemes.length];
}

export async function GET() {
  try {
    const { entries, oauthConfigured } = await getGuestbookData();
    return NextResponse.json({ success: true, entries, oauthConfigured });
  } catch (error: any) {
    console.error('Guestbook GET error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to load guestbook entries from database' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth();
    const sessionUser = session?.user;

    // Verified OAuth identity always wins over anything the client sends
    if (sessionUser?.email) {
      body.name = sessionUser.name || body.name;
      body.email = sessionUser.email;
      body.avatar = sessionUser.image || body.avatar;
    } else if (!isDevIdentityMode()) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to sign the guestbook' },
        { status: 401 }
      );
    }

    const parsed = GuestbookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { name, email, message, avatar, provider } = parsed.data;

    // Automatic theme assignment based on message
    const theme = determineTheme(message);

    // Guaranteed format: entry-${uuid}
    const entryId = `entry-${crypto.randomUUID()}`;

    const newRow = await insertEntry({
      id: entryId,
      name,
      email,
      message,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      provider,
      theme
    });

    // Send confirmation email asynchronously
    sendGuestbookConfirmationEmail({
      toEmail: email,
      name,
      message
    }).catch((err) => console.warn('Guestbook email notification dispatch error:', err));

    return NextResponse.json({
      success: true,
      entry: {
        id: newRow.id,
        name: newRow.name,
        email: newRow.email,
        message: newRow.message,
        avatar: newRow.avatar,
        provider: newRow.provider,
        theme: newRow.theme,
        createdAt: 'Just now',
        verified: true,
        isOwner: true
      }
    });
  } catch (error: any) {
    console.error('Guestbook POST error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to save message to database' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const session = await auth();
    // Query-string email is only honoured in local dev-identity mode (no OAuth configured)
    const email =
      session?.user?.email ||
      (isDevIdentityMode() ? searchParams.get('email') : null);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required to delete a note' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to delete your note' },
        { status: 401 }
      );
    }

    const deleted = await deleteEntryById(id, email);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this note or note not found' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error: any) {
    console.error('Guestbook DELETE error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note from database' },
      { status: 500 }
    );
  }
}
