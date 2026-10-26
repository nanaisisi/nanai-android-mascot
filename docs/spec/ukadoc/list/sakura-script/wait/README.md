# sakura-script/wait 項目別突合

実装コードの文字列検索による一次調査です。

| 項目 | 検索語 | 対応状況 |
| :--- | :--- | :---: |
| [\__w[時間]](__w.md) | \__w | ❌ 検出なし |
| [\_q](_q.md) | \_q | ✅ 実装済 |
| [\_s](_s.md) | \_s | ❌ 検出なし |
| [\_s[ID1,ID2,ID3...]](_s-ID1-ID2-ID3.md) | \_s | ❌ 検出なし |
| [\_w[時間]](_w.md) | \_w | ✅ 実装済 |
| [\![quicksection,false]](bang-quicksection-false.md) | \! | ❓ 要確認 |
| [\![quicksection,true]](bang-quicksection-true.md) | \! | ❓ 要確認 |
| [\![reset,syncobject,同期オブジェクト名]](bang-reset-syncobject.md) | \! | ❓ 要確認 |
| [\![set,syncobject,同期オブジェクト名]](bang-set-syncobject.md) | \! | ❓ 要確認 |
| [\![wait,syncobject,同期オブジェクト名,オプション]](bang-wait-syncobject.md) | \! | ❓ 要確認 |
| [\t](t.md) | \t | ❌ 検出なし |
| [\w時間](w.md) | \w | ❓ 要確認 |
| [\x](x.md) | \x | ✅ 実装済 |
| [\x[noclear]](x-noclear.md) | \x | ❌ 未実装 (パーサは引数形式を解釈しない) |
