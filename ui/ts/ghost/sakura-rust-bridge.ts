/**
 * @file sakura-rust-bridge.ts
 * @brief Rust(Kawari/Satoriya/Yaya) からのコマンド列をさくらスクリプトトークンに変換するブリッジ
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { SakuraScriptToken } from "./sakura-parser.js";

export interface RustCommand {
	type: string;
	payload?: {
		label?: string;
		id?: string;
		text?: string;
		arg?: string;
		half?: boolean;
		event?: string;
		references?: string[];
		category?: string;
		part?: string;
		status?: unknown;
		path?: string;
		mode?: string;
		x?: unknown;
		y?: unknown;
		tag?: string;
		param?: string;
		args?: string[];
		umsg?: unknown;
		wparam?: unknown;
		lparam?: unknown;
		plugin?: string;
		key?: string;
		value?: unknown;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export function rustCommandsToTokens(
	rustCommands: RustCommand[],
): SakuraScriptToken[] {
	const tokens: SakuraScriptToken[] = [];
	for (const item of rustCommands) {
		const cmd = item as RustCommand;
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
					x: cmd.payload?.x as number | undefined,
					y: cmd.payload?.y as number | undefined,
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
					animId: cmd.payload?.id as number | string | undefined,
					wait: cmd.payload?.wait as boolean | undefined,
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
				tokens.push({ type: "command", args: cmd.payload?.args as string[] | undefined });
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
					args: [String(cmd.payload ?? "")],
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
					args: [cmd.payload?.key ?? "", String(cmd.payload?.value ?? "")],
				});
				break;
			case "ScheduleAdd":
				tokens.push({ type: "command", command: "schedule-add", args: [] });
				break;
			case "Text":
				for (const ch of String(cmd.payload ?? "")) {
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
): Promise<SakuraScriptToken[]> {
	if (!isTauriAvailable()) {
		return [];
	}
	try {
		const res = (await invoke("parse_sakura_script", { script })) as
			| RustCommand[]
			| null;
		if (res && Array.isArray(res)) {
			return rustCommandsToTokens(res);
		}
		return [];
	} catch (e) {
		console.warn("Rust Sakura parser fallback to JS:", e);
		return [];
	}
}
