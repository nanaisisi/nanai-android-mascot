/**
 * @file controller.js
 * @brief イベント駆動型さくらスクリプト再生キュー・ウェイト制御コントローラー (Slot-05)
 */

export class SakuraPlaybackController {
	/**
	 * @param {object} [options]
	 * @param {import('../sakura-script.js').SakuraScriptPlayer} [options.player]
	 */
	constructor(options = {}) {
		this.player = options.player || null;
		/** @type {Array<{ id: number, script: string, resolve: Function, reject: Function }>} */
		this.queue = [];
		this.currentJob = null;
		this.isProcessing = false;
		this.isPaused = false;
		this.isQuickMode = false;
		this.nextJobId = 1;
		/** @type {Map<string, Set<Function>>} */
		this.listeners = new Map();
	}

	/**
	 * イベントリスナーの登録
	 * @param {string} event
	 * @param {Function} handler
	 * @returns {() => void} リスナー解除関数
	 */
	on(event, handler) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event).add(handler);
		return () => this.off(event, handler);
	}

	/**
	 * イベントリスナーの解除
	 * @param {string} event
	 * @param {Function} handler
	 */
	off(event, handler) {
		const handlers = this.listeners.get(event);
		if (handlers) {
			handlers.delete(handler);
			if (handlers.size === 0) {
				this.listeners.delete(event);
			}
		}
	}

	/**
	 * イベントの発行
	 * @param {string} event
	 * @param {...any} args
	 */
	emit(event, ...args) {
		const handlers = this.listeners.get(event);
		if (handlers) {
			for (const handler of Array.from(handlers)) {
				try {
					handler(...args);
				} catch (err) {
					console.error(
						`Error in SakuraPlaybackController event '${event}':`,
						err,
					);
				}
			}
		}
	}

	/**
	 * スクリプトを再生キューに追加
	 * @param {string} script
	 * @returns {Promise<any>}
	 */
	enqueue(script) {
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
	 * 再生キューから次のジョブを取得
	 */
	dequeue() {
		const job = this.queue.shift();
		if (job) {
			this.emit("queue:dequeued", { job, queueLength: this.queue.length });
		}
		return job;
	}

	/**
	 * キューのクリア
	 */
	clearQueue() {
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
	stop() {
		this.clearQueue();
		if (this.currentJob && this.player) {
			this.player.skip();
		}
		this.currentJob = null;
		this.isProcessing = false;
		this.emit("playback:stopped");
	}

	/**
	 * 即時表示モード (\\_q) の切り替え
	 * @param {boolean} [enable]
	 */
	setQuickMode(enable) {
		const prev = this.isQuickMode;
		this.isQuickMode = typeof enable === "boolean" ? enable : !this.isQuickMode;
		this.emit("playback:quick-mode", { enabled: this.isQuickMode, prev });
	}

	/**
	 * ウェイトイベント発火
	 * @param {number} durationMs
	 */
	notifyWait(durationMs) {
		this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
	}

	/**
	 * クリック待ちイベント発火
	 * @param {boolean} noClear
	 */
	notifyPause(noClear) {
		this.emit("playback:pause", { noClear });
	}

	/**
	 * バルーンクリアイベント発火
	 * @param {"all"|"char"|"line"} mode
	 * @param {number} count
	 */
	notifyClear(mode, count) {
		this.emit("playback:clear", { mode, count });
	}

	/**
	 * 内部キュー処理ループ
	 */
	async _processQueue() {
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
}
