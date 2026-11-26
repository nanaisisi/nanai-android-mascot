/**
 * @file click.ts
 * @brief Click, stroke, and multiple-click mouse event handlers
 */

import { invoke, isTauriAvailable } from "../../tauri-helper.js";

export type MouseApp = import("../../../../main.js").NanaiAndroidMascotApp & {
	playSakuraScript?: (script: string) => void;
	getCollisionInfo: (
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId?: number,
	) => { name?: string; canvasX: number; canvasY: number; scopeId?: number };
};

interface ShioriEventResponse {
	status?: number;
	value?: unknown;
	script?: unknown;
}

/**
 * Check whether time-critical SakuraScript playback currently suppresses mouse events.
 */
export function isTimeCriticalPlaying(app: unknown): boolean {
	const a = app as MouseApp | null | undefined;
	return Boolean(a?.sakuraPlayer?.timeCritical && a?.sakuraPlayer?.isPlaying);
}

/**
 * Extract playable SakuraScript text from a SHIORI event response.
 */
export function extractShioriScript(res: unknown): string | undefined {
	const r = res as ShioriEventResponse | null | undefined;
	const script = r?.status === 200 && r?.value ? r.value : r?.script;
	return (script as string) || undefined;
}

/**
 * Dispatch a SHIORI mouse event and invoke `playSakuraScript` if a script is returned.
 */
export function dispatchShioriMouseEvent(
	app: unknown,
	eventName: string,
	args: unknown[],
): Promise<unknown> {
	const a = app as MouseApp;
	const res = a.ghostController.sendShioriEvent(eventName, args);
	return Promise.resolve(res).then((r) => {
		const script = extractShioriScript(r);
		if (script) {
			a.playSakuraScript?.(script);
		}
		return r;
	});
}

/**
 * Resolve collision coordinates and dispatch a SHIORI mouse event with script playback.
 */
export function dispatchCollisionMouseEvent(
	app: unknown,
	clientX: number | undefined,
	clientY: number | undefined,
	rect: unknown,
	scopeId: number,
	eventName: string,
	buildArgs: (col: {
		canvasX: number;
		canvasY: number;
		name?: string;
	}) => unknown[],
): Promise<unknown> | undefined {
	const a = app as MouseApp;
	if (isTimeCriticalPlaying(a)) return;
	const col = a.getCollisionInfo(clientX, clientY, rect, scopeId);
	return dispatchShioriMouseEvent(a, eventName, buildArgs(col));
}

export function onGhostClick(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
	clickType: "single" | "double" = "single",
	device: string = "mouse",
) {
	const app = this as MouseApp;
	if (isTimeCriticalPlaying(app)) return;
	const col = app.getCollisionInfo(clientX, clientY, rect, scopeId);
	console.log(
		`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${col.name || "なし"} (X:${col.canvasX}, Y:${col.canvasY})`,
	);
	if (isTauriAvailable()) {
		invoke("on_mouse_click").catch(() => {});
	}

	const args = [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		0,
		device,
	];

	if (clickType === "single") {
		return dispatchShioriMouseEvent(app, "OnMouseClick", args);
	}

	const res = app.ghostController.sendShioriEvent("OnMouseDoubleClick", args);
	return Promise.resolve(res).then((r: unknown) => {
		const script = extractShioriScript(r);
		if (script) {
			app.playSakuraScript?.(script);
			return r;
		}
		return dispatchShioriMouseEvent(app, "OnMouseClick", args);
	});
}

export function onGhostStroke(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	const app = this as MouseApp;
	if (isTimeCriticalPlaying(app)) return;
	const col = app.getCollisionInfo(clientX, clientY, rect, scopeId);
	console.log(
		`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${col.name || "なし"}`,
	);
	return dispatchShioriMouseEvent(app, "OnMouseMove", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
	]);
}

export function onGhostMultipleClick(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	count: number = 3,
	button: number | string = 0,
	device: string = "mouse",
	scopeId: number = 0,
	isEx: boolean = false,
) {
	const eventName = isEx ? "OnMouseMultipleClickEx" : "OnMouseMultipleClick";
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		eventName,
		(col) => [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
			count,
		],
	);
}
