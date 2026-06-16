# build_engines.ps1
# This script natively compiles the Go and Rust engines for local Windows execution.

Write-Host "🚀 Initializing Local Compilation Pipeline..." -ForegroundColor Cyan

# Ensure bin directory exists
$binDir = Join-Path $PSScriptRoot "scripts\bin"
if (-Not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
}

# 1. Compile Go Engine
Write-Host "🔨 Compiling Go Telemetry Server..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "go_engine")
try {
    go build -o "..\scripts\bin\main.exe" main.go
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Go Engine compiled successfully: scripts\bin\main.exe" -ForegroundColor Green
    } else {
        Write-Host "❌ Go Engine compilation failed." -ForegroundColor Red
    }
} finally {
    Pop-Location
}

# 2. Compile Rust Engine
Write-Host "🔨 Compiling Rust Engine..." -ForegroundColor Yellow
Push-Location (Join-Path $PSScriptRoot "rust_engine")
try {
    cargo build --release
    if ($LASTEXITCODE -eq 0) {
        Copy-Item -Path "target\release\rust_engine.exe" -Destination "..\scripts\bin\rust_engine.exe" -Force
        Write-Host "✅ Rust Engine compiled successfully: scripts\bin\rust_engine.exe" -ForegroundColor Green
    } else {
        Write-Host "❌ Rust Engine compilation failed." -ForegroundColor Red
    }
} finally {
    Pop-Location
}

Write-Host "🎉 Pipeline Compilation Complete!" -ForegroundColor Cyan
