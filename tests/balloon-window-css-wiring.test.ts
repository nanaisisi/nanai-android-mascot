import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";

const WIRED_BALLOON_CSS_VARS = [
	"--balloon-cursor-default",
	"--balloon-cursor-grip",
	"--balloon-cursor-hand",
	"--balloon-cursor-wait",
	"--balloon-clickwait-x",
	"--balloon-clickwait-y",
	"--balloon-sstpmarker-x",
	"--balloon-sstpmarker-y",
	"--balloon-sstpmessage-x",
	"--balloon-sstpmessage-xr",
	"--balloon-sstpmessage-y",
	"--balloon-sstpmessage-yb",
	"--balloon-sstp-font-color",
	"--balloon-sstp-font-family",
	"--balloon-sstp-font-size",
	"--balloon-number-x",
	"--balloon-number-xr",
	"--balloon-number-y",
	"--balloon-number-yb",
	"--balloon-number-color",
	"--balloon-number-font-family",
	"--balloon-number-font-size",
] as const;

describe("balloon-window.css wiring", () => {
	it("consumes all 22 Phase B2 balloon CSS custom properties", () => {
		const cssPath = path.resolve(process.cwd(), "ui/css/balloon-window.css");
		const css = fs.readFileSync(cssPath, "utf-8");

		for (const varName of WIRED_BALLOON_CSS_VARS) {
			assert.match(
				css,
				new RegExp(`var\\(\\s*${varName}\\b`),
				`Expected ${varName} to be consumed in ui/css/balloon-window.css`,
			);
		}
	});
});
