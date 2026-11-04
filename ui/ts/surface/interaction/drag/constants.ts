/**
 * ゴーストドラッグ・インタラクション関連の定数定義
 */

/** 長押しでメニューを表示するまでの遅延時間 (ms) */
export const LONG_PRESS_DELAY = 600;

/** 撫で（Stroke）と認識する移動積算距離 (px) */
export const STROKE_THRESHOLD = 50;

/** ドラッグ移動時の画面端パディング (px) */
export const DRAG_PADDING = 40;

/** 初期の遊び（微小な手振れ）の移動距離閾値 (px) */
export const DRAG_MIN_MOVE = 5;

/** 左端スナップ退避判定（画面幅の割合） */
export const DOCK_LEFT_THRESHOLD = 0.12;

/** 右端スナップ退避判定（画面幅の割合） */
export const DOCK_RIGHT_THRESHOLD = 0.88;

/** ドッキング復帰時の画面端からのオフセット (px) */
export const DOCK_RESTORE_OFFSET = 120;
