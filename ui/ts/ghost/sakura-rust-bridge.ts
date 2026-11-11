import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { SakuraScriptToken } from "./sakura-parser.js";

export interface RustCommand {
	type: string;
	payload?: any;
	[key: string]: any;
}

export function rustCommandsToTokens(
	rustCommands: RustCommand[] | any[],
): SakuraScriptToken[] {
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
			case "Timeout":
				tokens.push({ type: "timeout" });
				break;
			case "Halt":
				tokens.push({ type: "halt" });
				break;
			case "End":
				tokens.push({ type: "end" });
				break;
			case "Animation":
				tokens.push({
					type: "animation",
					animId: cmd.payload?.id,
					wait: cmd.payload?.wait,
				});
				break;
			case "Sync":
				tokens.push({ type: "sync_toggle", value: cmd.payload });
				break;
			case "Offset":
				tokens.push({
					type: "offset",
					x: String(cmd.payload?.x ?? "0"),
					y: String(cmd.payload?.y ?? "0"),
				});
				break;
			case "Font":
				tokens.push({
					type: "font",
					tag: cmd.payload?.tag,
					param: cmd.payload?.param,
				});
				break;
			case "Command":
				tokens.push({ type: "command", args: cmd.payload?.args });
				break;
			case "PostMessage":
				tokens.push({
					type: "post_message",
					umsg: cmd.payload?.umsg,
					wparam: cmd.payload?.wparam,
					lparam: cmd.payload?.lparam,
				});
				break;
			case "Star":
				tokens.push({ type: "command", command: "marker", args: [] });
				break;
			case "Marker":
				tokens.push({ type: "command", command: "marker", args: [] });
				break;
			case "AudioWait":
				tokens.push({ type: "wait_audio" });
				break;
			case "Jump":
				tokens.push({
					type: "command",
					command: "jump",
					args: [cmd.payload ?? ""],
				});
				break;
			case "Plus":
				tokens.push({ type: "plus" });
				break;
			case "PluginEvent":
				tokens.push({
					type: "command",
					command: "raiseplugin",
					args: [cmd.payload?.plugin ?? "", cmd.payload?.event ?? ""],
				});
				break;
			case "NoUserBreak":
				tokens.push({ type: "no_user_break", value: cmd.payload });
				break;
			case "Voice":
				tokens.push({ type: "voice", path: cmd.payload });
				break;
			case "Midi":
				tokens.push({ type: "midi", value: cmd.payload });
				break;
			case "ModeChange":
				tokens.push({
					type: "command",
					command: "entermode",
					args: [cmd.payload?.mode ?? ""],
				});
				break;
			case "LockBalloonRepaint":
				tokens.push({
					type: "command",
					command: "lockrepaint",
					args: [cmd.payload ? "1" : "0"],
				});
				break;
			case "BalloonSetting":
				tokens.push({
					type: "command",
					command: "setballoon",
					args: [cmd.payload?.key ?? "", cmd.payload?.value ?? ""],
				});
				break;
			case "ScheduleAdd":
				tokens.push({ type: "command", command: "schedule-add", args: [] });
				break;
			case "Text":
				for (const ch of cmd.payload ?? "") {
					tokens.push({ type: "char", value: ch });
				}
				break;
			default:
				break;
		}
	}
	return tokens;
}

export async function parseSakuraScriptAsync(
	script: string,
): Promise<SakuraScriptToken[] | undefined> {
	if (!script || typeof script !== "string") return [];
	if (!isTauriAvailable()) {
		return undefined;
	}
	try {
		const rustCommands: unknown = await invoke("parse_sakura_script", {
			script,
		});
		if (Array.isArray(rustCommands)) {
			return rustCommandsToTokens(rustCommands);
		}
	} catch (err) {
		console.warn("⚠️ Rust parse_sakura_script 失敗:", err);
		return undefined;
	}
	return undefined;
}
