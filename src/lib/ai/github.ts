import { GoogleGenerativeAI } from "@google/generative-ai";
import { GitHubRepoMetadata, SynthesizedCaseStudy } from "@/types/ai";
import { getPromptTemplateDb } from "@/lib/db/aiConfig";

/**
 * Extracts owner and repo from various GitHub URL formats:
 * - https://github.com/rohan-bhau/agro-commerce
 * - github.com/rohan-bhau/agro-commerce
 * - rohan-bhau/agro-commerce
 */
export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const parts = cleaned.replace(/^github\.com\//, "").split("/").filter(Boolean);
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    return { owner, repo };
  }
  return null;
}

/**
 * Fetches public repository metadata, README.md, package.json, and root directory tree.
 * Respects rate limits by attempting raw endpoints if API limits are hit.
 */
export async function fetchGitHubRepoDetails(
  owner: string,
  repo: string
): Promise<GitHubRepoMetadata> {
  const headers: Record<string, string> = {
    "User-Agent": "RohanMia-Portfolio-Synthesizer/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (ghToken) {
    headers.Authorization = `Bearer ${ghToken}`;
  }

  // Repository metadata
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    next: { revalidate: 0 },
  }).catch(() => null);

  const repoData = repoRes?.ok ? await repoRes.json() : {};
  const defaultBranch = repoData.default_branch || "main";
  const description = repoData.description || "";
  const stars = Number(repoData.stargazers_count) || 0;
  const topics: string[] = Array.isArray(repoData.topics) ? repoData.topics : [];

  // README markdown
  let readmeContent = "";
  try {
    const rawReadmeRes = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`
    );
    if (rawReadmeRes.ok) {
      readmeContent = await rawReadmeRes.text();
    } else {
      const masterRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
      );
      if (masterRes.ok) readmeContent = await masterRes.text();
    }
  } catch (e) {
    console.warn("Could not fetch raw README for", `${owner}/${repo}`);
  }

  // package.json dependencies
  let packageJson: GitHubRepoMetadata["packageJson"] = undefined;
  try {
    const pkgRes = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`
    );
    if (pkgRes.ok) {
      packageJson = await pkgRes.json();
    }
  } catch (e) {
    // Non-JS repository
  }

  // Directory tree sample
  const fileTreeSample: string[] = [];
  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (Array.isArray(treeData.tree)) {
        for (const item of treeData.tree.slice(0, 40)) {
          if (item.path && !item.path.startsWith(".git") && !item.path.includes("node_modules")) {
            fileTreeSample.push(item.path);
          }
        }
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    description,
    defaultBranch,
    stars,
    topics,
    readmeContent: readmeContent.slice(0, 12000), // budget to prevent token overflow
    packageJson,
    fileTreeSample,
  };
}

/**
 * Uses Gemini AI to synthesize a complete, production-grade Case Study from repository metadata.
 */
export async function synthesizeCaseStudyFromRepo(
  meta: GitHubRepoMetadata,
  liveUrl?: string
): Promise<SynthesizedCaseStudy> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  const template = await getPromptTemplateDb("github_synth");
  if (!template) {
    throw new Error("GitHub synthesizer prompt template is not configured in PostgreSQL database.");
  }

  const prompt = template
    .replace(/{{FULL_NAME}}/g, meta.fullName)
    .replace(/{{DESCRIPTION}}/g, meta.description || "Not provided")
    .replace(/{{STARS}}/g, String(meta.stars))
    .replace(/{{TOPICS}}/g, meta.topics.join(", ") || "None")
    .replace(/{{LIVE_URL}}/g, liveUrl || "")
    .replace(/{{DEPENDENCIES}}/g, JSON.stringify(meta.packageJson?.dependencies || {}))
    .replace(/{{FILE_TREE}}/g, meta.fileTreeSample?.slice(0, 25).join("\n") || "Not available")
    .replace(/{{README}}/g, meta.readmeContent.slice(0, 3500));

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsed = JSON.parse(responseText) as SynthesizedCaseStudy;

  // Enforce required fields
  if (!parsed.slug) {
    parsed.slug = meta.repo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  if (!parsed.githubUrl) {
    parsed.githubUrl = `https://github.com/${meta.fullName}`;
  }
  if (!parsed.year) {
    parsed.year = new Date().getFullYear().toString();
  }
  if (!parsed.gradient) {
    parsed.gradient = "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(3,7,18,0.95) 100%)";
  }

  return parsed;
}
