/**
 * Tauri API Helper
 * `@tauri-apps/api` の公式バインディングを使用しつつ、
 * Web/ブラウザ単体プレビュー時やフォールバック環境でも動作するようにラップします。
 */
import { convertFileSrc as tauriConvertFileSrc, invoke as tauriInvoke } from "@tauri-apps/api/core";
import { emit as tauriEmit, listen as tauriListen } from "@tauri-apps/api/event";

/**
 * Tauri環境で動作しているかどうかを判定
 * @returns {boolean}
 */
export function isTauriAvailable() {
	return typeof globalThis !== "undefined" && (!!globalThis.__TAURI__ || !!globalThis.__TAURI_INTERNALS__);
}

/**
 * Tauri IPCコマンドの呼び出しラッパー
 * @template T
 * @param {string} cmd - 実行するTauriコマンド名
 * @param {Record<string, any>} [args] - コマンド引数
 * @returns {Promise<T>}
 */
export async function invoke(cmd, args = {}) {
	if (!isTauriAvailable()) {
		throw new Error(`Tauri is not available to invoke command: ${cmd}`);
	}
	return await tauriInvoke(cmd, args);
}

/**
 * ローカルファイルパスをアセットURLに変換
 * @param {string} filePath - ローカルパス
 * @param {string} [protocol] - プロトコル名 (デフォルト: 'asset')
 * @returns {string}
 */
export function convertFileSrc(filePath, protocol = "asset") {
	if (!filePath) return "";
	if (isTauriAvailable()) {
		return tauriConvertFileSrc(filePath, protocol);
	}
	// 相対パスまたはWeb URLはそのまま
	if (
		filePath.startsWith("http://") ||
		filePath.startsWith("https://") ||
		filePath.startsWith("asset://") ||
		filePath.startsWith("./") ||
		filePath.startsWith("/")
	) {
		return filePath;
	}
	// Windows絶対パスなどをフォールバック形式に変換
	const normalized = filePath.replace(/\\/g, "/");
	return `asset://localhost/${encodeURI(normalized)}`;
}

/**
 * イベントリスナー登録
 * @param {string} event
 * @param {(event: any) => void} handler
 * @returns {Promise<() => void>}
 */
export async function listen(event, handler) {
	if (!isTauriAvailable()) return () => {};
	return await tauriListen(event, handler);
}

/**
 * イベント発火
 * @param {string} event
 * @param {any} [payload]
 * @returns {Promise<void>}
 */
export async function emit(event, payload) {
	if (!isTauriAvailable()) return;
	await tauriEmit(event, payload);
}
