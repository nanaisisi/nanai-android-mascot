#!/usr/bin/env bash
# Build nanai-shiori-vm as a WebAssembly (.wasm) binary for Android/Web deployment
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "🚀 Building nanai-shiori-vm WebAssembly binary for Android/Web..."

cd "${REPO_ROOT}"

# Add wasm32 target if needed
rustup target add wasm32-unknown-unknown --toolchain nightly || true

# Build release WASM binary
CARGO_PROFILE_DEV_CODEGEN_BACKEND=llvm \
CARGO_BUILD_RUSTC_WRAPPER="" \
cargo +nightly build \
    --target wasm32-unknown-unknown \
    --package nanai-shiori-vm \
    --release

WASM_OUTPUT="${REPO_ROOT}/target/wasm32-unknown-unknown/release/nanai_shiori_vm.wasm"

if [[ -f "${WASM_OUTPUT}" ]]; then
    mkdir -p "${REPO_ROOT}/public/wasm"
    cp "${WASM_OUTPUT}" "${REPO_ROOT}/public/wasm/shiori.wasm"
    echo "✅ Successfully built and deployed WASM SHIORI to public/wasm/shiori.wasm ($(wc -c < "${REPO_ROOT}/public/wasm/shiori.wasm") bytes)"
else
    echo "❌ Build artifact not found at ${WASM_OUTPUT}"
    exit 1
fi
