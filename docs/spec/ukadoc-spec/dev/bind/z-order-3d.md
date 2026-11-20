# ある着せ替えが他の着せ替えの前後にまたがる三次元構造の場合

- **規格**: [bind.md](../../../../ukadoc-spec/dev/bind.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/bind/))
- **検索語**: bindgroup
- **対応状況**: ✅ 実装済

## 突合結果

複数レイヤー・描画順序による前後関係のある着せ替え合成に対応。

## 実装箇所

- `crates/nanai-surface/src/types/draw/interval.rs:79`
