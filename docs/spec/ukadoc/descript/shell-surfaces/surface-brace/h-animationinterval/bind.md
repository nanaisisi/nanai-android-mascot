# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind.md)
- **検索語**: bind
- **対応状況**: ✅ 実装済 (装着パーツの bind アニメーションを常時レイヤー合成)

## 突合結果

surface-parser.js / Rust マニフェストが解析し、dressupState（着せ替え状態）true の
bindgroup に対応する interval,bind アニメーションの pattern レイヤーを
element 合成後に常時合成する。OFF で解除。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:100` `intervalStr === "bind"` (自動再生対象外の別トリガー)
- `ui/js/surface/surface.js` `activeBindLayers(scopeId)` / `composeSurfaceElements(..., scopeId)` (装着パーツ bind レイヤー合成)
- `ui/js/surface/bind-menu.js` `bindAnimationIds (bindgroup 番号 + addid → アニメーションID)`
- `crates/ui/src/script/parser.rs:153` `"bind" => {`
- `crates/ui/src/script/parser.rs:130` (コメント) `// \![raise,Event,...] または \![bind,category,part,status]`
- `crates/ui/src/script/parser.rs:153` `"bind" => {`
- `crates/ui/src/lib.rs:56` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ribbon,1]";`
- `ui/js/surface/surface.js:193` (コメント) `* 着せ替えパーツの装着/解除 (\![bind,category,part,status] UKADOC準拠)`
