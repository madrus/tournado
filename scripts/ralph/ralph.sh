#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [max_iterations]

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq not found"
    exit 1
  elif ! jq empty "$PRD_FILE" >/dev/null 2>&1; then
    echo "Error: $PRD_FILE is not valid JSON"
    exit 1
  else
    CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
    LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

    if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
      # Archive the previous run
      DATE=$(date +%Y-%m-%d)
      # Strip "ralph/" prefix from branch name for folder
      # FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
      FOLDER_NAME="${LAST_BRANCH#ralph/}"

      if [[ "$FOLDER_NAME" =~ \.\. ]]; then
        echo "Error: Invalid branch name contains path traversal"
        exit 1
      fi

      ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

      echo "Archiving previous run: $LAST_BRANCH"
      mkdir -p "$ARCHIVE_FOLDER"
      [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
      [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
      echo "   Archived to: $ARCHIVE_FOLDER"

      # Reset progress file for new run
      echo "# Ralph Progress Log" > "$PROGRESS_FILE"
      echo "Started: $(date)" >> "$PROGRESS_FILE"
      echo "---" >> "$PROGRESS_FILE"
    fi
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq not found"
    exit 1
  elif ! jq empty "$PRD_FILE" >/dev/null 2>&1; then
    echo "Error: $PRD_FILE is not valid JSON"
    exit 1
  else
    CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
    if [ -n "$CURRENT_BRANCH" ]; then
      echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
    fi
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"
  
  # Run amp with the ralph prompt
  # COMMAND=(amp --dangerously-allow-all)
  # Run claude with the ralph prompt
  # COMMAND=(claude --permission-mode acceptEdits)
  # Run gemini with the ralph prompt
  # COMMAND=(gemini --yolo)
  # Run gpt with the ralph prompt
  COMMAND=(codex exec --dangerously-bypass-approvals-and-sandbox -)

  set +e
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | "${COMMAND[@]}" 2>&1 | tee /dev/stderr)
  EXIT_CODE=$?
  set -e

  if [ $EXIT_CODE -ne 0 ]; then
    echo "Error: command exited with code $EXIT_CODE"
    exit $EXIT_CODE
  fi
  
  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi
  
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
