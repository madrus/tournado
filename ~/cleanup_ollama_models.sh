#!/bin/bash

echo "🧹 Ollama Model Cleanup Script"
echo "This will remove clearly outdated/redundant models"
echo ""

# Models to remove (outdated/redundant)
MODELS_TO_REMOVE=(
    "llama2:7b"                    # Outclassed by llama3.1:8b
    "deepseek-coder:6.7b"         # Outclassed by instruct version and v2
    "codellama:13b"               # Outclassed by instruct version
    "starcoder2:7b"               # Outclassed by instruct version
)

echo "Models that will be removed:"
for model in "${MODELS_TO_REMOVE[@]}"; do
    echo "  ❌ $model"
done

echo ""
echo "Models that will be kept:"
echo "  ✅ llama3.1:8b (best general)"
echo "  ✅ starcoder2:instruct (instruction-tuned code)"
echo "  ✅ codellama:13b-instruct (code explanations)"
echo "  ✅ qwen2.5-coder:7b-instruct (balanced)"
echo "  ✅ qwen2.5-coder:14b (large)"
echo "  ✅ deepseek-coder:6.7b-instruct (fast)"
echo "  ✅ deepseek-coder-v2:16b (most advanced)"

echo ""
echo "💾 Estimated space savings: ~19 GB"
echo ""

read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing outdated models..."
    for model in "${MODELS_TO_REMOVE[@]}"; do
        echo "Removing $model..."
        ollama rm "$model"
    done
    echo ""
    echo "✅ Cleanup complete!"
    echo "📋 Remaining models:"
    ollama list
else
    echo "❌ Cleanup cancelled"
fi
