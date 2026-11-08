/**
 * @file sakura-tokenizer.ts
 * @brief さくらスクリプト（SakuraScript）トークナイザー（JS フォールバック）
 */

import {
	readBracketContent,
	splitBracketArgs,
} from "./parser/bracket-utils.js";
import { tokenizeTag } from "./parser/tag-tokenizer.js";
import type { SakuraScriptToken } from "./sakura-parser.js";

export { readBracketContent, splitBracketArgs };

export function parseSakuraScript(script: string): SakuraScriptToken[] {
	const tokens: SakuraScriptToken[] = [];
	let i = 0;
	const len = script.length;
	let rawModeDelimiter: string | null = null;

	while (i < len) {
		if (rawModeDelimiter) {
			if (script[i] === "\\" && script.startsWith(`\\${rawModeDelimiter}`, i)) {
				tokens.push({
					type: "raw_toggle",
					active: false,
					delimiter: rawModeDelimiter,
				});
				i += 1 + rawModeDelimiter.length;
				rawModeDelimiter = null;
			} else {
				tokens.push({ type: "char", value: script[i] });
				i++;
			}
			continue;
		}

		if (script[i] === "\\") {
			const res: unknown = tokenizeTag(script, i, len);
			if (res.tokens.length > 0) {
				for (const t of res.tokens) {
					const tok: unknown = t;
					if (tok.type === "raw_toggle" && tok.active) {
						rawModeDelimiter = tok.delimiter || "_?";
					}
					tokens.push(tok);
				}
			}
			i = res.nextIdx;
			if (res.haltParsing) {
				break;
			}
		} else {
			tokens.push({ type: "char", value: script[i] });
			i++;
		}
	}

	return tokens;
}
