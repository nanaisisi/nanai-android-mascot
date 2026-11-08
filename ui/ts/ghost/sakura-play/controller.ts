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
	isEmpty,
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
<<<<<<< HEAD
	player: unknown;
	queue: unknown[];
	currentJob: unknown;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	player: any;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	queue: any[];
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	currentJob: any;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	isProcessing: boolean;
	isPaused: boolean;
	isQuickMode: boolean;
	waitMultiplier: number;
	charWaitMs: number | null;
	nextJobId: number;
<<<<<<< HEAD
	listeners: Map<string, Set<(...args: unknown[]) => void>>;
	syncObjects: SyncObjectManager;

	constructor(options: unknown = {}) {
=======
	// biome-ignore lint/complexity/noBannedTypes: automated fix
	listeners: Map<string, Set<Function>>;
	syncObjects: SyncObjectManager;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	constructor(options: any = {}) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		this.player = options.player || null;
		if (this.player && !this.player.playbackController) {
			this.player.playbackController = this;
		}
		this.queue = [];
		this.currentJob = null;
		this.isProcessing = false;
		this.isPaused = false;
		this.isQuickMode = false;
		this.waitMultiplier = 1.0;
		this.charWaitMs = null;
		this.nextJobId = 1;
		this.listeners = new Map();
		this.syncObjects = new SyncObjectManager();
	}
}

<<<<<<< HEAD
const proto: unknown = SakuraPlaybackController.prototype;
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
const proto: any = SakuraPlaybackController.prototype;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

proto.on = on;
proto.off = off;
proto.emit = emit;

proto.enqueue = enqueue;
proto.enqueuePriority = enqueuePriority;
proto.interrupt = interrupt;
proto.dequeue = dequeue;
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
