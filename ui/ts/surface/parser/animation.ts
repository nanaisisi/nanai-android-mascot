/**
 * surfaces.txt SERIKO アニメーションハンドラー
 */

import { splitProtectedCommas } from "./utils.js";

export {
	handleAnimationCollision,
	handleAnimationCollisionEx,
} from "./animation-collision.js";

/**
 * animation*.interval 行のパースと登録
 */
export function handleAnimationInterval(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
) {
	// SERIKO/2 animation[ID].interval / SERIKO/1 [ID]interval
	const match = trimmed.match(/^(?:animation)?(\d+)\.?interval,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const interval = match[2].trim();
	currentSurfaces.forEach((s: string | number) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval, patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		} else {
			anim.interval = interval;
		}
	});
}

/**
 * animation*.name 行のパースと登録
 */
export function handleAnimationName(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
) {
	// SERIKO/2 animation[ID].name,定義名 / SERIKO/1 [ID]name,定義名
	const match = trimmed.match(/^(?:animation)?(\d+)\.?name,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const nameStr = match[2].trim();
	currentSurfaces.forEach((s: string | number) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval: "sometimes", patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		anim.name = nameStr;
	});
}

/**
 * animation*.option 行のパースと登録
 */
export function handleAnimationOption(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
) {
	// SERIKO/2 animation[ID].option,exclusive / SERIKO/1 [ID]option,exclusive
	const match = trimmed.match(/^(?:animation)?(\d+)\.?option,\s*(.+)$/);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const optionStr = match[2].trim();
	currentSurfaces.forEach((s: string | number) => {
		if (!animations[s]) animations[s] = [];
		if (!animationMaps[s]) animationMaps[s] = {};
		let anim = animationMaps[s][animId];
		if (!anim) {
			anim = { id: animId, interval: "sometimes", patterns: [] };
			animationMaps[s][animId] = anim;
			animations[s].push(anim);
		}
		if (!anim.options) anim.options = [];
		anim.options.push(optionStr);
	});
}

/**
 * animation*.pattern 行のパースと登録
 */
export function handleAnimationPattern(
	trimmed: string,
	currentSurfaces: unknown[],
	animations: { [x: string]: unknown[] },
	animationMaps: { [x: string]: unknown[] },
) {
	// SERIKO/2: animation[ID].pattern[P],method,surface,wait,x,y
	// SERIKO/1: [ID]pattern[P],surface,wait,method,x,y
	const match = trimmed.match(
		/^(?:animation)?(\d+)\.?(?:pattern)(\d+),\s*(.+)$/,
	);
	if (!match) return;

	const animId = Number.parseInt(match[1], 10);
	const index = Number.parseInt(match[2], 10);

	// 括弧内のカンマを保護しながら分割
	const rawValue = match[3];
	const parts = splitProtectedCommas(rawValue);

	const legacy = !trimmed.startsWith("animation");
	const rawType = (legacy ? parts[2] : parts[0]) || "";
	const typeLower = rawType.trim().toLowerCase();
	const isControlMethod =
		typeLower.startsWith("start") ||
		typeLower.startsWith("stop") ||
		typeLower.startsWith("alternativestart") ||
		typeLower.startsWith("alternativestop") ||
		typeLower.startsWith("parallelstart") ||
		typeLower.startsWith("parallelstop");

	if (parts.length >= 3 || (isControlMethod && parts.length >= 1)) {
		const surface = (legacy ? parts[0] : (parts[1] ?? "-1"))?.trim() ?? "-1";
		const wait = Number.parseInt(legacy ? parts[1] : (parts[2] ?? "0"), 10);
		const x = Number.parseInt(parts[3], 10) || 0;
		const y = Number.parseInt(parts[4], 10) || 0;

		let targetParam = "";
		if (isControlMethod) {
			if (legacy) {
				targetParam = surface;
			} else {
				targetParam = parts[1] ?? "";
			}
		}

		currentSurfaces.forEach((s: string | number) => {
			if (!animations[s]) animations[s] = [];
			if (!animationMaps[s]) animationMaps[s] = {};
			let anim = animationMaps[s][animId];
			if (!anim) {
				anim = { id: animId, interval: "sometimes", patterns: [] };
				animationMaps[s][animId] = anim;
				animations[s].push(anim);
			}
			const patternEntry: any = {
				surface,
				wait: Number.isNaN(wait) ? 0 : wait * (legacy ? 10 : 1),
				type: typeLower,
				x,
				y,
				index,
			};
			if (targetParam) {
				patternEntry.targetParam = targetParam;
			}
			anim.patterns.push(patternEntry);
		});
	}
}

/**
 * 全アニメーションのパターンインデックスソートと不要プロパティの除去
 */
export function finalizeAnimations(
	animations: { [s: string]: unknown } | ArrayLike<unknown>,
) {
	for (const animList of Object.values(animations)) {
		for (const anim of animList as any[]) {
			anim.patterns = anim.patterns
				.sort((a: { index: number }, b: { index: number }) => a.index - b.index)
				.map(({ index, ...pattern }: any) => pattern);
		}
	}
}
