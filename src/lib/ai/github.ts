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
  liveUrl?: string,
  serverRepoUrl?: string,
  serverMeta?: GitHubRepoMetadata | null
): Promise<SynthesizedCaseStudy> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const template = await getPromptTemplateDb("github_synth");
  if (!template) {
    throw new Error("GitHub synthesizer prompt template is not configured in PostgreSQL database.");
  }

  const clientUrl = `https://github.com/${meta.fullName}`;
  const resolvedServerUrl = serverRepoUrl || (serverMeta ? `https://github.com/${serverMeta.fullName}` : "");

  const backendRepoSection = serverMeta
    ? `### BACKEND REPOSITORY DATA:
- Backend Repo: ${serverMeta.fullName}
- Backend Description: ${serverMeta.description || "Not provided"}
- Backend Dependencies: ${JSON.stringify(serverMeta.packageJson?.dependencies || {})}
- Backend File Structure:
${serverMeta.fileTreeSample?.slice(0, 20).join("\n") || "Not available"}
- Backend README:
${serverMeta.readmeContent.slice(0, 2500)}`
    : (serverRepoUrl ? `### BACKEND REPOSITORY:
- Backend Repo URL: ${serverRepoUrl}` : "");

  const prompt = template
    .replace(/{{FULL_NAME}}/g, meta.fullName)
    .replace(/{{DESCRIPTION}}/g, meta.description || "Not provided")
    .replace(/{{STARS}}/g, String(meta.stars))
    .replace(/{{TOPICS}}/g, meta.topics.join(", ") || "None")
    .replace(/{{LIVE_URL}}/g, liveUrl || "")
    .replace(/{{CLIENT_URL}}/g, clientUrl)
    .replace(/{{SERVER_URL}}/g, resolvedServerUrl)
    .replace(/{{BACKEND_REPO_DATA}}/g, backendRepoSection)
    .replace(/{{DEPENDENCIES}}/g, JSON.stringify(meta.packageJson?.dependencies || {}))
    .replace(/{{FILE_TREE}}/g, meta.fileTreeSample?.slice(0, 25).join("\n") || "Not available")
    .replace(/{{README}}/g, meta.readmeContent.slice(0, 3500));

  let responseText = "";
  let lastErr: any = null;

  const CASCADE_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
  ];

  for (const mName of CASCADE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: mName,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      if (responseText) break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!responseText) {
    throw lastErr || new Error("Failed to synthesize repository across all models");
  }
  const parsed = JSON.parse(responseText) as SynthesizedCaseStudy;

  // Enforce required fields
  if (!parsed.slug) {
    parsed.slug = meta.repo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  if (!parsed.clientUrl) {
    parsed.clientUrl = clientUrl;
  }
  if (!parsed.serverUrl && resolvedServerUrl) {
    parsed.serverUrl = resolvedServerUrl;
  }
  if (!parsed.githubUrl) {
    parsed.githubUrl = clientUrl;
  }
  if (!parsed.liveUrl && liveUrl) {
    parsed.liveUrl = liveUrl;
  }
  if (!parsed.year) {
    parsed.year = new Date().getFullYear().toString();
  }
  if (!parsed.gradient) {
    parsed.gradient = "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(3,7,18,0.95) 100%)";
  }
  if (!parsed.accentColor) {
    parsed.accentColor = "#0ea5e9";
  }

  // Normalize keyFeatures to { title, description }[]
  if (Array.isArray(parsed.keyFeatures) && parsed.keyFeatures.length > 0) {
    parsed.keyFeatures = parsed.keyFeatures.map((f: any, idx: number) => {
      if (typeof f === "string") return { title: f, description: "" };
      return {
        title: f?.title || `Feature 0${idx + 1}`,
        description: f?.description || "",
      };
    });
  } else if (Array.isArray(parsed.highlights) && parsed.highlights.length > 0) {
    parsed.keyFeatures = parsed.highlights.map((h, idx) => ({
      title: `Key Architectural Feature 0${idx + 1}`,
      description: typeof h === "string" ? h : (h as any).title || "",
    }));
  }

  // Ensure whyIBuiltThis exists
  if (!parsed.whyIBuiltThis) {
    parsed.whyIBuiltThis = parsed.overview || parsed.tagline || "Engineered to deliver high-performance, resilient modern architecture.";
  }

  return parsed;
}
