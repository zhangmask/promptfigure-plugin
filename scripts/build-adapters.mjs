// build-adapters.mjs — 一份 skill 源 → 各 AI 宿主包装产物
// 🔴 adapters/ 下全部由本脚本生成，勿手改
// 🔴 skill 内容只有一份源 skill/promptfigure-local/SKILL.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILL_SRC = path.join(ROOT, "skill", "promptfigure-local", "SKILL.md");
const ADAPTERS = path.join(ROOT, "adapters");

const skill = fs.readFileSync(SKILL_SRC, "utf8");
fs.rmSync(ADAPTERS, { recursive: true, force: true });

// ---- Codex：plugin 目录（.codex-plugin/plugin.json + skills/ + marketplace.json）----
const codex = path.join(ADAPTERS, "codex", "promptfigure");
fs.mkdirSync(path.join(codex, ".codex-plugin"), { recursive: true });
fs.mkdirSync(path.join(codex, "skills", "promptfigure-local"), { recursive: true });
fs.copyFileSync(SKILL_SRC, path.join(codex, "skills", "promptfigure-local", "SKILL.md"));

fs.writeFileSync(
  path.join(codex, ".codex-plugin", "plugin.json"),
  JSON.stringify(
    {
      name: "promptfigure",
      version: "0.1.0",
      description: "promptFigure 本地插件：为论文配科研图（锚点定位 + 出图 + 审批闭环）",
      skills: "./skills/",
    },
    null,
    2,
  ),
);

// marketplace.json（本地安装用）
fs.writeFileSync(
  path.join(ADAPTERS, "codex", "marketplace.json"),
  JSON.stringify(
    {
      plugins: [
        {
          name: "promptfigure",
          source: { source: "local", path: "./promptfigure" },
          policy: { installation: "trusted" },
        },
      ],
    },
    null,
    2,
  ),
);

// ---- Claude Code：skill 目录拷贝脚本 ----
const claude = path.join(ADAPTERS, "claude-code");
fs.mkdirSync(claude, { recursive: true });
fs.copyFileSync(SKILL_SRC, path.join(claude, "SKILL.md"));
fs.writeFileSync(
  path.join(claude, "install.mjs"),
  `// 安装到 ~/.claude/skills/promptfigure-local/
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const src = new URL("./SKILL.md", import.meta.url).pathname.replace(/^\\/([A-Za-z]:)/, "$1");
const dest = path.join(os.homedir(), ".claude", "skills", "promptfigure-local");
fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(src, path.join(dest, "SKILL.md"));
console.log("✅ 已安装到 " + dest);
`,
);

console.log("✅ adapters/ 已生成：");
for (const p of walk(ADAPTERS)) console.log("   " + path.relative(ROOT, p));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const f = path.join(dir, d.name);
    return d.isDirectory() ? walk(f) : [f];
  });
}
