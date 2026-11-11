/**
 * @file controller.ts
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
	cancelJob,
	clearQueue,
	dequeue,
	destroy,
	enqueue,
	enqueuePriority,
	filterQueue,
	getCurrentJob,
	getIsPaused,
	getIsProcessing,
	getIsQuickMode,
	getJobById,
	getQueue,
	getQueueLength,
	getQueueSnapshot,
	getStatus,
	hasPendingJobs,
	interrupt,
	isEmpty,
	type PlaybackJob,
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
	player: any;
	queue: PlaybackJob[];
	currentJob: PlaybackJob | null;
	isProcessing: boolean;
	isPaused: boolean;
	pauseTimestamp: number | null;
	isQuickMode: boolean;
	waitMultiplier: number;
	charWaitMs: number | null;
	nextJobId: number;
	listeners: Map<string, Set<(...args: unknown[]) => unknown>>;
	syncObjects: SyncObjectManager;

	constructor(options: unknown = {}) {
		const opts = options as { player?: unknown };
		this.player = opts.player || null;
		if (
			this.player &&
			!(this.player as { playbackController?: unknown }).playbackController
		) {
			(this.player as { playbackController?: unknown }).playbackController =
				this;
		}
		this.queue = [];
		this.currentJob = null;
		this.isProcessing = false;
		this.isPaused = false;
		this.pauseTimestamp = null;
		this.isQuickMode = false;
		this.waitMultiplier = 1.0;
		this.charWaitMs = null;
		this.nextJobId = 1;
		this.listeners = new Map();
		this.syncObjects = new SyncObjectManager();
	}
}

const proto: any = SakuraPlaybackController.prototype;

proto.on = on;
proto.off = off;
proto.emit = emit;

proto.enqueue = enqueue;
proto.enqueuePriority = enqueuePriority;
proto.interrupt = interrupt;
proto.dequeue = dequeue;
proto.getJobById = getJobById;
proto.cancelJob = cancelJob;
proto.filterQueue = filterQueue;
proto.clearQueue = clearQueue;
proto.stop = stop;
proto.destroy = destroy;
proto.pause = pause;
proto.resume = resume;
proto.getQueue = getQueue;
proto.getQueueSnapshot = getQueueSnapshot;
proto.getQueueLength = getQueueLength;
proto.hasPendingJobs = hasPendingJobs;
proto.peekNextJob = peekNextJob;
proto.getCurrentJob = getCurrentJob;
proto.getIsPaused = getIsPaused;
proto.getIsProcessing = getIsProcessing;
proto.getIsQuickMode = getIsQuickMode;
proto.isEmpty = isEmpty;
proto.getStatus = getStatus;
proto._processQueue = processQueue;

proto.setWaitMultiplier = setWaitMultiplier;
proto.getWaitMultiplier = getWaitMultiplier;
proto.setBalloonWait = setBalloonWait;
proto.resetBalloonWait = resetBalloonWait;
proto.calculateWait = calculateWait;
proto.setQuickMode = setQuickMode;

proto.notifyWait = notifyWait;
proto.notifyPause = notifyPause;
proto.notifyClear = notifyClear;
proto.notifyChar = notifyChar;
proto.notifyScope = notifyScope;
