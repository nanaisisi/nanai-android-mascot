/**
 * @file skip.ts
 * @brief 未知タグ・引数ブラケットのスキップ処理
 */

import { readBracketContent } from "../bracket-utils.js";

export function skipUnknownTag(script: string, i: number, len: number) {
	const char = script[i];
	let nextIdx = i + 1;

	if (char === "_") {
		while (
			nextIdx < len &&
			script[nextIdx] !== "[" &&
			script[nextIdx] !== "\\"
		) {
			nextIdx++;
		}
	}

	if (nextIdx < len && script[nextIdx] === "[") {
		const parsed = readBracketContent(script, nextIdx);
		if (parsed) {
			nextIdx = parsed.nextIdx;
		} else {
			nextIdx++;
		}
	}

	return {
		tokens: [],
		nextIdx,
	};
}
