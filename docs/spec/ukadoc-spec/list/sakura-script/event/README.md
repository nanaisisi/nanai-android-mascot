# sakura-script/event 項目別突合

実装コードの文字列検索による一次調査です。

| 項目 | 検索語 | 対応状況 |
| :--- | :--- | :---: |
| [\_+](_-plus.md) | Plus | ✅ 実装済 |
| [\6](6.md) | \6 | ✅ 実装済 |
| [\7](7.md) | \7 | ✅ 実装済 |
| [\a](a.md) | AudioWait | ✅ 実装済 |
| [\![biff(,アカウント名)]](bang-biff.md) | Biff | ✅ 実装済 |
| [\![call,ghost,ゴースト名(,--option=raise-event)]](bang-call-ghost-option-eq-raise-event.md) | Call | ✅ 実装済 |
| [\![change,balloon,バルーン名]](bang-change-balloon.md) | Balloon | ✅ 実装済 |
| [\![change,calendarskin,カレンダースキン名]](bang-change-calendarskin.md) | Change | ✅ 実装済 |
| [\![change,ghost,ゴースト名(,--option=raise-event)]](bang-change-ghost-option-eq-raise-event.md) | Change | ✅ 実装済 |
| [\![change,shell,シェル名(,--option=raise-event)]](bang-change-shell-option-eq-raise-event.md) | Change | ✅ 実装済 |
| [\![embed,イベント名,r0,r1,r2...]](bang-embed-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![execute,calendarplugin,カレンダープラグイン名]](bang-execute-calendarplugin.md) | Command | ✅ 実装済 |
| [\![execute,headline,ヘッドライン名]](bang-execute-headline.md) | Command | ✅ 実装済 |
| [\![executesntp]](bang-executesntp.md) | ExecuteSntp | ✅ 実装済 |
| [\![notify,イベント名,r0,r1,r2...]](bang-notify-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![notifyother,ゴースト名,イベント名,r0,r1,r2...]](bang-notifyother-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![notifyplugin,プラグインのIDまたは名前,イベント名,r0,r1,r2...]](bang-notifyplugin-ID-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![raise,イベント名,r0,r1,r2...]](bang-raise-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![raiseother,ゴースト名,イベント名,r0,r1,r2...]](bang-raiseother-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![raiseplugin,プラグインのIDまたは名前,イベント名,r0,r1,r2...]](bang-raiseplugin-ID-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![restore,wallpaper]](bang-restore-wallpaper.md) | RestoreWallpaper | ✅ 実装済 |
| [\![save,wallpaper]](bang-save-wallpaper.md) | SaveWallpaper | ✅ 実装済 |
| [\![set,otherghosttalk,true/false/before/after]](bang-set-otherghosttalk-true-false-before-after.md) | ModeChange | ✅ 実装済 |
| [\![set,othersurfacechange,trueかfalse]](bang-set-othersurfacechange-true-false.md) | ModeChange | ✅ 実装済 |
| [\![set,tasktrayicon,ファイル名.ico,テキスト(,--duration=待機時間(,--runcount=繰り返し回数))]](bang-set-tasktrayicon-.ico-duration-eq-runcount-eq.md) | ModeChange | ✅ 実装済 |
| [\![set,trayballoon,オプション,オプション,オプション...]](bang-set-trayballoon.md) | ModeChange | ✅ 実装済 |
| [\![set,wallpaper,ファイル名,オプション]](bang-set-wallpaper.md) | SetWallpaper | ✅ 実装済 |
| [\![set,windowstate,!stayontop]](bang-set-windowstate-bang-stayontop.md) | WindowState | ✅ 実装済 |
| [\![set,windowstate,minimize]](bang-set-windowstate-minimize.md) | WindowState | ✅ 実装済 |
| [\![set,windowstate,stayontop]](bang-set-windowstate-stayontop.md) | WindowState | ✅ 実装済 |
| [\![timernotify,時間,繰り返すか否か,イベント名,r0,r1,r2...]](bang-timernotify-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![timernotifyother,時間,繰り返すか否か,ゴースト名,イベント名,r0,r1,r2...]](bang-timernotifyother-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![timernotifyplugin,時間,繰り返すか否か,プラグインのIDまたは名前,イベント名,r0,r1,r2...]](bang-timernotifyplugin-ID-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![timerraise,時間,繰り返すか否か,イベント名,r0,r1,r2...]](bang-timerraise-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![timerraiseother,時間,繰り返すか否か,ゴースト名,イベント名,r0,r1,r2...]](bang-timerraiseother-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![timerraiseplugin,時間,繰り返すか否か,プラグインのIDまたは名前,イベント名,r0,r1,r2...]](bang-timerraiseplugin-ID-r0-r1-r2.md) | Raise | ✅ 実装済 |
| [\![update,更新対象(,オプション,オプション...)]](bang-update.md) | Update | ✅ 実装済 |
| [\![update,platform]](bang-update-platform.md) | Update | ✅ 実装済 |
| [\![updatebymyself(,オプション,オプション...)]](bang-updatebymyself.md) | Update | ✅ 実装済 |
| [\![updateother,更新対象/オプション群,...]](bang-updateother.md) | Update | ✅ 実装済 |
| [\![vanishbymyself]](bang-vanishbymyself.md) | Halt | ✅ 実装済 |
| [\e](e.md) | End | ✅ 実装済 |
| [\-](entry.md) | Halt | ✅ 実装済 |
| [補足](note-1.md) | note-1.md | ✅ 実装済 |
| [\+](plus.md) | Plus | ✅ 実装済 |
| [\v](v.md) | Voice | ✅ 実装済 |
