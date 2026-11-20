/**
 * @file sakura-rust-bridge.ts
 * @brief Rust(Kawari/Satoriya/Yaya) からのコマンド列をさくらスクリプトトークンに変換するブリッジ
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import type { SakuraToken as WasmSakuraToken } from "../core/wasm/wasm-types.js";

export type { WasmSakuraToken };

export interface RustCommandObjectPayload {
	label?: string;
	id?: string | number;
	text?: string;
	arg?: string;
	half?: boolean;
	event?: string;
	references?: string[];
	category?: string;
	part?: string;
	status?: boolean | null;
	path?: string;
	mode?: string;
	x?: number | string | null;
	y?: number | string | null;
	opaque?: boolean;
	tag?: string;
	param?: string | null;
	args?: string[];
	umsg?: unknown;
	wparam?: unknown;
	lparam?: unknown;
	plugin?: string;
	key?: string;
	value?: unknown;
	wait?: boolean;
	is_notify?: boolean;
	active?: boolean;
	extra?: string[];
	date?: string;
	time?: string;
	title?: string;
	memo?: string;
	[key: string]: unknown;
}

export type RustCommandPayload =
	| number
	| string
	| boolean
	| RustCommandObjectPayload
	| null
	| undefined;

/**
 * Rust (crates/ui::SakuraCommand) の直列化形式に準拠した判別共用体
 */
export type RustSakuraCommand =
	| { type: "Target"; payload?: number }
	| { type: "Surface"; payload?: number }
	| { type: "Wait"; payload?: number }
	| { type: "ClickWait"; payload?: undefined }
	| { type: "Quick"; payload?: boolean }
	| { type: "NewLine"; payload?: { half?: boolean } }
	| { type: "NewLineNoPause"; payload?: undefined }
	| { type: "AutoPause"; payload?: undefined }
	| {
			type: "InlineBitmap";
			payload?: {
				path?: string;
				mode?: string;
				x?: number | null;
				y?: number | null;
				opaque?: boolean;
			};
	  }
	| {
			type: "PostMessage";
			payload?: { umsg?: unknown; wparam?: unknown; lparam?: unknown };
	  }
	| { type: "Clear"; payload?: undefined }
	| { type: "ClearArg"; payload?: { arg?: string } }
	| {
			type: "Choice";
			payload?: { label?: string; id?: string; args?: string[] };
	  }
	| {
			type: "Anchor";
			payload?: { id?: string; text?: string; args?: string[] };
	  }
	| { type: "Star"; payload?: undefined }
	| { type: "Marker"; payload?: undefined }
	| { type: "AudioWait"; payload?: undefined }
	| { type: "Jump"; payload?: string }
	| { type: "Plus"; payload?: undefined }
	| { type: "Raise"; payload?: { event?: string; references?: string[] } }
	| {
			type: "PluginEvent";
			payload?: {
				plugin?: string;
				event?: string;
				references?: string[];
				is_notify?: boolean;
			};
	  }
	| {
			type: "Bind";
			payload?: { category?: string; part?: string; status?: boolean | null };
	  }
	| { type: "Balloon"; payload?: number }
	| { type: "NoUserBreak"; payload?: boolean }
	| { type: "Voice"; payload?: string }
	| { type: "Midi"; payload?: string }
	| { type: "ModeChange"; payload?: { mode?: string; active?: boolean } }
	| { type: "LockBalloonRepaint"; payload?: boolean }
	| {
			type: "BalloonSetting";
			payload?: { key?: string; value?: unknown; extra?: string[] };
	  }
	| { type: "Animation"; payload?: { id?: number | string; wait?: boolean } }
	| { type: "Timeout"; payload?: undefined }
	| { type: "Halt"; payload?: undefined }
	| { type: "Sync"; payload?: boolean }
	| {
			type: "Offset";
			payload?: { x?: number | string | null; y?: number | string | null };
	  }
	| { type: "Font"; payload?: { tag?: string; param?: string | null } }
	| { type: "Text"; payload?: string }
	| { type: "End"; payload?: undefined }
	| { type: "ScheduleAdd"; payload?: RustCommandObjectPayload }
	| { type: "Command"; payload?: { args?: string[] } };

export interface RustCommand {
	type: string;
	payload?: RustCommandPayload;
	[key: string]: unknown;
}

export type SakuraScriptToken =
	| { type: "scope"; value: number }
	| { type: "surface"; value: number }
	| { type: "wait"; value: number }
	| { type: "pause" }
	| { type: "quick_toggle"; value: boolean }
	| { type: "newline"; half: boolean }
	| { type: "no_autowrap" }
	| { type: "auto_pause" }
	| { type: "clear"; mode?: "char" | "line"; count?: number }
	| { type: "choice"; text: string; id: string }
	| { type: "anchor_begin"; id: string; args: string[] }
	| { type: "char"; value: string }
	| { type: "anchor_end" }
	| { type: "command"; command?: string; args?: string[] }
	| { type: "balloon"; value: number }
	| {
			type: "inline_bitmap";
			path: string;
			mode: string;
			x?: number;
			y?: number;
	  }
	| { type: "timeout" }
	| { type: "halt" }
	| { type: "end" }
	| { type: "animation"; animId?: number | string; wait?: boolean }
	| { type: "sync_toggle"; value?: boolean }
	| { type: "offset"; x: string; y: string }
	| { type: "font"; tag?: string; param?: string }
	| {
			type: "post_message";
			umsg?: unknown;
			wparam?: unknown;
			lparam?: unknown;
	  }
	| { type: "wait_audio" }
	| { type: "plus" }
	| { type: "no_user_break"; value?: boolean }
	| { type: "voice"; path?: string }
	| { type: "midi"; value?: string };

function asObjectPayload(
	payload: unknown,
): RustCommandObjectPayload | undefined {
	return payload && typeof payload === "object"
		? (payload as RustCommandObjectPayload)
		: undefined;
}

function asNumberPayload(payload: unknown, fallback: number): number {
	return typeof payload === "number" && Number.isFinite(payload)
		? payload
		: fallback;
}

function asBooleanPayload(payload: unknown, fallback: boolean): boolean {
	if (typeof payload === "boolean") return payload;
	return payload === undefined || payload === null
		? fallback
		: Boolean(payload);
}

function asOptionalBooleanPayload(payload: unknown): boolean | undefined {
	if (payload === undefined) return undefined;
	return typeof payload === "boolean" ? payload : Boolean(payload);
}

function asOptionalStringPayload(payload: unknown): string | undefined {
	if (payload === undefined) return undefined;
	return typeof payload === "string" ? payload : String(payload);
}

export function rustCommandsToTokens(
	rustCommands: Array<RustCommand | RustSakuraCommand>,
): SakuraScriptToken[] {
	const tokens: SakuraScriptToken[] = [];
	for (const cmd of rustCommands) {
		const obj = asObjectPayload(cmd.payload);
		switch (cmd.type) {
			case "Target":
				tokens.push({
					type: "scope",
					value: asNumberPayload(cmd.payload, 0),
				});
				break;
			case "Surface":
				tokens.push({
					type: "surface",
					value: asNumberPayload(cmd.payload, 0),
				});
				break;
			case "Wait":
				tokens.push({
					type: "wait",
					value: asNumberPayload(cmd.payload, 100),
				});
				break;
			case "ClickWait":
				tokens.push({ type: "pause" });
				break;
			case "Quick":
				tokens.push({
					type: "quick_toggle",
					value: asBooleanPayload(cmd.payload, true),
				});
				break;
			case "NewLine":
				tokens.push({ type: "newline", half: obj?.half === true });
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
				const raw = String(obj?.arg ?? "");
				const parts = raw.split(",").map((s) => s.trim());
				if (parts[0] === "char" || parts[0] === "line") {
					tokens.push({
						type: "clear",
						mode: parts[0],
						count: Number.parseInt(parts[1] ?? "", 10) || 1,
					});
				} else {
					tokens.push({ type: "clear" });
				}
				break;
			}
			case "Choice":
				tokens.push({
					type: "choice",
					text: obj?.label ?? "",
					id: obj?.id != null ? String(obj.id) : "",
				});
				break;
			case "Anchor": {
				const anchorId = obj?.id != null ? String(obj.id) : "";
				tokens.push({
					type: "anchor_begin",
					id: anchorId,
					args: [anchorId],
				});
				for (const ch of obj?.text ?? "") {
					tokens.push({ type: "char", value: ch });
				}
				tokens.push({ type: "anchor_end" });
				break;
			}
			case "Raise":
				tokens.push({
					type: "command",
					command: "raise",
					args: [obj?.event ?? "", ...(obj?.references ?? [])],
				});
				break;
			case "Bind":
				tokens.push({
					type: "command",
					command: "bind",
					args: [obj?.category ?? "", obj?.part ?? "", obj?.status ? "1" : "0"],
				});
				break;
			case "Balloon":
				tokens.push({
					type: "balloon",
					value: asNumberPayload(cmd.payload, 0),
				});
				break;
			case "InlineBitmap":
				tokens.push({
					type: "inline_bitmap",
					path: obj?.path ?? "",
					mode: obj?.mode ?? "inline",
					x: typeof obj?.x === "number" ? obj.x : undefined,
					y: typeof obj?.y === "number" ? obj.y : undefined,
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
					animId:
						typeof obj?.id === "number" || typeof obj?.id === "string"
							? obj.id
							: undefined,
					wait: typeof obj?.wait === "boolean" ? obj.wait : undefined,
				});
				break;
			case "Sync":
				tokens.push({
					type: "sync_toggle",
					value: asOptionalBooleanPayload(cmd.payload),
				});
				break;
			case "Offset":
				tokens.push({
					type: "offset",
					x: String(obj?.x ?? "0"),
					y: String(obj?.y ?? "0"),
				});
				break;
			case "Font":
				tokens.push({
					type: "font",
					tag: obj?.tag,
					param: obj?.param ?? undefined,
				});
				break;
			case "Command":
				tokens.push({
					type: "command",
					args: Array.isArray(obj?.args) ? obj.args : undefined,
				});
				break;
			case "PostMessage":
				tokens.push({
					type: "post_message",
					umsg: obj?.umsg,
					wparam: obj?.wparam,
					lparam: obj?.lparam,
				});
				break;
			case "Star":
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
					args: [obj?.plugin ?? "", obj?.event ?? ""],
				});
				break;
			case "NoUserBreak":
				tokens.push({
					type: "no_user_break",
					value: asOptionalBooleanPayload(cmd.payload),
				});
				break;
			case "Voice":
				tokens.push({
					type: "voice",
					path: asOptionalStringPayload(cmd.payload),
				});
				break;
			case "Midi":
				tokens.push({
					type: "midi",
					value: asOptionalStringPayload(cmd.payload),
				});
				break;
			case "ModeChange":
				tokens.push({
					type: "command",
					command: "entermode",
					args: [obj?.mode ?? ""],
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
					args: [obj?.key ?? "", String(obj?.value ?? "")],
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
): Promise<SakuraScriptToken[] | undefined> {
	if (!isTauriAvailable()) {
		return undefined;
	}
	try {
		const res = await invoke<RustCommand[] | null>("parse_sakura_script", {
			script,
		});
		if (res && Array.isArray(res)) {
			return rustCommandsToTokens(res);
		}
		return [];
	} catch (e) {
		console.warn("Rust Sakura parser fallback to JS:", e);
		return undefined;
	}
}
