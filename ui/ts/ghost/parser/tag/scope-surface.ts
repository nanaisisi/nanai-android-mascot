/**
 * @file scope-surface.ts
 * @brief スコープ・サーフィス・アニメーションタグのトークナイズ処理 (\0, \1, \p, \s, \i)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

export function tokenizeScopeSurfaceTag(
	script: string,
	i: number,
	_len: number,
) {
	const char = script[i];

	if (char === "0" || char === "h") {
		return {
			tokens: [{ type: "scope", value: 0 }],
			nextIdx: i + 1,
		};
	}

	if (char === "1" || char === "u") {
		return {
			tokens: [{ type: "scope", value: 1 }],
			nextIdx: i + 1,
		};
	}

	if (char === "p") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const scopeVal = Number.parseInt(parsed.content.trim(), 10) || 0;
				return {
					tokens: [{ type: "scope", value: scopeVal }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: curr + 1 };
		}
		if (/\d/.test(script[curr])) {
			return {
				tokens: [{ type: "scope", value: Number.parseInt(script[curr], 10) }],
				nextIdx: curr + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	if (char === "s") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const val = parsed.content.trim();
				const parsedId = Number.parseInt(val, 10);
				return {
					tokens: [
						{
							type: "surface",
							value: Number.isNaN(parsedId) ? 0 : parsedId,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: curr + 1 };
		}
		if (/\d/.test(script[curr])) {
			return {
				tokens: [{ type: "surface", value: Number.parseInt(script[curr], 10) }],
				nextIdx: curr + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	if (char === "i") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const parts = splitBracketArgs(parsed.content);
				const rawTarget = parts[0] ? parts[0].trim() : "";
				const animId = Number.parseInt(rawTarget, 10);
				const wait = parts[1]?.toLowerCase() === "wait";
				return {
					tokens: [
						{
							type: "animation",
							animId: Number.isNaN(animId) ? rawTarget : animId,
							wait,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: curr + 1 };
		}
		if (/\d/.test(script[curr])) {
			return {
				tokens: [
					{
						type: "animation",
						animId: Number.parseInt(script[curr], 10),
						wait: false,
					},
				],
				nextIdx: curr + 1,
			};
		}
		return { tokens: [], nextIdx: i };
	}

	return null;
}
