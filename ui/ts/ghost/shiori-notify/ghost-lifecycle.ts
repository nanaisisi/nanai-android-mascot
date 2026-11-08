/**
 * @file shiori-notify/ghost-lifecycle.ts
 * @brief ゴースト起動・切替・呼び出し・規約ダイアログ等のライフサイクル通知
 */

import { shioriNotifyLifecycleEvents } from "./ghost-lifecycle/lifecycle-events.js";
import { shioriNotifyBoot } from "./ghost-lifecycle/boot.js";
import { shioriNotifyTerms } from "./ghost-lifecycle/terms.js";
import { shioriNotifyGhostCalls } from "./ghost-lifecycle/ghost-calls.js";

export const shioriNotifyGhostLifecycle = {
	...shioriNotifyLifecycleEvents,
	...shioriNotifyBoot,
	...shioriNotifyTerms,
	...shioriNotifyGhostCalls,
};
