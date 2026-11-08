/**
 * @file shiori-notify.ts
 * @brief UKADOC notify イベント群 (SHIORI/3.0 NOTIFY コマンド)
 *
 * 起動直後・ゴースト切替後などにベースウェア側の環境情報を SHIORI へ
 * 通知する。NOTIFY で通知したイベントへの SHIORI 応答（スクリプト）は
 * baseware が無視する規約のため、応答は保持せず fire-and-forget で送る。
 */

import { shioriNotifyApplicationHeadline } from "./shiori-notify/application-headline.js";
import { shioriNotifyBalloonSurface } from "./shiori-notify/balloon-surface.js";
import { shioriNotifyCore } from "./shiori-notify/core.js";
import { shioriNotifyEnvironment } from "./shiori-notify/environment.js";
import { shioriNotifyGhostLifecycle } from "./shiori-notify/ghost-lifecycle.js";
import { shioriNotifyInputEvents } from "./shiori-notify/input-events.js";
import { shioriNotifySystem } from "./shiori-notify/system.js";

export const shioriNotifyMethods = {
	...shioriNotifyCore,
	...shioriNotifyEnvironment,
	...shioriNotifyGhostLifecycle,
	...shioriNotifyInputEvents,
	...shioriNotifyBalloonSurface,
	...shioriNotifyApplicationHeadline,
	...shioriNotifySystem,
};
