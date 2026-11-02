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
	 * キュー処理の一時停止
	 */
	pause() {
		if (!this.isPaused) {
			this.isPaused = true;
			this.emit("queue:paused");
		}
	}

	/**
	 * キュー処理の再開
	 */
	resume() {
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
	getQueue() {
		return [...this.queue];
	}

	/**
	 * キュー残数を取得
	 * @returns {number}
	 */
	getQueueLength() {
		return this.queue.length;
	}

	/**
	 * 現在処理中のジョブを取得
	 * @returns {{ id: number, script: string, resolve: Function, reject: Function }|null}
	 */
	getCurrentJob() {
		return this.currentJob;
	}

	/**
	 * 一時停止中かどうかを取得
	 * @returns {boolean}
	 */
	getIsPaused() {
		return this.isPaused;
	}

	/**
	 * 処理実行中かどうかを取得
	 * @returns {boolean}
	 */
	getIsProcessing() {
		return this.isProcessing;
	}

	/**
	 * 即時表示モードかどうかを取得
	 * @returns {boolean}
	 */
	getIsQuickMode() {
		return this.isQuickMode;
	}

	/**
	 * ウェイト倍率の設定
	 * @param {number} ratio
	 */
	setWaitMultiplier(ratio) {
		const valid =
			typeof ratio === "number" && !Number.isNaN(ratio) && ratio >= 0;
		this.waitMultiplier = valid ? ratio : 1.0;
		this.emit("playback:wait-multiplier", {
			waitMultiplier: this.waitMultiplier,
		});
	}

	/**
	 * 現在のウェイト倍率を取得
	 * @returns {number}
	 */
	getWaitMultiplier() {
		return this.waitMultiplier;
	}

	/**
	 * 与えられたベースウェイト(ms)に倍率を掛けた実効ウェイトを算出
	 * @param {number} baseMs
	 * @returns {number}
	 */
	calculateWait(baseMs) {
		if (this.isQuickMode) return 0;
		const ms = Math.max(0, Number(baseMs) || 0);
		return Math.round(ms * this.waitMultiplier);
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
	 * 1文字発話イベント発火
	 * @param {string} char
	 * @param {number} scope
	 */
	notifyChar(char, scope) {
		this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
	}

	/**
	 * スコープ切り替えイベント発火
	 * @param {number} scope
	 */
	notifyScope(scope) {
		this.emit("playback:scope", { scope });
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
