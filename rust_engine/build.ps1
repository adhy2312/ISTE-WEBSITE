# Build script for compiling the Rust engine to WebAssembly
Write-Host "Compiling Rust engine to WebAssembly..." -ForegroundColor Cyan

# Check if wasm-pack is installed
if (Get-Command wasm-pack -ErrorAction SilentlyContinue) {
    wasm-pack build --target web
    Write-Host "Build complete! Wasm files are in rust_engine/pkg/" -ForegroundColor Green
} else {
    Write-Host "Error: wasm-pack is not installed." -ForegroundColor Red
    Write-Host "Please install Rust (https://rustup.rs/) and then run:" -ForegroundColor Yellow
    Write-Host "cargo install wasm-pack" -ForegroundColor Yellow
}
