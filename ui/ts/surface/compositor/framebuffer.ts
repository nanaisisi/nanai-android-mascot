import { composeSurfaceElements } from "./compose.js";
import { blendBuffers } from "./composite-blend.js";

export {
	BAYER_MATRIX_4X4,
	blendColor,
	blendHue,
	blendLuminosity,
	blendSaturation,
	clipColor,
	lum,
	sat,
	setLum,
	setSat,
} from "./blend-hsl.js";
export { blendBuffers } from "./composite-blend.js";

/**
 * @class SurfaceFrameBuffer
 * @description メモリ上のサーフィス画像ピクセルバッファおよび Canvas ラッパー (Slot-07 Contract 準拠)
 */
export class SurfaceFrameBuffer {
	width: number;
	height: number;
	data: Uint8ClampedArray<ArrayBuffer>;
	_data32: Uint32Array | null;
	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {Uint8ClampedArray|Uint8Array|null} [data]
	 */
	constructor(
		width: number,
		height: number,
		data: Uint8ClampedArray<ArrayBuffer> | null = null,
	) {
		this.width = width;
		this.height = height;
		this.data =
			data || new Uint8ClampedArray((width as number) * (height as number) * 4);
		/** @type {Uint32Array|null} */
		this._data32 = null;
	}

	/**
	 * 32bit 整数ピクセル配列ビュー (ゼロコピー・高速演算用)
	 * @returns {Uint32Array}
	 */
	get data32(): Uint32Array {
		if (
			!this._data32 ||
			this._data32.buffer !== this.data.buffer ||
			this._data32.byteOffset !== this.data.byteOffset
		) {
			this._data32 = new Uint32Array(
				this.data.buffer,
				this.data.byteOffset,
				((this.width as number) * (this.height as number)) | 0,
			);
		}
		return this._data32;
	}

	/**
	 * ImageData から SurfaceFrameBuffer を作成
	 * @param {ImageData} imageData
	 * @returns {SurfaceFrameBuffer}
	 */
	static fromImageData(imageData: {
		width: unknown;
		height: unknown;
		data: unknown;
	}) {
		return new SurfaceFrameBuffer(
			Number(imageData.width),
			Number(imageData.height),
			imageData.data as unknown as Uint8ClampedArray<ArrayBuffer>,
		);
	}

	/**
	 * HTMLCanvasElement から SurfaceFrameBuffer を非同期取得
	 * @param {HTMLCanvasElement} canvas
	 * @returns {SurfaceFrameBuffer|null}
	 */
	static fromCanvas(canvas: {
		getContext: (
			arg0: string,
			arg1?: { willReadFrequently: boolean },
		) => unknown;
		width: unknown;
		height: unknown;
	}) {
		const ctx = canvas.getContext("2d", { willReadFrequently: true }) as
			| CanvasRenderingContext2D
			| null;
		if (!ctx) return null;
		const imgData = ctx.getImageData(
			0,
			0,
			Number(canvas.width),
			Number(canvas.height),
		);
		return SurfaceFrameBuffer.fromImageData(imgData);
	}

	/**
	 * 指定座標のピクセル色 (r, g, b, a) を取得
	 * @param {number} x
	 * @param {number} y
	 * @returns {[number, number, number, number]|null}
	 */
	getPixel(x: number, y: number) {
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
	setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
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
	clearRect(x: number, y: number, w: number, h: number) {
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
	 * バッファ全体を指定色 (r, g, b, a) で塗りつぶす
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} [a=255]
	 */
	fill(r: number, g: number, b: number, a = 255) {
		const pixel =
			(((a & 0xff) << 24) |
				((b & 0xff) << 16) |
				((g & 0xff) << 8) |
				(r & 0xff)) >>>
			0;
		this.data32.fill(pixel);
	}

	/**
	 * 指定した部分矩形領域を指定色 (r, g, b, a) で塗りつぶす
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} [a=255]
	 */
	fillRect(
		x: number,
		y: number,
		w: number,
		h: number,
		r: number,
		g: number,
		b: number,
		a = 255,
	) {
		if (w <= 0 || h <= 0) return;
		const width = this.width as number;
		const height = this.height as number;
		const startX = Math.max(0, x | 0);
		const startY = Math.max(0, y | 0);
		const endX = Math.min(width, (x + w) | 0);
		const endY = Math.min(height, (y + h) | 0);

		if (startX >= endX || startY >= endY) return;

		const pixel =
			(((a & 0xff) << 24) |
				((b & 0xff) << 16) |
				((g & 0xff) << 8) |
				(r & 0xff)) >>>
			0;
		const d32 = this.data32;
		const rowWidth = endX - startX;

		for (let row = startY; row < endY; row++) {
			const offset = row * width + startX;
			d32.fill(pixel, offset, offset + rowWidth);
		}
	}

	/**
	 * 指定した部分矩形領域を切り出して新しい SurfaceFrameBuffer を作成
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @returns {SurfaceFrameBuffer|null}
	 */
	copyRect(
		x: number,
		y: number,
		w: number,
		h: number,
	): SurfaceFrameBuffer | null {
		const width = this.width as number;
		const height = this.height as number;
		if (w <= 0 || h <= 0 || x >= width || y >= height) {
			return null;
		}
		const startX = Math.max(0, x | 0);
		const startY = Math.max(0, y | 0);
		const endX = Math.min(width, (x + w) | 0);
		const endY = Math.min(height, (y + h) | 0);
		const actualW = endX - startX;
		const actualH = endY - startY;

		if (actualW <= 0 || actualH <= 0) return null;

		const sub = new SurfaceFrameBuffer(actualW, actualH);
		const src32 = this.data32;
		const dst32 = sub.data32;

		for (let row = 0; row < actualH; row++) {
			const srcOffset = (startY + row) * width + startX;
			const dstOffset = row * actualW;
			dst32.set(src32.subarray(srcOffset, srcOffset + actualW), dstOffset);
		}

		return sub;
	}

	/**
	 * 別の SurfaceFrameBuffer を指定座標 (dx, dy) に合成
	 * @param {SurfaceFrameBuffer} src
	 * @param {number} [dx=0]
	 * @param {number} [dy=0]
	 * @param {string} [method="overlay"]
	 */
	compositeBuffer(
		src: { width: unknown; height: unknown; data32: unknown },
		dx = 0,
		dy = 0,
		method = "overlay",
	) {
		if (!src?.width || !src.height) return;
		blendBuffers(
			this.data32,
			this.width as number,
			this.height as number,
			src.data32 as Uint32Array,
			src.width as number,
			src.height as number,
			dx,
			dy,
			method,
		);
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
