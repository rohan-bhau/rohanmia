'use server';

import connectDB from '@/lib/db';
import mongoose from 'mongoose';

const SYSTEM_PROMPT = `
You are Aru, the sophisticated AI concierge for Rohan Mia, a Senior Frontend Architect.
Your goal is to be helpful and proactively guide visitors through Rohan's portfolio.

ALWAYS provide relevant links when discussing Rohan's work:
- If they want to see projects or past work, link to: [View Projects](/projects)
- If they want to hire, collaborate, or send a message, link to: [Get in Touch](/contact)
- If they ask about his skills or technologies, link to: [Tech Stack](/tech-stack)
- If they ask about his photography or visual art, link to: [Gallery](/gallery)
- If they want to know more about his journey, link to: [About Rohan](/about)

Be concise, elegant, and professional. Use markdown for links.
`;

export async function chatWithAru(history, message, visitorId) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return { success: false, content: "Neural core offline. API Key missing." };

  try {
    // 1. Auto-Discovery: Find the BEST model available for this key
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    
    // Pick models that support content generation, prioritized by performance
    const authorizedModels = listData.models
      ?.filter(m => m.supportedGenerationMethods.includes('generateContent'))
      ?.map(m => m.name) || [];

    const modelsToTry = [
      ...authorizedModels.filter(m => m.includes('1.5-flash')),
      ...authorizedModels.filter(m => m.includes('1.5-pro')),
      ...authorizedModels,
      "models/gemini-1.5-flash" // Last resort hardcoded
    ];

    let aiResponse = null;
    let lastError = "No authorized models found.";

    // 2. Intelligence Loop
    for (const modelPath of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${API_KEY}`;
        
        const historyContext = history.map(h => ({
          role: h.role === 'bot' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [...historyContext, { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${message}` }] }],
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
          })
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiResponse = data.candidates[0].content.parts[0].text;
          break; 
        } else {
          lastError = data.error?.message || "Generation failed.";
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!aiResponse) {
      aiResponse = `I'm currently optimizing my neural pathways (Status: ${lastError}). How can I guide you through Rohan's portfolio?`;
    }

    // 3. Guaranteed Archiving
    saveAIChatLog(visitorId, message, aiResponse).catch(e => console.error('Archive Error:', e));

    return { success: true, content: aiResponse };

  } catch (error) {
    console.error('Final Neural Collapse:', error);
    return { success: true, content: "Neural link interrupted. Re-syncing." };
  }
}

async function saveAIChatLog(visitorId, userMsg, botMsg) {
  try {
    const vid = visitorId || 'anonymous_subject';
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const col = mongoose.connection.db.collection('aichatlogs');
      await col.updateOne(
        { visitorId: vid },
        { 
          $push: { 
            messages: { 
              $each: [
                { role: 'user', content: userMsg, timestamp: new Date() },
                { role: 'assistant', content: botMsg, timestamp: new Date() }
              ]
            } 
          },
          $set: { lastInteraction: new Date() }
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Archive Failed:', err);
  }
}

export async function deleteAIChatLog(id) {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const col = mongoose.connection.db.collection('aichatlogs');
      await col.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
      return { success: true };
    }
    return { success: false };
  } catch (err) {
    console.error('Delete Archive Failed:', err);
    return { success: false };
  }
}
