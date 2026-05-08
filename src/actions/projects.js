'use server';

import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { revalidatePath } from 'next/cache';

const DEFAULT_PROJECTS = [
  {
    title: "FlatFlow - Management",
    description: "An online apartment management web application with full responsiveness. Featuring real-time booking and interactive map visualization.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000",
    category: "Fullstack",
    techStack: ['SiNextdotjs', 'SiTailwindcss', 'SiMongodb', 'SiStripe'],
    liveLink: "https://flatflow.live",
    clientLink: "https://github.com/rohan/flatflow-client",
    serverLink: "https://github.com/rohan/flatflow-server",
    featured: true
  },
  {
    title: "MealMart - Restaurant",
    description: "Full-stack restaurant application for seamless ordering and management. Role-based access and live order tracking.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    category: "Fullstack",
    techStack: ['SiReact', 'SiNodedotjs', 'SiExpress', 'SiRedux'],
    liveLink: "https://mealmart.live",
    clientLink: "https://github.com/rohan/mealmart-client",
    featured: true
  },
  {
    title: "JobDrop - Career Portal",
    description: "High-performance job portal for talent and recruiter interaction. Advanced filtering and direct messaging system.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000",
    category: "Fullstack",
    techStack: ['SiNextdotjs', 'SiTailwindcss', 'SiFirebase', 'SiPrisma'],
    liveLink: "https://jobdrop.live",
    clientLink: "https://github.com/rohan/jobdrop-client",
    serverLink: "https://github.com/rohan/jobdrop-server",
    featured: true
  },
  {
    title: "EcoTrack - Sustenance",
    description: "Carbon footprint calculator with a social sustainability feed and energy API integration.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
    category: "Open Source",
    techStack: ["SiNodedotjs", "SiReact", "SiDocker", "SiGithubactions"],
    liveLink: "https://ecotrack.io",
    clientLink: "https://github.com/rohan/ecotrack",
    featured: false
  },
  {
    title: "Nebula - Data Vis",
    description: "Interactive 3D charts and real-time WebSocket sync with a custom widget engine.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    category: "Frontend",
    techStack: ["SiReact", "SiFramermotion", "SiThreedotjs", "SiTailwindcss"],
    liveLink: "https://nebula.data",
    clientLink: "https://github.com/rohan/nebula",
    featured: false
  }
];

export async function getProjects() {
  try {
    await dbConnect();
    
    // Smart Sync: Ensure all default projects exist
    for (const defProject of DEFAULT_PROJECTS) {
      const exists = await Project.findOne({ title: defProject.title });
      if (!exists) {
        await Project.create(defProject);
      }
    }

    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    return [];
  }
}

export async function addProject(data) {
  try {
    await dbConnect();
    const project = await Project.create(data);
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error) {
    console.error('Add Project Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProject(id, data) {
  try {
    await dbConnect();
    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, project: JSON.parse(JSON.stringify(project)) };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id) {
  try {
    await dbConnect();
    await Project.findByIdAndDelete(id);
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleFeaturedProject(id) {
  try {
    await dbConnect();
    const project = await Project.findById(id);
    project.featured = !project.featured;
    await project.save();
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/admin/projects');
    return { success: true, featured: project.featured };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
