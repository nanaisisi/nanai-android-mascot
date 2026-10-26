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
