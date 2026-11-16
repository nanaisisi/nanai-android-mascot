//! さくらスクリプト コマンド名およびトークン型定義

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum SakuraCommandName {
    #[serde(rename = "open:inputbox")]
    OpenInputbox,
    #[serde(rename = "open:passwordinput")]
    OpenPasswordinput,
    #[serde(rename = "open:textarea")]
    OpenTextarea,
    #[serde(rename = "open:slider")]
    OpenSlider,
    #[serde(rename = "open:ipinput")]
    OpenIpinput,
    #[serde(rename = "open:date")]
    OpenDate,
    #[serde(rename = "open:time")]
    OpenTime,
    #[serde(rename = "open:teachbox")]
    OpenTeachbox,
    #[serde(rename = "open:communicatebox")]
    OpenCommunicatebox,
    #[serde(rename = "close:inputbox")]
    CloseInputbox,
    #[serde(rename = "close:textarea")]
    CloseTextarea,
    #[serde(rename = "close:dialog")]
    CloseDialog,
    #[serde(rename = "close:teachbox")]
    CloseTeachbox,
    #[serde(rename = "close:communicatebox")]
    CloseCommunicatebox,
    #[serde(rename = "jump")]
    Jump,
    #[serde(rename = "raise")]
    Raise,
    #[serde(rename = "raiseother")]
    Raiseother,
    #[serde(rename = "notifyother")]
    Notifyother,
    #[serde(rename = "embed")]
    Embed,
    #[serde(rename = "change")]
    Change,
    #[serde(rename = "call")]
    Call,
    #[serde(rename = "vanishbymyself")]
    Vanishbymyself,
    #[serde(rename = "bind")]
    Bind,
    #[serde(rename = "open:dressupexplorer")]
    OpenDressupexplorer,
    #[serde(rename = "anim")]
    Anim,
    #[serde(rename = "setchoicetimeout")]
    SetChoicetimeout,
    #[serde(rename = "setballoontimeout")]
    SetBalloontimeout,
    #[serde(rename = "setballoonwait")]
    SetBalloonwait,
    #[serde(rename = "setsyncobject")]
    SetSyncobject,
    #[serde(rename = "resetsyncobject")]
    ResetSyncobject,
    #[serde(rename = "waitsyncobject")]
    WaitSyncobject,
    #[serde(rename = "quicksection")]
    Quicksection,
    #[serde(rename = "update")]
    Update,
    #[serde(rename = "updatebymyself")]
    Updatebymyself,
    #[serde(rename = "updateother")]
    Updateother,
    #[serde(rename = "mail")]
    Mail,
    #[serde(rename = "mailcheck")]
    Mailcheck,
    #[serde(rename = "file")]
    File,
    #[serde(rename = "download")]
    Download,
    #[serde(rename = "upload")]
    Upload,
    #[serde(rename = "archive")]
    Archive,
    #[serde(rename = "setproxy")]
    Setproxy,
    #[serde(rename = "sethttptimeout")]
    Sethttptimeout,
    #[serde(rename = "setwallpaper")]
    Setwallpaper,
    #[serde(rename = "cancelnetworkservice")]
    Cancelnetworkservice,
    #[serde(rename = "closenetworkservice")]
    Closenetworkservice,
    #[serde(rename = "execute")]
    Execute,
    #[serde(rename = "execute:emptyrecyclebin")]
    ExecuteEmptyrecyclebin,
    #[serde(rename = "execute:filewatch")]
    ExecuteFilewatch,
    #[serde(rename = "cancel:filewatch")]
    CancelFilewatch,
    #[serde(rename = "execute:ping")]
    ExecutePing,
    #[serde(rename = "execute:nslookup")]
    ExecuteNslookup,
    #[serde(rename = "execute:schedule-add")]
    ExecuteScheduleAdd,
    #[serde(rename = "set:alignmentondesktop")]
    SetAlignmentondesktop,
    #[serde(rename = "set:tasktrayicon")]
    SetTasktrayicon,
    #[serde(rename = "set:trayballoon")]
    SetTrayballoon,
    #[serde(rename = "plugin")]
    Plugin,
    #[serde(rename = "entermode")]
    Entermode,
    #[serde(rename = "leavemode")]
    Leavemode,
    #[serde(rename = "setposition")]
    Setposition,
    #[serde(rename = "setsensing")]
    Setsensing,
    #[serde(rename = "setalpha")]
    Setalpha,
    #[serde(rename = "setproperty")]
    Setproperty,
    #[serde(rename = "getproperty")]
    Getproperty,
    #[serde(rename = "setserikotalk")]
    Setserikotalk,
    #[serde(rename = "setothersurfacechange")]
    Setothersurfacechange,
    #[serde(rename = "opensystemtarget")]
    Opensystemtarget,
    #[serde(rename = "reloadghost")]
    Reloadghost,
    #[serde(rename = "reloadshell")]
    Reloadshell,
    #[serde(rename = "reloadballoon")]
    Reloadballoon,
    #[serde(rename = "reloaddescript")]
    Reloaddescript,
    #[serde(rename = "reloadsurface")]
    Reloadsurface,
    #[serde(rename = "reloadshiori")]
    Reloadshiori,
    #[serde(rename = "executesntp")]
    Executesntp,
    #[serde(rename = "executeresetwindowpos")]
    Executeresetwindowpos,
    #[serde(rename = "executeresetballoonpos")]
    Executeresetballoonpos,
    #[serde(rename = "biff")]
    Biff,
    #[serde(rename = "notify")]
    Notify,
    #[serde(rename = "timerraise")]
    Timerraise,
    #[serde(rename = "timernotify")]
    Timernotify,
    #[serde(rename = "notifyplugin")]
    Notifyplugin,
    #[serde(rename = "raiseplugin")]
    Raiseplugin,
    #[serde(rename = "setshioridebugmode")]
    Setshioridebugmode,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
#[serde(tag = "type", content = "value")]
pub enum SakuraToken {
    /// テキスト文字列
    Text(String),
    /// スコープ変更 (\0, \1, \p[N])
    Scope(u32),
    /// サーフィス変更 (\s[N])
    Surface(i32),
    /// バルーン指定 (\b[N])
    Balloon(i32),
    /// アニメーション再生 (\i[N])
    Animation(i32),
    /// 改行 (\n, \n[half])
    Newline,
    /// 画面クリア (\c: reset, \C: keep settings)
    Clear { keep_settings: bool },
    /// 音声再生指定 (\__v[path])
    Voice { path: String },
    /// ウエイト (\w1 ~ \w9, \_w[ms])
    Wait(u32),
    /// 選択肢入力待ち (\*)
    Star,
    /// 選択肢 (\q[title,id])
    Choice {
        title: String,
        id: String,
        args: Vec<String>,
    },
    /// アンカー (\_a[id]title\_a)
    Anchor { id: String, text: String },
    /// フォント設定 (\f[bold,true], \f[color,r,g,b], \f[height,12] 等 - UKADOC仕様準拠)
    Font { property: String, args: Vec<String> },
    /// 同期モード (\_s)
    Sync(bool),
    /// クイックモード (\_q)
    Quick(bool),
    /// 選択肢スコープ開始 (\__q[id,args...])
    ChoiceScopeBegin { id: String, args: Vec<String> },
    /// 選択肢スコープ終了 (\__q)
    ChoiceScopeEnd,
    /// オートラップ無効化 (\_n)
    NoAutoWrap,
    /// Rawモード切替 (\_?, \_!)
    RawToggle { active: bool, delimiter: String },
    /// 拡張コマンド (\![...])
    Command { command: String, args: Vec<String> },
    /// スクリプト終了 (\e)
    Halt,
}
