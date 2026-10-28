/**
 * @file balloon-actions.js
 * @brief バルーン関連アクション（テーマ切替・descript反映）の統合モジュール
 */
import { balloonThemeActions } from "./balloon-theme.js";
import { balloonDescriptActions } from "./balloon-descript.js";

export const balloonActions = {
	...balloonThemeActions,
	...balloonDescriptActions,
};
