/**
 * surfaces.txt パーサー共通ユーティリティ
 */

/**
 * "0-5,10,12" のような範囲文字列を展開して文字列配列にする
 * @param {string} rangeStr
 * @returns {string[]}
 */
export function expandSurfaceRange(rangeStr) {
	const res = [];
	rangeStr.split(",").forEach((part) => {
		if (part.includes("-")) {
			const [start, end] = part.split("-").map((v) => Number.parseInt(v, 10));
			for (let i = start; i <= end; i++) res.push(String(i));
		} else {
			res.push(part.trim());
		}
	});
	return res;
}

/**
 * 括弧 `()` やブラケット `[]` 内のカンマを保護しながらカンマで分割する
 * @param {string} rawValue
 * @returns {string[]}
 */
export function splitProtectedCommas(rawValue) {
	const parts = [];
	let current = "";
	let depthParen = 0;
	let depthBracket = 0;
	for (let i = 0; i < rawValue.length; i++) {
		const ch = rawValue[i];
		if (ch === "(") depthParen++;
		else if (ch === ")") depthParen = Math.max(0, depthParen - 1);
		else if (ch === "[") depthBracket++;
		else if (ch === "]") depthBracket = Math.max(0, depthBracket - 1);
		else if (ch === "," && depthParen === 0 && depthBracket === 0) {
			parts.push(current.trim());
			current = "";
			continue;
		}
		current += ch;
	}
	if (current.trim().length > 0) parts.push(current.trim());
	return parts;
}
