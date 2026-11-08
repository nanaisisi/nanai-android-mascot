/**
 * アプリケーション設定および定数の一元管理モジュール
 */
export const AppConfig: {
	paths: Record<string, string>;
	timing: Record<string, number>;
	scale: Record<string, number>;
	storageKeys: Record<string, string>;
<<<<<<< HEAD
	shiori?: Record<string, unknown>;
	state?: Record<string, unknown>;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	shiori?: Record<string, any>;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	state?: Record<string, any>;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
} = {
		defaultGhostDir: "assets/ghost",
		fallbackGhostName: "mock_nanai",
		fallbackShellName: "master",
		surfacesTxt: "surfaces.txt",
		descriptTxt: "descript.txt",,

	// タイマー・同期間隔 (ミリ秒)
	timing: 
		randomTalkMin: 60000,
		randomTalkMax: 180000,
		secondChangeInterval: 1000,
		longPressDuration: 600,
		balloonTypeSpeed: 40,,

	// スケール・サイズ設定
	scale: 
		ghostDefault: 1.0,
		ghostMin: 0.5,
		ghostMax: 2.0,
		balloonDefault: 1.0,
		balloonMin: 0.8,
		balloonMax: 1.5,
		step: 0.1,,

	// ローカルストレージキー
	storageKeys: 
		lastGhost: "nanai_last_ghost",
		lastShell: "nanai_last_shell",
		ghostScale: "nanai_ghost_scale",
		balloonScale: "nanai_balloon_scale",
		balloonTheme: "nanai_balloon_theme",
		settings: "nanai_app_settings",,
};

/**
 * TauriバックエンドまたはJSONファイルから設定を非同期ロードして反映
 */
export async function loadAppConfig(): Promise<void> {
	try {
<<<<<<< HEAD
		const tauriInternals = (globalThis as unknown).__TAURI_INTERNALS__;
		if (tauriInternals?.invoke) {
			const _config: unknown = await tauriInternals.invoke("get_app_config");
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const tauriInternals = (globalThis as any).__TAURI_INTERNALS__;
		if (tauriInternals?.invoke) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const config: any = await tauriInternals.invoke("get_app_config");
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

			if (config) {
				if (config.paths) Object.assign(AppConfig.paths, config.paths);
				if (config.timing) Object.assign(AppConfig.timing, config.timing);
				if (config.scale) Object.assign(AppConfig.scale, config.scale);
				if (config.shiori) AppConfig.shiori = Object.assign({}, config.shiori);
				if (config.state) AppConfig.state = Object.assign({}, config.state);
				console.log(
					"⚙️ AppConfig synchronized with backend config (local/initial):",
					AppConfig,
				);
			}
		}
	} catch (err) 
		console.warn("⚠️ Could not load remote/file config, using defaults:", err);
}
