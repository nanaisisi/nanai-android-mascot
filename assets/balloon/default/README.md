# default balloon skin

既定のバルーンスキン（`assets/balloon/default`）。

- 実体は `ui/css/balloon-theme.css` の `:root` トークン（モダンニュートラル）で描画する
- このディレクトリには descript.txt のみ配置し、背景画像は使用しない
  （Web 画像提供型のスキンは `assets/balloon/emily4` を参照）
- `balloon_manifest` コマンドのパス解決がここで成功するため
  「No valid path found」のフォールバック警告が抑制される

.gitignore により `assets/balloon/*` は除外されるが、`default` のみ管理対象。
