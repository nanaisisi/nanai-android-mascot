import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { SakuraScriptToken } from "./sakura-parser.js";

export function rustCommandsToTokens(rustCommands: any[]): SakuraScriptToken[] {
	const tokens: SakuraScriptToken[] = [];
	for (const cmd of rustCommands) {
		switch (cmd.type) {
			case "Target":
				tokens.push({ type: "scope", value: cmd.payload ?? 0 });
				break;
			case "Surface":
				tokens.push({ type: "surface", value: cmd.payload ?? 0 });
				break;
			case "Wait":
				tokens.push({ type: "wait", value: cmd.payload ?? 100 });
				break;
			case "ClickWait":
				tokens.push({ type: "pause" });
				break;
			case "Quick":
				tokens.push({ type: "quick_toggle", value: cmd.payload ?? true });
				break;
			case "NewLine":
				tokens.push({ type: "newline", half: cmd.payload?.half === true });
				break;
			case "NewLineNoPause":
				tokens.push({ type: "no_autowrap" });
				break;
			case "AutoPause":
				tokens.push({ type: "auto_pause" });
				break;
			case "Clear":
				tokens.push({ type: "clear" });
				break;
			case "ClearArg": {
				const raw = String(cmd.payload?.arg ?? "");
				const parts = raw.split(",").map((s) => s.trim());
				if (parts[0] === "char" || parts[0] === "line") {
					tokens.push({
						type: "clear",
						mode: parts[0],
						count: Number.parseInt(parts[1], 10) || 1,
					});
				} else {
					tokens.push({ type: "clear" });
				}
				break;
			}
			case "Choice":
				tokens.push({
					type: "choice",
					text: cmd.payload?.label ?? "",
					id: cmd.payload?.id ?? "",
				});
				break;
			case "Anchor":
				tokens.push({
					type: "anchor_begin",
					id: cmd.payload?.id ?? "",
					args: [cmd.payload?.id ?? ""],
				});
				for (const ch of cmd.payload?.text ?? "") {
					tokens.push({ type: "char", value: ch });
				}
				tokens.push({ type: "anchor_end" });
				break;
			case "Raise":
				tokens.push({
					type: "command",
					command: "raise",
					args: [cmd.payload?.event ?? "", ...(cmd.payload?.references ?? [])],
				});
				break;
			case "Bind":
				tokens.push({
					type: "command",
					command: "bind",
					args: [
						cmd.payload?.category ?? "",
						cmd.payload?.part ?? "",
						cmd.payload?.status ? "1" : "0",
					],
				});
				break;
			case "Balloon":
				tokens.push({ type: "balloon", value: cmd.payload ?? 0 });
				break;
			case "InlineBitmap":
				tokens.push({
					type: "inline_bitmap",
					path: cmd.payload?.path ?? "",
					mode: cmd.payload?.mode ?? "inline",
					x: cmd.payload?.x,
					y: cmd.payload?.y,
				});
				break;
			case "Text":
				for (const ch of cmd.payload ?? "") {
					tokens.push({ type: "char", value: ch });
				}
				break;
			default:
				if (typeof cmd.payload === "string") {
					for (const ch of cmd.payload) {
						tokens.push({ type: "char", value: ch });
					}
				}
				break;
		}
	}
	return tokens;
}

export async function parseSakuraScriptAsync(script: string): Promise<SakuraScriptToken[]> {
	if (!script || typeof script !== "string") return [];
	if (!isTauriAvailable()) {
		const { parseSakuraScript } = await import("./sakura-tokenizer.js");
		return parseSakuraScript(script);
	}
	try {
		const rustCommands: any = await invoke("parse_sakura_script", { script });
		if (Array.isArray(rustCommands)) {
			return rustCommandsToTokens(rustCommands);
		}
	} catch (err) {
		console.warn("⚠️ Rust parse_sakura_script 失敗、JSフォールバックへ:", err);
	}
	const { parseSakuraScript } = await import("./sakura-tokenizer.js");
	return parseSakuraScript(script);
}
