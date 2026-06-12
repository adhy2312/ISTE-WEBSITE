package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

type TelemetryLog struct {
	JobID     string `json:"job_id"`
	Action    string `json:"action"`
	Role      string `json:"role"`
	Domain    string `json:"domain"`
	Company   string `json:"company"`
	Timestamp string `json:"timestamp"`
}

var (
	logBuffer []TelemetryLog
	mu        sync.Mutex
)

// flushBuffer writes the current logBuffer to disk and resets it.
// This prevents infinite memory growth (memory leak mitigation).
func flushBuffer() {
	mu.Lock()
	if len(logBuffer) == 0 {
		mu.Unlock()
		return
	}
	// Copy buffer and clear it
	toFlush := make([]TelemetryLog, len(logBuffer))
	copy(toFlush, logBuffer)
	logBuffer = nil // Free memory slice immediately
	mu.Unlock()

	// Append to a local JSON file (simulating a DB insert for now)
	filename := "telemetry_ingest.json"
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("[Go Engine] Failed to open telemetry log file: %v", err)
		return
	}
	defer file.Close()

	for _, tLog := range toFlush {
		b, _ := json.Marshal(tLog)
		file.Write(b)
		file.WriteString("\n")
	}
	log.Printf("[Go Engine] Flushed %d logs to disk.", len(toFlush))
}

func telemetryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	// Payload Limit: Max 1MB to prevent DoS via massive JSON payloads
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	var tLog TelemetryLog
	if err := json.NewDecoder(r.Body).Decode(&tLog); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if tLog.Timestamp == "" {
		tLog.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	mu.Lock()
	logBuffer = append(logBuffer, tLog)
	bufferSize := len(logBuffer)
	mu.Unlock()

	log.Printf("[Go Engine] Ingested telemetry: %s at %s. Total in buffer: %d", tLog.Action, tLog.Company, bufferSize)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"success","message":"Ingested by Fortified Go Microservice"}`)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/telemetry", telemetryHandler)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// 1. Background Flusher: Runs every 5 minutes to prevent memory exhaustion
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				flushBuffer()
			case <-ctx.Done():
				return
			}
		}
	}()

	// 2. Server Goroutine
	go func() {
		fmt.Println("🚀 Fortified Go Telemetry Engine running on http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// 3. Graceful Shutdown Signal Handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down Go Telemetry Engine...")

	// Cancel the background flusher
	cancel()

	// Flush any remaining data immediately
	flushBuffer()

	// Shutdown the HTTP server gracefully
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Engine cleanly stopped.")
}
