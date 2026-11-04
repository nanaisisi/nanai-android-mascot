/**
 * surfaces.txt パーサー共通ユーティリティ
 */

/**
 * "0-5,10,12" や SSP 専用除外指定 "1-30,!15,!20-25" のような範囲文字列を展開して文字列配列にする。
 * "!" による除外指定は記述位置によらず最優先される。
 * @param {string} rangeStr
 * @returns {string[]}
 */
export function expandSurfaceRange(rangeStr) {
	const included = [];
	const excluded = new Set();

	rangeStr.split(",").forEach((rawPart) => {
		let part = rawPart.trim().replace(/^\[/, "").replace(/\]$/, "");
		if (!part) return;

		const isExclude = part.startsWith("!");
		if (isExclude) {
			part = part.slice(1).trim();
		}

		if (part.includes("-")) {
			const [sStr, eStr] = part.split("-");
			const start = Number.parseInt(sStr, 10);
			const end = Number.parseInt(eStr, 10);
			if (!Number.isNaN(start) && !Number.isNaN(end)) {
				if (start <= end) {
					for (let i = start; i <= end; i++) {
						if (isExclude) {
							excluded.add(String(i));
						} else {
							included.push(String(i));
						}
					}
				}
				return;
			}
		}

		const num = Number.parseInt(part, 10);
		if (!Number.isNaN(num)) {
			if (isExclude) {
				excluded.add(String(num));
			} else {
				included.push(String(num));
			}
		} else if (!isExclude && part.length > 0) {
			included.push(part);
		}
	});

	if (excluded.size === 0) {
		return included;
	}
	return included.filter((id) => !excluded.has(id));
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
