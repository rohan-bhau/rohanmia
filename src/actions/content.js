'use server';

import dbConnect from '@/lib/db';
import HomeContent from '@/models/HomeContent';
import { revalidatePath } from 'next/cache';

const DEFAULT_HERO = {
  greeting: "Hey, I'm",
  firstName: "Rohan",
  lastName: "Mia",
  titles: ["Senior Full Stack Developer", "Creative Engineer", "UI/UX Architect"],
  description: "Specializing in high-performance Next.js architectures, cinematic UI/UX, and creative engineering for world-class digital products.",
  status: "Available for Strategic Partnerships",
  bannerImage: "/hero-art.jpg"
};

const DEFAULT_ABOUT = {
  titlePart1: "The Story Behind",
  titlePart2: "The Code",
  p1: "I am Rohan Mia, a professional Full Stack Developer based in Bangladesh, dedicated to engineering cinematic digital experiences.",
  p2: "My approach blends high-performance code with world-class design aesthetics, ensuring every line of code serves a larger narrative of innovation and technical excellence.",
  image: "/hero-art.jpg",
  nationality: "Bangladeshi // Dhaka",
  communication: "English, Bangla, Hindi",
  status: "Online // Available",
  journey: [
    {
      year: "2024",
      title: "Senior Full Stack Developer",
      company: "TechNova Solutions",
      description: "Leading the development of high-scale enterprise applications using Next.js and Cloud architecture.",
      icon: "Briefcase"
    },
    {
      year: "2022",
      title: "Bachelor of Science in CSE",
      company: "State University",
      description: "Graduated with honors, focusing on software engineering and artificial intelligence.",
      icon: "GraduationCap"
    },
    {
      year: "2020",
      title: "Junior Web Developer",
      company: "Creative Labs",
      description: "Started my journey in web development, mastering HTML, CSS, and modern JavaScript.",
      icon: "Award"
    }
  ]
};

const DEFAULTS = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  services: {}
};

export async function getHomeContent(section = "hero") {
  try {
    await dbConnect();
    let content = await HomeContent.findOne({ section }).lean();
    
    if (!content) {
      // Seed default if missing
      content = await HomeContent.create({ 
        section, 
        data: DEFAULTS[section] || {} 
      });
    } else {
      // Merge defaults for missing fields to ensure no empty boxes
      const mergedData = { ...DEFAULTS[section], ...content.data };
      return JSON.parse(JSON.stringify(mergedData));
    }
    
    return JSON.parse(JSON.stringify(content.data));
  } catch (error) {
    console.error('Fetch Content Error:', error);
    return DEFAULTS[section] || {};
  }
}

export async function updateHomeContent(section, data) {
  try {
    await dbConnect();
    await HomeContent.findOneAndUpdate(
      { section },
      { data, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    revalidatePath('/');
    revalidatePath('/about');
    return { success: true };
  } catch (error) {
    console.error('Update Content Error:', error);
    return { success: false, error: error.message };
  }
}
