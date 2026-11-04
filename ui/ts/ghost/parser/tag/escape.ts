/**
 * @file escape.ts
 * @brief エスケープ文字（\\, \%, \&[ID]）のトークナイズ処理
 */

import { readBracketContent } from "../bracket-utils.js";

export function tokenizeEscapeTag(script: string, i: number, len: number) {
	if (i >= len) {
		return null;
	}

	if (script[i] === "\\") {
		return {
			tokens: [{ type: "char", value: "\\" }],
			nextIdx: i + 1,
		};
	}

	if (script[i] === "%") {
		return {
			tokens: [{ type: "char", value: "%" }],
			nextIdx: i + 1,
		};
	}

	if (script[i] === "&" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const id = parsed.content.trim().toLowerCase();
			let resolved = "";
			switch (id) {
				case "amp":
					resolved = "&";
					break;
				case "lt":
					resolved = "<";
					break;
				case "gt":
					resolved = ">";
					break;
				case "quot":
					resolved = '"';
					break;
				case "apos":
					resolved = "'";
					break;
				case "nbsp":
					resolved = " ";
					break;
				default:
					resolved = `&[${parsed.content}]`;
					break;
			}
			return {
				tokens: resolved.split("").map((ch) => ({ type: "char", value: ch })),
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	return null;
}
