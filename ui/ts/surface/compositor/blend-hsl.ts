// 4x4 Bayer Dither Matrix (values 0..15)
export const BAYER_MATRIX_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// W3C Compositing & Blending Level 1 HSL helpers
export function lum(r: number, g: number, b: number): number {
	return 0.3 * r + 0.59 * g + 0.11 * b;
}

export function clipColor(r: number, g: number, b: number): [number, number, number] {
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

export function setLum(
	r: number,
	g: number,
	b: number,
	l: number,
): [number, number, number] {
	const d = l - lum(r, g, b);
	return clipColor(r + d, g + d, b + d);
}

export function sat(r: number, g: number, b: number): number {
	return Math.max(r, g, b) - Math.min(r, g, b);
}

export function setSat(
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

export function blendHue(
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

export function blendSaturation(
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

export function blendColor(
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

export function blendLuminosity(
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
