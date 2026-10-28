//! SHIORI DLL 呼び出しの低レベル FFI・ホストプロセス管理

use std::ffi::c_void;
use std::path::{Path, PathBuf};

pub type Hglobal = *mut c_void;
pub(super) type ShioriLoadFn = unsafe extern "C" fn(h: Hglobal, len: i64) -> i32;
pub(super) type ShioriUnloadFn = unsafe extern "C" fn() -> i32;
pub(super) type ShioriRequestFn = unsafe extern "C" fn(h: Hglobal, len: *mut i64) -> Hglobal;

#[cfg(windows)]
unsafe extern "system" {
    pub(super) fn GlobalAlloc(uFlags: u32, dwBytes: usize) -> Hglobal;
    pub(super) fn GlobalFree(hMem: Hglobal) -> Hglobal;
}

#[allow(dead_code)]
pub(super) const GMEM_FIXED: u32 = 0x0000;

/// 32bit DLL 用ホストプロセス (shiori-host32.exe) との stdio ブリッジ
#[cfg(windows)]
pub(super) struct HostProc {
    child: std::process::Child,
    stdin: std::process::ChildStdin,
    stdout: std::process::ChildStdout,
}

#[cfg(not(windows))]
pub(super) struct HostProc;

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

    pub(super) fn spawn(dll_path: &Path) -> Result<Self, String> {
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
        use std::io::Read;
        let mut head = [0u8; 8];
        self.stdout
            .read_exact(&mut head)
            .map_err(|e| e.to_string())?;
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
        self.stdout
            .read_exact(&mut buf)
            .map_err(|e| e.to_string())?;
        Ok((status, buf))
    }

    pub(super) fn call(&mut self, cmd: u8, payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
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
    pub(super) fn call(&mut self, _cmd: u8, _payload: &[u8]) -> Result<(i32, Vec<u8>), String> {
        Err("host unsupported".into())
    }
}

/// PE ヘッダから x86 (0x14C) DLL かどうか判定
#[cfg(windows)]
pub(super) fn is_x86_dll(path: &Path) -> bool {
    let Ok(b) = std::fs::read(path) else {
        return false;
    };
    if b.len() < 0x40 {
        return false;
    }
    let o = u32::from_le_bytes([b[0x3C], b[0x3D], b[0x3E], b[0x3F]]) as usize;
    b.len() > o + 6 && u16::from_le_bytes([b[o + 4], b[o + 5]]) == 0x14C
}
