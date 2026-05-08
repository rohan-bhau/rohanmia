import Hero from "@/components/home/Hero";
import SkillsSection from "@/components/home/SkillsSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import { getProjects } from "@/actions/projects";
import { getTopSkills } from "@/actions/techstack";
import { getSettings } from "@/actions/settings";
import { getHomeContent } from "@/actions/content";

import { getContactData } from "@/actions/contact";

export default async function Home() {
  const [projects, topSkills, settings, heroContent, contactData] = await Promise.all([
    getProjects(),
    getTopSkills(),
    getSettings(),
    getHomeContent("hero"),
    getContactData()
  ]);

  return (
    <div className="flex flex-col gap-20 pb-20">
      <Hero settings={settings} heroContent={heroContent} contactData={contactData} />
      <div className="relative">
        {/* Subtle background glow for sections */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-primary/5 blur-[150px] -z-10" />
        <SkillsSection skills={topSkills} />
        <ProjectsSection projects={projects.slice(0, 3)} />
      </div>
    </div>
  );
}
