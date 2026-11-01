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
}

/**
 * 伺か標準レイヤー合成 (Slot-07 Contract: compositeElements)
 * @type {typeof composeSurfaceElements}
 */
export const compositeElements = composeSurfaceElements;
