# SSTP メッセージフォント設定 (`sstpmessage.font.*`)

- **規格**: [sstp-message.md](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/)
- **検索語**: sstpmessage.font
- **対応状況**: ✅ 実装済

`sstpmessage.font.name`, `sstpmessage.font.height`, `sstpmessage.font.color` などの SSTP 受信表示用フォント設定適用。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:35` `const sstpFontName = props["sstpmessage.font.name"];`
- `ui/ts/core/actions/balloon-descript/font/special.ts:42` `const sstpFontHeight = parseInt(props["sstpmessage.font.height"], 10);`
- `ui/ts/core/actions/balloon-descript/font/special.ts:47` `rgbFromComponents(props, "sstpmessage.font.color")`
