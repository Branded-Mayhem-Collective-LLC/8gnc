#!/usr/bin/env node
/* cli.ts — `8gnc` (list) · `8gnc add <plugin> [--global|--into <dir>]` · `8gnc add all` */
import { fetchCatalog, installPlugin, marketplaceHint, resolveTarget } from "./index.js";

const [, , cmd = "list", ...rest] = process.argv;
const flags: Record<string, string | boolean> = {};
const positional: string[] = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a === "--global" || a === "-g") flags.global = true;
  else if (a === "--into") flags.into = rest[++i];
  else if (a === "--help" || a === "-h") flags.help = true;
  else positional.push(a);
}

function usage(): void {
  console.log(`8gnc — free, MIT-licensed skill plugins from Branded Mayhem Collective (https://8gnc.io/products)

  npx @8gnc/skills                      list the catalog
  npx @8gnc/skills add <plugin>         install into ./.claude/skills
  npx @8gnc/skills add <plugin> -g      install into ~/.claude/skills
  npx @8gnc/skills add <plugin> --into <dir>   any folder that reads SKILL.md (Codex, Cursor, your agent)
  npx @8gnc/skills add all [-g]         everything in the catalog`);
}

try {
  if (flags.help || cmd === "help") { usage(); process.exit(0); }
  const catalog = await fetchCatalog();
  if (cmd === "list") {
    console.log("Catalog (source: contraband marketplace on GitHub):\n");
    for (const p of catalog) console.log(`  ${p.name.padEnd(26)} ${p.description ?? ""}`);
    console.log(`\nInstall: npx @8gnc/skills add <plugin>   ·   details: https://8gnc.io/products`);
    process.exit(0);
  }
  if (cmd === "add") {
    const want = positional[0];
    if (!want) { usage(); process.exit(2); }
    const target = resolveTarget({ global: !!flags.global, into: typeof flags.into === "string" ? flags.into : undefined });
    const picks = want === "all" ? catalog : catalog.filter(p => p.name === want);
    if (!picks.length) { console.error(`unknown plugin "${want}". Run: npx @8gnc/skills`); process.exit(1); }
    for (const p of picks) {
      const skills = await installPlugin(p, target);
      console.log(`✓ ${p.name}: ${skills.length} skill${skills.length === 1 ? "" : "s"} → ${target}\n    ${skills.join(", ")}`);
    }
    console.log(`\n${marketplaceHint(picks.length === 1 ? picks[0].name : "<plugin>")}`);
    process.exit(0);
  }
  usage(); process.exit(2);
} catch (e) {
  console.error(`8gnc: ${(e as Error).message}`);
  process.exit(1);
}
