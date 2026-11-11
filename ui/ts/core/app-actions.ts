/**
 * @file app-actions.ts
 * @brief アプリケーションメニューアクション・SHIORIイベント連携・ゴースト切り替え・バルーンテーマ切り替え制御モジュール (UKADOC準拠)
 *
 * 参考仕様:
 * - OnChoiceSelect: リコメンド・ポータル等の選択イベント
 * - OnUpdate: ネットワーク更新トリガー
 * - OnHeadline: ヘッドラインセンス参照
 * - OnBoot: 起動時イベント
 */
import { balloonActions } from "./actions/balloon-actions.js";
import { ghostActions } from "./actions/ghost-actions.js";
import { handleMenuActionImpl } from "./actions/menu-action-dispatcher.js";
import { networkActions } from "./actions/network-actions.js";

export * from "./actions/sstp-fmo-actions.js";
export * from "./async-parallel.js";

export const actionMethods = {
	...balloonActions,
	...ghostActions,
	...networkActions,

	handleMenuAction(action: string, payload: unknown = null) {
		return handleMenuActionImpl(this, action, payload);
	},
};
