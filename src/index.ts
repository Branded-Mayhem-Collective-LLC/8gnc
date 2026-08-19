/* index.ts — catalog + installer. No runtime dependencies.
 * Catalog of record = the contraband marketplace manifest on GitHub (the same
 * file Claude Code's /plugin marketplace reads), so this CLI can never drift
 * from what the marketplace says. */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

export const ORG = "Branded-Mayhem-Collective-LLC";
export const MARKETPLACE_REPO = `${ORG}/contraband-marketplace`;
export const MARKETPLACE_URL = `https://raw.githubusercontent.com/${MARKETPLACE_REPO}/HEAD/.claude-plugin/marketplace.json`;

export type Plugin = { name: string; description?: string; repo: string };

export function parseMarketplace(json: unknown): Plugin[] {
  const m = json as { plugins?: Array<{ name: string; description?: string; source?: { repo?: string } }> };
  return (m.plugins ?? [])
    .filter(p => p?.name && p.source?.repo)
    .map(p => ({ name: p.name, description: p.description, repo: p.source!.repo! }));
}

export async function fetchCatalog(fetchImpl: typeof fetch = fetch): Promise<Plugin[]> {
  const r = await fetchImpl(MARKETPLACE_URL, { headers: { "user-agent": "8gnc-cli" } });
  if (!r.ok) throw new Error(`catalog fetch failed: HTTP ${r.status}`);
  return parseMarketplace(await r.json());
}

/** Where skills go. Project-local by default (./.claude/skills), --global → ~/.claude/skills,
 *  --into <dir> for Codex/Cursor/anything else that reads SKILL.md folders. */
export function resolveTarget(opts: { global?: boolean; into?: string; cwd?: string }): string {
  if (opts.into) return path.resolve(opts.into);
  if (opts.global) return path.join(os.homedir(), ".claude", "skills");
  return path.join(opts.cwd ?? process.cwd(), ".claude", "skills");
}

function run(cmd: string, args: string[], cwd?: string): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd, stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", d => (err += d));
    p.on("close", code => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err.trim()}`))));
    p.on("error", rej);
  });
}

/** Download the plugin repo tarball (HEAD) and copy its skills/* folders into target.
 *  Returns the list of installed skill folder names. */
export async function installPlugin(plugin: Plugin, target: string, fetchImpl: typeof fetch = fetch): Promise<string[]> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "8gnc-"));
  try {
    const url = `https://codeload.github.com/${plugin.repo}/tar.gz/HEAD`;
    const r = await fetchImpl(url, { headers: { "user-agent": "8gnc-cli" } });
    if (!r.ok || !r.body) throw new Error(`download failed for ${plugin.repo}: HTTP ${r.status}`);
    const tgz = path.join(tmp, "plugin.tgz");
    await fs.writeFile(tgz, Buffer.from(await r.arrayBuffer()));
    await run("tar", ["-xzf", tgz, "-C", tmp]);
    const [extracted] = (await fs.readdir(tmp, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name);
    if (!extracted) throw new Error("archive had no top-level folder");
    const skillsDir = path.join(tmp, extracted, "skills");
    let skills: string[];
    try { skills = (await fs.readdir(skillsDir, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name); }
    catch { throw new Error(`${plugin.repo} has no skills/ folder`); }
    await fs.mkdir(target, { recursive: true });
    for (const s of skills) await fs.cp(path.join(skillsDir, s), path.join(target, s), { recursive: true, force: true });
    return skills;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

export function marketplaceHint(name: string): string {
  return [
    `Prefer the Claude Code plugin route? Inside Claude Code:`,
    `  /plugin marketplace add ${MARKETPLACE_REPO}`,
    `  /plugin install ${name}@contraband`,
  ].join("\n");
}
