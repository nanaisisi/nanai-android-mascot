/**
 * @file queue.ts
 * @brief SakuraPlaybackController 向け再生キュー操作およびループ処理ロジック
 */


export function enqueue(this: unknown, _script: string): Promise<unknown> {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _enqueue(this: any, script: string): Promise<any> {

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


export function _enqueuePriority(
	this: unknown,
	_script: string,
): Promise<unknown> {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _enqueuePriority(this: any, script: string): Promise<any> {

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


export function _interrupt(this: unknown, _script: string): Promise<unknown> {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _interrupt(this: any, script: string): Promise<any> {

	if (this.player) {
		this.player.skip();
	}
	return this.enqueuePriority(script);
}


export function _dequeue(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _dequeue(this: any) {

	const job = this.queue.shift();
	if (job) {
		this.emit("queue:dequeued", { job, queueLength: this.queue.length });
	}
	return job;
}


export function _clearQueue(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _clearQueue(this: any) {

	const canceled = [...this.queue];
	this.queue = [];
	for (const job of canceled) {
		job.reject(new Error("Playback queue cleared"));
	}
	this.emit("queue:cleared", { canceledCount: canceled.length });
}


export function _stop(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _stop(this: any) {

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


export function _destroy(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _destroy(this: any) {

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


export function _pause(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _pause(this: any) {

	if (!this.isPaused) {
		this.isPaused = true;
		this.emit("queue:paused");
	}
}


export function _resume(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _resume(this: any) {

	if (this.isPaused) {
		this.isPaused = false;
		this.emit("queue:resumed");
		this._processQueue();
	}
}


export function _getQueue(this: unknown) {
	return [...this.queue];
}

export function _getQueueSnapshot(this: unknown) {
	return this.queue.map((job: unknown) => ({ id: job.id, script: job.script }));
}

export function _getQueueLength(this: unknown): number {
	return this.queue.length;
}

export function _hasPendingJobs(this: unknown): boolean {
	return this.isProcessing || this.queue.length > 0;
}

export function _peekNextJob(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getQueue(this: any) {
	return [...this.queue];
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getQueueSnapshot(this: any) {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	return this.queue.map((job: any) => ({ id: job.id, script: job.script }));
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getQueueLength(this: any): number {
	return this.queue.length;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _hasPendingJobs(this: any): boolean {
	return this.isProcessing || this.queue.length > 0;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _peekNextJob(this: any) {

	if (this.queue.length === 0) return null;
	const job = this.queue[0];
	return { id: job.id, script: job.script };
}


export function _getCurrentJob(this: unknown) {
	return this.currentJob;
}

export function _getIsPaused(this: unknown): boolean {
	return this.isPaused;
}

export function _getIsProcessing(this: unknown): boolean {
	return this.isProcessing;
}

export function _getIsQuickMode(this: unknown): boolean {
	return this.isQuickMode;
}

export function _isEmpty(this: unknown): boolean {
	return this.queue.length === 0;
}

export function _getStatus(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getCurrentJob(this: any) {
	return this.currentJob;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getIsPaused(this: any): boolean {
	return this.isPaused;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getIsProcessing(this: any): boolean {
	return this.isProcessing;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getIsQuickMode(this: any): boolean {
	return this.isQuickMode;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _isEmpty(this: any): boolean {
	return this.queue.length === 0;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getStatus(this: any) {

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


export async function _processQueue(this: unknown) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _processQueue(this: any) {

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
