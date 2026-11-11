/**
 * @file queue.ts
 * @brief SakuraPlaybackController 向け再生キュー操作およびループ処理ロジック
 */

export interface PlaybackJob {
	id: number;
	script: string;
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
	priority?: boolean;
}

export function enqueue(this: unknown, script: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const self = this as {
			nextJobId: number;
			queue: PlaybackJob[];
			emit: (event: string, payload?: unknown) => void;
			_processQueue: () => void;
		};
		const job: PlaybackJob = {
			id: self.nextJobId++,
			script,
			resolve,
			reject,
		};
		self.queue.push(job);
		self.emit("queue:enqueued", { job, queueLength: self.queue.length });
		self._processQueue();
	});
}

export function enqueueMany(
	this: unknown,
	scripts: string[],
): Promise<unknown[]> {
	if (!Array.isArray(scripts) || scripts.length === 0) {
		return Promise.resolve([]);
	}
	const self = this as { enqueue: (s: string) => Promise<unknown> };
	return Promise.all(scripts.map((s) => self.enqueue(s)));
}

export function enqueuePriority(
	this: unknown,
	script: string,
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const self = this as {
			nextJobId: number;
			queue: PlaybackJob[];
			emit: (event: string, payload?: unknown) => void;
			_processQueue: () => void;
		};
		const job: PlaybackJob = {
			id: self.nextJobId++,
			script,
			resolve,
			reject,
			priority: true,
		};
		self.queue.unshift(job);
		self.emit("queue:enqueued", {
			job,
			priority: true,
			queueLength: self.queue.length,
		});
		self._processQueue();
	});
}

export function interrupt(this: unknown, script: string): Promise<unknown> {
	const self = this as {
		player?: { skip: () => void };
		enqueuePriority: (s: string) => Promise<unknown>;
	};
	if (self.player) {
		self.player.skip();
	}
	return self.enqueuePriority(script);
}

export function dequeue(this: unknown) {
	const self = this as {
		queue: PlaybackJob[];
		emit: (event: string, payload?: unknown) => void;
	};
	const job = self.queue.shift();
	if (job) {
		self.emit("queue:dequeued", { job, queueLength: self.queue.length });
	}
	return job;
}

export function getJobById(this: unknown, id: number): PlaybackJob | null {
	const self = this as {
		currentJob: PlaybackJob | null;
		queue: PlaybackJob[];
	};
	if (self.currentJob && self.currentJob.id === id) {
		return self.currentJob;
	}
	return self.queue.find((j) => j.id === id) || null;
}

export function findJobs(
	this: unknown,
	predicate: (job: PlaybackJob) => boolean,
): PlaybackJob[] {
	const self = this as {
		currentJob: PlaybackJob | null;
		queue: PlaybackJob[];
	};
	const matches: PlaybackJob[] = [];
	if (self.currentJob && predicate(self.currentJob)) {
		matches.push(self.currentJob);
	}
	for (const job of self.queue) {
		if (predicate(job)) {
			matches.push(job);
		}
	}
	return matches;
}

export function retryJob(this: unknown, id: number): Promise<unknown> | null {
	const self = this as {
		getJobById: (id: number) => PlaybackJob | null;
		enqueuePriority: (s: string) => Promise<unknown>;
	};
	const job = self.getJobById(id);
	if (!job) return null;
	return self.enqueuePriority(job.script);
}

export function cancelJob(
	this: unknown,
	id: number,
	reason: string = "Job cancelled",
): boolean {
	const self = this as {
		currentJob: PlaybackJob | null;
		queue: PlaybackJob[];
		emit: (event: string, payload?: unknown) => void;
		player?: { skip: () => void };
	};
	// もし現在再生中のジョブであればプレイヤーをスキップ
	if (self.currentJob && self.currentJob.id === id) {
		const job = self.currentJob;
		if (self.player) {
			self.player.skip();
		}
		self.emit("queue:job-cancelled", { id, job, reason, wasCurrent: true });
		return true;
	}

	const index = self.queue.findIndex((j) => j.id === id);
	if (index !== -1) {
		const [job] = self.queue.splice(index, 1);
		job.reject(new Error(reason));
		self.emit("queue:job-cancelled", {
			id,
			job,
			reason,
			queueLength: self.queue.length,
		});
		return true;
	}
	return false;
}

export function filterQueue(
	this: unknown,
	predicate: (job: PlaybackJob) => boolean,
	cancelReason: string = "Filtered out of queue",
): number {
	const self = this as {
		queue: PlaybackJob[];
		emit: (event: string, payload?: unknown) => void;
	};
	const remaining: PlaybackJob[] = [];
	const removed: PlaybackJob[] = [];

	for (const job of self.queue) {
		if (predicate(job)) {
			remaining.push(job);
		} else {
			removed.push(job);
		}
	}

	self.queue = remaining;
	for (const job of removed) {
		job.reject(new Error(cancelReason));
	}
	if (removed.length > 0) {
		self.emit("queue:filtered", {
			removedCount: removed.length,
			queueLength: self.queue.length,
		});
	}
	return removed.length;
}

export function clearQueue(this: unknown) {
	const self = this as {
		queue: PlaybackJob[];
		emit: (event: string, payload?: unknown) => void;
	};
	const canceled = [...self.queue];
	self.queue = [];
	for (const job of canceled) {
		job.reject(new Error("Playback queue cleared"));
	}
	self.emit("queue:cleared", { canceledCount: canceled.length });
}

export function stop(this: unknown) {
	const self = this as {
		clearQueue: () => void;
		syncObjects?: { clear: () => void };
		player?: { skip: () => void };
		currentJob: unknown;
		isProcessing: boolean;
		emit: (event: string) => void;
	};
	self.clearQueue();
	if (self.syncObjects) {
		self.syncObjects.clear();
	}
	if (self.player) {
		self.player.skip();
	}
	self.currentJob = null;
	self.isProcessing = false;
	self.emit("playback:stopped");
}

export function destroy(this: unknown) {
	const self = this as {
		stop: () => void;
		emit: (event: string) => void;
		listeners: Map<string, unknown>;
		isPaused: boolean;
		syncObjects?: { clear: () => void };
		player?: { destroy?: () => void };
	};
	self.stop();
	self.emit("playback:destroyed");
	self.listeners.clear();
	self.isPaused = true;
	if (self.syncObjects) {
		self.syncObjects.clear();
	}
	if (self.player?.destroy) {
		self.player.destroy();
	}
}

export function pause(this: unknown) {
	const self = this as {
		isPaused: boolean;
		pauseTimestamp?: number | null;
		emit: (event: string, payload?: unknown) => void;
	};
	if (!self.isPaused) {
		self.isPaused = true;
		self.pauseTimestamp = Date.now();
		self.emit("queue:paused", { pauseTimestamp: self.pauseTimestamp });
	}
}

export function resume(this: unknown) {
	const self = this as {
		isPaused: boolean;
		pauseTimestamp?: number | null;
		emit: (event: string, payload?: unknown) => void;
		_processQueue: () => void;
	};
	if (self.isPaused) {
		const durationMs = self.pauseTimestamp
			? Math.max(0, Date.now() - self.pauseTimestamp)
			: 0;
		self.isPaused = false;
		self.pauseTimestamp = null;
		self.emit("queue:resumed", { pausedDurationMs: durationMs });
		self._processQueue();
	}
}

export function getQueue(this: unknown) {
	const self = this as { queue: PlaybackJob[] };
	return [...self.queue];
}

export function getQueueSnapshot(this: unknown) {
	const self = this as { queue: PlaybackJob[] };
	return self.queue.map((job) => ({ id: job.id, script: job.script }));
}

export function getQueueLength(this: unknown): number {
	const self = this as { queue: PlaybackJob[] };
	return self.queue.length;
}

export function hasPendingJobs(this: unknown): boolean {
	const self = this as { isProcessing: boolean; queue: PlaybackJob[] };
	return self.isProcessing || self.queue.length > 0;
}

export function peekNextJob(this: unknown) {
	const self = this as { queue: PlaybackJob[] };
	if (self.queue.length === 0) return null;
	const job = self.queue[0];
	return { id: job.id, script: job.script };
}

export function getCurrentJob(this: unknown) {
	const self = this as { currentJob: PlaybackJob | null };
	return self.currentJob;
}

export function getIsPaused(this: unknown): boolean {
	const self = this as { isPaused: boolean };
	return self.isPaused;
}

export function getIsProcessing(this: unknown): boolean {
	const self = this as { isProcessing: boolean };
	return self.isProcessing;
}

export function getIsQuickMode(this: unknown): boolean {
	const self = this as { isQuickMode: boolean };
	return self.isQuickMode;
}

export function isEmpty(this: unknown): boolean {
	const self = this as { queue: PlaybackJob[] };
	return self.queue.length === 0;
}

export function getStatus(this: unknown) {
	const self = this as {
		isProcessing: boolean;
		isPaused: boolean;
		isQuickMode: boolean;
		queue: PlaybackJob[];
		currentJob: PlaybackJob | null;
		waitMultiplier: number;
		charWaitMs: number | null;
		pauseTimestamp?: number | null;
		processedCount: number;
		syncObjects?: { getAllInfo: () => unknown[] };
	};
	const pausedDurationMs =
		self.isPaused && self.pauseTimestamp
			? Math.max(0, Date.now() - self.pauseTimestamp)
			: 0;

	return {
		isProcessing: self.isProcessing,
		isPaused: self.isPaused,
		isQuickMode: self.isQuickMode,
		queueLength: self.queue.length,
		currentJobId: self.currentJob ? self.currentJob.id : null,
		waitMultiplier: self.waitMultiplier,
		charWaitMs: self.charWaitMs,
		pausedDurationMs,
		processedCount: self.processedCount || 0,
		syncObjects: self.syncObjects ? self.syncObjects.getAllInfo() : [],
	};
}

export async function processQueue(this: unknown) {
	const self = this as {
		isProcessing: boolean;
		isPaused: boolean;
		queue: PlaybackJob[];
		currentJob: PlaybackJob | null;
		dequeue: () => PlaybackJob | undefined;
		emit: (event: string, payload?: unknown) => void;
		player?: { play: (s: string) => Promise<unknown> };
		_processQueue: () => void;
	};

	if (self.isProcessing || self.isPaused || self.queue.length === 0) {
		return;
	}

	self.isProcessing = true;
	const job = self.dequeue();
	if (!job) {
		self.isProcessing = false;
		return;
	}
	self.currentJob = job;

	try {
		self.emit("playback:started", { job });
		let result = null;
		if (self.player) {
			result = await self.player.play(job.script);
		}
		const countObj = self as { processedCount?: number };
		countObj.processedCount = (countObj.processedCount || 0) + 1;
		self.emit("playback:completed", { job, result });
		job.resolve(result);
	} catch (err) {
		self.emit("playback:error", { job, error: err });
		job.reject(err);
	} finally {
		self.currentJob = null;
		self.isProcessing = false;
		if (self.queue.length > 0) {
			queueMicrotask(() => self._processQueue());
		} else {
			self.emit("queue:empty");
		}
	}
}
