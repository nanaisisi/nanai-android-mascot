# バルーン descript.txt 仕様項目一覧インデックス (Descript-txt Index)

本インデックスは、`docs/spec/ukadoc-spec/descript/balloon/descript-txt/` 配下に存在するすべてのバルーンプロパティ仕様ファイルの一覧および対応する実装情報（`balloon-descript.js` / `descript.rs`）の突合インデックスである。

| 項目 | 検索語 | 対応状況 |
| :--- | :--- | :---: |
| [descript.txt（Balloonの）](introduction_descript.txt.md) | descript.txt | ✅ 対応済 (balloon_manifest / balloon-window.js) |
| [charset,文字コード](charset.md) | charset | ✅ 対応済 (descript.rs) |
| [name,バルーン名](name.md) | name | ✅ 対応済 (descript.rs) |
| [type,種別](type.md) | type | ✅ 対応済 (descript.rs) |
| [craftman,作者名](craftman.md) | craftman | ✅ 対応済 (descript.rs) |
| [craftmanw,作者名](craftmanw.md) | craftmanw | ✅ 対応済 (descript.rs) |
| [id,ID名](id.md) | id | ❌ 検出なし |
| [craftmanurl,URL](craftmanurl.md) | craftmanurl | ✅ 対応済 (descript.rs) |
| [homeurl,URL](homeurl.md) | homeurl | ⚠️ 一部対応 (読込のみ) |
| [dpi,推奨DPI](dpi.md) | dpi | ✅ 対応済 (balloon-descript.js) |
| [readme,ファイル名](readme.md) | readme | ❌ 検出なし |
| [readme.charset,文字コード](readme.charset.md) | readme.charset | ❌ 検出なし |
| [cursor,ファイル名 / mousecursor,ファイル名](cursor.md) | cursor | ✅ 対応済 (balloon-descript.js) |
| [mousecursor.text,ファイル名](mousecursor.text.md) | mousecursor.text | ✅ 対応済 (balloon-descript.js) |
| [mousecursor.wait,ファイル名](mousecursor.wait.md) | mousecursor.wait | ✅ 対応済 (balloon-descript.js) |
| [mousecursor.arrow,ファイル名](mousecursor.arrow.md) | mousecursor.arrow | ✅ 対応済 (balloon-descript.js) |
| [origin.x,座標 \*1](origin.x.md) | origin.x | ✅ 対応済 (balloon-descript.js) |
| [origin.y,座標 \*1](origin.y.md) | origin.y | ✅ 対応済 (balloon-descript.js) |
| [validrect.left,座標 \*1](validrect.left.md) | validrect.left | ✅ 対応済 (balloon-descript.js) |
| [validrect.top,座標 \*1](validrect.top.md) | validrect.top | ✅ 対応済 (balloon-descript.js) |
| [validrect.right,座標 \*1](validrect.right.md) | validrect.right | ✅ 対応済 (balloon-descript.js) |
| [validrect.bottom,座標 \*1](validrect.bottom.md) | validrect.bottom | ✅ 対応済 (balloon-descript.js) |
| [wordwrappoint.x,座標 \*1](wordwrappoint.x.md) | wordwrappoint.x | ✅ 対応済 (balloon-descript.js) |
| [wordwrappoint.y,座標 \*1](wordwrappoint.y.md) | wordwrappoint.y | ✅ 対応済 (balloon-descript.js) |
| [vertical,0/1](vertical.md) | vertical | ✅ 対応済 (balloon-descript.js) |
| [font.name,フォント名](font.name.md) | font.name | ✅ 対応済 (balloon-descript.js) |
| [font.height,数値](font.height.md) | font.height | ✅ 対応済 (balloon-descript.js) |
| [font.color.r,数値](font.color.r.md) | font.color.r | ✅ 対応済 (balloon-descript.js) |
| [font.color.g,数値](font.color.g.md) | font.color.g | ✅ 対応済 (balloon-descript.js) |
| [font.color.b,数値](font.color.b.md) | font.color.b | ✅ 対応済 (balloon-descript.js) |
| [font.shadowcolor.r,数値](font.shadowcolor.r.md) | font.shadowcolor.r | ✅ 対応済 (balloon-descript.js) |
| [font.shadowcolor.g,数値](font.shadowcolor.g.md) | font.shadowcolor.g | ✅ 対応済 (balloon-descript.js) |
| [font.shadowcolor.b,数値](font.shadowcolor.b.md) | font.shadowcolor.b | ✅ 対応済 (balloon-descript.js) |
| [font.shadowstyle,形態指定](font.shadowstyle.md) | font.shadowstyle | ✅ 対応済 (balloon-descript.js) |
| [font.bold,0/1](font.bold.md) | font.bold | ✅ 対応済 (balloon-descript.js) |
| [font.italic,0/1](font.italic.md) | font.italic | ✅ 対応済 (balloon-descript.js) |
| [font.underline,0/1](font.underline.md) | font.underline | ✅ 対応済 (balloon-descript.js) |
| [font.strike,0/1](font.strike.md) | font.strike | ✅ 対応済 (balloon-descript.js) |
| [font.outline,0/1](font.outline.md) | font.outline | ✅ 対応済 (balloon-descript.js) |
| [disable.font.(フォント定義),(指定)](disable.font.md) | disable.font | ✅ 対応済 (balloon-descript.js) |
| [cursor.style,形状](cursor.style.md) | cursor.style | ✅ 対応済 (balloon-descript.js) |
| [cursor.blendmethod,コマンド](cursor.blendmethod.md) | cursor.blendmethod | ❌ 検出なし |
| [cursor.font.color.r,数値](cursor.font.color.r.md) | cursor.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [cursor.font.color.g,数値](cursor.font.color.g.md) | cursor.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [cursor.font.color.b,数値](cursor.font.color.b.md) | cursor.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [cursor.font.shadowcolor.r,数値](cursor.font.shadowcolor.r.md) | cursor.font.shadowcolor.r | ❌ 検出なし |
| [cursor.font.shadowcolor.g,数値](cursor.font.shadowcolor.g.md) | cursor.font.shadowcolor.g | ❌ 検出なし |
| [cursor.font.shadowcolor.b,数値](cursor.font.shadowcolor.b.md) | cursor.font.shadowcolor.b | ❌ 検出なし |
| [cursor.font.shadowstyle,形態指定](cursor.font.shadowstyle.md) | cursor.font.shadowstyle | ❌ 検出なし |
| [cursor.pen.color.r,数値](cursor.pen.color.r.md) | cursor.pen.color.r | ❌ 検出なし |
| [cursor.pen.color.g,数値](cursor.pen.color.g.md) | cursor.pen.color.g | ❌ 検出なし |
| [cursor.pen.color.b,数値](cursor.pen.color.b.md) | cursor.pen.color.b | ❌ 検出なし |
| [cursor.brush.color.r,数値](cursor.brush.color.r.md) | cursor.brush.color.r | ❌ 検出なし |
| [cursor.brush.color.g,数値](cursor.brush.color.g.md) | cursor.brush.color.g | ❌ 検出なし |
| [cursor.brush.color.b,数値](cursor.brush.color.b.md) | cursor.brush.color.b | ❌ 検出なし |
| [cursor.notselect.style,形状](cursor.notselect.style.md) | cursor.notselect.style | ❌ 検出なし |
| [cursor.notselect.font.color.r,数値](cursor.notselect.font.color.r.md) | cursor.notselect.font.color.r | ❌ 検出なし |
| [cursor.notselect.font.color.g,数値](cursor.notselect.font.color.g.md) | cursor.notselect.font.color.g | ❌ 検出なし |
| [cursor.notselect.font.color.b,数値](cursor.notselect.font.color.b.md) | cursor.notselect.font.color.b | ❌ 検出なし |
| [cursor.notselect.font.shadowcolor.r,数値](cursor.notselect.font.shadowcolor.r.md) | cursor.notselect.font.shadowcolor.r | ❌ 検出なし |
| [cursor.notselect.font.shadowcolor.g,数値](cursor.notselect.font.shadowcolor.g.md) | cursor.notselect.font.shadowcolor.g | ❌ 検出なし |
| [cursor.notselect.font.shadowcolor.b,数値](cursor.notselect.font.shadowcolor.b.md) | cursor.notselect.font.shadowcolor.b | ❌ 検出なし |
| [cursor.notselect.font.shadowstyle,形態指定](cursor.notselect.font.shadowstyle.md) | cursor.notselect.font.shadowstyle | ❌ 検出なし |
| [cursor.notselect.pen.color.r,数値](cursor.notselect.pen.color.r.md) | cursor.notselect.pen.color.r | ❌ 検出なし |
| [cursor.notselect.pen.color.g,数値](cursor.notselect.pen.color.g.md) | cursor.notselect.pen.color.g | ❌ 検出なし |
| [cursor.notselect.pen.color.b,数値](cursor.notselect.pen.color.b.md) | cursor.notselect.pen.color.b | ❌ 検出なし |
| [cursor.notselect.brush.color.r,数値](cursor.notselect.brush.color.r.md) | cursor.notselect.brush.color.r | ❌ 検出なし |
| [cursor.notselect.brush.color.g,数値](cursor.notselect.brush.color.g.md) | cursor.notselect.brush.color.g | ❌ 検出なし |
| [cursor.notselect.brush.color.b,数値](cursor.notselect.brush.color.b.md) | cursor.notselect.brush.color.b | ❌ 検出なし |
| [anchor.font.color.r,数値](anchor.font.color.r.md) | anchor.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [anchor.font.color.g,数値](anchor.font.color.g.md) | anchor.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [anchor.font.color.b,数値](anchor.font.color.b.md) | anchor.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [anchor.font.shadowcolor.r,数値](anchor.font.shadowcolor.r.md) | anchor.font.shadowcolor.r | ❌ 検出なし |
| [anchor.font.shadowcolor.g,数値](anchor.font.shadowcolor.g.md) | anchor.font.shadowcolor.g | ❌ 検出なし |
| [anchor.font.shadowcolor.b,数値](anchor.font.shadowcolor.b.md) | anchor.font.shadowcolor.b | ❌ 検出なし |
| [anchor.font.shadowstyle,形態指定](anchor.font.shadowstyle.md) | anchor.font.shadowstyle | ❌ 検出なし |
| [anchor.style,形状](anchor.style.md) | anchor.style | ✅ 対応済 (balloon-descript.js) |
| [anchor.blendmethod,コマンド](anchor.blendmethod.md) | anchor.blendmethod | ❌ 検出なし |
| [anchor.pen.color.r,数値](anchor.pen.color.r.md) | anchor.pen.color.r | ❌ 検出なし |
| [anchor.pen.color.g,数値](anchor.pen.color.g.md) | anchor.pen.color.g | ❌ 検出なし |
| [anchor.pen.color.b,数値](anchor.pen.color.b.md) | anchor.pen.color.b | ❌ 検出なし |
| [anchor.brush.color.r,数値](anchor.brush.color.r.md) | anchor.brush.color.r | ❌ 検出なし |
| [anchor.brush.color.g,数値](anchor.brush.color.g.md) | anchor.brush.color.g | ❌ 検出なし |
| [anchor.brush.color.b,数値](anchor.brush.color.b.md) | anchor.brush.color.b | ❌ 検出なし |
| [anchor.notselect.style,形状](anchor.notselect.style.md) | anchor.notselect.style | ✅ 対応済 (balloon-descript.js) |
| [anchor.notselect.font.color.r,数値](anchor.notselect.font.color.r.md) | anchor.notselect.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [anchor.notselect.font.color.g,数値](anchor.notselect.font.color.g.md) | anchor.notselect.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [anchor.notselect.font.color.b,数値](anchor.notselect.font.color.b.md) | anchor.notselect.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [anchor.notselect.font.shadowcolor.r,数値](anchor.notselect.font.shadowcolor.r.md) | anchor.notselect.font.shadowcolor.r | ❌ 検出なし |
| [anchor.notselect.font.shadowcolor.g,数値](anchor.notselect.font.shadowcolor.g.md) | anchor.notselect.font.shadowcolor.g | ❌ 検出なし |
| [anchor.notselect.font.shadowcolor.b,数値](anchor.notselect.font.shadowcolor.b.md) | anchor.notselect.font.shadowcolor.b | ❌ 検出なし |
| [anchor.notselect.font.shadowstyle,形態指定](anchor.notselect.font.shadowstyle.md) | anchor.notselect.font.shadowstyle | ❌ 検出なし |
| [anchor.notselect.pen.color.r,数値](anchor.notselect.pen.color.r.md) | anchor.notselect.pen.color.r | ❌ 検出なし |
| [anchor.notselect.pen.color.g,数値](anchor.notselect.pen.color.g.md) | anchor.notselect.pen.color.g | ❌ 検出なし |
| [anchor.notselect.pen.color.b,数値](anchor.notselect.pen.color.b.md) | anchor.notselect.pen.color.b | ❌ 検出なし |
| [anchor.notselect.brush.color.r,数値](anchor.notselect.brush.color.r.md) | anchor.notselect.brush.color.r | ❌ 検出なし |
| [anchor.notselect.brush.color.g,数値](anchor.notselect.brush.color.g.md) | anchor.notselect.brush.color.g | ❌ 検出なし |
| [anchor.notselect.brush.color.b,数値](anchor.notselect.brush.color.b.md) | anchor.notselect.brush.color.b | ❌ 検出なし |
| [anchor.visited.style,形状](anchor.visited.style.md) | anchor.visited.style | ✅ 対応済 (balloon-descript.js) |
| [anchor.visited.font.color.r,数値](anchor.visited.font.color.r.md) | anchor.visited.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [anchor.visited.font.color.g,数値](anchor.visited.font.color.g.md) | anchor.visited.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [anchor.visited.font.color.b,数値](anchor.visited.font.color.b.md) | anchor.visited.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [anchor.visited.font.shadowcolor.r,数値](anchor.visited.font.shadowcolor.r.md) | anchor.visited.font.shadowcolor.r | ❌ 検出なし |
| [anchor.visited.font.shadowcolor.g,数値](anchor.visited.font.shadowcolor.g.md) | anchor.visited.font.shadowcolor.g | ❌ 検出なし |
| [anchor.visited.font.shadowcolor.b,数値](anchor.visited.font.shadowcolor.b.md) | anchor.visited.font.shadowcolor.b | ❌ 検出なし |
| [anchor.visited.font.shadowstyle,形態指定](anchor.visited.font.shadowstyle.md) | anchor.visited.font.shadowstyle | ❌ 検出なし |
| [anchor.visited.pen.color.r,数値](anchor.visited.pen.color.r.md) | anchor.visited.pen.color.r | ❌ 検出なし |
| [anchor.visited.pen.color.g,数値](anchor.visited.pen.color.g.md) | anchor.visited.pen.color.g | ❌ 検出なし |
| [anchor.visited.pen.color.b,数値](anchor.visited.pen.color.b.md) | anchor.visited.pen.color.b | ❌ 検出なし |
| [anchor.visited.brush.color.r,数値](anchor.visited.brush.color.r.md) | anchor.visited.brush.color.r | ❌ 検出なし |
| [anchor.visited.brush.color.g,数値](anchor.visited.brush.color.g.md) | anchor.visited.brush.color.g | ❌ 検出なし |
| [anchor.visited.brush.color.b,数値](anchor.visited.brush.color.b.md) | anchor.visited.brush.color.b | ❌ 検出なし |
| [clickwaitmarker.x,座標 \*1](clickwaitmarker.x.md) | clickwaitmarker.x | ✅ 対応済 (balloon-descript.js) |
| [clickwaitmarker.y,座標 \*1](clickwaitmarker.y.md) | clickwaitmarker.y | ✅ 対応済 (balloon-descript.js) |
| [sstpmarker.x,座標 \*1](sstpmarker.x.md) | sstpmarker.x | ✅ 対応済 (balloon-descript.js) |
| [sstpmarker.y,座標 \*1](sstpmarker.y.md) | sstpmarker.y | ✅ 対応済 (balloon-descript.js) |
| [sstpmessage.x,座標 \*1](sstpmessage.x.md) | sstpmessage.x | ✅ 対応済 (balloon-descript.js) |
| [sstpmessage.y,座標 \*1](sstpmessage.y.md) | sstpmessage.y | ✅ 対応済 (balloon-descript.js) |
| [sstpmessage.xr,座標 \*1](sstpmessage.xr.md) | sstpmessage.xr | ✅ 対応済 (balloon-descript.js) |
| [sstpmessage.yb,座標 \*1](sstpmessage.yb.md) | sstpmessage.yb | ✅ 対応済 (balloon-descript.js) |
| [onlinemarker.interval,待機時間](onlinemarker.interval.md) | onlinemarker.interval | ✅ 対応済 (balloon-descript.js) |
| [onlinemarker.x,座標 \*1](onlinemarker.x.md) | onlinemarker.x | ✅ 対応済 (balloon-descript.js) |
| [onlinemarker.y,座標 \*1](onlinemarker.y.md) | onlinemarker.y | ✅ 対応済 (balloon-descript.js) |
| [sstpmessage.font.name,フォント名](sstpmessage.font.name.md) | sstpmessage.font.name | ❌ 検出なし |
| [sstpmessage.font.height,サイズ](sstpmessage.font.height.md) | sstpmessage.font.height | ❌ 検出なし |
| [sstpmessage.font.color.r,数値](sstpmessage.font.color.r.md) | sstpmessage.font.color.r | ❌ 検出なし |
| [sstpmessage.font.color.g,数値](sstpmessage.font.color.g.md) | sstpmessage.font.color.g | ❌ 検出なし |
| [sstpmessage.font.color.b,数値](sstpmessage.font.color.b.md) | sstpmessage.font.color.b | ❌ 検出なし |
| [number.font.name,フォント名](number.font.name.md) | number.font.name | ✅ 対応済 (balloon-descript.js) |
| [number.font.height,数値](number.font.height.md) | number.font.height | ✅ 対応済 (balloon-descript.js) |
| [number.font.color.r,数値](number.font.color.r.md) | number.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [number.font.color.g,数値](number.font.color.g.md) | number.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [number.font.color.b,数値](number.font.color.b.md) | number.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [number.x,座標 \*1](number.x.md) | number.x | ✅ 対応済 (balloon-descript.js) |
| [number.xr,座標 \*1](number.xr.md) | number.xr | ✅ 対応済 (balloon-descript.js) |
| [number.y,座標 \*1](number.y.md) | number.y | ✅ 対応済 (balloon-descript.js) |
| [number.yb,座標 \*1](number.yb.md) | number.yb | ✅ 対応済 (balloon-descript.js) |
| [arrow0.x,座標 \*1](arrow0.x.md) | arrow0.x | ✅ 対応済 (balloon-descript.js) |
| [arrow0.y,座標 \*1](arrow0.y.md) | arrow0.y | ✅ 対応済 (balloon-descript.js) |
| [arrow1.x,座標 \*1](arrow1.x.md) | arrow1.x | ✅ 対応済 (balloon-descript.js) |
| [arrow1.y,座標 \*1](arrow1.y.md) | arrow1.y | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.font.name,フォント名](communicatebox.font.name.md) | communicatebox.font.name | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.font.color.r,数値](communicatebox.font.color.r.md) | communicatebox.font.color.r | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.font.color.g,数値](communicatebox.font.color.g.md) | communicatebox.font.color.g | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.font.color.b,数値](communicatebox.font.color.b.md) | communicatebox.font.color.b | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.background.color.r,数値](communicatebox.background.color.r.md) | communicatebox.background.color.r | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.background.color.g,数値](communicatebox.background.color.g.md) | communicatebox.background.color.g | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.background.color.b,数値](communicatebox.background.color.b.md) | communicatebox.background.color.b | ✅ 実装済 (balloon-descript.js) |
| [communicatebox.placeholder.color.r,数値](communicatebox.placeholder.color.r.md) | communicatebox.placeholder.color.r | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.placeholder.color.g,数値](communicatebox.placeholder.color.g.md) | communicatebox.placeholder.color.g | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.placeholder.color.b,数値](communicatebox.placeholder.color.b.md) | communicatebox.placeholder.color.b | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.x,座標](communicatebox.x.md) | communicatebox.x | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.y,座標](communicatebox.y.md) | communicatebox.y | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.width,サイズ](communicatebox.width.md) | communicatebox.width | ✅ 対応済 (balloon-descript.js) |
| [communicatebox.height,サイズ](communicatebox.height.md) | communicatebox.height | ✅ 対応済 (balloon-descript.js) |
| [paint_transparent_region_black,数値](paint_transparent_region_black.md) | paint_transparent_region_black | ✅ 対応済 (balloon-descript.js) |
| [use_self_alpha,値](use_self_alpha.md) | use_self_alpha | ✅ 対応済 (balloon-descript.js) |
| [use_input_alpha,数値](use_input_alpha.md) | use_input_alpha | ✅ 対応済 (balloon-descript.js) |
| [overlay_outside_balloon,`0/1`](overlay_outside_balloon.md) | overlay_outside_balloon | ✅ 対応済 (balloon-descript.js) |
| [windowposition.x,座標](windowposition.x.md) | windowposition.x | ✅ 対応済 (balloon-descript.js) |
| [windowposition.y,座標](windowposition.y.md) | windowposition.y | ✅ 対応済 (balloon-descript.js) |
| [windowposition.limit,0/1](windowposition.limit.md) | windowposition.limit | ✅ 対応済 (balloon-descript.js) |
