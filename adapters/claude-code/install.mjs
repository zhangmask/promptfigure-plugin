// 安装到 ~/.claude/skills/promptfigure-local/
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const src = new URL("./SKILL.md", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const dest = path.join(os.homedir(), ".claude", "skills", "promptfigure-local");
fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(src, path.join(dest, "SKILL.md"));
console.log("✅ 已安装到 " + dest);
