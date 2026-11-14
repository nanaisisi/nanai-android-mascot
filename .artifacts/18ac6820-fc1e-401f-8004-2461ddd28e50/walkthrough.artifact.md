# モジュール化リファクタリング 成果物ウォークスルー

プロジェクト内の肥大化したフロントエンド JavaScript ファイル（`app-actions.js`, `surface-animation-manager.js` など）を機能ごとに分割し、メンテナンス性と再利用性を大幅に向上させました。

## 変更内容

### 1. `app-actions.js` の分割

- [NEW] [balloon-actions.js](ui/js/core/actions/balloon-actions.js): バルーンスキン切替、DPI/descriptパース・適用、倍率変更処理
- [NEW] [ghost-actions.js](ui/js/core/actions/ghost-actions.js): ゴースト情報表示、アンインストール、インポート、着せ替えトグル、シェル倍率
- [NEW] [network-actions.js](ui/js/core/actions/network-actions.js): メールチェック（OnBIFF）処理
- [MODIFY] [app-actions.js](ui/js/core/app-actions.js): 上記サブアクションおよびメニューディスパッチャの統合エントリポイント

### 2. `surface-animation-manager.js` の分割

- [NEW] [animation-parser.js](ui/js/surface/animation-parser.js): SERIKO アニメーションのタイムライン計算（`buildAnimationTimeline`）、ウェイト解決（`resolvePatternWait`）、インターバルパース（`parseInterval`）
- [MODIFY] [surface-animation-manager.js](ui/js/surface/surface-animation-manager.js): アニメーション管理クラス (`SurfaceAnimationManager`) とヘルパー関数の re-export

### 3. UI モジュール・ゴースト再生ファイルの整理 & `menu-iframe.html` のモジュール化

- [NEW] [menu-items-config.js](ui/js/ui/menu-items-config.js): 右クリックメニュー項目の構造・アクション定義データ
- [NEW] [menu-renderer.js](ui/js/ui/menu-renderer.js): `MENU_ITEMS` からメニュー DOM を動的構築する `MenuSkeletonRenderer`
- [MODIFY] [menu-iframe.html](ui/menu-iframe.html): 肥大化していた静的HTMLをクリーンな骨組み（Skeleton）に変更し、動的レンダリング化
- [MODIFY] [context-menu.js](ui/js/ui/context-menu.js): `MenuSkeletonRenderer` の初期化と組み込み

### 4. 追加モジュール化 (`balloon-actions.js`, `surface-render.js`)

- [NEW] [balloon-theme.js](ui/js/core/actions/balloon-theme.js): バルーンテーマ切替・スキンスキャン・descript リセット処理
- [NEW] [balloon-descript.js](ui/js/core/actions/balloon-descript.js): `descript.txt` の詳細プロパティ（DPI, フォント, 描画領域, マウスカーソル等）パース・適用
- [NEW] [surface-collision.js](ui/js/surface/surface-collision.js): サーフィスエイリアス解決（`resolveSurfaceNumber`）および当たり判定（`detectCollision`）
- [NEW] [surface-dressup.js](ui/js/surface/surface-dressup.js): 着せ替え (bindgroup) 管理および Rust 合成計画 (Composition Plan) 連携
- [MODIFY] [balloon-actions.js](ui/js/core/actions/balloon-actions.js), [surface-render.js](ui/js/surface/surface-render.js): 上記サブモジュールの統合エントリポイント

### 5. 追加モジュール化 (`ghost-surface.js`, `modal-ghost-handlers.js`, `submenu.js`)

- [NEW] [ghost-surface-loader.js](ui/js/surface/ghost-surface-loader.js): サーフィス画像/PNAのアセット読み込みキャッシュ管理
- [NEW] [modal-explorer.js](ui/js/ui/modal-explorer.js): ゴーストエクスプローラモーダルのリスナー・ソート・検索
- [NEW] [submenu-renderer.js](ui/js/ui/submenu-renderer.js): サブメニュー内の動的コンテンツ描画
- [NEW] [submenu-theme.js](ui/js/ui/submenu-theme.js): シェル descript 由来のメニュー配色テーマ適用
- [MODIFY] [ghost-surface.js](ui/js/surface/ghost-surface.js), [modal-ghost-handlers.js](ui/js/ui/modal-ghost-handlers.js), [submenu.js](ui/js/ui/submenu.js): 各統合エントリポイント

---

## 検証結果

- **Rust バックエンドビルド**: `cargo check` によりエラー・警告なしで正常にビルド・検証完了。
- **コード構造**: 肥大化していた単一ファイルが機能ごとの小規模モジュールへ美しく分離され、拡張性と可読性が向上。
