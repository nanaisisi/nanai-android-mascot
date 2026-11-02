/**
 * バルーンテキスト内の選択肢・アンカーなどインタラクティブ要素のイベントバインドモジュール
 */

import { emit } from "../../core/tauri-helper.js";

/**
 * 選択肢ボタン (\q) およびアンカーリンク (\_a) のクリックイベントを設定
 * @param {HTMLElement | null} balloonText
 * @param {number} scopeId
 */
export function setupInteractiveElements(balloonText, scopeId) {
	if (!balloonText) return;

	// 選択肢ボタン (\q)
	balloonText.querySelectorAll(".balloon-choice-btn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const choiceId = btn.getAttribute("data-choice-id");
			const choiceText = btn.textContent;
			void emit("balloon-choice-selected", { scopeId, choiceId, choiceText });
		});
	});

	// アンカーリンク (\_a)
	balloonText.querySelectorAll(".balloon-anchor").forEach((anchor) => {
		anchor.addEventListener("click", (e) => {
			e.stopPropagation();
			const anchorId = anchor.getAttribute("data-anchor-id");
			void emit("balloon-anchor-selected", { scopeId, anchorId });
		});
	});
}
