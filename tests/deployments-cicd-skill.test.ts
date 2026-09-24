import { beforeAll, describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadValidatedSkillMap } from "../src/shared/skill-map-loader.ts";

// Content-contract guards for the deployments-cicd skill. SKILL.md keeps the
// common release flow and routes provider-specific examples and OIDC details
// to references/, which must exist. Promoting a preview deployment creates a
// new production build, so release examples stage a production deployment
// before promoting it. CI examples authenticate through VERCEL_TOKEN.

const ROOT = resolve(import.meta.dirname, "..");
const SKILL_DIR = resolve(ROOT, "skills/deployments-cicd");

let skill: string;
let allContent: string;

beforeAll(() => {
  const { skills } = loadValidatedSkillMap(resolve(ROOT, "skills"));
  expect(skills["deployments-cicd"]).toBeDefined();
  skill = readFileSync(resolve(SKILL_DIR, "SKILL.md"), "utf8");
  const references = readdirSync(resolve(SKILL_DIR, "references")).map((file) =>
    readFileSync(resolve(SKILL_DIR, "references", file), "utf8"),
  );
  allContent = [skill, ...references].join("\n");
});

describe("deployments-cicd references", () => {
  test("every linked reference exists", () => {
    const links = [...skill.matchAll(/\]\((references\/[^)#]+)/g)].map((m) => m[1]);
    expect(links).toContain("references/ci-providers.md");
    expect(links).toContain("references/oidc-federation.md");
    for (const link of links) {
      expect(existsSync(resolve(SKILL_DIR, link))).toBe(true);
    }
  });
});

describe("deployments-cicd guidance", () => {
  test("stages production deployments before promoting them", () => {
    expect(skill).toContain("vercel deploy --prebuilt --prod --skip-domain");
    expect(skill).toContain("Promoting a preview rebuilds it with production environment variables");
    expect(skill).not.toContain("re-points the production alias without rebuilding");
    expect(skill).not.toContain("deploy-preview.outputs.url");
  });

  test("warns that rollback turns off auto-assignment", () => {
    expect(skill).toContain("**Rollback turns off auto-assignment.**");
  });

  test("CI examples authenticate with VERCEL_TOKEN instead of --token", () => {
    expect(allContent).not.toMatch(/--token[= ]\$/);
    expect(skill).toContain("VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}");
  });
});
