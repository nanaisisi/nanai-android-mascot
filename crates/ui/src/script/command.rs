use serde::{Deserialize, Serialize};

/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum SakuraCommand {
    Target(u8),   // \0, \1, \p[n]
    Surface(u32), // \s[0], \s0
    Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)
    ClickWait,    // \x (クリック/入力待ち)
    Quick(bool),  // \_q (高速表示トグル)
    NewLine {
        half: bool,
    }, // \n / \n[half]
    NewLineNoPause, // \_n
    AutoPause,      // \_?
    InlineBitmap {
        path: String,
        mode: String,
        x: Option<i32>,
        y: Option<i32>,
        opaque: bool,
    }, // \_b[...]
    Clear,        // \c
    ClearArg { arg: String }, // \c[char,n], \c[line,n]
    Choice {
        label: String,
        id: String,
    }, // \q[label,id]
    Anchor {
        id: String,
        text: String,
    }, // \_a[id]text\_a
    Raise {
        event: String,
        references: Vec<String>,
    }, // \![raise,Event,...]
    Bind {
        category: String,
        part: String,
        status: Option<bool>,
    }, // \![bind,cat,part,status]
    Balloon(i32), // \b[n], \b[-1], \b0..\b9
    NoUserBreak(bool), // \_!
    Voice(String),     // \__v[opt]
    ModeChange { mode: String, active: bool },
    LockBalloonRepaint(bool),
    BalloonSetting { key: String, value: String, extra: Vec<String> },
    Marker,
    Animation {
        id: u32,
        wait: bool,
    }, // \i[ID], \i[ID,wait]
    Timeout,      // \t (タイムアウト抑止)
    Halt,         // \- (ゴースト終了)
    Sync(bool),   // \_s (複数キャラ同期発話トグル)
    Offset {
        x: String,
        y: String,
    }, // \_l[x,y] (座標移動)
    Font {
        tag: String,
        param: Option<String>,
    }, // \f[tag,param], \f[tag]
    Text(String), // 通常テキスト
    End,          // \e
    ScheduleAdd {
        date: String,
        time: String,
        title: String,
        memo: String,
    }, // \![execute,schedule-add,...]
    OpenDialog {
        dialog_type: String,
        id: String,
        args: Vec<String>,
    }, // \![open,inputbox,ID,...] 等
    ChoiceTimeout(u32),
    BalloonOffset {
        x: i32,
        y: i32,
    },
    BalloonTimeout(u32),
    LockBalloonMove(bool),
    WindowState(String),
    Change {
        target: String,
        name: String,
    },
    Call {
        target: String,
        name: String,
    },
    SetWallpaper {
        filename: String,
        option: String,
    },
    SaveWallpaper,
    RestoreWallpaper,
    Cancel {
        service: String,
        target: String,
    },
    Close {
        service: String,
        target: String,
    },
    ArchiveExec {
        action: String,
        filename: String,
        dest: String,
    },
    DownloadExec {
        url: String,
        save_path: String,
    },
    UploadExec {
        url: String,
        file_path: String,
    },
    MailCheckExec {
        account: String,
    },
    MailExec {
        action: String,
        target: String,
    },
    FileExec {
        action: String,
        path: String,
        dest: String,
    },
    SetHttpTimeout(u32),
    SetProxy {
        server: String,
        port: u16,
    },
    Biff,
    ExecuteSntp,
    CreateShortcut,
    Command {
        args: Vec<String>,
    }, // その他の \![...] 汎用透過
}
