/**
 * @file android-bridge.js
 * @description Slot-12 Android プラットフォームブリッジ & ライフサイクル・オーバーレイ制御
 * Contract: AndroidBridge, イベント命名規約 nam:android:*
 */

import { destroyAndroidBridge } from "./android-bridge-cleanup.js";
import {
	checkIsThrottled,
	getAndroidBridgeState,
} from "./android-bridge-state.js";
import {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	applyPlatformUiClasses,
	BackButtonManager,
	BridgeEventEmitter,
	DockManager,
	detectPlatformMode,
	isAndroidPlatform,
	isNativeAndroidPlatform,
	OverlayManager,
	type PlatformMode,
	setupVisibilityListeners,
} from "./bridge/index.js";

export {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	applyPlatformUiClasses,
	BackButtonManager,
	BridgeEventEmitter,
	DockManager,
	detectPlatformMode,
	OverlayManager,
	type PlatformMode,
};

/**
 * AndroidプラットフォームとのIPCおよびライフサイクル管理を提供するブリッジクラス
 */
export class AndroidBridge {
	_cleanupFns: Array<() => void>;
	_lifecycleState: string;
	_emitter: BridgeEventEmitter;
	_backButtonManager: BackButtonManager;
	_dockManager: DockManager;
	_overlayManager: OverlayManager;

	constructor(options: any = {}) {
		this._cleanupFns = [];
		this._lifecycleState = ANDROID_LIFECYCLE_STATES.ACTIVE;

		// イベントディスパッチ & リスナー管理モジュール
		this._emitter = new BridgeEventEmitter();

		// 戻るボタン管理モジュール
		this._backButtonManager = new BackButtonManager(
			(eventName: unknown, data: unknown) => {
				this._dispatch(eventName, data);
			},
		);

		// ドッキング & ジェスチャー連携管理モジュール
		this._dockManager = new DockManager({
			gestureRecognizer: options.gestureRecognizer,
			element: options.element,
			dockMargin: options.dockMargin,
			autoRestoreOnTap: options.autoRestoreOnTap,
			dispatchFn: (eventName: string, data: unknown) => {
				this._dispatch(eventName, data);
			},
		});

		// オーバーレイ & プラットフォーム管理モジュール
		this._overlayManager = new OverlayManager({
			invokeHandler: options.invokeHandler,
			dispatchFn: (eventName: unknown, data: unknown) => {
				this._dispatch(eventName, data);
			},
		});

		if (options.syncUiClasses !== false) {
			this.applyPlatformUi(options.targetElement);
		}

		// ブラウザ/WebViewの可視性変更およびライフサイクル監視
		const visibilityCleanups = setupVisibilityListeners({
			setLifecycleState: (state: string) => {
				this._lifecycleState = state;
			},
			getGestureRecognizer: () => this._dockManager.gestureRecognizer,
			dispatch: (eventName: unknown, data: unknown) => {
				this._dispatch(eventName, data);
			},
		});
		this._cleanupFns.push(...visibilityCleanups);
	}

	get _listeners() {
		return this._emitter.listeners;
	}

	get _gestureRecognizer() {
		return this._dockManager.gestureRecognizer;
	}

	set _gestureRecognizer(val) {
		this._dockManager.setGestureRecognizer(val);
	}

	get _dockState() {
		return this._dockManager.dockState;
	}

	set _dockState(val) {
		this._dockManager.setDockMode(val);
	}

	get _backHandlers() {
		return this._backButtonManager._backHandlers;
	}

	set _backHandlers(val) {
		this._backButtonManager._backHandlers = val;
	}

	get _overlayTransparency() {
		return this._overlayManager.overlayTransparency;
	}

	set _overlayTransparency(val) {
		this._overlayManager._overlayTransparency = val;
	}

	get _isClickThrough() {
		return this._overlayManager.isClickThrough;
	}

	set _isClickThrough(val) {
		this._overlayManager._isClickThrough = val;
	}

	get _isForegroundServiceActive() {
		return this._overlayManager.isForegroundServiceActive;
	}

	set _isForegroundServiceActive(val) {
		this._overlayManager._isForegroundServiceActive = val;
	}

	get _isOverlayEnabled() {
		return this._overlayManager.isOverlayEnabled;
	}

	set _isOverlayEnabled(val) {
		this._overlayManager._isOverlayEnabled = val;
	}

	setGestureRecognizer(recognizer: unknown) {
		this._dockManager.setGestureRecognizer(recognizer);
	}

	setDockMode(dockState: unknown) {
		return this._dockManager.setDockMode(dockState);
	}

	getDockMode() {
		return this._dockManager.getDockMode();
	}

	get isDocked() {
		return this._dockManager.isDocked;
	}

	get attachedElement() {
		return this._dockManager.attachedElement;
	}

	attachDockElement(element: unknown) {
		this._dockManager.attachElement(element);
	}

	detachDockElement() {
		this._dockManager.detachElement();
	}

	getDockOptions() {
		return this._dockManager.getDockOptions();
	}

	setDockOptions(options: any) {
		return this._dockManager.setDockOptions(options);
	}

	collapse(edge = "right") {
		return this._dockManager.collapse(edge);
	}

	restore() {
		return this._dockManager.restore();
	}

	expand() {
		return this._dockManager.expand();
	}

	toggleDock(edge = "right") {
		return this._dockManager.toggle(edge);
	}

	isAndroid() {
		return isAndroidPlatform();
	}

	isNativeAndroid() {
		return isNativeAndroidPlatform();
	}

	getPlatformMode(): PlatformMode {
		return detectPlatformMode();
	}

	applyPlatformUi(targetElement?: unknown): PlatformMode {
		const mode = applyPlatformUiClasses(targetElement);
		this._dispatch(ANDROID_EVENTS.PLATFORM_MODE_DETECTED, {
			platformMode: mode,
			isAndroid: mode.startsWith("android"),
			isNative: mode.endsWith("-native"),
			timestamp: Date.now(),
		});
		return mode;
	}

	async requestOverlayPermission() {
		return this._overlayManager.requestOverlayPermission();
	}

	async setupForegroundService(enabled: boolean) {
		return this._overlayManager.setupForegroundService(enabled);
	}

	async setOverlayTransparency(alpha: unknown) {
		return this._overlayManager.setOverlayTransparency(alpha);
	}

	async setClickThrough(enabled: boolean) {
		return this._overlayManager.setClickThrough(enabled);
	}

	async toggleClickThrough() {
		return this._overlayManager.toggleClickThrough();
	}

	async toggleForegroundService() {
		return this._overlayManager.toggleForegroundService();
	}

	async trimMemory(level = 40) {
		return this._overlayManager.trimMemory(level);
	}

	registerBackHandler(handler: unknown) {
		return this._backButtonManager.registerBackHandler(handler);
	}

	getBackHandlerCount() {
		return this._backButtonManager.handlerCount;
	}

	getListenerCount(eventName: unknown) {
		return this._emitter.listenerCount(eventName);
	}

	async handleBackButton() {
		return this._backButtonManager.handleBackButton();
	}

	isThrottled() {
		return checkIsThrottled(this._lifecycleState);
	}

	getState() {
		return getAndroidBridgeState(
			this._lifecycleState,
			this._overlayManager,
			this._dockManager,
		);
	}

	destroy() {
		const cleanups = this._cleanupFns;
		this._cleanupFns = [];
		destroyAndroidBridge(
			cleanups,
			this._emitter,
			this._backButtonManager,
			this._dockManager,
		);
		this._lifecycleState = ANDROID_LIFECYCLE_STATES.STOPPED;
	}

	on(eventName: unknown, callback: unknown) {
		return this._emitter.on(eventName, callback);
	}

	off(eventName: unknown, callback: unknown) {
		this._emitter.off(eventName, callback);
	}

	_dispatch(eventName: unknown, data: unknown) {
		this._emitter.dispatch(eventName, data);
	}
}
