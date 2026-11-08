/**
 * @file config.ts
 * @brief アプリケーション設定・パス・定数の保持および Tauri バックエンド連携
 */

export interface AppConfigSpec {
	paths: Record<string, string>;
	timing: Record<string, number>;
	scale: Record<string, number>;
	storageKeys: Record<string, string>;
	shiori?: Record<string, any>;
	state?: Record<string, any>;
}

export const AppConfig: AppConfigSpec = {
	// パス関連
	paths: {
		defaultGhostDir: "test_dir",
		fallbackGhostName: "mock_nanai",
		fallbackShellName: "master",
		surfacesTxt: "surfaces.txt",
		descriptTxt: "descript.txt",
	},
	// タイミング関連 (ミリ秒)
	timing: {
		randomTalkMin: 60000,
		randomTalkMax: 180000,
		secondChangeInterval: 1000,
		longPressDuration: 600,
		balloonTypeSpeed: 40,
	},
	// 倍率関連 (50%〜200%)
	scale: {
		ghostDefault: 1,
		ghostMin: 0.5,
		ghostMax: 2,
		balloonDefault: 1,
		balloonMin: 0.8,
		balloonMax: 1.5,
		step: 0.1,
	},
	// ストレージキー
	storageKeys: {
		lastGhost: "nanai_last_ghost",
		lastShell: "nanai_last_shell",
		ghostScale: "nanai_ghost_scale",
		balloonScale: "nanai_balloon_scale",
		balloonTheme: "nanai_balloon_theme",
		settings: "nanai_app_settings",
	},
};

/**
 * TauriバックエンドまたはJSONファイルから設定を非同期ロードして反映
 */
export async function loadAppConfig(): Promise<void> {
	try {
		const tauriInternals = (globalThis as any).__TAURI_INTERNALS__;
		if (tauriInternals?.invoke) {
			const config: any = await tauriInternals.invoke("get_app_config");

			if (config) {
				if (config.paths) Object.assign(AppConfig.paths, config.paths);
				if (config.timing) Object.assign(AppConfig.timing, config.timing);
				if (config.scale) Object.assign(AppConfig.scale, config.scale);
				if (config.shiori) AppConfig.shiori = Object.assign({}, config.shiori);
				if (config.state) AppConfig.state = Object.assign({}, config.state);
			}
		}
	} catch (err) {
		console.warn("Tauriバックエンドからの設定読み込みに失敗しました（フォールバック設定を使用）:", err);
	}
}
