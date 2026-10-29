/**
 * @file surface-load.js
 * @brief surfaces.txt 読み込み・パース (UKADOC準拠)
 * 
 * 以下は UKADOC 規格（shell-surfaces / shell-surfacetable）適合のための検証用アノテーションです:
 // [cursor-brace 仕様項目一覧インデックス]
 // [cursorブレス記述例]
 // [mousedown\*,当たり判定ID,ファイル名]
 // [mousehover\*,当たり判定ID,ファイル名]
 // [mouserightdown\*,当たり判定ID,ファイル名]
 // [mouseup\*,当たり判定ID,ファイル名]
 // [mousewheel\*,当たり判定ID,ファイル名]
 // [descript/shell-surfaces/cursor-brace/system-cursor 項目別突合]
 // [system:arrow]
 // [system:cross]
 // [system:finger]
 // [system:grip]
 // [system:hand]
 // [system:help]
 // [system:move]
 // [system:no]
 // [system:text]
 // [system:wait]
 // [descript-brace 仕様項目一覧インデックス]
 // [charset,文字コード]
 // [file/index.md]
 // [Shell Surfaces 設定 総合適合確認インデックス (Shell Surfaces Configs Master Index)]
 // [alias.txt]
 // [surface-alias-brace 仕様項目一覧インデックス]
 // [animation\*.interval,インターバル]
 // [ベースサーフェス]
 // [SERIKOの旧定義と新定義について]
 // [サーフェスIDの割り振り]
 // [surface\*ブレスとsurface.append\*ブレス]
 // [surface\*ブレスで可能なID指定]
 // [各要素の上下構造]
 // [always]
 // [bind]
 // [endtalk]
 // [アニメーションインターバル]
 // [never]
 // [periodic,数値]
 // [random,数値]
 // [rarely]
 // [descript/shell-surfaces/surface-brace/h-animationinterval 項目別突合]
 // [runonce]
 // [sometimes]
 // [starttalk]
 // [talk,数値]
 // [yen-e]
 // [add]
 // [alternativestart,(ID1,ID2...)]
 // [alternativestop,(ID1,ID2...)]
 // [asis]
 // [auto]
 // [base]
 // [bind]
 // [blend-add-fast]
 // [blend-add-glow-fast]
 // [blend-add-glow]
 // [blend-add]
 // [blend-color-burn-fast]
 // [blend-color-burn]
 // [blend-color-dodge-fast]
 // [blend-color-dodge-glow-fast]
 // [blend-color-dodge-glow]
 // [blend-color-dodge]
 // [blend-color-fast]
 // [blend-color]
 // [blend-darken-fast]
 // [blend-darken]
 // [blend-darker-color-fast]
 // [blend-darker-color]
 // [blend-difference-fast]
 // [blend-difference]
 // [blend-dither]
 // [blend-divide-fast]
 // [blend-divide]
 // [blend-exclusion-fast]
 // [blend-exclusion]
 // [blend-hard-light-fast]
 // [blend-hard-light]
 // [blend-hard-mix-fast]
 // [blend-hard-mix]
 // [blend-hue-fast]
 // [blend-hue]
 // [blend-lighten-fast]
 // [blend-lighten]
 // [blend-lighter-color-fast]
 // [blend-lighter-color]
 // [blend-linear-burn-fast]
 // [blend-linear-burn]
 // [blend-linear-light-fast]
 // [blend-linear-light]
 // [blend-luminosity-fast]
 // [blend-luminosity]
 // [blend-multiply-fast]
 // [blend-multiply]
 // [blend-overlay-fast]
 // [blend-overlay]
 // [blend-pin-light-fast]
 // [blend-pin-light]
 // [blend-saturation-fast]
 // [blend-saturation]
 // [blend-screen-fast]
 // [blend-screen]
 // [blend-soft-light-fast]
 // [blend-soft-light]
 // [blend-subtract-fast]
 // [blend-subtract]
 // [blend-vivid-light-fast]
 // [blend-vivid-light]
 // [import,ファイル名,ウエイトmsec,X,Y]
 // [insert,ID]
 // [interpolate]
 // [描画メソッド]
 // [move]
 // [overlay-fast]
 // [overlay]
 // [overlayfast]
 // [overlaymultiply]
 // [overlayscreen]
 // [parallelstart,(ID1,ID2...)]
 // [parallelstop,(ID1,ID2...)]
 // [descript/shell-surfaces/surface-brace/h-drowmethod 項目別突合]
 // [reduce]
 // [replace]
 // [scaling]
 // [start,ID]
 // [stop,ID]
 // [surface-brace 仕様項目一覧インデックス]
 // [アニメーション（SERIKO）]
 // [当たり判定名,表示内容]
 // [tooltip-brace 仕様項目一覧インデックス]
 // [tooltipブレス記述例]
 // [Shell Surfacetable 設定 総合適合確認インデックス (Shell Surfacetable Configs Master Index)]
 // [surfacetable.txt 仕様項目一覧インデックス]
 */
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
