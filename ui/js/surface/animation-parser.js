/**
 * SERIKOアニメーションのタイムライン計算および interval / wait パース補助
 */
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * pattern 列から Rust（`crates/ui::animation`）で実行スケジュールを計算する
 * @param {Array<{index?: number, wait?: number|string}>} patterns
 * @returns {Promise<{ frames: number[], totalMs: number }|null>}
 */
export async function buildAnimationTimeline(patterns) {
	if (!patterns?.length || !isTauriAvailable()) return null;
	try {
		const timeline = await invoke("animation_timeline", {
			patterns: patterns.map((pat, index) => ({
				index: pat.index ?? index,
				waitMs: resolvePatternWait(pat.wait, pat.waitMax),
			})),
		});
		const frames = (timeline?.frames ?? []).map((f) => f.atMs ?? f.at_ms ?? 0);
		return {
			frames,
			totalMs: timeline?.totalMs ?? timeline?.total_ms ?? 0,
		};
	} catch (_err) {
		return null;
	}
}

/**
 * pattern のウェイト（ミリ秒）。
 * @param {number|string|undefined} wait
 * @param {number|string|null|undefined} [waitMax]
 * @returns {number}
 */
export function resolvePatternWait(wait, waitMax = null) {
	const toNumber = (value) => {
		const match = String(value ?? "")
			.trim()
			.match(/^(\d+)(?:-(\d+))?$/);
		if (!match) return null;
		const min = Number(match[1]);
		const max = match[2] == null ? min : Number(match[2]);
		return { min: Math.min(min, max), span: Math.abs(max - min) };
	};
	const low = toNumber(wait);
	if (low == null) return 0;
	const high = toNumber(waitMax);
	if (high != null) {
		const min = low.min;
		const span = Math.max(high.min + high.span - min, 0);
		return min + Math.floor(Math.random() * (span + 1));
	}
	return low.min + Math.floor(Math.random() * (low.span + 1));
}

/**
 * animation*.interval を UKADOC の組み合わせ指定として解釈する。
 * @param {string|undefined} interval
 * @returns {{ kinds: Set<string>, param: number|null }}
 */
export function parseInterval(interval) {
	const value = String(interval || "sometimes")
		.trim()
		.toLowerCase();
	const comma = value.indexOf(",");
	const head = comma < 0 ? value : value.slice(0, comma);
	const raw = comma < 0 ? "" : value.slice(comma + 1).trim();
	const param = raw === "" ? null : Number.parseFloat(raw);
	const kinds = new Set(
		head
			.split("+")
			.map((kind) => kind.trim())
			.map((kind) => (kind === "\\e" || kind === "/e" ? "yen-e" : kind))
			.filter(Boolean),
	);
	return { kinds, param: Number.isFinite(param) ? param : null };
}
