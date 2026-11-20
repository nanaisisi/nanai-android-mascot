/**
 * SSP 仕様準拠: ウィンドウドラッグ時のスナップ機能 (Snap X/Y) およびツールチップ表示
 */

export type SnapTargetType = "Character" | "Monitor" | "Initial" | "None";

export interface SnapResult {
	x: number;
	y: number;
	snapXType: SnapTargetType;
	snapYType: SnapTargetType;
}

export interface SnapWindowRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface SnapScreenBounds {
	x?: number;
	y?: number;
	width: number;
	height: number;
}

export interface MonitorLike {
	position?: { x: number; y: number } | null;
	size?: { width: number; height: number } | null;
	workArea?: {
		position?: { x: number; y: number } | null;
		size?: { width: number; height: number } | null;
	} | null;
	scaleFactor?: number | null;
}

export interface ResolvedMonitorWorkArea {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleFactor: number;
}

function findClosestAxisTarget(
	current: number,
	candidates: number[],
	snapThreshold: number,
): number | null {
	let bestDist = snapThreshold;
	let bestTarget: number | null = null;
	for (const candidate of candidates) {
		if (!Number.isFinite(candidate)) continue;
		const dist = Math.abs(current - candidate);
		if (dist < bestDist) {
			bestDist = dist;
			bestTarget = candidate;
		}
	}
	return bestTarget;
}

/**
 * 複数モニター候補から現在のウィンドウ位置に対応するワークスペース (タスクバー抜き workArea) を解決する
 */
export function pickMonitorWorkArea(
	monitors: Array<MonitorLike | null | undefined>,
	winX: number,
	winY: number,
	winWidth: number,
	winHeight: number,
	fallback: ResolvedMonitorWorkArea = {
		x: 0,
		y: 0,
		width: 1920,
		height: 1080,
		scaleFactor: 1,
	},
): ResolvedMonitorWorkArea {
	const centerX = winX + winWidth / 2;
	const centerY = winY + winHeight / 2;

	let bestDist2 = Number.POSITIVE_INFINITY;
	let bestArea: ResolvedMonitorWorkArea | null = null;

	for (const monitor of monitors) {
		if (!monitor) continue;
		const workPos = monitor.workArea?.position ?? monitor.position;
		const workSize = monitor.workArea?.size ?? monitor.size;
		if (
			!workSize ||
			!Number.isFinite(workSize.width) ||
			!Number.isFinite(workSize.height) ||
			workSize.width <= 0 ||
			workSize.height <= 0
		) {
			continue;
		}
		const wx = Number.isFinite(workPos?.x) ? (workPos?.x ?? 0) : 0;
		const wy = Number.isFinite(workPos?.y) ? (workPos?.y ?? 0) : 0;
		const ww = workSize.width;
		const wh = workSize.height;

		const hitPos = monitor.position ?? workPos;
		const hitSize = monitor.size ?? workSize;
		const hx = Number.isFinite(hitPos?.x) ? (hitPos?.x ?? wx) : wx;
		const hy = Number.isFinite(hitPos?.y) ? (hitPos?.y ?? wy) : wy;
		const hw =
			hitSize && Number.isFinite(hitSize.width) && hitSize.width > 0
				? hitSize.width
				: ww;
		const hh =
			hitSize && Number.isFinite(hitSize.height) && hitSize.height > 0
				? hitSize.height
				: wh;

		const dx = Math.max(hx - centerX, 0, centerX - (hx + hw));
		const dy = Math.max(hy - centerY, 0, centerY - (hy + hh));
		const dist2 = dx * dx + dy * dy;

		if (dist2 < bestDist2) {
			bestDist2 = dist2;
			const rawScale = monitor.scaleFactor;
			const scaleFactor =
				typeof rawScale === "number" &&
				Number.isFinite(rawScale) &&
				rawScale > 0
					? rawScale
					: 1;
			bestArea = {
				x: wx,
				y: wy,
				width: ww,
				height: wh,
				scaleFactor,
			};
			if (dist2 === 0) break;
		}
	}

	return bestArea ?? fallback;
}

/**
 * 他のキャラクターウィンドウ、タスクバー抜きワークスペース端 (Monitor)、および初期位置 (Initial) に対するスナップ位置計算
 */
export function calculateWindowSnap(
	currentX: number,
	currentY: number,
	winWidth: number,
	winHeight: number,
	otherWindows: SnapWindowRect[],
	screenSize: SnapScreenBounds,
	initialPos?: { x: number; y: number } | null,
	isCtrlPressed: boolean = false,
	snapThreshold: number = 12,
): SnapResult {
	if (isCtrlPressed || snapThreshold <= 0) {
		return { x: currentX, y: currentY, snapXType: "None", snapYType: "None" };
	}

	let snappedX = currentX;
	let snappedY = currentY;
	let snapXType: SnapTargetType = "None";
	let snapYType: SnapTargetType = "None";

	// 1. 初期位置 (Initial) スナップ判定
	if (initialPos) {
		if (
			Number.isFinite(initialPos.x) &&
			Math.abs(currentX - initialPos.x) < snapThreshold
		) {
			snappedX = initialPos.x;
			snapXType = "Initial";
		}
		if (
			Number.isFinite(initialPos.y) &&
			Math.abs(currentY - initialPos.y) < snapThreshold
		) {
			snappedY = initialPos.y;
			snapYType = "Initial";
		}
	}

	// 2. モニターワークスペース境界（タスクバー抜き Monitor）スナップ判定
	const monX = Number.isFinite(screenSize.x) ? (screenSize.x ?? 0) : 0;
	const monY = Number.isFinite(screenSize.y) ? (screenSize.y ?? 0) : 0;
	if (snapXType === "None" && Number.isFinite(screenSize.width)) {
		const monTargetX = findClosestAxisTarget(
			currentX,
			[monX, monX + screenSize.width - winWidth],
			snapThreshold,
		);
		if (monTargetX !== null) {
			snappedX = monTargetX;
			snapXType = "Monitor";
		}
	}

	if (snapYType === "None" && Number.isFinite(screenSize.height)) {
		const monTargetY = findClosestAxisTarget(
			currentY,
			[monY, monY + screenSize.height - winHeight],
			snapThreshold,
		);
		if (monTargetY !== null) {
			snappedY = monTargetY;
			snapYType = "Monitor";
		}
	}

	// 3. 他キャラウィンドウとの接触スナップ判定
	if (snapXType === "None") {
		const xCandidates: number[] = [];
		for (const other of otherWindows) {
			xCandidates.push(
				other.x + other.width,
				other.x - winWidth,
				other.x,
				other.x + other.width - winWidth,
			);
		}
		const charTargetX = findClosestAxisTarget(
			currentX,
			xCandidates,
			snapThreshold,
		);
		if (charTargetX !== null) {
			snappedX = charTargetX;
			snapXType = "Character";
		}
	}

	if (snapYType === "None") {
		const yCandidates: number[] = [];
		for (const other of otherWindows) {
			yCandidates.push(
				other.y,
				other.y + other.height - winHeight,
				other.y + other.height,
				other.y - winHeight,
			);
		}
		const charTargetY = findClosestAxisTarget(
			currentY,
			yCandidates,
			snapThreshold,
		);
		if (charTargetY !== null) {
			snappedY = charTargetY;
			snapYType = "Character";
		}
	}

	return {
		x: snappedX,
		y: snappedY,
		snapXType,
		snapYType,
	};
}

export interface CharacterSnapBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

const CHAR_BOUNDS_STORAGE_PREFIX = "nanai_char_bounds_";

export function saveCharacterBoundsForSnap(
	windowLabel: string,
	bounds: CharacterSnapBounds | null,
): void {
	if (typeof localStorage === "undefined" || !windowLabel) return;
	try {
		if (bounds && bounds.width > 0 && bounds.height > 0) {
			localStorage.setItem(
				`${CHAR_BOUNDS_STORAGE_PREFIX}${windowLabel}`,
				JSON.stringify(bounds),
			);
		} else {
			localStorage.removeItem(`${CHAR_BOUNDS_STORAGE_PREFIX}${windowLabel}`);
		}
	} catch {}
}

export function resolveOtherCharacterSnapRect(
	windowLabel: string,
	winX: number,
	winY: number,
	winWidth: number,
	winHeight: number,
): SnapWindowRect {
	if (typeof localStorage !== "undefined" && windowLabel) {
		try {
			const raw = localStorage.getItem(
				`${CHAR_BOUNDS_STORAGE_PREFIX}${windowLabel}`,
			);
			if (raw) {
				const b = JSON.parse(raw) as Partial<CharacterSnapBounds>;
				if (
					typeof b.x === "number" &&
					typeof b.y === "number" &&
					typeof b.width === "number" &&
					typeof b.height === "number" &&
					b.width > 0 &&
					b.height > 0
				) {
					return {
						x: winX + b.x,
						y: winY + b.y,
						width: b.width,
						height: b.height,
					};
				}
			}
		} catch {}
	}
	return { x: winX, y: winY, width: winWidth, height: winHeight };
}

/**
 * 画像要素の非透明ピクセル領域から、物理ピクセル単位の characterBounds を算出する。
 */
export function computeOpaqueImageBounds(
	img: HTMLImageElement | null,
	physicalScale: number,
): CharacterSnapBounds | null {
	const imgW = img ? img.naturalWidth || img.width : 0;
	const imgH = img ? img.naturalHeight || img.height : 0;
	if (
		!img?.complete ||
		imgW <= 0 ||
		imgH <= 0 ||
		typeof document === "undefined" ||
		typeof document.createElement !== "function"
	) {
		return null;
	}
	try {
		const tmp = document.createElement("canvas");
		tmp.width = imgW;
		tmp.height = imgH;
		const tctx = tmp.getContext?.("2d");
		if (!tctx) return null;
		tctx.drawImage(img, 0, 0, imgW, imgH);
		const data = tctx.getImageData(0, 0, imgW, imgH).data;
		let minX = imgW;
		let minY = imgH;
		let maxX = -1;
		let maxY = -1;
		for (let y = 0; y < imgH; y++) {
			const row = y * imgW * 4;
			for (let x = 0; x < imgW; x++) {
				if (data[row + x * 4 + 3] > 0) {
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}
		if (maxX >= minX && maxY >= minY) {
			return {
				x: Math.round(minX * physicalScale),
				y: Math.round(minY * physicalScale),
				width: Math.round((maxX - minX + 1) * physicalScale),
				height: Math.round((maxY - minY + 1) * physicalScale),
			};
		}
	} catch {}
	return null;
}

/**
 * キャラクターの非透明領域（characterBounds）を基準にスナップを計算し、
 * スナップ後のウィンドウ左上座標 (x, y) を返す。
 */
export function calculateCharacterSnap(
	windowX: number,
	windowY: number,
	windowWidth: number,
	windowHeight: number,
	characterBounds: CharacterSnapBounds | null | undefined,
	otherWindows: SnapWindowRect[],
	screenSize: SnapScreenBounds,
	initialPos?: { x: number; y: number } | null,
	isCtrlPressed: boolean = false,
	snapThreshold: number = 12,
): SnapResult {
	if (
		!characterBounds ||
		characterBounds.width <= 0 ||
		characterBounds.height <= 0
	) {
		return calculateWindowSnap(
			windowX,
			windowY,
			windowWidth,
			windowHeight,
			otherWindows,
			screenSize,
			initialPos,
			isCtrlPressed,
			snapThreshold,
		);
	}
	const offsetX = characterBounds.x;
	const offsetY = characterBounds.y;
	// 1. Initial スナップは initial 枠 (windowX, windowY) 基準で判定
	let snappedX = windowX;
	let snappedY = windowY;
	let snapXType: SnapTargetType = "None";
	let snapYType: SnapTargetType = "None";

	if (
		!isCtrlPressed &&
		snapThreshold > 0 &&
		initialPos &&
		Number.isFinite(initialPos.x) &&
		Number.isFinite(initialPos.y)
	) {
		if (Math.abs(windowX - initialPos.x) < snapThreshold) {
			snappedX = initialPos.x;
			snapXType = "Initial";
		}
		if (Math.abs(windowY - initialPos.y) < snapThreshold) {
			snappedY = initialPos.y;
			snapYType = "Initial";
		}
	}

	// 2. Monitor / Character スナップは character 枠基準で判定し、window 座標へ戻す
	if (snapXType === "None" || snapYType === "None") {
		const res = calculateWindowSnap(
			windowX + offsetX,
			windowY + offsetY,
			characterBounds.width,
			characterBounds.height,
			otherWindows,
			screenSize,
			null,
			isCtrlPressed,
			snapThreshold,
		);
		if (snapXType === "None" && res.snapXType !== "None") {
			snappedX = res.x - offsetX;
			snapXType = res.snapXType;
		}
		if (snapYType === "None" && res.snapYType !== "None") {
			snappedY = res.y - offsetY;
			snapYType = res.snapYType;
		}
	}

	return {
		x: snappedX,
		y: snappedY,
		snapXType,
		snapYType,
	};
}

/**
 * SSP 準拠のスナップツールチップ 2行プレーンテキスト生成
 * @param x X座標
 * @param y Y座標
 * @param snapXType X軸スナップ種別
 * @param snapYType Y軸スナップ種別
 * @param options オプション（coordsOnly: 座標表示のみモード, showCtrlHint: Ctrlヒントの表示制御）
 */
export function formatSnapTooltipText(
	x: number,
	y: number,
	snapXType: string = "None",
	snapYType: string = "None",
	options: { coordsOnly?: boolean; showCtrlHint?: boolean } = {},
): string {
	const roundedX = Math.round(x);
	const roundedY = Math.round(y);
	const { coordsOnly = false, showCtrlHint = true } = options;

	if (coordsOnly) {
		return `${roundedX},${roundedY}`;
	}

	const snapDetails: string[] = [];
	if (snapXType && snapXType !== "None") {
		snapDetails.push(`Snap X:${snapXType}`);
	}
	if (snapYType && snapYType !== "None") {
		snapDetails.push(`Snap Y:${snapYType}`);
	}

	const snapText = snapDetails.length > 0 ? ` (${snapDetails.join(", ")})` : "";
	const line1 = `${roundedX},${roundedY}${snapText}`;
	return showCtrlHint ? `${line1}\nPress Ctrl to disable` : line1;
}
