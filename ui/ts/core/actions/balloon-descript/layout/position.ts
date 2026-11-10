/**
 * @file position.js
 * @brief バルーン原点・数字表示座標・SSTPメッセージ座標・ウィンドウ初期位置設定反映 (UKADOC準拠)
 */

export function applyPositionProperties(
	root: HTMLElement,
	props: object,
	instance: { windowPositionLimit?: boolean } = {},
) {
	// [origin.x,座標], [origin.y,座標]:
	const ox = parseInt(props["origin.x"], 10);
	const oy = parseInt(props["origin.y"], 10);
	if (!Number.isNaN(ox)) {
		root.style.setProperty("--balloon-origin-x", `${ox}px`);
	}
	if (!Number.isNaN(oy)) {
		root.style.setProperty("--balloon-origin-y", `${oy}px`);
	}

	// [number.x,座標], [number.y,座標], [number.xr,座標], [number.yb,座標]:
	const numX = parseInt(props["number.x"], 10);
	const numY = parseInt(props["number.y"], 10);
	const numXR = parseInt(props["number.xr"], 10);
	const numYB = parseInt(props["number.yb"], 10);
	if (!Number.isNaN(numX))
		root.style.setProperty("--balloon-number-x", `${numX}px`);
	if (!Number.isNaN(numY))
		root.style.setProperty("--balloon-number-y", `${numY}px`);
	if (!Number.isNaN(numXR))
		root.style.setProperty("--balloon-number-xr", `${numXR}px`);
	if (!Number.isNaN(numYB))
		root.style.setProperty("--balloon-number-yb", `${numYB}px`);

	// [sstpmessage.x,座標], [sstpmessage.y,座標], [sstpmessage.xr,座標], [sstpmessage.yb,座標]:
	const sstpX = parseInt(props["sstpmessage.x"], 10);
	const sstpY = parseInt(props["sstpmessage.y"], 10);
	const sstpXR = parseInt(props["sstpmessage.xr"], 10);
	const sstpYB = parseInt(props["sstpmessage.yb"], 10);
	if (!Number.isNaN(sstpX))
		root.style.setProperty("--balloon-sstpmessage-x", `${sstpX}px`);
	if (!Number.isNaN(sstpY))
		root.style.setProperty("--balloon-sstpmessage-y", `${sstpY}px`);
	if (!Number.isNaN(sstpXR))
		root.style.setProperty("--balloon-sstpmessage-xr", `${sstpXR}px`);
	if (!Number.isNaN(sstpYB))
		root.style.setProperty("--balloon-sstpmessage-yb", `${sstpYB}px`);

	// [windowposition.x,座標], [windowposition.y,座標], [windowposition.limit,0/1]:
	const wpX = parseInt(props["windowposition.x"], 10);
	const wpY = parseInt(props["windowposition.y"], 10);
	if (!Number.isNaN(wpX))
		root.style.setProperty("--balloon-windowpos-x", `${wpX}px`);
	if (!Number.isNaN(wpY))
		root.style.setProperty("--balloon-windowpos-y", `${wpY}px`);

	const winLimit =
		props["windowposition.limit"] === "1" ||
		props["windowposition.limit"]?.toLowerCase() === "true";
	if (instance) {
		instance.windowPositionLimit = winLimit;
	}
}
