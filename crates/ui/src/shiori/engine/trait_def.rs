use std::path::Path;
use super::state::ShioriLifecycleState;

/// SHIORI/3.0 エンジントレイト
pub trait ShioriEngine: Send + Sync {
    /// SHIORI エンジンのロード・初期化
    ///
    /// 辞書やマスターファイルが配置されているディレクトリパスを受け取る
    fn load(&mut self, dir_path: &Path) -> Result<(), String>;

    /// SHIORI/3.0 リクエストの同期送信
    fn request(&self, request_str: &str) -> Result<String, String>;

    /// SHIORI エンジンのアンロード・解放
    fn unload(&mut self) -> Result<(), String>;

    /// エンジンがロード済みか否か
    fn is_loaded(&self) -> bool;

    /// モバイル/バックグラウンド移行時のサスペンド (省電力・メモリ圧縮)
    fn suspend(&mut self) -> Result<(), String> {
        Ok(())
    }

    /// フォアグラウンド復帰時のレジューム
    fn resume(&mut self) -> Result<(), String> {
        Ok(())
    }

    /// 現在のライフサイクル状態を取得
    fn lifecycle_state(&self) -> ShioriLifecycleState {
        if self.is_loaded() {
            ShioriLifecycleState::Active
        } else {
            ShioriLifecycleState::Unloaded
        }
    }
}
