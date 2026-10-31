import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/** @typedef {import('./sakura-parser.js').SakuraScriptToken} SakuraScriptToken */

/**
 * Rust 側の SakuraCommand をフロントエンドの SakuraScriptToken 列へ変換
 * @param {Array<{ type: string, payload?: any }>} rustCommands
 * @returns {SakuraScriptToken[]}
 */
export function rustCommandsToTokens(rustCommands) {
	const tokens = [];
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
			case "Clear":
				tokens.push({ type: "clear" });
				break;
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
			case "Animation":
				tokens.push({
					type: "animation",
					animId: cmd.payload?.id ?? 0,
					wait: cmd.payload?.wait === true,
				});
				break;
			case "Timeout":
				tokens.push({ type: "timeout" });
				break;
			case "Halt":
				tokens.push({ type: "halt" });
				break;
			case "Sync":
				tokens.push({ type: "sync_toggle", value: cmd.payload ?? true });
				break;
			case "Offset":
				tokens.push({
					type: "offset",
					x: cmd.payload?.x ?? "0",
					y: cmd.payload?.y ?? "0",
				});
				break;
			case "Font":
				tokens.push({
					type: "font",
					tag: cmd.payload?.tag ?? "",
					param: cmd.payload?.param ?? null,
				});
				break;
			case "ChoiceTimeout":
				tokens.push({ type: "choice_timeout", timeout: cmd.payload ?? 0 });
				break;
			case "BalloonOffset":
				tokens.push({ type: "balloon_offset", x: cmd.payload?.x ?? 0, y: cmd.payload?.y ?? 0 });
				break;
			case "BalloonTimeout":
				tokens.push({ type: "balloon_timeout", timeout: cmd.payload ?? 0 });
				break;
			case "LockBalloonMove":
				tokens.push({ type: "lock_balloon_move", locked: cmd.payload ?? true });
				break;
			case "WindowState":
				tokens.push({ type: "command", command: "windowstate", args: [cmd.payload ?? ""] });
				break;
			case "Change":
				tokens.push({
					type: "command",
					command: "change",
					args: [cmd.payload?.target ?? "", cmd.payload?.name ?? ""],
				});
				break;
			case "Call":
				tokens.push({
					type: "command",
					command: "call",
					args: [cmd.payload?.target ?? "", cmd.payload?.name ?? ""],
				});
				break;
			case "SetWallpaper":
				tokens.push({
					type: "command",
					command: "setwallpaper",
					args: [cmd.payload?.filename ?? "", cmd.payload?.option ?? ""],
				});
				break;
			case "SaveWallpaper":
				tokens.push({ type: "command", command: "savewallpaper", args: [] });
				break;
			case "RestoreWallpaper":
				tokens.push({ type: "command", command: "restorewallpaper", args: [] });
				break;
			case "Cancel":
				tokens.push({
					type: "command",
					command: "cancel",
					args: [cmd.payload?.service ?? "", cmd.payload?.target ?? ""],
				});
				break;
			case "Close":
				tokens.push({
					type: "command",
					command: "close",
					args: [cmd.payload?.service ?? "", cmd.payload?.target ?? ""],
				});
				break;
			case "ArchiveExec":
				tokens.push({
					type: "command",
					command: "archiveexec",
					args: [cmd.payload?.action ?? "", cmd.payload?.filename ?? "", cmd.payload?.dest ?? ""],
				});
				break;
			case "Biff":
				tokens.push({ type: "command", command: "biff", args: [] });
				break;
			case "ExecuteSntp":
				tokens.push({ type: "command", command: "executesntp", args: [] });
				break;
			case "CreateShortcut":
				tokens.push({ type: "command", command: "createshortcut", args: [] });
				break;
			case "OpenDialog":
				tokens.push({
					type: "command",
					command: "open",
					args: [cmd.payload?.dialog_type ?? "", cmd.payload?.id ?? "", ...(cmd.payload?.args ?? [])],
				});
				break;
			case "Text":
				for (const ch of cmd.payload ?? "") {
					tokens.push({ type: "char", value: ch });
				}
				break;
			case "End":
				tokens.push({ type: "end" });
				break;
			case "Command":
				// 未対応 \![...] の汎用透過
				tokens.push({ type: "command", args: cmd.payload?.args ?? [] });
				break;
			default:
				break;
		}
	}
	return tokens;
}

/**
 * Rust コアパーサー経由でさくらスクリプトを解析（フォールバック付き）
 * @param {string} script
 * @returns {Promise<SakuraScriptToken[]>}
 */
export async function parseSakuraScriptAsync(script) {
	if (isTauriAvailable()) {
		try {
			const rustCommands = await invoke("parse_sakura_script", { script });
			if (Array.isArray(rustCommands)) {
				return rustCommandsToTokens(rustCommands);
			}
		} catch (err) {
			console.warn(
				"⚠️ Rust parse_sakura_script 失敗、JSパーサーへフォールバック:",
				err,
			);
		}
	}
}
