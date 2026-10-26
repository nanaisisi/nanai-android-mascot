/**
 * さくらスクリプト（SakuraScript）トークナイザー・パーサー
 *
 * - `sakura-rust-bridge.js`: Rust コアパーサー経由の解析とトークン変換
 * - `sakura-tokenizer.js`: JS フォールバック・トークナイザー
 */

/**
 * @typedef {Object} SakuraScriptToken
 * @property {string} type - トークン種別 ('scope'|'surface'|'animation'|'wait'|'newline'|'clear'|'pause'|'quick_toggle'|'anchor_begin'|'anchor_end'|'choice'|'command'|'char'|'end')
 * @property {any} [value] - トークンの値
 * @property {number} [animId] - アニメーションID
 * @property {boolean} [wait] - アニメーション完了待ちフラグ
 * @property {boolean} [half] - 半改行フラグ
 * @property {string} [id] - 選択肢やアンカーのID
 * @property {string} [text] - 選択肢テキスト
 * @property {string[]} [args] - コマンドやアンカーの引数リスト
 */

export {
	parseSakuraScriptAsync,
	rustCommandsToTokens,
} from "./sakura-rust-bridge.js";
export { parseSakuraScript } from "./sakura-tokenizer.js";
