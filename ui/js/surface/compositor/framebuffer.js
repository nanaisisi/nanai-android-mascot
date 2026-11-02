import { composeSurfaceElements } from "./compose.js";

/**
 * @class SurfaceFrameBuffer
 * @description メモリ上のサーフィス画像ピクセルバッファおよび Canvas ラッパー (Slot-07 Contract 準拠)
 */
export class SurfaceFrameBuffer {
	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {Uint8ClampedArray|Uint8Array|null} [data]
	 */
	constructor(width, height, data = null) {
		this.width = width;
		this.height = height;
		this.data = data || new Uint8ClampedArray(width * height * 4);
		/** @type {Uint32Array|null} */
		this._data32 = null;
	}

	/**
	 * 32bit 整数ピクセル配列ビュー (ゼロコピー・高速演算用)
	 * @returns {Uint32Array}
	 */
	get data32() {
		if (
			!this._data32 ||
			this._data32.buffer !== this.data.buffer ||
			this._data32.byteOffset !== this.data.byteOffset
		) {
			this._data32 = new Uint32Array(
				this.data.buffer,
				this.data.byteOffset,
				(this.width * this.height) | 0,
			);
		}
		return this._data32;
	}

	/**
	 * ImageData から SurfaceFrameBuffer を作成
	 * @param {ImageData} imageData
	 * @returns {SurfaceFrameBuffer}
	 */
	static fromImageData(imageData) {
		return new SurfaceFrameBuffer(
			imageData.width,
			imageData.height,
			imageData.data,
		);
	}

	/**
	 * HTMLCanvasElement から SurfaceFrameBuffer を非同期取得
	 * @param {HTMLCanvasElement} canvas
	 * @returns {SurfaceFrameBuffer|null}
	 */
	static fromCanvas(canvas) {
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return null;
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		return SurfaceFrameBuffer.fromImageData(imgData);
	}

	/**
	 * 指定座標のピクセル色 (r, g, b, a) を取得
	 * @param {number} x
	 * @param {number} y
	 * @returns {[number, number, number, number]|null}
	 */
	getPixel(x, y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return null;
		}
		const idx = (y * this.width + x) * 4;
		return [
			this.data[idx],
			this.data[idx + 1],
			this.data[idx + 2],
			this.data[idx + 3],
		];
	}

	/**
	 * 指定座標にピクセル色を設定
	 * @param {number} x
	 * @param {number} y
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	setPixel(x, y, r, g, b, a) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
			return;
		}
		const idx = (y * this.width + x) * 4;
		this.data[idx] = r;
		this.data[idx + 1] = g;
		this.data[idx + 2] = b;
		this.data[idx + 3] = a;
	}

	/**
	 * バッファ全体を透明クリア (RGBA = 0)
	 */
	clear() {
		this.data32.fill(0);
	}

	/**
	 * 指定した部分矩形領域のみを透明クリア (局所ダーティ領域のクリア)
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	clearRect(x, y, w, h) {
		if (w <= 0 || h <= 0) return;
		const startX = Math.max(0, x | 0);
		const startY = Math.max(0, y | 0);
		const endX = Math.min(this.width, (x + w) | 0);
		const endY = Math.min(this.height, (y + h) | 0);

		if (startX >= endX || startY >= endY) return;

		const d32 = this.data32;
		const rowWidth = endX - startX;
		const width = this.width;

		for (let row = startY; row < endY; row++) {
			const offset = row * width + startX;
			d32.fill(0, offset, offset + rowWidth);
		}
	}

	/**
	 * 別の SurfaceFrameBuffer を指定座標 (dx, dy) に合成
	 * @param {SurfaceFrameBuffer} src
	 * @param {number} [dx=0]
	 * @param {number} [dy=0]
	 * @param {string} [method="overlay"]
	 */
	compositeBuffer(src, dx = 0, dy = 0, method = "overlay") {
		if (!src?.width || !src.height) return;

		const m = (method || "overlay").toLowerCase();
		const dstWidth = this.width;
		const dstHeight = this.height;
		const srcWidth = src.width;
		const srcHeight = src.height;

		const dst32 = this.data32;
		const src32 = src.data32;

		for (let sy = 0; sy < srcHeight; sy++) {
			const ty = dy + sy;
			if (ty < 0 || ty >= dstHeight) continue;

			for (let sx = 0; sx < srcWidth; sx++) {
				const tx = dx + sx;
				if (tx < 0 || tx >= dstWidth) continue;

				const srcIdx = sy * srcWidth + sx;
				const dstIdx = ty * dstWidth + tx;
				const srcPixel = src32[srcIdx];

				if (m === "replace" || m === "overlayfast" || m === "fast") {
					dst32[dstIdx] = srcPixel;
				} else if (m === "interpolate") {
					// 下の絵と同一色または完全透明の場合は透過
					if ((srcPixel & 0xff000000) === 0) continue;
					if ((srcPixel & 0x00ffffff) === (dst32[dstIdx] & 0x00ffffff)) {
						continue;
					}
					dst32[dstIdx] = srcPixel;
				} else if (m === "reduce") {
					// ベースレイヤと新規レイヤの不透明度（アルファ）を乗算合成 (UKADOC準拠)
					const sa = (srcPixel >>> 24) & 0xff;
					const da = (dst32[dstIdx] >>> 24) & 0xff;
					const outA = Math.round((da * sa) / 255);
					dst32[dstIdx] = (dst32[dstIdx] & 0x00ffffff) | (outA << 24);
				} else {
					// 標準 overlay (完全透明はスキップ、完全不透明はダイレクト代入、半透明はブレンド)
					const sa = (srcPixel >>> 24) & 0xff;
					if (sa === 0) continue;
					if (sa === 255) {
						dst32[dstIdx] = srcPixel;
					} else {
						const da = (dst32[dstIdx] >>> 24) & 0xff;
						const invAlpha = 1 - sa / 255;
						const alphaNorm = sa / 255;

						const sr = srcPixel & 0xff;
						const sg = (srcPixel >>> 8) & 0xff;
						const sb = (srcPixel >>> 16) & 0xff;

						const dr = dst32[dstIdx] & 0xff;
						const dg = (dst32[dstIdx] >>> 8) & 0xff;
						const db = (dst32[dstIdx] >>> 16) & 0xff;

						const outR = Math.min(255, (sr * alphaNorm + dr * invAlpha) | 0);
						const outG = Math.min(255, (sg * alphaNorm + dg * invAlpha) | 0);
						const outB = Math.min(255, (sb * alphaNorm + db * invAlpha) | 0);
						const outA = Math.min(255, (sa + da * invAlpha) | 0);

						dst32[dstIdx] =
							((outA << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
					}
				}
			}
		}
	}

	/**
	 * 新しい独立したコピーを生成
	 * @returns {SurfaceFrameBuffer}
	 */
	clone() {
		const copyData = new Uint8ClampedArray(this.data);
		return new SurfaceFrameBuffer(this.width, this.height, copyData);
	}

	/**
	 * メモリを明示的に解放・破棄（モバイル GC 圧力を低減）
	 */
	destroy() {
		this.clear();
		this._data32 = null;
		this.data = new Uint8ClampedArray(0);
		this.width = 0;
		this.height = 0;
	}
}

/**
 * 伺か標準レイヤー合成 (Slot-07 Contract: compositeElements)
 * @type {typeof composeSurfaceElements}
 */
export const compositeElements = composeSurfaceElements;
