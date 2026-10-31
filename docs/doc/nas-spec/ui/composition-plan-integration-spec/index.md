# Composition/UI統合仕様

- **規格**: [composition-plan-integration-spec.md](composition-plan-integration-spec.md)
- **検索語**: plan_composition
- **対応状況**: ✅ 実装済


> **位置づけ**: `ghost-compatibility-gap-and-roadmap.md` の
> 「着手中項目① `surfaces.txt` 多重要素合成」とそれが指し示す **Rust
> `CompositionPlan` とフロント Canvas 描画の連携** を仕様化する。
>
> **前提方針**: パフォーマンス重視。 **静止構成の計算は Rust で 1 回だけ**行い、
> 毎フレームの IPC・再計算・Canvas 全体再描画を行わない。
