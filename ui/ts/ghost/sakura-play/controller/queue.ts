/**
 * @file queue.ts
 * @brief SakuraPlaybackController 向け再生キュー操作およびループ処理ロジック
 */

<<<<<<< HEAD
export function enqueue(this: unknown, script: string): Promise<unknown> {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function enqueue(this: any, script: string): Promise<any> {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	return new Promise((resolve, reject) => {
		const job = {
			id: this.nextJobId++,
			script,
			resolve,
			reject,
		};
		this.queue.push(job);
		this.emit("queue:enqueued", { job, queueLength: this.queue.length });
		this._processQueue();
	});
}

<<<<<<< HEAD
export function enqueuePriority(
	this: unknown,
	script: string,
): Promise<unknown> {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function enqueuePriority(this: any, script: string): Promise<any> {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	return new Promise((resolve, reject) => {
		const job = {
			id: this.nextJobId++,
			script,
			resolve,
			reject,
			priority: true,
		};
		this.queue.unshift(job);
		this.emit("queue:enqueued", {
			job,
			priority: true,
			queueLength: this.queue.length,
		});
		this._processQueue();
	});
}

<<<<<<< HEAD
export function interrupt(this: unknown, script: string): Promise<unknown> {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function interrupt(this: any, script: string): Promise<any> {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (this.player) {
		this.player.skip();
	}
	return this.enqueuePriority(script);
}

<<<<<<< HEAD
export function dequeue(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function dequeue(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const job = this.queue.shift();
	if (job) {
		this.emit("queue:dequeued", { job, queueLength: this.queue.length });
	}
	return job;
}

<<<<<<< HEAD
export function clearQueue(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function clearQueue(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const canceled = [...this.queue];
	this.queue = [];
	for (const job of canceled) {
		job.reject(new Error("Playback queue cleared"));
	}
	this.emit("queue:cleared", { canceledCount: canceled.length });
}

<<<<<<< HEAD
export function stop(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function stop(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	this.clearQueue();
	if (this.syncObjects) {
		this.syncObjects.clear();
	}
	if (this.player) {
		this.player.skip();
	}
	this.currentJob = null;
	this.isProcessing = false;
	this.emit("playback:stopped");
}

<<<<<<< HEAD
export function destroy(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function destroy(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	this.stop();
	this.emit("playback:destroyed");
	this.listeners.clear();
	this.isPaused = true;
	if (this.syncObjects) {
		this.syncObjects.clear();
	}
	if (this.player?.destroy) {
		this.player.destroy();
	}
}

<<<<<<< HEAD
export function pause(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function pause(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (!this.isPaused) {
		this.isPaused = true;
		this.emit("queue:paused");
	}
}

<<<<<<< HEAD
export function resume(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function resume(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (this.isPaused) {
		this.isPaused = false;
		this.emit("queue:resumed");
		this._processQueue();
	}
}

<<<<<<< HEAD
export function getQueue(this: unknown) {
	return [...this.queue];
}

export function getQueueSnapshot(this: unknown) {
	return this.queue.map((job: unknown) => ({ id: job.id, script: job.script }));
}

export function getQueueLength(this: unknown): number {
	return this.queue.length;
}

export function hasPendingJobs(this: unknown): boolean {
	return this.isProcessing || this.queue.length > 0;
}

export function peekNextJob(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getQueue(this: any) {
	return [...this.queue];
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getQueueSnapshot(this: any) {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	return this.queue.map((job: any) => ({ id: job.id, script: job.script }));
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getQueueLength(this: any): number {
	return this.queue.length;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function hasPendingJobs(this: any): boolean {
	return this.isProcessing || this.queue.length > 0;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function peekNextJob(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (this.queue.length === 0) return null;
	const job = this.queue[0];
	return { id: job.id, script: job.script };
}

<<<<<<< HEAD
export function getCurrentJob(this: unknown) {
	return this.currentJob;
}

export function getIsPaused(this: unknown): boolean {
	return this.isPaused;
}

export function getIsProcessing(this: unknown): boolean {
	return this.isProcessing;
}

export function getIsQuickMode(this: unknown): boolean {
	return this.isQuickMode;
}

export function isEmpty(this: unknown): boolean {
	return this.queue.length === 0;
}

export function getStatus(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getCurrentJob(this: any) {
	return this.currentJob;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getIsPaused(this: any): boolean {
	return this.isPaused;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getIsProcessing(this: any): boolean {
	return this.isProcessing;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getIsQuickMode(this: any): boolean {
	return this.isQuickMode;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function isEmpty(this: any): boolean {
	return this.queue.length === 0;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function getStatus(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	return {
		isProcessing: this.isProcessing,
		isPaused: this.isPaused,
		isQuickMode: this.isQuickMode,
		queueLength: this.queue.length,
		currentJobId: this.currentJob ? this.currentJob.id : null,
		waitMultiplier: this.waitMultiplier,
		charWaitMs: this.charWaitMs,
	};
}

<<<<<<< HEAD
export async function processQueue(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function processQueue(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (this.isProcessing || this.isPaused || this.queue.length === 0) {
		return;
	}

	this.isProcessing = true;
	const job = this.dequeue();
	this.currentJob = job;

	try {
		this.emit("playback:started", { job });
		let result = null;
		if (this.player) {
			result = await this.player.play(job.script);
		}
		this.emit("playback:completed", { job, result });
		job.resolve(result);
	} catch (err) {
		this.emit("playback:error", { job, error: err });
		job.reject(err);
	} finally {
		this.currentJob = null;
		this.isProcessing = false;
		if (this.queue.length > 0) {
			queueMicrotask(() => this._processQueue());
		} else {
			this.emit("queue:empty");
		}
	}
}
