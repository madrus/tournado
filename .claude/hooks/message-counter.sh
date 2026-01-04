#!/bin/bash
# Status line script to display message count in Claude Code
# Reads transcript path from stdin JSON and counts messages

# Read JSON input from stdin
input=$(cat)

# Extract transcript path
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty')

# Count messages if transcript exists
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
  # JSONL format: each line is a JSON object
  # Count only user messages that are NOT system reminders
  # System reminders contain "<system-reminder>" in their content
  message_count=$(grep '"type":"user"' "$transcript_path" 2>/dev/null | \
    grep -v '<system-reminder>' | \
    wc -l | \
    tr -d ' ' || echo "0")

  if [ -n "$message_count" ] && [ "$message_count" != "0" ]; then
    echo "💬 Messages: $message_count"
  else
    echo "💬 Messages: 0"
  fi
else
  echo "💬 Messages: —"
fi
