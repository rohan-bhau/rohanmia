import { getProjectsDb } from "@/lib/db/projects";
import { getTechStackDb } from "@/lib/db/stack";
import { getAboutContentDb } from "@/lib/db/content";
import { getHeroData } from "@/actions/adminHero";
import { getSettings } from "@/actions/adminSettings";
import { getPublicLinks } from "@/actions/adminLinks";
import { getAiConfigDb } from "@/lib/db/aiConfig";
import { GroundedPortfolioContext, AIMode } from "@/types/ai";

/**
 * Loads dynamic portfolio snapshot from live PostgreSQL database.
 */
export async function getLiveGroundedContext(): Promise<GroundedPortfolioContext> {
  try {
    const [projects, techStack, aboutContent, heroData, settings, links] = await Promise.all([
      getProjectsDb().catch(() => []),
      getTechStackDb().catch(() => []),
      getAboutContentDb().catch(() => null),
      getHeroData().catch(() => null),
      getSettings().catch(() => null),
      getPublicLinks().catch(() => ({ links: [], socialMap: {} })),
    ]);

    const sanitizedProjects = projects.map((p) => ({
      title: p.title || "",
      slug: p.slug || "",
      tagline: p.tagline || "",
      category: p.category || "Full-Stack",
      year: p.year || "2026",
      techStack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
      liveUrl: p.live_url || "",
      githubUrl: p.github_url || "",
    }));

    const sanitizedCategories = techStack.map((cat) => ({
      id: cat.id,
      title: cat.title,
      number: cat.number,
      skills: (cat.items || []).map((item) => item.name),
    }));

    const sanitizedEducation = Array.isArray(aboutContent?.education)
      ? aboutContent.education.map((e: any) => ({
          institution: String(e.institution || ""),
          degree: String(e.degree || ""),
          period: String(e.period || ""),
          location: String(e.location || ""),
          tag: e.tag ? String(e.tag) : undefined,
        }))
      : [];

    const sanitizedCareer = Array.isArray(aboutContent?.career_experiences)
      ? aboutContent.career_experiences.map((c: any) => ({
          role: String(c.role || ""),
          company: String(c.company || ""),
          period: String(c.period || ""),
          description: String(c.description || ""),
          skills: Array.isArray(c.skills) ? c.skills : [],
        }))
      : [];

    const ownerFullName = [heroData?.name, heroData?.surname].filter(Boolean).join(" ").trim();

    return {
      siteTitle: settings?.site_title || "",
      ownerName: ownerFullName,
      bio: heroData?.bio || "",
      rotatingRoles: Array.isArray(heroData?.rotating_roles) ? heroData.rotating_roles : [],
      stats: [
        { label: "Completed Projects", value: String(projects.length) },
      ],
      projects: sanitizedProjects,
      categories: sanitizedCategories,
      socials: links?.socialMap || {},
      education: sanitizedEducation,
      careerExperiences: sanitizedCareer,
      aboutBioParagraphs: Array.isArray(aboutContent?.bio_paragraphs) ? aboutContent.bio_paragraphs : [],
    };
  } catch (error) {
    console.error("Error grounding AI context from PostgreSQL:", error);
    return {
      siteTitle: "",
      ownerName: "",
      bio: "",
      rotatingRoles: [],
      stats: [],
      projects: [],
      categories: [],
      socials: {},
      education: [],
      careerExperiences: [],
      aboutBioParagraphs: [],
    };
  }
}

/**
 * Formats database context into markdown for runtime system prompt injection.
 */
export function formatContextForPrompt(ctx: GroundedPortfolioContext, mode: AIMode = "visitor"): string {
  const projectListStr = ctx.projects
    .map(
      (p, i) =>
        `${i + 1}. **${p.title}** (Slug: \`/projects/${p.slug}\`): ${p.tagline} | Tech: [${p.techStack.join(", ")}]${p.liveUrl ? ` | Live: ${p.liveUrl}` : ""}${p.githubUrl ? ` | Repo: ${p.githubUrl}` : ""}`
    )
    .join("\n");

  const techCategoriesStr = ctx.categories
    .map((c) => `- **${c.title}**: ${c.skills.join(", ")}`)
    .join("\n");

  const socialsStr = Object.entries(ctx.socials)
    .map(([platform, url]) => `- ${platform}: ${url}`)
    .join("\n");

  const educationStr = ctx.education && ctx.education.length > 0
    ? ctx.education
        .map(
          (e) =>
            `- **${e.degree}** at **${e.institution}** (${e.period}), Location: ${e.location}${e.tag ? ` [${e.tag}]` : ""}`
        )
        .join("\n")
    : "No academic records registered in database.";

  const careerStr = ctx.careerExperiences && ctx.careerExperiences.length > 0
    ? ctx.careerExperiences
        .map(
          (c) =>
            `- **${c.role}** at **${c.company}** (${c.period}): ${c.description}${c.skills && c.skills.length > 0 ? ` | Skills: ${c.skills.join(", ")}` : ""}`
        )
        .join("\n")
    : "No career records registered in database.";

  const bioStr = ctx.aboutBioParagraphs && ctx.aboutBioParagraphs.length > 0
    ? ctx.aboutBioParagraphs.join("\n\n")
    : (ctx.bio || "No biography provided in database.");

  const adminRouteStr =
    mode === "admin"
      ? "- **Admin Studio / Control Room (/control-room-internal)**: Dedicated management dashboard for Hero, Projects, Stack, About, Gallery, Guestbook, Inquiries, Settings, and Aru AI.\n"
      : "";

  return `
### LIVE POSTGRESQL PORTFOLIO KNOWLEDGE BASE (REALTIME):
${ctx.ownerName ? `- **Owner**: ${ctx.ownerName} (Known online as "Bhau" or "Rohan Bhau")` : ""}
${ctx.bio ? `- **Primary Bio**: ${ctx.bio}` : ""}
${ctx.rotatingRoles.length > 0 ? `- **Roles**: ${ctx.rotatingRoles.join(" | ")}` : ""}
${ctx.stats.length > 0 ? `- **Key Stats**: ${ctx.stats.map((s) => `${s.label}: ${s.value}`).join(" | ")}` : ""}

### EDUCATION & ACADEMIC BACKGROUND (VERIFIED):
${educationStr}

### CAREER & PROFESSIONAL WORK HISTORY (VERIFIED):
${careerStr}

### DETAILED ABOUT PROFILE:
${bioStr}

### VERIFIED PROJECTS IN DATABASE:
${projectListStr || "No projects currently in database."}

### VERIFIED TECH STACK & SKILLS BY CATEGORY:
${techCategoriesStr || "No tech categories currently in database."}

### SOCIALS & LINKS:
${socialsStr || "Direct through website contact form."}

### WEBSITE STRUCTURE & SITEMAP:
- **Homepage (/)**: Hero intro, featured case studies, skills showcase, client reviews, interactive booking widget.
- **About (/about)**: Detailed biography, academic background, professional experience, engineering principles, and core competencies.
- **Projects (/projects & /projects/[slug])**: Comprehensive directory of all engineered applications with live demos, GitHub repositories, architecture trees, challenges, and code snippets.
- **Tech Stack (/tech-stack)**: Deep categorized skills inventory (Frontend, Backend, Databases, DevOps, Tools).
- **Gallery (/gallery)**: Visual snapshots, workspace, and developer lifestyle moments.
- **Guestbook (/guestbook)**: Public community message wall where visitors can leave notes.
- **Contact (/contact & /contact#meeting)**: Direct inquiry form, email channel, and interactive calendar meeting booking scheduler.
${adminRouteStr}`;
}

/**
 * Returns the effective system prompt for visitor or admin mode.
 * Prompt templates are loaded dynamically from PostgreSQL.
 */
export async function getEffectiveSystemPrompt(mode: AIMode): Promise<string> {
  const [dbConfig, groundedCtx] = await Promise.all([
    getAiConfigDb(),
    getLiveGroundedContext(),
  ]);

  const basePrompt =
    mode === "admin"
      ? dbConfig?.admin_prompt || ""
      : dbConfig?.visitor_prompt || "";

  const dynamicGrounding = formatContextForPrompt(groundedCtx, mode);
  const extraKnowledge = dbConfig?.knowledge_base
    ? `\n### DOMAIN KNOWLEDGE BASE:\n${dbConfig.knowledge_base}`
    : "";

  return `${basePrompt}\n\n${dynamicGrounding}${extraKnowledge}`.trim();
}


