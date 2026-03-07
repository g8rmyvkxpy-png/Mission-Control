#!/bin/bash

# Qwen 3.5 Benchmark Script
# Usage: ./qwen-benchmark.sh

echo "🚀 Qwen 3.5 Benchmark"
echo "====================="
echo ""

# Test prompts - varied complexity
PROMPTS=(
  "What is 2+2?"
  "Explain quantum computing in one sentence."
  "Write a Python function to reverse a string."
  "What's the capital of France? Think step by step."
)

# Models to test
MODELS=("qwen3:4b" "qwen3:3b")

echo "Available models:"
for model in "${MODELS[@]}"; do
  echo "  - $model"
done
echo ""

# Check if models are available
echo "Checking models..."
for model in "${MODELS[@]}"; do
  if ! ollama list | grep -q "$model"; then
    echo "⚠️  $model not found. Pulling..."
    ollama pull "$model"
  fi
done
echo ""

# Run benchmarks
for model in "${MODELS[@]}"; do
  echo "========================================"
  echo "📊 Testing: $model"
  echo "========================================"
  
  total_time=0
  count=0
  
  for prompt in "${PROMPTS[@]}"; do
    echo ""
    echo "Prompt: $prompt"
    echo "---"
    
    start=$(date +%s.%N)
    response=$(ollama run "$model" "$prompt" 2>/dev/null)
    end=$(date +%s.%N)
    
    elapsed=$(echo "$end - $start" | bc)
    total_time=$(echo "$total_time + $elapsed" | bc)
    count=$((count + 1))
    
    echo "Response: $response"
    echo "Time: ${elapsed}s"
  done
  
  avg_time=$(echo "scale=2; $total_time / $count" | bc)
  echo ""
  echo "📈 $model Average Time: ${avg_time}s"
  echo ""
done

echo "✅ Benchmark Complete!"
echo ""
echo "Comparison:"
echo "  - 4B: Larger, more capable, slower"
echo "  - 3B: Smaller, faster, slightly less capable"
