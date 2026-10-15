import { getProjectsDb } from "@/lib/db/projects";
import { getTechStackDb } from "@/lib/db/stack";
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
    const [projects, techStack, heroData, settings, links] = await Promise.all([
      getProjectsDb().catch(() => []),
      getTechStackDb().catch(() => []),
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

    return {
      siteTitle: settings?.site_title || "MD Rohan Mia | Full-Stack Software Engineer",
      ownerName: `${heroData?.name || "MD Rohan"} ${heroData?.surname || "Mia"}`.trim(),
      bio: heroData?.bio || "Full-Stack Software Engineer specializing in modern Next.js, TypeScript, PostgreSQL, and scalable web architectures.",
      rotatingRoles: heroData?.rotating_roles || ["Full-Stack Software Engineer", "Next.js Specialist", "UI/UX Craftsman"],
      stats: [
        { label: "Completed Projects", value: String(projects.length) },
      ],
      projects: sanitizedProjects,
      categories: sanitizedCategories,
      socials: links?.socialMap || {},
    };
  } catch (error) {
    console.error("Error grounding AI context from PostgreSQL:", error);
    return {
      siteTitle: "MD Rohan Mia | Full-Stack Software Engineer",
      ownerName: "MD Rohan Mia",
      bio: "Full-Stack Software Engineer specializing in Next.js, TypeScript, and high-performance applications.",
      rotatingRoles: ["Full-Stack Software Engineer"],
      stats: [{ label: "Availability", value: "Available" }],
      projects: [],
      categories: [],
      socials: {},
    };
  }
}

/**
 * Formats database context into markdown for runtime system prompt injection.
 */
export function formatContextForPrompt(ctx: GroundedPortfolioContext): string {
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

  return `
### LIVE POSTGRESQL PORTFOLIO KNOWLEDGE BASE (REALTIME):
- **Owner**: ${ctx.ownerName} (Known online and casually as "Bhau" or "Rohan Bhau")
- **Bio**: ${ctx.bio}
- **Roles**: ${ctx.rotatingRoles.join(" | ")}
- **Key Stats**: ${ctx.stats.map((s) => `${s.label}: ${s.value}`).join(" | ")}

### VERIFIED PROJECTS IN DATABASE:
${projectListStr || "No projects currently in database."}

### VERIFIED TECH STACK & SKILLS BY CATEGORY:
${techCategoriesStr || "No tech categories currently in database."}

### SOCIALS & LINKS:
${socialsStr || "Direct through website contact form."}
`;
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

  const dynamicGrounding = formatContextForPrompt(groundedCtx);
  const extraKnowledge = dbConfig?.knowledge_base
    ? `\n### DOMAIN KNOWLEDGE BASE:\n${dbConfig.knowledge_base}`
    : "";

  return `${basePrompt}\n\n${dynamicGrounding}${extraKnowledge}`.trim();
}


