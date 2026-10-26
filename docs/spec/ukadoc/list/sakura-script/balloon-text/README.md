# sakura-script/balloon-text 項目別突合

実装コードの文字列検索による一次調査です。

| 項目                                                                                                      | 検索語 |                 対応状況                 |
| :-------------------------------------------------------------------------------------------------------- | :----- | :--------------------------------------: |
| [\__v[オプション]](__v.md)                                                                                | \__v   |    📝 コメントのみ(未実装の可能性大)     |
| [\_!](_-bang.md)                                                                                          | \_!    |               ❌ 検出なし                |
| [\_?](_-q.md)                                                                                             | \_     |                ❌ 未実装                 |
| [\_b[ファイルパス,inline]](_b-inline.md)                                                                  | \_b    |               ❌ 検出なし                |
| [\_b\[ファイルパス,inline,[オプション](note-1.md#_bファイルパスについて),オプション...\]](_b-inline-2.md) | \_b    |               ❌ 検出なし                |
| [\_b[ファイルパス,inline,opaque]](_b-inline-opaque.md)                                                    | \_b    |               ❌ 検出なし                |
| [\_b[ファイルパス,x,y]](_b-x-y.md)                                                                        | \_b    |               ❌ 検出なし                |
| [\_b\[ファイルパス,x,y,[オプション](note-1.md#_bファイルパスについて),オプション...\]](_b-x-y-2.md)       | \_b    |               ❌ 検出なし                |
| [\_b[ファイルパス,x,y,opaque]](_b-x-y-opaque.md)                                                          | \_b    |               ❌ 検出なし                |
| [\_l[x,y]](_l-x-y.md)                                                                                     | \_l    |               ❌ 検出なし                |
| [\_n](_n.md)                                                                                              | \_n    |               ❌ 検出なし                |
| [\b[ID番号]](b-ID.md)                                                                                     | \b     |                ❌ 未実装                 |
| [\![enter,nouserbreakmode]](bang-enter-nouserbreakmode.md)                                                | \!     |                ❌ 未実装                 |
| [\![enter,onlinemode]](bang-enter-onlinemode.md)                                                          | \!     |                ❌ 未実装                 |
| [\![execute,resetballoonpos]](bang-execute-resetballoonpos.md)                                            | \!     |                ❌ 未実装                 |
| [\![leave,nouserbreakmode]](bang-leave-nouserbreakmode.md)                                                | \!     |                ❌ 未実装                 |
| [\![leave,onlinemode]](bang-leave-onlinemode.md)                                                          | \!     |                ❌ 未実装                 |
| [\![lock,balloonmove]](bang-lock-balloonmove.md)                                                          | \!     |                ❌ 未実装                 |
| [\![lock,balloonrepaint]](bang-lock-balloonrepaint.md)                                                    | \!     |                ❌ 未実装                 |
| [\![set,autoscroll,disable]](bang-set-autoscroll-disable.md)                                              | \!     |                ❌ 未実装                 |
| [\![set,autoscroll,enable]](bang-set-autoscroll-enable.md)                                                | \!     |                ❌ 未実装                 |
| [\![set,balloonalign,ID]](bang-set-balloonalign-ID.md)                                                    | \!     |                ❌ 未実装                 |
| [\![set,balloonmarker,マーカー表示文字列]](bang-set-balloonmarker.md)                                     | \!     |                ❌ 未実装                 |
| [\![set,balloonnum,ファイル名,現在の数,最大数]](bang-set-balloonnum.md)                                   | \!     |                ❌ 未実装                 |
| [\![set,balloonoffset,x,y]](bang-set-balloonoffset-x-y.md)                                                | \!     |                ❌ 未実装                 |
| [\![set,balloontimeout,時間]](bang-set-balloontimeout.md)                                                 | \!     |                ❌ 未実装                 |
| [\![set,balloonwait,倍率]](bang-set-balloonwait.md)                                                       | \!     |                ❌ 未実装                 |
| [\![set,serikotalk,true/false]](bang-set-serikotalk-true-false.md)                                        | \!     |                ❌ 未実装                 |
| [\![*]](bang-star.md)                                                                                     | \!     |                ❌ 未実装                 |
| [\![unlock,balloonmove]](bang-unlock-balloonmove.md)                                                      | \!     |                ❌ 未実装                 |
| [\![unlock,balloonrepaint]](bang-unlock-balloonrepaint.md)                                                | \!     |                ❌ 未実装                 |
| [\bID番号](bID.md)                                                                                        | \bID   |               ❌ 検出なし                |
| [\c](c.md)                                                                                                | \c     |                ✅ 実装済                 |
| [\C](C-2.md)                                                                                              | \C     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\c[char,数値]](c-char.md)                                                                                | \c     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\c[char,数値,開始位置]](c-char-2.md)                                                                     | \c     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\c[line,数値]](c-line.md)                                                                                | \c     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\c[line,数値,開始位置]](c-line-2.md)                                                                     | \c     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\n](n.md)                                                                                                | \n     |                ✅ 実装済                 |
| [\n[パーセント]](n-2.md)                                                                                  | \n     | ❌ 未実装 (パーサは引数形式を解釈しない) |
| [\n[half]](n-half.md)                                                                                     | \n     |                ✅ 実装済                 |
| [補足](note-1.md)                                                                                         | 補足   |               ❌ 検出なし                |
