/**
 * @file wait.ts
 * @brief ウェイト・タイムアウト・停止・終了タグのトークナイズ処理 (\w, \_w, \__w, \t, \-, \e)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

export function tokenizeWaitTag(script: string, i: number, _len: number) {
	const char = script[i];

	if (char === "w" && /\d/.test(script[i + 1])) {
		const weight = Number.parseInt(script[i + 1], 10);
		return {
			tokens: [{ type: "wait", value: weight * 50 }],
			nextIdx: i + 2,
		};
	}

	if (char === "_" && script[i + 1] === "w" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const ms = Number.parseInt(parsed.content.trim(), 10) || 100;
			return {
				tokens: [{ type: "wait", value: ms }],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	if (
		char === "_" &&
		script[i + 1] === "_" &&
		script[i + 2] === "w" &&
		script[i + 3] === "["
	) {
		const parsed = readBracketContent(script, i + 3);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			if (parts[0]?.toLowerCase() === "animation" && parts[1]) {
				const rawTarget = parts[1];
				const num = Number.parseInt(rawTarget, 10);
				return {
					tokens: [
						{
							type: "wait_animation",
							animId: Number.isNaN(num) ? rawTarget : num,
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 3 };
	}

	if (char === "t") {
		return {
			tokens: [{ type: "timeout" }],
			nextIdx: i + 1,
		};
	}

	if (char === "-") {
		return {
			tokens: [{ type: "halt" }],
			nextIdx: i + 1,
		};
	}

	if (char === "e") {
		return {
			tokens: [{ type: "end" }],
			nextIdx: i + 1,
			haltParsing: true,
		};
	}

	return null;
}
