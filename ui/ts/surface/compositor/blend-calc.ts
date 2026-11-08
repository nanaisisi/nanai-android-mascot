/**
 * Specific composite blend calculations for standard blend modes.
 */

export function calculateBlendMode(
	baseMode: string,
	sr: number,
	sg: number,
	sb: number,
	dr: number,
	dg: number,
	db: number,
): [number, number, number] {
	if (baseMode === "multiply") {
		return [((sr * dr) / 255) | 0, ((sg * dg) / 255) | 0, ((sb * db) / 255) | 0];
	}
	if (baseMode === "screen") {
		return [
			(255 - ((255 - sr) * (255 - dr)) / 255) | 0,
			(255 - ((255 - sg) * (255 - dg)) / 255) | 0,
			(255 - ((255 - sb) * (255 - db)) / 255) | 0,
		];
	}
	if (
		baseMode === "add" ||
		baseMode === "lighter" ||
		baseMode === "add-glow" ||
		baseMode === "addglow"
	) {
		return [
			Math.min(255, sr + dr),
			Math.min(255, sg + dg),
			Math.min(255, sb + db),
		];
	}
	if (baseMode === "darken") {
		return [Math.min(sr, dr), Math.min(sg, dg), Math.min(sb, db)];
	}
	if (baseMode === "darker-color" || baseMode === "darkercolor") {
		const lumSrc = (sr * 299 + sg * 587 + sb * 114) / 1000;
		const lumDst = (dr * 299 + dg * 587 + db * 114) / 1000;
		return lumSrc < lumDst ? [sr, sg, sb] : [dr, dg, db];
	}
	if (baseMode === "lighten") {
		return [Math.max(sr, dr), Math.max(sg, dg), Math.max(sb, db)];
	}
	if (baseMode === "lighter-color" || baseMode === "lightercolor") {
		const lumSrc = (sr * 299 + sg * 587 + sb * 114) / 1000;
		const lumDst = (dr * 299 + dg * 587 + db * 114) / 1000;
		return lumSrc > lumDst ? [sr, sg, sb] : [dr, dg, db];
	}
	if (baseMode === "difference") {
		return [Math.abs(sr - dr), Math.abs(sg - dg), Math.abs(sb - db)];
	}
	if (baseMode === "exclusion") {
		return [
			Math.max(0, Math.min(255, dr + sr - (2 * dr * sr) / 255)) | 0,
			Math.max(0, Math.min(255, dg + sg - (2 * dg * sg) / 255)) | 0,
			Math.max(0, Math.min(255, db + sb - (2 * db * sb) / 255)) | 0,
		];
	}
	if (baseMode === "subtract") {
		return [
			Math.max(0, dr - sr),
			Math.max(0, dg - sg),
			Math.max(0, db - sb),
		];
	}
	if (baseMode === "divide") {
		return [
			sr === 0 ? 255 : Math.min(255, ((dr * 255) / sr) | 0),
			sg === 0 ? 255 : Math.min(255, ((dg * 255) / sg) | 0),
			sb === 0 ? 255 : Math.min(255, ((db * 255) / sb) | 0),
		];
	}
	if (baseMode === "overlay") {
		const overlayCalc = (d: number, s: number) =>
			d < 128
				? Math.min(255, ((2 * d * s) / 255) | 0)
				: Math.min(255, (255 - (2 * (255 - d) * (255 - s)) / 255) | 0);
		return [overlayCalc(dr, sr), overlayCalc(dg, sg), overlayCalc(db, sb)];
	}
	if (baseMode === "softlight" || baseMode === "soft-light") {
		const softCalc = (d: number, s: number) => {
			const df = d / 255;
			const sf = s / 255;
			const res =
				sf < 0.5
					? df - (1 - 2 * sf) * df * (1 - df)
					: df + (2 * sf - 1) * (Math.sqrt(df) - df);
			return Math.max(0, Math.min(255, Math.round(res * 255)));
		};
		return [softCalc(dr, sr), softCalc(dg, sg), softCalc(db, sb)];
	}
	if (
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
		return [dodgeCalc(dr, sr), dodgeCalc(dg, sg), dodgeCalc(db, sb)];
	}
	if (baseMode === "color-burn" || baseMode === "colorburn") {
		const burnCalc = (d: number, s: number) =>
			d === 255
				? 255
				: s === 0
					? 0
					: Math.max(0, 255 - ((((255 - d) * 255) / s) | 0));
		return [burnCalc(dr, sr), burnCalc(dg, sg), burnCalc(db, sb)];
	}
	if (baseMode === "hard-light" || baseMode === "hardlight") {
		const hardCalc = (d: number, s: number) =>
			s < 128
				? Math.min(255, ((2 * s * d) / 255) | 0)
				: Math.min(255, 255 - (((2 * (255 - s) * (255 - d)) / 255) | 0 || 0));
		return [hardCalc(dr, sr), hardCalc(dg, sg), hardCalc(db, sb)];
	}
	if (baseMode === "vivid-light" || baseMode === "vividlight") {
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
			return sVal >= 255 ? 255 : Math.min(255, ((d * 255) / (255 - sVal)) | 0);
		};
		return [vividCalc(dr, sr), vividCalc(dg, sg), vividCalc(db, sb)];
	}
	if (baseMode === "linear-burn" || baseMode === "linearburn") {
		return [
			Math.max(0, dr + sr - 255),
			Math.max(0, dg + sg - 255),
			Math.max(0, db + sb - 255),
		];
	}
	if (baseMode === "linear-light" || baseMode === "linearlight") {
		return [
			Math.max(0, Math.min(255, dr + 2 * sr - 255)),
			Math.max(0, Math.min(255, dg + 2 * sg - 255)),
			Math.max(0, Math.min(255, db + 2 * sb - 255)),
		];
	}
	if (baseMode === "pin-light" || baseMode === "pinlight") {
		const pinCalc = (d: number, s: number) =>
			s < 128 ? Math.min(d, 2 * s) : Math.max(d, 2 * (s - 128));
		return [pinCalc(dr, sr), pinCalc(dg, sg), pinCalc(db, sb)];
	}
	if (baseMode === "hard-mix" || baseMode === "hardmix") {
		return [
			dr + 2 * sr - 255 >= 128 ? 255 : 0,
			dg + 2 * sg - 255 >= 128 ? 255 : 0,
			db + 2 * sb - 255 >= 128 ? 255 : 0,
		];
	}
	return [sr, sg, sb];
}
