/**
 * Host Bridge Interface
 * Tauri 環境と WASM / Web ブラウザ環境を透過的に扱うための抽象化アダプター
 */

import {
	isAndroidMobile,
	isTauriAvailable,
	isWindowsDesktop,
} from "./tauri-helper.js";

export interface HostBridge {
	/**
	 * コマンド呼び出し (Tauri IPC または WASM 直接呼出)
	 */
	invokeCommand<T = unknown>(
		cmd: string,
		args?: Record<string, unknown>,
	): Promise<T>;

	/**
	 * ファイル読み込み (Tauri plugin-fs または OPFS / File API)
	 */
	readFile(path: string): Promise<Uint8Array>;

	/**
	 * プラットフォーム識別名の取得
	 */
	getPlatformName(): string;
}

/**
 * Tauri ネイティブ環境用のアダプター
 */
export class TauriHostBridge implements HostBridge {
	async invokeCommand<T = unknown>(
		cmd: string,
		args: Record<string, unknown> = {},
	): Promise<T> {
		const modName = "@tauri-apps/api/core";
		const { invoke } = await import(/* @vite-ignore */ modName);
		return await invoke<T>(cmd, args);
	}

	async readFile(path: string): Promise<Uint8Array> {
		try {
			const modName = "@tauri-apps/plugin-fs";
			const fsPlugin = (await import(/* @vite-ignore */ modName)) as {
				readFile?: (p: string) => Promise<Uint8Array>;
			};
			if (typeof fsPlugin?.readFile === "function") {
				return await fsPlugin.readFile(path);
			}
		} catch (_e) {}
		return new Uint8Array();
	}

	getPlatformName(): string {
		if (isAndroidMobile()) return "tauri-android";
		if (isWindowsDesktop()) return "tauri-windows";
		return "tauri-desktop";
	}
}

/**
 * WASM / Web ブラウザ環境用のアダプター (スタブ実装)
 */
export class WasmHostBridge implements HostBridge {
	private wasmModule: unknown = null;

	/**
	 * WASM モジュールの動的ロード・初期化
	 */
	async initWasm(): Promise<void> {
		if (!this.wasmModule) {
			try {
				const wasmPkgPath = "./wasm/pkg/nanai_core.js";
				this.wasmModule = await import(/* @vite-ignore */ wasmPkgPath);
			} catch (e) {
				console.warn(
					"WASM モジュールのロードをスキップしました (スタブ動作)",
					e,
				);
			}
		}
	}

	async invokeCommand<T = unknown>(
		cmd: string,
		args: Record<string, unknown> = {},
	): Promise<T> {
		await this.initWasm();

		console.log(`[WasmHostBridge] fallback command invoke: ${cmd}`, args);

		// スタブ処理: 各コマンドごとの WASM 関数または Web API へのマッピング
		if (cmd === "parse_sakura_script" && args.script) {
			// 例: wasmModule.parse_sakura_script_json(args.script) などへルーティング
			return [] as unknown as T;
		}

		throw new Error(
			`[WasmHostBridge] Command '${cmd}' is not implemented in WASM fallback.`,
		);
	}

	async readFile(path: string): Promise<Uint8Array> {
		// OPFS (Origin Private File System) または Fetch API での取得スタブ
		console.log(`[WasmHostBridge] fallback readFile: ${path}`);
		return new Uint8Array();
	}

	getPlatformName(): string {
		if (isAndroidMobile()) return "wasm-android";
		if (isWindowsDesktop()) return "wasm-windows";
		return "wasm-web";
	}
}

let currentBridge: HostBridge | null = null;

/**
 * 現在の実行環境に応じた HostBridge インスタンスを取得
 */
export function getHostBridge(): HostBridge {
	if (!currentBridge) {
		if (isTauriAvailable()) {
			currentBridge = new TauriHostBridge();
		} else {
			currentBridge = new WasmHostBridge();
		}
	}
	return currentBridge;
}
