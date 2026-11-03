/**
 * @file controller.js
 * @brief イベント駆動型さくらスクリプト再生キュー・ウェイト制御コントローラー (Slot-05)
 */

import { emit, off, on } from "./controller/events.js";
import {
	notifyChar,
	notifyClear,
	notifyPause,
	notifyScope,
	notifyWait,
} from "./controller/notifications.js";
import {
	clearQueue,
	dequeue,
	destroy,
	enqueue,
	enqueuePriority,
	getCurrentJob,
	getIsPaused,
	getIsProcessing,
	getIsQuickMode,
	getQueue,
	getQueueLength,
	getQueueSnapshot,
	getStatus,
	hasPendingJobs,
	interrupt,
	pause,
	peekNextJob,
	processQueue,
	resume,
	stop,
} from "./controller/queue.js";
import {
	calculateWait,
	getWaitMultiplier,
	resetBalloonWait,
	setBalloonWait,
	setQuickMode,
	setWaitMultiplier,
} from "./controller/wait.js";
import { SyncObjectManager } from "./sync-object.js";

export class SakuraPlaybackController {
	/**
	 * @param {object} [options]
	 * @param {import('../sakura-script.js').SakuraScriptPlayer} [options.player]
	 */
	constructor(options = {}) {
		this.player = options.player || null;
		if (this.player && !this.player.playbackController) {
			this.player.playbackController = this;
		}
		/** @type {Array<{ id: number, script: string, resolve: Function, reject: Function }>} */
		this.queue = [];
		this.currentJob = null;
		this.isProcessing = false;
		this.isPaused = false;
		this.isQuickMode = false;
		this.waitMultiplier = 1.0;
		/** @type {number|null} ミリ秒絶対指定時の待機時間 (\![set,balloonwait,<N>ms]) */
		this.charWaitMs = null;
		this.nextJobId = 1;
		/** @type {Map<string, Set<Function>>} */
		this.listeners = new Map();
		/** @type {SyncObjectManager} UKADOC同期オブジェクト管理 (Cycle 6) */
		this.syncObjects = new SyncObjectManager();
	}
}

// イベントリスナー操作
SakuraPlaybackController.prototype.on = on;
SakuraPlaybackController.prototype.off = off;
SakuraPlaybackController.prototype.emit = emit;

// キュー操作・制御・状態参照
SakuraPlaybackController.prototype.enqueue = enqueue;
SakuraPlaybackController.prototype.enqueuePriority = enqueuePriority;
SakuraPlaybackController.prototype.interrupt = interrupt;
SakuraPlaybackController.prototype.dequeue = dequeue;
SakuraPlaybackController.prototype.clearQueue = clearQueue;
SakuraPlaybackController.prototype.stop = stop;
SakuraPlaybackController.prototype.destroy = destroy;
SakuraPlaybackController.prototype.pause = pause;
SakuraPlaybackController.prototype.resume = resume;
SakuraPlaybackController.prototype.getQueue = getQueue;
SakuraPlaybackController.prototype.getQueueSnapshot = getQueueSnapshot;
SakuraPlaybackController.prototype.getQueueLength = getQueueLength;
SakuraPlaybackController.prototype.hasPendingJobs = hasPendingJobs;
SakuraPlaybackController.prototype.peekNextJob = peekNextJob;
SakuraPlaybackController.prototype.getCurrentJob = getCurrentJob;
SakuraPlaybackController.prototype.getIsPaused = getIsPaused;
SakuraPlaybackController.prototype.getIsProcessing = getIsProcessing;
SakuraPlaybackController.prototype.getIsQuickMode = getIsQuickMode;
SakuraPlaybackController.prototype.getStatus = getStatus;
SakuraPlaybackController.prototype._processQueue = processQueue;

// ウェイト・倍率・即時表示制御
SakuraPlaybackController.prototype.setWaitMultiplier = setWaitMultiplier;
SakuraPlaybackController.prototype.getWaitMultiplier = getWaitMultiplier;
SakuraPlaybackController.prototype.setBalloonWait = setBalloonWait;
SakuraPlaybackController.prototype.resetBalloonWait = resetBalloonWait;
SakuraPlaybackController.prototype.calculateWait = calculateWait;
SakuraPlaybackController.prototype.setQuickMode = setQuickMode;

// イベント通知ヘルパー
SakuraPlaybackController.prototype.notifyWait = notifyWait;
SakuraPlaybackController.prototype.notifyPause = notifyPause;
SakuraPlaybackController.prototype.notifyClear = notifyClear;
SakuraPlaybackController.prototype.notifyChar = notifyChar;
SakuraPlaybackController.prototype.notifyScope = notifyScope;
