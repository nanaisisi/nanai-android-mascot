use super::super::trait_def::ShioriEngine;
use super::super::wasm::WasmShioriEngine;
use std::path::Path;

#[test]
fn test_wasm_shiori_engine_initial_state() {
    let engine = WasmShioriEngine::new();
    assert!(!engine.is_loaded());

    let default_engine = WasmShioriEngine::default();
    assert!(!default_engine.is_loaded());
}

#[test]
fn test_wasm_shiori_engine_unloaded_request() {
    let engine = WasmShioriEngine::new();
    let res = engine.request("GET SHIORI/3.0\r\nID: version\r\n\r\n");
    assert!(res.is_err());
    assert_eq!(res.unwrap_err(), "WASM SHIORI engine not loaded");
}

#[test]
fn test_wasm_shiori_engine_load_without_bytecode() {
    let mut engine = WasmShioriEngine::new();
    let res = engine.load(Path::new("/dummy/ghost/ghost/master"));
    assert!(res.is_err());
    assert_eq!(res.unwrap_err(), "WASM module not loaded via load_bytecode");
    assert!(!engine.is_loaded());
}

#[test]
fn test_wasm_shiori_engine_invalid_bytecode() {
    let mut engine = WasmShioriEngine::new();
    let invalid_bytes = b"NOT_A_WASM_BINARY_MAGIC";
    let res = engine.load_bytecode(invalid_bytes);
    assert!(res.is_err());
    assert!(res.unwrap_err().contains("WASM module compilation failed"));
    assert!(!engine.is_loaded());
}

#[test]
fn test_wasm_shiori_engine_valid_bytecode_lifecycle() {
    let mut engine = WasmShioriEngine::new();

    // Standard minimal valid WASM binary header (\0asm \1\0\0\0)
    let minimal_wasm: [u8; 8] = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];
    let compile_res = engine.load_bytecode(&minimal_wasm);
    assert!(compile_res.is_ok());
    assert!(!engine.is_loaded());

    // Now load with directory
    let load_res = engine.load(Path::new("/ghost/master"));
    assert!(load_res.is_ok());
    assert!(engine.is_loaded());

    // Request should succeed
    let req = "GET SHIORI/3.0\r\nID: version\r\n\r\n";
    let res = engine.request(req).expect("Request should succeed");
    assert!(res.contains("SHIORI/3.0 200 OK"));
    assert!(res.contains("Sender: WasmShiori"));
    assert!(res.contains(&format!("request len {}", req.len())));

    // Unload
    let unload_res = engine.unload();
    assert!(unload_res.is_ok());
    assert!(!engine.is_loaded());

    // Request after unload should fail
    let after_unload_res = engine.request(req);
    assert!(after_unload_res.is_err());
}
