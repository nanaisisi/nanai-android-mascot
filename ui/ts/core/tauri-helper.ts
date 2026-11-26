/**
 * Tauri API Helper
 * `@tauri-apps/api` の公式バインディングを使用しつつ、
 * Web/ブラウザ単体プレビュー時やフォールバック環境でも動作するようにラップします。
 */
import {
	convertFileSrc as tauriConvertFileSrc,
	invoke as tauriInvoke,
} from "@tauri-apps/api/core";
import {
	emit as tauriEmit,
	listen as tauriListen,
} from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";

interface AndroidOverlayIpcBridge {
	invoke?: (reqId: string, cmd: string, argsJson: string) => void;
	emitEvent?: (eventName: string, payloadJson: string) => void;
	moveWindowBy?: (dx: number, dy: number) => void;
	getWindowPosition?: () => string;
}

const overlayPending = new Map<
	string,
	{ resolve: (v: unknown) => void; reject: (err: unknown) => void }
>();
const overlayEventListeners = new Map<string, Set<(event: unknown) => void>>();
let overlayReqSeq = 0;

const gOverlay = globalThis as unknown as {
	__NANAI_OVERLAY_IPC__?: AndroidOverlayIpcBridge;
	__NANAI_OVERLAY_IPC_RESOLVE__?: (
		reqId: string,
		ok: boolean,
		payloadJson: string,
	) => void;
	__NANAI_OVERLAY_EVENT_DISPATCH__?: (
		eventName: string,
		payloadJson: string,
	) => void;
};

gOverlay.__NANAI_OVERLAY_EVENT_DISPATCH__ = (
	eventName: string,
	payloadJson: string,
) => {
	const listeners = overlayEventListeners.get(eventName);
	if (!listeners || listeners.size === 0) return;
	let payload: unknown = payloadJson;
	try {
		payload = JSON.parse(payloadJson);
	} catch (_err) {}
	const eventObj = { event: eventName, payload };
	for (const handler of Array.from(listeners)) {
		try {
			handler(eventObj);
		} catch (err) {
			console.warn(`Overlay event handler error (${eventName}):`, err);
		}
	}
};

gOverlay.__NANAI_OVERLAY_IPC_RESOLVE__ = (
	reqId: string,
	ok: boolean,
	payloadJson: string,
) => {
	const entry = overlayPending.get(reqId);
	if (!entry) return;
	overlayPending.delete(reqId);
	try {
		const parsed = JSON.parse(payloadJson);
		if (ok) {
			entry.resolve(parsed);
		} else {
			entry.reject(
				new Error(typeof parsed === "string" ? parsed : payloadJson),
			);
		}
	} catch (err) {
		if (ok) entry.resolve(payloadJson);
		else entry.reject(err);
	}
};

export function isOverlayWindow(): boolean {
	if (typeof location === "undefined") return false;
	return new URLSearchParams(location.search).get("overlay") === "1";
}

export function isOverlayIpcAvailable(): boolean {
	return Boolean(gOverlay.__NANAI_OVERLAY_IPC__?.invoke);
}

/**
 * Tauri環境で動作しているかどうかを判定
 */
export function isTauriAvailable(): boolean {
	if (isOverlayIpcAvailable()) return true;
	const g = globalThis as unknown as Record<string, unknown>;
	const win =
		typeof window !== "undefined"
			? window
			: (g.window as Window & { location?: Location; navigator?: Navigator });
	const loc = win?.location;
	const nav = win?.navigator;

	return (
		!!g.__TAURI__ ||
		!!g.__TAURI_INTERNALS__ ||
		!!g.__TAURI_IPC__ ||
		!!g.__TAURI_POST_MESSAGE__ ||
		typeof g.ipc === "function" ||
		typeof (g as { rpc?: unknown }).rpc === "function" ||
		!!(nav?.userAgent && /Tauri/i.test(nav.userAgent)) ||
		!!(
			loc &&
			(loc.protocol?.startsWith("tauri") ||
				loc.hostname === "tauri.localhost" ||
				loc.hostname === "tauri.app")
		)
	);
}

/**
 * 静的コンパイル時確定: Windows / デスクトップ環境かどうかを判定
 */
export function isWindowsDesktop(): boolean {
	if (typeof __IS_WINDOWS__ !== "undefined") {
		return __IS_WINDOWS__;
	}
	if (typeof navigator !== "undefined" && navigator.userAgent) {
		return /Windows|Win32|Win64|x86_64|WOW64/i.test(navigator.userAgent);
	}
	return typeof process !== "undefined" && process.platform === "win32";
}

/**
 * 静的コンパイル時確定: Android / モバイル環境かどうかを判定
 */
export function isAndroidMobile(): boolean {
	if (typeof __IS_ANDROID__ !== "undefined") {
		return __IS_ANDROID__;
	}
	if (isWindowsDesktop()) return false;
	if (typeof navigator === "undefined" || !navigator.userAgent) return false;
	return /Android/i.test(navigator.userAgent);
}

export function getOverlayWindowOrigin(): { x: number; y: number } {
	if (gOverlay.__NANAI_OVERLAY_IPC__?.getWindowPosition) {
		try {
			const parsed = JSON.parse(
				gOverlay.__NANAI_OVERLAY_IPC__.getWindowPosition(),
			) as { x?: number; y?: number };
			if (typeof parsed.x === "number" && typeof parsed.y === "number") {
				return { x: parsed.x, y: parsed.y };
			}
		} catch (_err) {}
	}
	return {
		x: (globalThis as { screenX?: number }).screenX ?? 0,
		y: (globalThis as { screenY?: number }).screenY ?? 0,
	};
}

/**
 * Windows ネイティブ透過マルチウィンドウ、または Android 独立オーバーレイマルチウィンドウ環境かどうかを判定
 */
export function isNativeMultiWindow(): boolean {
	return !isAndroidMobile() || isOverlayWindow();
}

/**
 * Android / Web ブラウザ仮想 Single Page UI 環境かどうかを判定
 */
export function isSinglePageUi(): boolean {
	return !isTauriAvailable() || isAndroidMobile();
}

/**
 * IPC キュー統計管理（最大キュー数・同時保留数・警告検知）
 */
export const ipcQueueStats = {
	pendingCount: 0,
	peakPendingCount: 0,
	totalCalls: 0,
	reset() {
		this.pendingCount = 0;
		this.peakPendingCount = 0;
		this.totalCalls = 0;
	},
};

/**
 * Tauri IPCコマンドの呼び出しラッパー
 */
export async function invoke<T = unknown>(
	cmd: string,
	args: Record<string, unknown> = {},
): Promise<T> {
	if (!isTauriAvailable()) {
		const { getHostBridge } = await import("./host-bridge.js");
		return await getHostBridge().invokeCommand<T>(cmd, args);
	}

	ipcQueueStats.totalCalls++;
	ipcQueueStats.pendingCount++;
	if (ipcQueueStats.pendingCount > ipcQueueStats.peakPendingCount) {
		ipcQueueStats.peakPendingCount = ipcQueueStats.pendingCount;
		console.log(
			`📊 [IPC Queue] 最大キュー数更新: ${ipcQueueStats.peakPendingCount} (直近実行: ${cmd}, 累積呼出: ${ipcQueueStats.totalCalls})`,
		);
	}

	if (ipcQueueStats.pendingCount === 100) {
		console.warn(
			`⚠️ [IPC Queue Alert] キュー軽度滞留 (100件到達): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	} else if (ipcQueueStats.pendingCount === 1000) {
		console.warn(
			`🚨 [IPC Queue Warning] キュー重度滞留 (1000件到達): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	} else if (ipcQueueStats.pendingCount === 5000) {
		console.error(
			`🔥 [IPC Queue CRITICAL] キュー危険域 (5000件到達 - Win32上限10,000件の50%): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	}

	try {
		if (isOverlayIpcAvailable() && gOverlay.__NANAI_OVERLAY_IPC__?.invoke) {
			const reqId = `ov_${++overlayReqSeq}`;
			return await new Promise<T>((resolve, reject) => {
				overlayPending.set(reqId, {
					resolve: resolve as (v: unknown) => void,
					reject,
				});
				try {
					gOverlay.__NANAI_OVERLAY_IPC__?.invoke?.(
						reqId,
						cmd,
						JSON.stringify(args ?? {}),
					);
				} catch (err) {
					overlayPending.delete(reqId);
					reject(err);
				}
			});
		}
		return await tauriInvoke(cmd, args);
	} finally {
		ipcQueueStats.pendingCount--;
	}
}

/**
 * ローカルファイルパスをアセットURLに変換
 */
export function convertFileSrc(
	filePath: string | null | undefined,
	protocol: string = "asset",
): string {
	if (!filePath) return "";
	if (isTauriAvailable() && typeof tauriConvertFileSrc === "function") {
		try {
			return tauriConvertFileSrc(filePath, protocol);
		} catch (_e) {}
	}
	if (
		filePath.startsWith("http://") ||
		filePath.startsWith("https://") ||
		filePath.startsWith("asset://") ||
		filePath.startsWith("./") ||
		filePath.startsWith("/")
	) {
		return filePath;
	}
	const normalized = filePath.replace(/\\/g, "/");
	return `asset://localhost/${encodeURI(normalized)}`;
}

/**
 * イベントリスナー登録
 */
export async function listen(
	event: string,
	handler: (event: unknown) => void,
): Promise<() => void> {
	if (!isTauriAvailable()) return () => {};
	if (isOverlayIpcAvailable()) {
		let set = overlayEventListeners.get(event);
		if (!set) {
			set = new Set();
			overlayEventListeners.set(event, set);
		}
		set.add(handler);
		return () => {
			set?.delete(handler);
		};
	}
	return await tauriListen(event, handler);
}

/**
 * イベント発火
 */
export async function emit(event: string, payload?: unknown): Promise<void> {
	if (!isTauriAvailable()) return;
	if (isOverlayIpcAvailable()) {
		gOverlay.__NANAI_OVERLAY_IPC__?.emitEvent?.(
			event,
			JSON.stringify(payload ?? null),
		);
		return;
	}
	await tauriEmit(event, payload);
}

/**
 * 現在のウィンドウのドラッグ移動を開始
 */
export async function startDraggingWindow(): Promise<void> {
	if (!isTauriAvailable()) return;
	try {
		getCurrentWindow()
			.startDragging()
			.catch((err) => {
				console.warn("startDraggingWindow failed:", err);
			});
	} catch (err) {
		console.warn("startDraggingWindow failed:", err);
	}
}

/**
 * 現在のウィンドウを指定量だけ移動する。
 */
export async function moveCurrentWindowBy(
	x: number,
	y: number,
	origin: { x: number; y: number },
): Promise<void> {
	if (!isTauriAvailable()) return;
	if (isOverlayIpcAvailable() && gOverlay.__NANAI_OVERLAY_IPC__?.moveWindowBy) {
		const cur = getOverlayWindowOrigin();
		const dx = Math.round(origin.x + x - cur.x);
		const dy = Math.round(origin.y + y - cur.y);
		if (dx !== 0 || dy !== 0) {
			gOverlay.__NANAI_OVERLAY_IPC__.moveWindowBy(dx, dy);
		}
		return;
	}
	try {
		await getCurrentWindow().setPosition(
			new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),
		);
	} catch (err) {
		console.warn("moveCurrentWindowBy failed:", err);
	}
}

export async function getCurrentWindowPosition(): Promise<{
	x: number;
	y: number;
} | null> {
	if (!isTauriAvailable()) return null;
	if (isOverlayIpcAvailable()) {
		return getOverlayWindowOrigin();
	}
	try {
		const position = await getCurrentWindow().outerPosition();
		return { x: position.x, y: position.y };
	} catch (err) {
		console.warn("getCurrentWindowPosition failed:", err);
		return null;
	}
}

/**
 * フロントエンド側のログをRustターミナル（stdout/stderr）に転送する
 */
export function frontendLog(message: string, level = "info") {
	console.log(`[Frontend Log] ${message}`);
	if (isTauriAvailable()) {
		void invoke("log_from_frontend", { message, level }).catch(() => {});
	}
}

(globalThis as unknown as Record<string, unknown>).__NANAI_IPC_QUEUE_STATS__ =
	ipcQueueStats;
