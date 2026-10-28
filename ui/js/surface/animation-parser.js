/**
 * @file animation-parser.js
 * @brief SERIKO アニメーションのタイムライン計算および interval / wait パース補助モジュール
 *
 * UKADOC / SSP の SERIKO アニメーション定義における interval 指定の解釈、
 * pattern の wait（最小-最大ランダム範囲）解決、および Rust コア
 * （`crates/ui::animation` / `animation_timeline` コマンド）との連携による
 * 高精度なアニメーション実行スケジュール計算を担当します。
 */
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * pattern 列から Rust（`crates/ui::animation`）で実行スケジュールを計算する
 *
 * `frames[i]` は `frames[i-1]` との差分待ち時間（累積 at_ms）で描画します。
 * 失敗時（Tauri 未検出やオフライン等）は null を返し、レガシーの逐次待機へフォールバックします。
 *
 * @param {Array<{index?: number, wait?: number|string, waitMax?: number|string|null}>} patterns - アニメーションパターン列
 * @returns {Promise<{ frames: number[], totalMs: number }|null>} タイムラインフレーム情報または null
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
 * pattern のウェイト（ミリ秒）を解決する。
 * SSP の「最小-最大」指定（例: `100-200`）に対応し、指定範囲内でランダムにミリ秒を選定します。
 *
 * @param {number|string|undefined} wait - 最小ウェイトまたは単一ウェイト値
 * @param {number|string|null|undefined} [waitMax] - 上限（Rust パースの `wait_max`）
 * @returns {number} 解決されたウェイト値（ミリ秒）
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
 * animation*.interval を UKADOC の組み合わせ指定（SSP: `+` 区切り）として解釈する。
 * パラメータは末尾にカンマ区切りで指定できます（例: `bind+random,5`, `periodic,4`）。
 *
 * @param {string|undefined} interval - インターバル文字列（例: "sometimes", "always", "periodic,3"）
 * @returns {{ kinds: Set<string>, param: number|null }} 解析された種類セットと数値パラメータ
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
