# Run script for the Go telemetry microservice
Write-Host "Starting Go Telemetry Engine..." -ForegroundColor Cyan

if (Get-Command go -ErrorAction SilentlyContinue) {
    go run main.go
} else {
    Write-Host "Error: Go is not installed." -ForegroundColor Red
    Write-Host "Please install Go (https://go.dev/dl/) to run this microservice." -ForegroundColor Yellow
}
