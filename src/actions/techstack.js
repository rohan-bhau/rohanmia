'use server';

import dbConnect from '@/lib/db';
import { TechStack } from '@/models/Skill'; // Using the existing model we found
import { revalidatePath } from 'next/cache';

const DEFAULT_TECH = [
  { name: 'Next.js', icon: 'SiNextdotjs', category: 'Frontend', proficiency: 95, isTopSkill: true, color: '#ffffff' },
  { name: 'React', icon: 'SiReact', category: 'Frontend', proficiency: 98, isTopSkill: true, color: '#61DAFB' },
  { name: 'TypeScript', icon: 'SiTypescript', category: 'Frontend', proficiency: 92, isTopSkill: true, color: '#3178C6' },
  { name: 'Tailwind CSS', icon: 'SiTailwindcss', category: 'Frontend', proficiency: 100, isTopSkill: true, color: '#06B6D4' },
  { name: 'Node.js', icon: 'SiNodedotjs', category: 'Backend', proficiency: 90, isTopSkill: false, color: '#339933' },
  { name: 'MongoDB', icon: 'SiMongodb', category: 'Database', proficiency: 88, isTopSkill: false, color: '#47A248' },
];

export async function getTechStacks() {
  try {
    await dbConnect();
    const tech = await TechStack.find({}).sort({ category: 1, name: 1 }).lean();
    
    return JSON.parse(JSON.stringify(tech));
  } catch (error) {
    console.error('Fetch Tech Error:', error);
    return [];
  }
}

export async function getTopSkills() {
  try {
    await dbConnect();
    const skills = await TechStack.find({ isTopSkill: true }).sort({ proficiency: -1 }).lean();
    console.log(`--- FETCH TOP SKILLS --- Found: ${skills.length}`);
    return JSON.parse(JSON.stringify(skills));
  } catch (error) {
    console.error('Fetch Top Skills Error:', error);
    return [];
  }
}

export async function seedTechStack(techs) {
  try {
    await dbConnect();
    
    // Process all techs from all categories
    let createdCount = 0;
    for (const categoryData of techs) {
      for (const skill of categoryData.skills) {
        await TechStack.findOneAndUpdate(
          { name: skill.name },
          {
            name: skill.name,
            icon: skill.iconName || skill.name,
            category: categoryData.title.split('-')[0],
            proficiency: parseInt(skill.level) || 90,
            color: skill.color || '#0ea5e9',
            isTopSkill: skill.isTopSkill || false
          },
          { upsert: true, new: true }
        );
        createdCount++;
      }
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('Seed Tech Error:', error);
    return { success: false, error: error.message };
  }
}

export async function addTech(data) {
  try {
    await dbConnect();
    const tech = await TechStack.create(data);
    revalidatePath('/');
    revalidatePath('/admin/tech-stack');
    return { success: true, tech: JSON.parse(JSON.stringify(tech)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateTech(id, data) {
  try {
    await dbConnect();
    const tech = await TechStack.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/');
    revalidatePath('/admin/tech-stack');
    return { success: true, tech: JSON.parse(JSON.stringify(tech)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteTech(id) {
  try {
    await dbConnect();
    await TechStack.findByIdAndDelete(id);
    revalidatePath('/');
    revalidatePath('/admin/tech-stack');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function toggleTopSkill(id) {
  try {
    await dbConnect();
    const tech = await TechStack.findById(id);
    tech.isTopSkill = !tech.isTopSkill;
    await tech.save();
    console.log(`--- TOGGLE TOP SKILL --- ID: ${id}, New State: ${tech.isTopSkill}`);
    revalidatePath('/');
    revalidatePath('/admin/tech-stack');
    return { success: true, isTopSkill: tech.isTopSkill };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
