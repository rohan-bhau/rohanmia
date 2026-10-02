import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Analytics } from '@/models/Analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();

    if (body.type === 'duration') {
      await Analytics.findOneAndUpdate(
        { visitorId: body.visitorId, path: body.path },
        { $inc: { duration: body.duration || 10 } },
        { sort: { timestamp: -1 } }
      );
      return NextResponse.json({ success: true });
    }

    // Default: page view tracking
    await Analytics.create({
      path: body.path,
      visitorId: body.visitorId,
      device: body.device,
      browser: body.browser,
      location: body.location,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking fail-safe: analytics errors should never break user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
