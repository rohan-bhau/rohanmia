'use server';

import connectDB from '@/lib/db';
import { Analytics, Message } from '@/models/Analytics';
import Lead from '@/models/Lead';
import AIChatLog from '@/models/AIChatLog';

export async function trackPageView(data) {
  try {
    await connectDB();
    await Analytics.create({
      path: data.path,
      visitorId: data.visitorId,
      device: data.device,
      browser: data.browser,
      location: data.location,
      timestamp: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getDashboardData() {
  try {
    await connectDB();
    
    // Core Metrics
    const totalViews = await Analytics.countDocuments();
    const totalVisitors = (await Analytics.distinct('visitorId')).length;
    const totalMessages = await Message.countDocuments();
    const totalLeads = await Lead.countDocuments();

    // Last 7 Days Chart Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const viewsOverTimeRaw = await Analytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const viewsOverTime = viewsOverTimeRaw.map(item => {
      const date = new Date(item._id);
      return {
        name: dayNames[date.getDay()],
        views: item.count,
        fullDate: item._id
      };
    });

    // Recent Messages
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5).lean();

    // Top Pages
    const topPagesRaw = await Analytics.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topPages = topPagesRaw.map(page => ({
      name: page._id === '/' ? 'Home' : page._id.replace('/', '').charAt(0).toUpperCase() + page._id.slice(2),
      path: page._id,
      views: page.count,
      percentage: Math.round((page.count / totalViews) * 100) || 0
    }));

    // AI LOGS with Identity Enrichment
    const aiLogsRaw = await AIChatLog.find().sort({ lastInteraction: -1 }).limit(10).lean();
    const leads = await Lead.find({ visitorId: { $in: aiLogsRaw.map(l => l.visitorId) } }).lean();
    
    const aiLogs = aiLogsRaw.map(log => {
      const lead = leads.find(l => l.visitorId === log.visitorId);
      return {
        ...log,
        name: lead?.name || 'Anonymous Subject',
        email: lead?.email || 'No Signal',
        _id: log._id.toString()
      };
    });

    return {
      stats: [
        { label: 'Total Visitors', value: totalVisitors.toLocaleString(), icon: 'users' },
        { label: 'Page Views', value: totalViews.toLocaleString(), icon: 'eye' },
        { label: 'Messages', value: totalMessages.toString(), icon: 'message' },
        { label: 'Leads', value: totalLeads.toString(), icon: 'trending' },
      ],
      chartData: viewsOverTime,
      recentMessages: JSON.parse(JSON.stringify(recentMessages)),
      topPages,
      aiLogs: JSON.parse(JSON.stringify(aiLogs))
    };
  } catch (error) {
    console.error('Dashboard Error:', error);
    return null;
  }
}

export async function updatePageDuration(visitorId, path, duration) {
  try {
    await connectDB();
    await Analytics.findOneAndUpdate(
      { visitorId, path },
      { $inc: { duration: duration } },
      { sort: { timestamp: -1 } }
    );
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
