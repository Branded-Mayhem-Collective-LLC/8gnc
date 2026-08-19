# 8gnc

The free, MIT-licensed skill plugins from [Branded Mayhem Collective](https://brandedmayhem.com) — brand strategy, product strategy, content, SEO, conversion, sales — installable in one command into Claude Code, Codex, Cursor, or any agent that reads `SKILL.md` folders.

```bash
npx 8gnc                         # list the catalog
npx 8gnc add brandprint-engine   # install into ./.claude/skills
npx 8gnc add all -g              # everything, into ~/.claude/skills
npx 8gnc add seo-visibility-toolkit --into ~/.codex/skills
```

The catalog of record is the [contraband marketplace](https://github.com/Branded-Mayhem-Collective-LLC/contraband-marketplace) manifest — the same file Claude Code's `/plugin marketplace` reads — so this CLI can't drift from it. Each plugin is its own public repo; `add` downloads the repo and copies its `skills/` folders. No account, no telemetry, no runtime dependencies.

| Plugin | What it is |
|---|---|
| `brandprint-engine` | Six-layer brand strategy chain + deep-research engine → a consulting-grade Brand Strategy & Competitive Positioning report |
| `productprint-engine` | Six-layer product strategy chain: Playing-to-Win cascade, Now/Next/Later roadmap, adversarial pre-mortem |
| `content-creative-lab` | Eight-skill content lab: voice profiling, humanization, narrative structure, focus-group simulation |
| `seo-visibility-toolkit` | DataForSEO automation, local-services SEO matrix, AI-agent-readiness audits, AI-commerce data density |
| `conversion-architecture` | Neuro-design playbook, UX/UI choice architecture, fairness-anchor pricing ladder |
| `sales-accelerator` | Pitching pivot, outreach diagnosis, sales-simulator practice arena |

Prefer the native plugin route inside Claude Code?

```
/plugin marketplace add Branded-Mayhem-Collective-LLC/contraband-marketplace
/plugin install brandprint-engine@contraband
```

The plugin is the methodology; the agency is the hands. Details, examples and the email-free starter kit: [8gnc.io/products](https://8gnc.io/products).

MIT © 2026 Branded Mayhem Collective LLC
