package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
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
	// In-memory buffer for ultra-fast ingestion before batching to a real DB
	logBuffer []TelemetryLog
	mu        sync.Mutex
)

func telemetryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var tLog TelemetryLog
	if err := json.NewDecoder(r.Body).Decode(&tLog); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set timestamp if empty
	if tLog.Timestamp == "" {
		tLog.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}

	// Lock-free concurrent ingestion can be done via channels, 
	// but a simple mutex is blazing fast for this scale.
	mu.Lock()
	logBuffer = append(logBuffer, tLog)
	bufferSize := len(logBuffer)
	mu.Unlock()

	log.Printf("[Go Engine] Ingested telemetry: %s at %s. Total in buffer: %d", tLog.Action, tLog.Company, bufferSize)

	// In a full implementation, a background goroutine would periodically 
	// flush this buffer to Sanity CMS or PostgreSQL.

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"success","message":"Ingested by Go Microservice"}`)
}

func main() {
	http.HandleFunc("/telemetry", telemetryHandler)

	fmt.Println("🚀 Go Telemetry Engine running on http://localhost:8080")
	fmt.Println("Waiting for high-speed data ingestion...")
	
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
