import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { parseMarketplace, resolveTarget, marketplaceHint, MARKETPLACE_URL } from "../dist/index.js";

test("parses the marketplace manifest shape", () => {
  const plugins = parseMarketplace({ plugins: [
    { name: "sales-accelerator", description: "x", source: { source: "github", repo: "Branded-Mayhem-Collective-LLC/sales-accelerator" } },
    { name: "broken" },
  ]});
  assert.equal(plugins.length, 1);
  assert.equal(plugins[0].repo, "Branded-Mayhem-Collective-LLC/sales-accelerator");
});
test("resolves targets", () => {
  assert.equal(resolveTarget({ cwd: "/x" }), path.join("/x", ".claude", "skills"));
  assert.equal(resolveTarget({ global: true }), path.join(os.homedir(), ".claude", "skills"));
  assert.equal(resolveTarget({ into: "/tmp/s" }), path.resolve("/tmp/s"));
});
test("marketplace hint names the repo", () => {
  assert.match(marketplaceHint("brandprint-engine"), /contraband-marketplace/);
  assert.match(MARKETPLACE_URL, /marketplace\.json$/);
});
