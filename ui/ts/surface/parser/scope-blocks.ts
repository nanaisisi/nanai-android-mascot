/**
 * surfaces.txt *.cursor および *.tooltips スコープブロックハンドラー
 */

/**
 * スコープブロック開始行判定
 * @param {string} trimmed
 * @param {Record<string, Array<{ event: string, collision: string, cursor: string }>>} cursors
 * @param {Record<string, Record<string, string>>} tooltips
 * @returns {{ type: 'cursor'|'tooltip', scope: string } | null | false}
 */
export function matchScopeBlockHeader(
	trimmed: string,
	cursors: { [x: string]: never[] },
	tooltips: { [x: string]: unknown },
) {
	// *.cursor ブロック開始判定
	const cursorMatch = trimmed.match(
		/^(sakura|kero|char\d+|\*)?\.?cursor\s*\{?$/i,
	);
	if (cursorMatch) {
		let scope = (cursorMatch[1] || "*").toLowerCase();
		if (scope === "char0") scope = "sakura";
		if (scope === "char1") scope = "kero";
		if (!cursors[scope]) cursors[scope] = [];
		return { type: "cursor", scope };
	}

	// *.tooltips ブロック開始判定
	const tooltipsMatch = trimmed.match(
		/^(sakura|kero|char\d+|\*)?\.?tooltips\s*\{?$/i,
	);
	if (tooltipsMatch) {
		let scope = (tooltipsMatch[1] || "*").toLowerCase();
		if (scope === "char0") scope = "sakura";
		if (scope === "char1") scope = "kero";
		if (!tooltips[scope]) tooltips[scope] = {};
		return { type: "tooltip", scope };
	}

	return false;
}

/**
 * スコープブロック内の行パース
 * @param {string} trimmed
 * @param {{ type: 'cursor'|'tooltip', scope: string }} currentScopeBlock
 * @param {Record<string, Array<{ event: string, collision: string, cursor: string }>>} cursors
 * @param {Record<string, Record<string, string>>} tooltips
 */
export function handleScopeBlockLine(
	trimmed: string,
	currentScopeBlock: { type: string; scope: string | number },
	cursors: {
		[x: string]: { event: unknown; collision: unknown; cursor: unknown }[];
	},
	tooltips: { [x: string]: { [x: string]: unknown } },
) {
	if (currentScopeBlock.type === "cursor") {
		const parts = trimmed.split(",");
		if (parts.length >= 3) {
			const rawEvent = parts[0].trim().toLowerCase();
			const collision = parts[1].trim();
			const cursor = parts[2].trim();
			let event = rawEvent;
			if (rawEvent.startsWith("mouseup")) event = "mouseup";
			else if (rawEvent.startsWith("mousedown")) event = "mousedown";
			else if (rawEvent.startsWith("mouserightdown")) event = "mouserightdown";
			else if (rawEvent.startsWith("mousewheel")) event = "mousewheel";
			else if (rawEvent.startsWith("mousehover")) event = "mousehover";

			cursors[currentScopeBlock.scope].push({ event, collision, cursor });
		}
		return;
	}

	if (currentScopeBlock.type === "tooltip") {
		const commaIdx = trimmed.indexOf(",");
		if (commaIdx !== -1) {
			const collision = trimmed.slice(0, commaIdx).trim();
			const text = trimmed.slice(commaIdx + 1).trim();
			if (collision) {
				tooltips[currentScopeBlock.scope][collision] = text;
			}
		}
	}
}
