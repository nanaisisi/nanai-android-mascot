/**
 * @file queue.js
 * @brief SakuraPlaybackController 向け再生キュー操作およびループ処理ロジック
 */

/**
 * スクリプトを再生キューに追加
 * @param {string} script
 * @returns {Promise<any>}
 */
export function enqueue(script) {
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

/**
 * 優先度付き（先頭割り込み）でスクリプトをキューに追加 (Cycle 6)
 * @param {string} script
 * @returns {Promise<any>}
 */
export function enqueuePriority(script) {
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

/**
 * 現在再生中のスクリプトを中断して直ちに指定スクリプトを実行 (Cycle 6)
 * @param {string} script
 * @returns {Promise<any>}
 */
export function interrupt(script) {
	if (this.player) {
		this.player.skip();
	}
	return this.enqueuePriority(script);
}

/**
 * 再生キューから次のジョブを取得
 */
export function dequeue() {
	const job = this.queue.shift();
	if (job) {
		this.emit("queue:dequeued", { job, queueLength: this.queue.length });
	}
	return job;
}

/**
 * キューのクリア
 */
export function clearQueue() {
	const canceled = [...this.queue];
	this.queue = [];
	for (const job of canceled) {
		job.reject(new Error("Playback queue cleared"));
	}
	this.emit("queue:cleared", { canceledCount: canceled.length });
}

/**
 * 現在再生中ジョブの停止およびキュークリア
 */
export function stop() {
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

/**
 * コントローラーの破棄・全タイマーおよびキューの完全クリーンアップ (Cycle 3 モバイル最適化)
 */
export function destroy() {
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

/**
 * キュー処理の一時停止
 */
export function pause() {
	if (!this.isPaused) {
		this.isPaused = true;
		this.emit("queue:paused");
	}
}

/**
 * キュー処理の再開
 */
export function resume() {
	if (this.isPaused) {
		this.isPaused = false;
		this.emit("queue:resumed");
		this._processQueue();
	}
}

/**
 * 現在のキュー配列の浅いコピーを取得
 * @returns {Array<{ id: number, script: string, resolve: Function, reject: Function }>}
 */
export function getQueue() {
	return [...this.queue];
}

/**
 * キューのスナップショット（シリアライズ可能な情報のみ）を取得 (Cycle 4 拡張)
 * @returns {Array<{ id: number, script: string }>}
 */
export function getQueueSnapshot() {
	return this.queue.map((job) => ({ id: job.id, script: job.script }));
}

/**
 * キュー残数を取得
 * @returns {number}
 */
export function getQueueLength() {
	return this.queue.length;
}

/**
 * キューまたは再生中の未完了ジョブが存在するかどうかを取得
 * @returns {boolean}
 */
export function hasPendingJobs() {
	return this.isProcessing || this.queue.length > 0;
}

/**
 * キューの先頭ジョブをデキューせずに参照
 * @returns {{ id: number, script: string }|null}
 */
export function peekNextJob() {
	if (this.queue.length === 0) return null;
	const job = this.queue[0];
	return { id: job.id, script: job.script };
}

/**
 * 現在処理中のジョブを取得
 * @returns {{ id: number, script: string, resolve: Function, reject: Function }|null}
 */
export function getCurrentJob() {
	return this.currentJob;
}

/**
 * 一時停止中かどうかを取得
 * @returns {boolean}
 */
export function getIsPaused() {
	return this.isPaused;
}

/**
 * 処理実行中かどうかを取得
 * @returns {boolean}
 */
export function getIsProcessing() {
	return this.isProcessing;
}

/**
 * 即時表示モードかどうかを取得
 * @returns {boolean}
 */
export function getIsQuickMode() {
	return this.isQuickMode;
}

/**
 * 再生コントローラーの総合ステータステレメトリを取得 (Cycle 6)
 * @returns {{
 *   isProcessing: boolean,
 *   isPaused: boolean,
 *   isQuickMode: boolean,
 *   queueLength: number,
 *   currentJobId: number|null,
 *   waitMultiplier: number,
 *   charWaitMs: number|null
 * }}
 */
export function getStatus() {
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

/**
 * 内部キュー処理ループ
 */
export async function processQueue() {
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
