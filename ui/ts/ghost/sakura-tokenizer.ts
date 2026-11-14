/**
 * @file sakura-tokenizer.ts
 * @brief さくらスクリプト（SakuraScript）トークナイザー（WASM 統合）
 */

import { parseSakuraScriptWasm } from "../core/wasm/wasm-sakura.js";
import {
	readBracketContent,
	splitBracketArgs,
} from "./parser/bracket-utils.js";
import type { SakuraScriptToken } from "./sakura-parser.js";

export { readBracketContent, splitBracketArgs };

export function parseSakuraScript(script: string): SakuraScriptToken[] {
	const wasmTokens = parseSakuraScriptWasm(script);
	if (!wasmTokens) {
		return [];
	}

	const tokens: SakuraScriptToken[] = [];
	for (const t of wasmTokens) {
		if (t.type === "Text") {
			for (const ch of String(t.value ?? "")) {
				tokens.push({ type: "char", value: ch });
			}
		} else if (t.type === "Choice") {
			tokens.push({
				type: "choice",
				text: t.title,
				id: t.id,
			});
		} else if (t.type === "Wait") {
			tokens.push({ type: "wait", value: t.value });
		} else if (t.type === "Halt") {
			tokens.push({ type: "halt" });
		} else if (t.type === "Clear") {
			tokens.push({ type: "clear" });
		} else if (t.type === "Newline") {
			tokens.push({ type: "newline", half: false });
		} else if (t.type === "Scope") {
			tokens.push({ type: "scope", value: t.value });
		} else if (t.type === "Surface") {
			tokens.push({ type: "surface", value: t.value });
		} else if (t.type === "Balloon") {
			tokens.push({ type: "balloon", value: t.value });
		} else if (t.type === "Animation") {
			tokens.push({ type: "animation", animId: t.value });
		} else if (t.type === "Anchor") {
			tokens.push({ type: "anchor_begin", id: t.id, args: [t.id] });
			for (const ch of String(t.text ?? "")) {
				tokens.push({ type: "char", value: ch });
			}
			tokens.push({ type: "anchor_end" });
		} else if (t.type === "Font") {
			tokens.push({ type: "font", tag: t.property, param: (t.args || []).join(",") });
		} else if (t.type === "Sync") {
			tokens.push({ type: "sync_toggle", value: t.value });
		} else if (t.type === "Quick") {
			tokens.push({ type: "quick_toggle", value: t.value });
		} else if (t.type === "Command") {
			tokens.push({ type: "command", command: t.command, args: t.args });
		} else if (t.type === "ChoiceScopeBegin") {
			tokens.push({ type: "choice_scope_begin", id: t.id, args: t.args });
		} else if (t.type === "ChoiceScopeEnd") {
			tokens.push({ type: "choice_scope_end" });
		} else if (t.type === "NoAutoWrap") {
			tokens.push({ type: "no_autowrap" });
		} else if (t.type === "RawToggle") {
			tokens.push({ type: "raw_toggle", active: t.active, delimiter: t.delimiter });
		}
	}

	return tokens;
}
