'use server';

import dbConnect from '@/lib/db';
import SkillCategory from '@/models/SkillCategory';
import { Skill } from '@/models/Skill';
import { revalidatePath } from 'next/cache';

const DEFAULT_SKILLS = [
  {
    title: "Framework Architecture",
    icon: "Layout",
    skills: [
      { name: "Next.js 14/15", level: 98, icon: "SiNextdotjs" },
      { name: "React 18/19", level: 95, icon: "SiReact" },
      { name: "Vue.js", level: 80, icon: "SiVite" },
    ]
  },
  {
    title: "Design Engineering",
    icon: "Palette",
    skills: [
      { name: "Tailwind CSS", level: 100, icon: "SiTailwindcss" },
      { name: "Framer Motion", level: 95, icon: "SiFramer" },
      { name: "GSAP", level: 90, icon: "SiGreensock" },
      { name: "Sass/SCSS", level: 92, icon: "SiSass" },
    ]
  },
  {
    title: "Core Logic",
    icon: "Code2",
    skills: [
      { name: "TypeScript", level: 94, icon: "SiTypescript" },
      { name: "JavaScript ES6+", level: 98, icon: "SiJavascript" },
      { name: "Zod / Validation", level: 90, icon: "SiZod" },
    ]
  },
  {
    title: "Immersive Tech",
    icon: "Sparkles",
    skills: [
      { name: "Three.js", level: 85, icon: "SiThreedotjs" },
      { name: "Animation Physics", level: 92, icon: "Zap" },
      { name: "Performance Opt.", level: 96, icon: "Globe" },
    ]
  }
];

export async function getSkillCategories() {
  try {
    await dbConnect();
    let categories = await SkillCategory.find({}).sort({ order: 1 }).lean();
    
    if (categories.length === 0) {
      await SkillCategory.insertMany(DEFAULT_SKILLS);
      categories = await SkillCategory.find({}).sort({ order: 1 }).lean();
    }
    
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Fetch Skills Error:', error);
    return [];
  }
}

// Homepage Specific Action
export async function getSkills() {
  try {
    await dbConnect();
    const skills = await Skill.find({}).sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(skills));
  } catch (error) {
    console.error('Fetch Top Skills Error:', error);
    return [];
  }
}

export async function updateSkillCategory(id, data) {
  try {
    await dbConnect();
    const category = await SkillCategory.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/skills');
    revalidatePath('/admin/skills');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addSkillCategory(data) {
  try {
    await dbConnect();
    const category = await SkillCategory.create(data);
    revalidatePath('/skills');
    revalidatePath('/admin/skills');
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSkillCategory(id) {
  try {
    await dbConnect();
    await SkillCategory.findByIdAndDelete(id);
    revalidatePath('/skills');
    revalidatePath('/admin/skills');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
