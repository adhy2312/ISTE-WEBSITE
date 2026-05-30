#!/bin/bash
# 3. Verification Bash Blueprint (setup_storage.sh)

set -e

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Initialize Bloom Filter for URLs (Targets 500k entities with 0.1% FPR)
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BF.RESERVE bf:internship:urls 0.001 500000 || echo "Bloom filter may already exist or Redis module is missing."

# Pre-populate default runtime feature flags without redeployment
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" HSET config:feature_flags \
    auto_publishing "true" \
    sanity_sync "true" \
    ai_enrichment "false"

echo "Storage blueprint constraints applied to Redis."
