//! SHIORI DLL 呼び出しの低レベル FFI・ホストプロセス管理
//!
//! [DLL共通仕様], [メモリ管理], [request関数], [ライフサイクル関数 (loadu)]

use std::{
    ffi::c_void,
    path::{Path, PathBuf},
};

pub type Hglobal = *mut c_void;
// [ライフサイクル関数 (loadu)]: load / loadu FFI シグネチャ
pub(crate) type ShioriLoadFn = unsafe extern "C" fn(h: Hglobal, len: i64) -> i32;
// [ライフサイクル関数 (loadu)]: unload FFI シグネチャ
pub(crate) type ShioriUnloadFn = unsafe extern "C" fn() -> i32;
// [request関数]: request FFI シグネチャ
pub(crate) type ShioriRequestFn = unsafe extern "C" fn(h: Hglobal, len: *mut i64) -> Hglobal;

#[cfg(windows)]
unsafe extern "system" {
    // [メモリ管理]: GlobalAlloc Win32 API 連携
    pub(crate) fn GlobalAlloc(uFlags: u32, dwBytes: usize) -> Hglobal;
    // [メモリ管理]: GlobalFree Win32 API 連携
    pub(crate) fn GlobalFree(hMem: Hglobal) -> Hglobal;
}

#[allow(dead_code)]
pub(crate) const GMEM_FIXED: u32 = 0x0000;

/// 32bit DLL 用ホストプロセス (shiori-host32.exe) との stdio ブリッジ
#[cfg(windows)]
pub(crate) struct HostProc {
    child: std::process::Child,
    stdin: std::process::ChildStdin,
    stdout: std::process::ChildStdout,
}

#[cfg(not(windows))]
pub(crate) struct HostProc;

#[cfg(windows)]
impl HostProc {
    fn find_exe() -> Option<PathBuf> {
        let name = "shiori-host32.exe";
        let mut cands = Vec::new();
        if let Ok(exe) = std::env::current_exe()
            && let Some(d) = exe.parent()
        {
            cands.push(d.join(name));
            cands.push(d.join("resources").join(name));
        }
        // 開発時
        for prof in ["release", "debug"] {
            cands.push(PathBuf::from(format!(
                "shiori-host/target/i686-pc-windows-msvc/{prof}/{name}"
            )));
            cands.push(PathBuf::from(format!(
                "src-tauri/shiori-host/target/i686-pc-windows-msvc/{prof}/{name}"
            )));
        }
        cands.into_iter().find(|p| p.exists())
    }

    pub(crate) fn spawn(dll_path: &Path) -> Result<Self, String> {
        use std::process::{Command, Stdio};
        let exe = Self::find_exe().ok_or(
            "shiori-host32.exe が見つかりません。`cargo build --release --target i686-pc-windows-msvc --manifest-path src-tauri/shiori-host/Cargo.toml` を実行してください",
        )?;
        let mut child = Command::new(exe)
            .arg(dll_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("host spawn failed: {e}"))?;
        let stdin = child.stdin.take().ok_or("no stdin")?;
        let stdout = child.stdout.take().ok_or("no stdout")?;
        let mut h = HostProc {
            child,
            stdin,
            stdout,
        };
        // 起動通知 (ready) を待つ
        h.read_reply()
            .map_err(|e| format!("host did not start (DLL load failed?): {e}"))?;
        Ok(h)
    }

    fn read_reply(&mut self) -> Result<(i32, Vec<u8>), String> {
        read_reply_stream(&mut self.stdout)
    }

    pub(crate) fn call(&mut self, cmd: u8, payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
        use std::io::Write;
        let mut msg = Vec::with_capacity(5 + payload.len());
        msg.push(cmd);
        msg.extend_from_slice(&(payload.len() as u32).to_le_bytes());
        msg.extend_from_slice(payload);
        self.stdin.write_all(&msg).map_err(|e| e.to_string())?;
        self.stdin.flush().map_err(|e| e.to_string())?;
        self.read_reply()
    }
}

#[cfg(windows)]
impl Drop for HostProc {
    fn drop(&mut self) {
        let _ = self.child.kill();
    }
}

#[cfg(not(windows))]
impl HostProc {
    pub(crate) fn call(&mut self, _cmd: u8, _payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
        Err("host unsupported".into())
    }
}

/// PE ヘッダから x86 (0x14C) DLL かどうか判定
#[cfg(windows)]
pub(crate) fn is_x86_dll(path: &Path) -> bool {
    let Ok(b) = std::fs::read(path) else {
        return false;
    };
    if b.len() < 0x40 {
        return false;
    }
    let o = u32::from_le_bytes([b[0x3C], b[0x3D], b[0x3E], b[0x3F]]) as usize;
    b.len() > o + 6 && u16::from_le_bytes([b[o + 4], b[o + 5]]) == 0x14C
}

/// ホストプロセス (shiori-host32) の stdout ストリームから (status, payload) を読み取る
#[allow(dead_code)]
pub(crate) fn read_reply_stream(reader: &mut impl std::io::Read) -> Result<(i32, Vec<u8>), String> {
    let mut head = [0u8; 8];
    reader.read_exact(&mut head).map_err(|e| e.to_string())?;
    let status = i32::from_le_bytes(
        head[0..4]
            .try_into()
            .map_err(|_| "Invalid status bytes".to_string())?,
    );
    let len = u32::from_le_bytes(
        head[4..8]
            .try_into()
            .map_err(|_| "Invalid length bytes".to_string())?,
    ) as usize;
    let mut buf = vec![0u8; len];
    reader.read_exact(&mut buf).map_err(|e| e.to_string())?;
    Ok((status, buf))
}

#[cfg(test)]
mod tests {
    use super::read_reply_stream;
    use std::io::Cursor;

    #[test]
    fn test_read_reply_stream_success() {
        let mut data = Vec::new();
        let status: i32 = 200;
        let payload = b"SHIORI/3.0 200 OK\r\n\r\n";
        data.extend_from_slice(&status.to_le_bytes());
        data.extend_from_slice(&(payload.len() as u32).to_le_bytes());
        data.extend_from_slice(payload);

        let mut cursor = Cursor::new(data);
        let res = read_reply_stream(&mut cursor).expect("expected successful read");
        assert_eq!(res.0, 200);
        assert_eq!(res.1, payload);
    }

    #[test]
    fn test_read_reply_stream_empty_payload() {
        let mut data = Vec::new();
        let status: i32 = 1;
        let payload: &[u8] = b"";
        data.extend_from_slice(&status.to_le_bytes());
        data.extend_from_slice(&(payload.len() as u32).to_le_bytes());

        let mut cursor = Cursor::new(data);
        let res =
            read_reply_stream(&mut cursor).expect("expected successful read of empty payload");
        assert_eq!(res.0, 1);
        assert_eq!(res.1, Vec::<u8>::new());
    }

    #[test]
    fn test_read_reply_stream_truncated_header() {
        let data = vec![0u8; 4]; // only 4 bytes instead of 8
        let mut cursor = Cursor::new(data);
        let res = read_reply_stream(&mut cursor);
        assert!(res.is_err());
    }

    #[test]
    fn test_read_reply_stream_truncated_payload() {
        let mut data = Vec::new();
        let status: i32 = 0;
        let len: u32 = 10;
        data.extend_from_slice(&status.to_le_bytes());
        data.extend_from_slice(&len.to_le_bytes());
        data.extend_from_slice(b"12345"); // only 5 bytes instead of 10

        let mut cursor = Cursor::new(data);
        let res = read_reply_stream(&mut cursor);
        assert!(res.is_err());
    }
}
