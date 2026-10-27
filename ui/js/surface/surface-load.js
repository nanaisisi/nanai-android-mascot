import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { seedDressupDefaults } from "./bind-menu.js";
import {
	getShellManifest,
	manifestToSurfaceData,
	parseSurfacesTextWithRust,
} from "./shell-manifest.js";
import { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";

/**
 * surfaces.txt の読み込み・パース系メソッド (SurfaceManager に mixin)
 */
export const surfaceLoadMethods = {
	/**
	 * ゴーストの surfaces.txt を読み込んでパース
	 *
	 * Tauri 環境では Rust 側パーサー（`shell_manifest` コマンド、ukadoc-spec 突合済）を
	 * 優先使用し、失敗時またはブラウザ環境では JS パーサーにフォールバックする。
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {string} ghostPath
	 * @param {string} shellName
	 */
	async loadSurfacesTxt(ghostPath, shellName = "master") {
		try {
			// ghostPath が `..../shell/<シェル名>` 形式なら分割する
			let basePath = ghostPath;
			let shell = shellName;
			const shellMatch = ghostPath.match(/[/\\]shell[/\\]([^/\\]+)$/);
			if (shellMatch) {
				basePath = ghostPath.slice(0, shellMatch.index);
				shell = shellMatch[1];
			}
			const ghostName = basePath.split(/[\\/]/).filter(Boolean).pop() || "";

			// 1) Rust パーサー経由（ukadoc-spec 突合済み）
			if (isTauriAvailable()) {
				const manifest = await getShellManifest(ghostName, shell);
				if (manifest) {
					console.log(
						`📜 shell_manifest 取得成功 (ghost=${ghostName}, shell=${shell})`,
					);
					this.applyShellManifest(manifest);
					return;
				}
				console.warn(
					"shell_manifest 取得失敗、テキストパースへフォールバック:",
				);
			}

			// 2) JS テキストパーサー（フォールバック / ブラウザ環境）
			let content = "";
			const surfacesPath = `${basePath}/shell/${shell}/surfaces.txt`;

			if (isTauriAvailable()) {
				try {
					content = await invoke("open_file", { path: surfacesPath });
				} catch (_e) {
					console.warn(`Tauri open_file 失敗、fetchを試行: ${surfacesPath}`);
					const res = await fetch(surfacesPath);
					if (res.ok) content = await res.text();
				}
			} else {
				const res = await fetch(surfacesPath);
				if (res.ok) content = await res.text();
			}

			if (content) {
				console.log(`📜 surfaces.txt 読み込み成功 (${surfacesPath})`);
				await this.parseSurfacesTxt(content);
			}
		} catch (err) {
			console.warn(
				"surfaces.txt 読み込みスキップ (デフォルト設定を使用):",
				err,
			);
		}
	},

	/**
	 * Rust `shell_manifest` のマニフェストを内部レコードへ適用する
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	applyShellManifest(manifest) {
		const data = manifestToSurfaceData(manifest);
		this.collisions = data.collisions;
		this.elements = data.elements;
		this.animations = data.animations;
		this.aliases = data.aliases;
		this.keroAliases = data.keroAliases;
		this.shellManifest = manifest;
		// シェル単位の Rust 合成計画キャッシュは消去（composition-plan-integration-spec 2.3）
		this.planCache?.clear();
		this.baseCanvasCache?.clear();

		// bindgroup[N].default,1（初期装着）を着せ替え状態へシード（既存キーは保持）
		const seeded = seedDressupDefaults(manifest, this.dressupState);
		if (seeded > 0) {
			console.log(`👗 bindgroup default 初期装着シード: ${seeded} パーツ`);
		}

		console.log(
			`🎯 当たり判定・合成要素登録完了 (Rust shell_manifest): ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
	},

	/**
	 * surfaces.txt のテキスト内容をパースして当たり判定を登録
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	async parseSurfacesTxt(text) {
		this.planCache?.clear();
		this.baseCanvasCache?.clear();
		if (isTauriAvailable()) {
			const rustData = await parseSurfacesTextWithRust(text);
			if (rustData) {
				this.collisions = rustData.collisions;
				this.elements = rustData.elements;
				this.animations = rustData.animations;
				console.log(
					`🎯 当たり判定・合成要素登録完了 (Rust parse_surfaces_text): ${Object.keys(this.collisions).length} サーフィス登録済み`,
				);
				return;
			}
		}

		const parsed = parseSurfacesTxt(text);
		this.collisions = parsed.collisions;
		this.elements = parsed.elements;
		this.animations = parsed.animations;

		console.log(
			`🎯 当たり判定・合成要素登録完了 (JS fallback): ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
	},

	/**
	 * `0-9,20-22` 形式の範囲指定をサーフィス番号列へ展開
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	expandSurfaceRange(rangeStr) {
		return expandSurfaceRange(rangeStr);
	},
};
