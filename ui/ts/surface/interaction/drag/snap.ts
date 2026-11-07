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

/**
 * 他のキャラクターウィンドウ、画面端 (Monitor)、および初期位置 (Initial) に対するスナップ位置計算
 */
export function calculateWindowSnap(
	currentX: number,
	currentY: number,
	winWidth: number,
	winHeight: number,
	otherWindows: Array<{ x: number; y: number; width: number; height: number }>,
	screenSize: { width: number; height: number },
	initialPos?: { x: number; y: number } | null,
	isCtrlPressed: boolean = false,
	snapThreshold: number = 12,
): SnapResult {
	if (isCtrlPressed) {
		return { x: currentX, y: currentY, snapXType: "None", snapYType: "None" };
	}

	let snappedX = currentX;
	let snappedY = currentY;
	let snapXType: SnapTargetType = "None";
	let snapYType: SnapTargetType = "None";

	// 1. 初期位置 (Initial) スナップ判定
	if (initialPos) {
		if (Math.abs(currentX - initialPos.x) < snapThreshold) {
			snappedX = initialPos.x;
			snapXType = "Initial";
		}
		if (Math.abs(currentY - initialPos.y) < snapThreshold) {
			snappedY = initialPos.y;
			snapYType = "Initial";
		}
	}

	// 2. モニター境界（画面端 Monitor）スナップ判定
	if (snapXType === "None") {
		if (Math.abs(currentX) < snapThreshold) {
			snappedX = 0;
			snapXType = "Monitor";
		} else if (Math.abs(currentX + winWidth - screenSize.width) < snapThreshold) {
			snappedX = screenSize.width - winWidth;
			snapXType = "Monitor";
		}
	}

	if (snapYType === "None") {
		if (Math.abs(currentY) < snapThreshold) {
			snappedY = 0;
			snapYType = "Monitor";
		} else if (Math.abs(currentY + winHeight - screenSize.height) < snapThreshold) {
			snappedY = screenSize.height - winHeight;
			snapYType = "Monitor";
		}
	}

	// 3. 他キャラウィンドウとの接触スナップ判定
	for (const other of otherWindows) {
		if (snapXType === "None") {
			if (Math.abs(currentX - (other.x + other.width)) < snapThreshold) {
				snappedX = other.x + other.width;
				snapXType = "Character";
			} else if (Math.abs(currentX + winWidth - other.x) < snapThreshold) {
				snappedX = other.x - winWidth;
				snapXType = "Character";
			}
		}

		if (snapYType === "None") {
			if (Math.abs(currentY - other.y) < snapThreshold) {
				snappedY = other.y;
				snapYType = "Character";
			} else if (Math.abs(currentY + winHeight - (other.y + other.height)) < snapThreshold) {
				snappedY = other.y + other.height - winHeight;
				snapYType = "Character";
			}
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
 * SSP 準拠のスナップツールチップ HTML テキスト生成
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
	if (snapXType !== "None") snapDetails.push(`Snap X:${snapXType}`);
	if (snapYType !== "None") snapDetails.push(`Snap Y:${snapYType}`);

	const snapText = snapDetails.length > 0 ? ` (${snapDetails.join(", ")})` : "";
	const ctrlHint = showCtrlHint
		? `<br><span style="font-size: 10px; opacity: 0.8;">Press Ctrl to disable</span>`
		: "";

	return `${roundedX},${roundedY}${snapText}${ctrlHint}`;
}
