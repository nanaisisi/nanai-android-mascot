import { composeSurfaceElements } from "./compose.js";

// 4x4 Bayer Dither Matrix (values 0..15)
const BAYER_MATRIX_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// W3C Compositing & Blending Level 1 HSL helpers
function lum(r: number, g: number, b: number): number {
	return 0.3 * r + 0.59 * g + 0.11 * b;
}

function clipColor(r: number, g: number, b: number): [number, number, number] {
	const l = lum(r, g, b);
	const n = Math.min(r, g, b);
	const x = Math.max(r, g, b);

	let cr = r;
	let cg = g;
	let cb = b;

	if (n < 0 && Math.abs(l - n) > 1e-6) {
		cr = l + ((cr - l) * l) / (l - n);
		cg = l + ((cg - l) * l) / (l - n);
		cb = l + ((cb - l) * l) / (l - n);
	}
	if (x > 1 && Math.abs(x - l) > 1e-6) {
		cr = l + ((cr - l) * (1 - l)) / (x - l);
		cg = l + ((cg - l) * (1 - l)) / (x - l);
		cb = l + ((cb - l) * (1 - l)) / (x - l);
	}
	return [
		Math.max(0, Math.min(1, cr)),
		Math.max(0, Math.min(1, cg)),
		Math.max(0, Math.min(1, cb)),
	];
}

function setLum(
	r: number,
	g: number,
	b: number,
	l: number,
): [number, number, number] {
	const d = l - lum(r, g, b);
	return clipColor(r + d, g + d, b + d);
}

function sat(r: number, g: number, b: number): number {
	return Math.max(r, g, b) - Math.min(r, g, b);
}

function setSat(
	r: number,
	g: number,
	b: number,
	s: number,
): [number, number, number] {
	const colors: [number, number][] = [
		[r, 0],
		[g, 1],
		[b, 2],
	];
	colors.sort((a, b) => a[0] - b[0]);

	const cMin = colors[0][0];
	const cMid = colors[1][0];
	const cMax = colors[2][0];

	if (cMax > cMin) {
		const newMid = Math.max(
			0,
			Math.min(1, ((cMid - cMin) * s) / (cMax - cMin)),
		);
		const newMax = Math.max(0, Math.min(1, s));
		const newMin = 0;

		const res = [0, 0, 0];
		res[colors[0][1]] = newMin;
		res[colors[1][1]] = newMid;
		res[colors[2][1]] = newMax;
		return [res[0], res[1], res[2]];
	}
	return [0, 0, 0];
}

function blendHue(
	dr: number,
	dg: number,
	db: number,
	sr: number,
	sg: number,
	sb: number,
): [number, number, number] {
	const [r1, g1, b1] = setSat(
		sr / 255,
		sg / 255,
		sb / 255,
		sat(dr / 255, dg / 255, db / 255),
	);
	const [r2, g2, b2] = setLum(r1, g1, b1, lum(dr / 255, dg / 255, db / 255));
	return [
		Math.max(0, Math.min(255, Math.round(r2 * 255))),
		Math.max(0, Math.min(255, Math.round(g2 * 255))),
		Math.max(0, Math.min(255, Math.round(b2 * 255))),
	];
}

function blendSaturation(
	dr: number,
	dg: number,
	db: number,
	sr: number,
	sg: number,
	sb: number,
): [number, number, number] {
	const [r1, g1, b1] = setSat(
		dr / 255,
		dg / 255,
		db / 255,
		sat(sr / 255, sg / 255, sb / 255),
	);
	const [r2, g2, b2] = setLum(r1, g1, b1, lum(dr / 255, dg / 255, db / 255));
	return [
		Math.max(0, Math.min(255, Math.round(r2 * 255))),
		Math.max(0, Math.min(255, Math.round(g2 * 255))),
		Math.max(0, Math.min(255, Math.round(b2 * 255))),
	];
}

function blendColor(
	dr: number,
	dg: number,
	db: number,
	sr: number,
	sg: number,
	sb: number,
): [number, number, number] {
	const [r, g, b] = setLum(
		sr / 255,
		sg / 255,
		sb / 255,
		lum(dr / 255, dg / 255, db / 255),
	);
	return [
		Math.max(0, Math.min(255, Math.round(r * 255))),
		Math.max(0, Math.min(255, Math.round(g * 255))),
		Math.max(0, Math.min(255, Math.round(b * 255))),
	];
}

function blendLuminosity(
	dr: number,
	dg: number,
	db: number,
	sr: number,
	sg: number,
	sb: number,
): [number, number, number] {
	const [r, g, b] = setLum(
		dr / 255,
		dg / 255,
		db / 255,
		lum(sr / 255, sg / 255, sb / 255),
	);
	return [
		Math.max(0, Math.min(255, Math.round(r * 255))),
		Math.max(0, Math.min(255, Math.round(g * 255))),
		Math.max(0, Math.min(255, Math.round(b * 255))),
	];
}

/**
 * @class SurfaceFrameBuffer
 * @description メモリ上のサーフィス画像ピクセルバッファおよび Canvas ラッパー (Slot-07 Contract 準拠)
 */
export class SurfaceFrameBuffer {
	width: unknown;
	height: unknown;
	data: Uint8ClampedArray<ArrayBuffer>;
	_data32: null;
	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {Uint8ClampedArray|Uint8Array|null} [data]
	 */
	constructor(width: unknown, height: unknown, data = null) {
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
	static fromImageData(imageData: {
		width: unknown;
		height: unknown;
		data: null | undefined;
	}) {
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
	static fromCanvas(canvas: {
		getContext: (
			arg0: string,
			arg1: { willReadFrequently: boolean },
		) => unknown;
		width: unknown;
		height: unknown;
	}) {
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
				} else if (
					m.startsWith("blend-") ||
					m.endsWith("-fast") ||
					m === "multiply" ||
					m === "screen" ||
					m === "add" ||
					m === "lighter" ||
					m === "darken" ||
					m === "lighten" ||
					m === "difference" ||
					m === "exclusion" ||
					m === "subtract" ||
					m === "divide" ||
					m === "softlight" ||
					m === "soft-light" ||
					m === "hue" ||
					m === "saturation" ||
					m === "color" ||
					m === "luminosity" ||
					m === "dither" ||
					m === "overlaymultiply" ||
					m === "overlayscreen"
				) {
					const sa = (srcPixel >>> 24) & 0xff;
					if (sa === 0) continue;

					const isFast =
						m.endsWith("-fast") ||
						m === "overlaymultiply" ||
						m === "overlayscreen";
					const baseMode = m
						.replace(/^blend-/, "")
						.replace(/-fast$/, "")
						.replace(/^overlay(?=multiply|screen)/, "");

					const sr = srcPixel & 0xff;
					const sg = (srcPixel >>> 8) & 0xff;
					const sb = (srcPixel >>> 16) & 0xff;

					const dr = dst32[dstIdx] & 0xff;
					const dg = (dst32[dstIdx] >>> 8) & 0xff;
					const db = (dst32[dstIdx] >>> 16) & 0xff;
					const da = (dst32[dstIdx] >>> 24) & 0xff;

					let br = sr;
					let bg = sg;
					let bb = sb;

					if (baseMode === "multiply") {
						br = ((sr * dr) / 255) | 0;
						bg = ((sg * dg) / 255) | 0;
						bb = ((sb * db) / 255) | 0;
					} else if (baseMode === "screen") {
						br = (255 - ((255 - sr) * (255 - dr)) / 255) | 0;
						bg = (255 - ((255 - sg) * (255 - dg)) / 255) | 0;
						bb = (255 - ((255 - sb) * (255 - db)) / 255) | 0;
					} else if (
						baseMode === "add" ||
						baseMode === "lighter" ||
						baseMode === "add-glow" ||
						baseMode === "addglow"
					) {
						br = Math.min(255, sr + dr);
						bg = Math.min(255, sg + dg);
						bb = Math.min(255, sb + db);
					} else if (baseMode === "darken") {
						br = Math.min(sr, dr);
						bg = Math.min(sg, dg);
						bb = Math.min(sb, db);
					} else if (
						baseMode === "darker-color" ||
						baseMode === "darkercolor"
					) {
						const lumSrc = (sr * 299 + sg * 587 + sb * 114) / 1000;
						const lumDst = (dr * 299 + dg * 587 + db * 114) / 1000;
						if (lumSrc < lumDst) {
							br = sr;
							bg = sg;
							bb = sb;
						} else {
							br = dr;
							bg = dg;
							bb = db;
						}
					} else if (baseMode === "lighten") {
						br = Math.max(sr, dr);
						bg = Math.max(sg, dg);
						bb = Math.max(sb, db);
					} else if (
						baseMode === "lighter-color" ||
						baseMode === "lightercolor"
					) {
						const lumSrc = (sr * 299 + sg * 587 + sb * 114) / 1000;
						const lumDst = (dr * 299 + dg * 587 + db * 114) / 1000;
						if (lumSrc > lumDst) {
							br = sr;
							bg = sg;
							bb = sb;
						} else {
							br = dr;
							bg = dg;
							bb = db;
						}
					} else if (baseMode === "difference") {
						br = Math.abs(sr - dr);
						bg = Math.abs(sg - dg);
						bb = Math.abs(sb - db);
					} else if (baseMode === "exclusion") {
						br = Math.max(0, Math.min(255, dr + sr - (2 * dr * sr) / 255)) | 0;
						bg = Math.max(0, Math.min(255, dg + sg - (2 * dg * sg) / 255)) | 0;
						bb = Math.max(0, Math.min(255, db + sb - (2 * db * sb) / 255)) | 0;
					} else if (baseMode === "subtract") {
						br = Math.max(0, dr - sr);
						bg = Math.max(0, dg - sg);
						bb = Math.max(0, db - sb);
					} else if (baseMode === "divide") {
						br = sr === 0 ? 255 : Math.min(255, ((dr * 255) / sr) | 0);
						bg = sg === 0 ? 255 : Math.min(255, ((dg * 255) / sg) | 0);
						bb = sb === 0 ? 255 : Math.min(255, ((db * 255) / sb) | 0);
					} else if (baseMode === "overlay") {
						const overlayCalc = (d: number, s: number) =>
							d < 128
								? Math.min(255, ((2 * d * s) / 255) | 0)
								: Math.min(255, (255 - (2 * (255 - d) * (255 - s)) / 255) | 0);
						br = overlayCalc(dr, sr);
						bg = overlayCalc(dg, sg);
						bb = overlayCalc(db, sb);
					} else if (baseMode === "softlight" || baseMode === "soft-light") {
						const softCalc = (d: number, s: number) => {
							const df = d / 255;
							const sf = s / 255;
							const res =
								sf < 0.5
									? df - (1 - 2 * sf) * df * (1 - df)
									: df + (2 * sf - 1) * (Math.sqrt(df) - df);
							return Math.max(0, Math.min(255, Math.round(res * 255)));
						};
						br = softCalc(dr, sr);
						bg = softCalc(dg, sg);
						bb = softCalc(db, sb);
					} else if (
						baseMode === "color-dodge" ||
						baseMode === "colordodge" ||
						baseMode === "color-dodge-glow" ||
						baseMode === "colordodgeglow"
					) {
						const dodgeCalc = (d: number, s: number) =>
							d === 0
								? 0
								: s >= 255
									? 255
									: Math.min(255, ((d * 255) / (255 - s)) | 0);
						br = dodgeCalc(dr, sr);
						bg = dodgeCalc(dg, sg);
						bb = dodgeCalc(db, sb);
					} else if (baseMode === "color-burn" || baseMode === "colorburn") {
						const burnCalc = (d: number, s: number) =>
							d === 255
								? 255
								: s === 0
									? 0
									: Math.max(0, 255 - ((((255 - d) * 255) / s) | 0));
						br = burnCalc(dr, sr);
						bg = burnCalc(dg, sg);
						bb = burnCalc(db, sb);
					} else if (baseMode === "hard-light" || baseMode === "hardlight") {
						const hardCalc = (d: number, s: number) =>
							s < 128
								? Math.min(255, ((2 * s * d) / 255) | 0)
								: Math.min(
										255,
										255 - (((2 * (255 - s) * (255 - d)) / 255) | 0 || 0),
									);
						br = hardCalc(dr, sr);
						bg = hardCalc(dg, sg);
						bb = hardCalc(db, sb);
					} else if (baseMode === "vivid-light" || baseMode === "vividlight") {
						const vividCalc = (d: number, s: number) => {
							if (s < 128) {
								if (d === 255) return 255;
								if (s === 0) return 0;
								const s2 = s * 2;
								return Math.max(0, 255 - ((((255 - d) * 255) / s2) | 0));
							}
							if (d === 0) return 0;
							if (s >= 255) return 255;
							const sVal = 2 * (s - 128);
							return sVal >= 255
								? 255
								: Math.min(255, ((d * 255) / (255 - sVal)) | 0);
						};
						br = vividCalc(dr, sr);
						bg = vividCalc(dg, sg);
						bb = vividCalc(db, sb);
					} else if (baseMode === "linear-burn" || baseMode === "linearburn") {
						br = Math.max(0, dr + sr - 255);
						bg = Math.max(0, dg + sg - 255);
						bb = Math.max(0, db + sb - 255);
					} else if (
						baseMode === "linear-light" ||
						baseMode === "linearlight"
					) {
						br = Math.max(0, Math.min(255, dr + 2 * sr - 255));
						bg = Math.max(0, Math.min(255, dg + 2 * sg - 255));
						bb = Math.max(0, Math.min(255, db + 2 * sb - 255));
					} else if (baseMode === "pin-light" || baseMode === "pinlight") {
						const pinCalc = (d: number, s: number) =>
							s < 128 ? Math.min(d, 2 * s) : Math.max(d, 2 * (s - 128));
						br = pinCalc(dr, sr);
						bg = pinCalc(dg, sg);
						bb = pinCalc(db, sb);
					} else if (baseMode === "hard-mix" || baseMode === "hardmix") {
						br = dr + 2 * sr - 255 >= 128 ? 255 : 0;
						bg = dg + 2 * sg - 255 >= 128 ? 255 : 0;
						bb = db + 2 * sb - 255 >= 128 ? 255 : 0;
					} else if (baseMode === "hue") {
						[br, bg, bb] = blendHue(dr, dg, db, sr, sg, sb);
					} else if (baseMode === "saturation") {
						[br, bg, bb] = blendSaturation(dr, dg, db, sr, sg, sb);
					} else if (baseMode === "color") {
						[br, bg, bb] = blendColor(dr, dg, db, sr, sg, sb);
					} else if (baseMode === "luminosity") {
						[br, bg, bb] = blendLuminosity(dr, dg, db, sr, sg, sb);
					} else if (baseMode === "dither") {
						const bayerVal = BAYER_MATRIX_4X4[((ty & 3) << 2) | (tx & 3)];
						const threshold = (((bayerVal * 2 + 1) * 255) / 32) | 0;
						if (sa > threshold) {
							dst32[dstIdx] = ((255 << 24) | (sb << 16) | (sg << 8) | sr) >>> 0;
						}
						continue;
					}

					if (isFast) {
						dst32[dstIdx] = ((sa << 24) | (bb << 16) | (bg << 8) | br) >>> 0;
					} else {
						const alphaNorm = sa / 255;
						const invAlpha = 1 - alphaNorm;
						const outR = Math.min(255, (br * alphaNorm + dr * invAlpha) | 0);
						const outG = Math.min(255, (bg * alphaNorm + dg * invAlpha) | 0);
						const outB = Math.min(255, (bb * alphaNorm + db * invAlpha) | 0);
						const outA = Math.min(255, (sa + da * invAlpha) | 0);
						dst32[dstIdx] =
							((outA << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
					}
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
