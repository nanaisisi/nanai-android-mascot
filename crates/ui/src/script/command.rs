/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SakuraCommand {
    Target(u8),   // \0, \1, \p[n]
    Surface(u32), // \s[0], \s0
    Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)
    ClickWait,    // \x (クリック/入力待ち)
    Quick(bool),  // \_q (高速表示トグル)
    NewLine,      // \n
    Clear,        // \c
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
    Text(String), // 通常テキスト
    End,          // \e
}
