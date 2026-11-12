# 各論3：ECS (データ指向) の適用評価と Web/WASM における適用限界

## 1. Areka モデル (bevy_ecs) の参考要素と適用イメージ

Areka（`ekicyou/areka`）等で採用されている ECS (Entity Component System) アーキテクチャは、ゴースト・バルーン・サーフィスといったマスコットの構成要素をデータ（Components）と処理（Systems）に明確に分離する優れた設計モデルです。

- **エンティティ (Entities)**: Ghost (Sakura / Kero / サブキャラ), Balloon, SurfaceElement
- **コンポーネント (Components)**: `ScopeId`, `Position`, `SurfaceState`, `AnimationPlayer`, `CollisionBox`
- **システム (Systems)**: `script_playback_system`, `animation_evaluation_system`, `surface_composition_system`

---

## 2. Web / DOM / WASM 環境における現実的評価と限界

### ① エンティティ数の少なさとオーバースペック（Overkill）

- ゲームエンジンのように数千・数万個のオブジェクトを同時に動かす場合、`bevy_ecs` のような本格的 ECS は大きな効果を発揮します。
- 一方、伺かマスコットシステムは**エンティティ数が同時に数個〜数十個程度**と極めて少なく、フル機能の ECS フレームワークを Web/WASM 上で動作させることは**アーキテクチャとして過剰（Overkill）**であり、かえってコードの複雑化やバイナリサイズの増大を招くリスクがあります。

### ② Web / DOM 描画モデルとのミスマッチ

- Web フロントエンド環境（DOM / CSS / Canvas）は、本質的にツリー構造およびイベント駆動（Event-Driven）の更新モデルで動作します。
- 毎フレーム全エンティティを走査する ECS のゲームループ（Tick loop）よりも、さくらスクリプトのトークン消費やユーザー操作に応答する**「イベント駆動型状態機械 (Event-Driven State Machine)」**の方が Web 側の描画サイクルと自然にフィットします。

---

## 3. 結論および採用方針

- **フル ECS（bevy_ecs）の採用は見送り**:
  - Web/WASM レイヤーにおいて `bevy_ecs` などのフレームワークをそのまま組み込むことはせず、Web 環境に最適な軽量アーキテクチャを維持します。
- **データ分離の設計思想のみを継承**:
  - `bevy_ecs` の「状態（Data）とロジック（System）の分離」という設計思想（データ指向設計）のみを参考にし、WASM 内では**軽量なイベント駆動型状態機械**として実装します。
