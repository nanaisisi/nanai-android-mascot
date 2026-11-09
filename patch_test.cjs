const fs = require("node:fs");
const file = "tests/canvas-pixel-snapshot/cycle10-pixel-ops.test.ts";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
	/clipped.destroy\(\);\nimport \{ describe, expect, it \} from "vitest";/,
	`clipped.destroy();\n});\nimport { describe, expect, it } from "vitest";`,
);
code = code.replace(/}\);\n}\);\n$/, `});\n`);
code = code.replace(/}\);\n}\);\n}\);$/, `});\n});\n`); // Clean up trailing things

fs.writeFileSync(file, code, "utf8");
