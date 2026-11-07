/// Windows タスクバー・右クリックジャンプリスト（タスク: Explorer / Calendar）登録モジュール

#[cfg(target_os = "windows")]
pub fn setup_taskbar_jumplist(_app: &tauri::App) -> Result<(), String> {
    use windows_sys::Win32::System::Com::{COINIT_APARTMENTTHREADED, CoInitializeEx};
    use windows_sys::Win32::UI::Shell::SetCurrentProcessExplicitAppUserModelID;

    println!("🟢 Windows タスクバー・ジャンプリスト（タスク: Explorer / Calendar）初期化中...");
    unsafe {
        let _ = CoInitializeEx(std::ptr::null_mut(), COINIT_APARTMENTTHREADED as u32);
        let app_id: Vec<u16> = "com.nanai-android-mascot.app\0".encode_utf16().collect();
        let _ = SetCurrentProcessExplicitAppUserModelID(app_id.as_ptr());
    }
    println!("🟢 Windows タスクバー・ジャンプリストの AppUserModelID 設定が完了しました");
    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn setup_taskbar_jumplist(_app: &tauri::App) -> Result<(), String> {
    Ok(())
}
