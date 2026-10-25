import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */

/**
 * @typedef {Object} CollisionArea
 * @property {number} x0
 * @property {number} y0
 * @property {number} x1
 * @property {number} y1
 * @property {string} id
 */

/**
 * @typedef {Object} SurfaceElement
 * @property {string} type
 * @property {string} file
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} AnimationPattern
 * @property {number} surface
 * @property {number} wait
 * @property {string} type
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} SurfaceAnimation
 * @property {number} id
 * @property {string} interval
 * @property {AnimationPattern[]} patterns
 */

export class SurfaceManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {Record<number, CollisionArea[]>} */
		this.collisions = {};
		/** @type {Record<number, SurfaceElement[]>} */
		this.elements = {};
		/** @type {Record<number, SurfaceAnimation[]>} */
		this.animations = {};
		/** @type {number[]} */
		this.activeAnimationTimers = [];
		/** @type {number} */
		this.baseWidth = 200;
		/** @type {number} */
		this.baseHeight = 400;
		/** @type {number} */
		this.currentSurfaceId = 0;
		/** @type {Map<string, string>} */
		this.chromaKeyCache = new Map();
	}

	/**
	 * ゴーストの surfaces.txt を読み込んでパース
	 * @param {string} ghostPath
	 * @param {string} shellName
	 */
	async loadSurfacesTxt(ghostPath, shellName = "master") {
		try {
			let content = "";
			// shell/master などのパス形式に対応
			const basePath = ghostPath.includes("/shell/") ? ghostPath : `${ghostPath}/shell/${shellName}`;
			const surfacesPath = `${basePath}/surfaces.txt`;

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
				this.parseSurfacesTxt(content);
			}
		} catch (err) {
			console.warn(
				"surfaces.txt 読み込みスキップ (デフォルト設定を使用):",
				err,
			);
		}
	}

	/**
	 * surfaces.txt のテキスト内容をパースして当たり判定を登録
	 */
	parseSurfacesTxt(text) {
		const lines = text.split(/\r?\n/);
		let currentSurfaces = ["default"];

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("//")) return;

			// surface[ID] または surface.append[ID] ブロック開始
			const surfaceMatch = trimmed.match(/^surface(?:\.append)?([\d,-]+)/);
			if (surfaceMatch) {
				currentSurfaces = this.expandSurfaceRange(surfaceMatch[1]);
				currentSurfaces.forEach((s) => {
					if (!this.collisions[s]) this.collisions[s] = [];
				});
				return;
			}

			// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]
			if (trimmed.startsWith("collisionex")) {
				const parts = trimmed.split(",");
				if (parts.length >= 6) {
					const name = parts[1].trim().toLowerCase();
					const shape = parts[2].trim().toLowerCase();
					const x1 = parseInt(parts[3], 10);
					const y1 = parseInt(parts[4], 10);
					const x2 = parseInt(parts[5], 10);
					const y2 = parseInt(parts[6], 10);

					currentSurfaces.forEach((s) => {
						if (!this.collisions[s]) this.collisions[s] = [];
						this.collisions[s].push({ name, shape, x1, y1, x2, y2 });
					});
				}
			} else if (trimmed.startsWith("collision")) {
				const parts = trimmed.split(",");
				// collision[ID],[x1],[y1],[x2],[y2],[name]
				if (parts.length >= 6) {
					const x1 = parseInt(parts[1], 10);
					const y1 = parseInt(parts[2], 10);
					const x2 = parseInt(parts[3], 10);
					const y2 = parseInt(parts[4], 10);
					const name = parts[5].trim().toLowerCase();

					currentSurfaces.forEach((s) => {
						if (!this.collisions[s]) this.collisions[s] = [];
						this.collisions[s].push({ name, shape: "rect", x1, y1, x2, y2 });
					});
				}
			} else if (trimmed.startsWith("element")) {
				const parts = trimmed.split(",");
				if (parts.length >= 5) {
					const type = parts[1].trim().toLowerCase();
					const file = parts[2].trim();
					const x = parseInt(parts[3], 10) || 0;
					const y = parseInt(parts[4], 10) || 0;

					currentSurfaces.forEach((s) => {
						if (!this.elements[s]) this.elements[s] = [];
						this.elements[s].push({ type, file, x, y });
					});
				}
			} else if (trimmed.includes(".interval,")) {
				// animation[ID].interval,[interval]
				const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);
				if (match) {
					const animId = parseInt(match[1], 10);
					const interval = match[2].trim();
					currentSurfaces.forEach((s) => {
						if (!this.animations[s]) this.animations[s] = [];
						let anim = this.animations[s].find((a) => a.id === animId);
						if (!anim) {
							anim = { id: animId, interval, patterns: [] };
							this.animations[s].push(anim);
						} else {
							anim.interval = interval;
						}
					});
				}
			} else if (trimmed.includes(".pattern")) {
				// animation[ID].pattern[P],[surface],[wait],[type],[x],[y]
				const match = trimmed.match(/^animation(\d+)\.pattern\d*,\s*(.+)$/);
				if (match) {
					const animId = parseInt(match[1], 10);
					const pParts = match[2].split(",");
					if (pParts.length >= 2) {
						const patSurface = pParts[0].trim();
						const wait = parseInt(pParts[1], 10) || 100;
						const type = pParts[2] ? pParts[2].trim().toLowerCase() : "overlay";
						const x = pParts[3] ? parseInt(pParts[3], 10) || 0 : 0;
						const y = pParts[4] ? parseInt(pParts[4], 10) || 0 : 0;

						currentSurfaces.forEach((s) => {
							if (!this.animations[s]) this.animations[s] = [];
							let anim = this.animations[s].find((a) => a.id === animId);
							if (!anim) {
								anim = { id: animId, interval: "sometimes", patterns: [] };
								this.animations[s].push(anim);
							}
							anim.patterns.push({ surface: patSurface, wait, type, x, y });
						});
					}
				}
			}
		});

		console.log(
			`🎯 当たり判定・合成要素登録完了: ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
	}

	expandSurfaceRange(rangeStr) {
		const res = [];
		rangeStr.split(",").forEach((part) => {
			if (part.includes("-")) {
				const [start, end] = part.split("-").map((v) => parseInt(v, 10));
				for (let i = start; i <= end; i++) res.push(String(i));
			} else {
				res.push(part.trim());
			}
		});
		return res;
	}

	setSurfaceId(surfaceId) {
		this.currentSurfaceId = surfaceId;
	}

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 */
	detectCollision(clickX, clickY, targetRect, surfaceId = null) {
		const sid =
			surfaceId !== null ? String(surfaceId) : String(this.currentSurfaceId);

		// 表示要素内での相対座標 (0.0 〜 1.0)
		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

		// 元のテクスチャ解像度座標系へ逆変換
		const canvasX = Math.round(relX * this.baseWidth);
		const canvasY = Math.round(relY * this.baseHeight);

		const colList = this.collisions[sid] || this.collisions.default || [];

		// 定義の逆順（手前のもの優先）で判定
		for (let i = colList.length - 1; i >= 0; i--) {
			const col = colList[i];
			if (
				canvasX >= col.x1 &&
				canvasX <= col.x2 &&
				canvasY >= col.y1 &&
				canvasY <= col.y2
			) {
				return {
					name: col.name,
					canvasX,
					canvasY,
				};
			}
		}

		return {
			name: "",
			canvasX,
			canvasY,
		};
	}

	/**
	 * 伺か標準仕様のクロマキー（緑透過 #00FF00 / 左上ピクセル色）透過処理
	 * @param {string} imageSrc - 画像URLまたはDataURL
	 * @returns {Promise<string>} - 透過処理後のDataURL (PNG)
	 */
	processChromaKey(imageSrc) {
		if (!imageSrc) return Promise.resolve(imageSrc);
		if (this.chromaKeyCache.has(imageSrc)) {
			return Promise.resolve(this.chromaKeyCache.get(imageSrc));
		}

		return new Promise((resolve) => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				try {
					const canvas = document.createElement("canvas");
					const width = img.naturalWidth || img.width;
					const height = img.naturalHeight || img.height;
					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext("2d", { willReadFrequently: true });
					if (!ctx) {
						this.chromaKeyCache.set(imageSrc, imageSrc);
						resolve(imageSrc);
						return;
					}

					ctx.drawImage(img, 0, 0);
					const imgData = ctx.getImageData(0, 0, width, height);
					const data = imgData.data;

					// 左上1ピクセル (0, 0) の色を取得（伺かの伝統的な透過色仕様）
					const cornerR = data[0];
					const cornerG = data[1];
					const cornerB = data[2];
					const cornerA = data[3];

					// 左上が透過でなく、純緑(#00FF00)または特定背景色の場合にクロマキー判定
					const isCornerPureGreen =
						cornerR === 0 && cornerG >= 250 && cornerB === 0 && cornerA === 255;
					const isCornerTarget =
						isCornerPureGreen ||
						(cornerA === 255 &&
							cornerR === 0 &&
							cornerG === 255 &&
							cornerB === 0);

					let modified = false;
					const len = data.length;

					for (let i = 0; i < len; i += 4) {
						const r = data[i];
						const g = data[i + 1];
						const b = data[i + 2];
						const a = data[i + 3];

						if (a === 0) continue;

						// 純緑 (#00FF00) 判定 (許容差あり: R <= 30, G >= 220, B <= 30)
						const isGreen = r <= 35 && g >= 220 && b <= 35;

						// または左上ピクセルと完全一致
						const isMatchCorner =
							isCornerTarget && r === cornerR && g === cornerG && b === cornerB;

						if (isGreen || isMatchCorner) {
							data[i + 3] = 0; // アルファ値を 0（完全透明）に設定
							modified = true;
						}
					}

					if (modified) {
						ctx.putImageData(imgData, 0, 0);
						const resultUrl = canvas.toDataURL("image/png");
						this.chromaKeyCache.set(imageSrc, resultUrl);
						resolve(resultUrl);
					} else {
						this.chromaKeyCache.set(imageSrc, imageSrc);
						resolve(imageSrc);
					}
				} catch (_err) {
					resolve(imageSrc);
				}
			};
			img.onerror = () => resolve(imageSrc);
			img.src = imageSrc;
		});
	}
}
