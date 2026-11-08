/**
 * surfaces.txt element ハンドラー
 */

/**
 * element 行のパースと登録
 * @param {string} trimmed
 * @param {string[]} currentSurfaces
 * @param {Record<string, import('../surface-parser.js').SurfaceElement[]>} elements
 */
export function handleElement(
	trimmed: string,
	currentSurfaces: unknown[],
	elements: {
		[x: string]: { type: unknown; file: unknown; x: number; y: number }[];
	},
) {
	const parts = trimmed.split(",");
	if (parts.length < 5) return;

	const type = parts[1].trim().toLowerCase();
	const file = parts[2].trim();
	const x = Number.parseInt(parts[3], 10) || 0;
	const y = Number.parseInt(parts[4], 10) || 0;

	currentSurfaces.forEach((s: string | number) => {
		if (!elements[s]) elements[s] = [];
		elements[s].push({ type, file, x, y });
	});
}
