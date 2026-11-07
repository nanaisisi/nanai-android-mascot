/**
 * @file text-format.ts
 * @brief 改行・クリア・ポーズ・描画速度・フォントタグのトークナイズ処理 (\n, \c, \x, \_q, \f)
 */

import { readBracketContent, splitBracketArgs } from "../bracket-utils.js";

export function tokenizeTextFormatTag(script: string, i: number, _len: number) {
	const char = script[i];

	if (char === "_" && script[i + 1] === "n") {
		return {
			tokens: [{ type: "no_autowrap" }],
			nextIdx: i + 2,
		};
	}

	if (char === "_" && (script[i + 1] === "?" || script[i + 1] === "!")) {
		return {
			tokens: [
				{
					type: "raw_toggle",
					active: true,
					delimiter: `_${script[i + 1]}`,
				},
			],
			nextIdx: i + 2,
		};
	}

	if (char === "n") {
		const curr = i + 1;
		if (script.substr(curr, 6) === "[half]") {
			return {
				tokens: [{ type: "newline", half: true }],
				nextIdx: curr + 6,
			};
		}
		return {
			tokens: [{ type: "newline", half: false }],
			nextIdx: curr,
		};
	}

	if (char === "c") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const parts = splitBracketArgs(parsed.content);
				if (parts[0] === "char" || parts[0] === "line") {
					return {
						tokens: [
							{
								type: "clear",
								mode: parts[0],
								count: Number.parseInt(parts[1], 10) || 1,
							},
						],
						nextIdx: parsed.nextIdx,
					};
				}
				return {
					tokens: [{ type: "clear" }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [{ type: "clear" }], nextIdx: curr };
		}
		return { tokens: [{ type: "clear" }], nextIdx: curr };
	}

	if (char === "x") {
		const curr = i + 1;
		if (script[curr] === "[") {
			const parsed = readBracketContent(script, curr);
			if (parsed) {
				const opt = parsed.content.trim().toLowerCase();
				return {
					tokens: [
						{
							type: "pause",
							noClear: opt === "noclear",
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [{ type: "pause" }], nextIdx: curr };
		}
		return { tokens: [{ type: "pause" }], nextIdx: curr };
	}

	if (char === "_" && script[i + 1] === "q") {
		if (script[i + 2] === "[") {
			const parsed = readBracketContent(script, i + 2);
			if (parsed) {
				const val = parsed.content.trim();
				return {
					tokens: [
						{
							type: "quick_toggle",
							value: val !== "0" && val !== "false",
						},
					],
					nextIdx: parsed.nextIdx,
				};
			}
			return {
				tokens: [{ type: "quick_toggle", value: true }],
				nextIdx: i + 2,
			};
		}
		return {
			tokens: [{ type: "quick_toggle", value: undefined }],
			nextIdx: i + 2,
		};
	}

	if (char === "_" && script[i + 1] === "u" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const raw = parsed.content.trim();
			const code =
				raw.startsWith("0x") || raw.startsWith("0X")
					? Number.parseInt(raw.slice(2), 16)
					: Number.parseInt(raw, 10);
			if (!Number.isNaN(code) && code >= 0 && code <= 0x10ffff) {
				return {
					tokens: [{ type: "char", value: String.fromCodePoint(code) }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	if (char === "_" && script[i + 1] === "m" && script[i + 2] === "[") {
		const parsed = readBracketContent(script, i + 2);
		if (parsed) {
			const raw = parsed.content.trim();
			const code =
				raw.startsWith("0x") || raw.startsWith("0X")
					? Number.parseInt(raw.slice(2), 16)
					: Number.parseInt(raw, 10);
			if (!Number.isNaN(code) && code >= 0 && code <= 0xff) {
				return {
					tokens: [{ type: "char", value: String.fromCharCode(code) }],
					nextIdx: parsed.nextIdx,
				};
			}
			return { tokens: [], nextIdx: parsed.nextIdx };
		}
		return { tokens: [], nextIdx: i + 2 };
	}

	if (char === "f" && script[i + 1] === "[") {
		const parsed = readBracketContent(script, i + 1);
		if (parsed) {
			const parts = splitBracketArgs(parsed.content);
			return {
				tokens: [
					{
						type: "font",
						tag: parts[0] || "",
						param: parts.length > 1 ? parts.slice(1).join(",") : null,
					},
				],
				nextIdx: parsed.nextIdx,
			};
		}
		return { tokens: [], nextIdx: i + 1 };
	}

	return null;
}
