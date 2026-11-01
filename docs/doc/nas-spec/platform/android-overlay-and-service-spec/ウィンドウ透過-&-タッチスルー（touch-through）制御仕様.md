# 3. ウィンドウ透過 & タッチスルー（Touch-through）制御仕様

### 3.1 WindowManager レイアウトパラメータ

Android の `WindowManager` に登録する浮遊ビュー（または WebView）のフラグ制御：

```java
WindowManager.LayoutParams params = new WindowManager.LayoutParams(
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
    // 透過制御用フラグ
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
    PixelFormat.TRANSLUCENT
);
```

### 3.2 透過領域のタッチ判定（動的フラグ切替）

マスコット以外の透明領域を裏のアプリへ素通し（パススルー）させるための設計：

1. **方式 A: 透明ピクセルのタッチスルー（推奨）**
   - WebView 側で `pointer-events: none` をベースコンテナに設定。
   - `.ghost-display`（マスコット）および `.balloon`（吹き出し）のみ `pointer-events: auto` を設定。
   - Android ネイティブ側でタッチイベントをフックし、マスコットの矩形外へのタップは直ちに親ウィンドウ（背後）へ転送。
2. **方式 B: ウィンドウサイズ追従方式**
   - 画面全体を覆う透明ウィンドウではなく、マスコット本体とバルーンの周囲のみを矩形ウィンドウとして動的に移動・リサイズする。

---
