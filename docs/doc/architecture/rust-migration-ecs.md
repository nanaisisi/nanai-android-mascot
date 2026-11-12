# 各論4：Bevy-ECS にインスパイアされたデータ指向エンジン（Arekaモデル）

## 1. 概要と背景

Areka（`ekicyou/areka`）等で採用されている ECS (Entity Component System) アーキテクチャを参考に、当プロジェクトのゴーストランタイムおよび再生エンジンを `bevy_ecs` ベースへ移行する設計です。
これにより、クリーンで疎結合、かつ**データ指向 (Data-Oriented Design)** の高性能なエンジンが実現し、将来の機能拡張に対する改変性が飛躍的に向上します。

## 2. 伺か (Nanai Android Mascot) における ECS ドメインマッピング

### エンティティ (Entities)

- **Ghost (ゴースト)**: アクティブなゴーストのインスタンス（例: Sakura, Kero, その他サブキャラクター）。
- **Balloon (バルーン)**: 特定のスコープに紐付く、アクティブなダイアログバルーン。
- **SurfaceElement (サーフィス要素)**: ゴーストの視覚表現を構成する、個々のパーツやレイヤー。

### コンポーネント (Components)

- `ScopeId`: スコープを識別するID（0=Sakura, 1=Kero など）。
- `Position`: 画面やキャンバス上の座標 (`x`, `y`)。
- `SurfaceState`: 現在のサーフィスID、着せ替えのバインディング状態、クロマキープロパティ。
- `AnimationPlayer`: 再生中のアニメーションID、フレームタイマー、再生状態。
- `ScriptState`: 現在のAST命令ポインタ、ウェイトタイマー、クイックモードのフラグ、フォントスタイルスタック。
- `CollisionBox`: サーフィスのパーツにマッピングされた、マウスクリック/タッチの当たり判定領域。

### システム (Systems)

- `script_playback_system`: ASTトークンの実行を進め、テキストのタイピング、ポーズ処理、イベントディスパッチを行う。
- `animation_evaluation_system`: SERIKOアニメーションのフレームを評価し、サーフィスの合成状態を更新する。
- `surface_composition_system`: アクティブレイヤーと着せ替え状態に基づいて、ピクセルバッファ（`SurfaceFrameBuffer`）のブレンディング（合成）を行う。
- `touch_interaction_system`: 当たり判定領域（Collision Box）に対するマウス/タッチのヒットを検出し、SHIORIイベント（`OnTouch` 等）を発火させる。

## 3. WASM 環境におけるメリット

- **並列データ処理とキャシュ効率**: `bevy_ecs` のコンポーネントストレージはメモリ上で連続的に配置されるため、WASM内でのループ処理やピクセル計算時のCPUキャッシュヒット率が劇的に向上します。
- **明確な状態分離**: 状態（データ）がロジックから完全に分離されるため、クロスプラットフォーム環境（Tauri / Android）におけるステートのシリアライズ、状態の永続化、およびスナップショットデバッグが簡略化されます。
