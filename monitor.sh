#!/bin/bash

# Check dependencies
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install jq to run this script."
  exit 1
fi

# Check required files
if [ ! -f scripts/ralph/prd.json ]; then
  echo "Error: scripts/ralph/prd.json not found"
  exit 1
fi

if [ ! -f scripts/ralph/progress.txt ]; then
  echo "Error: scripts/ralph/progress.txt not found"
  exit 1
fi

# Story status
cat scripts/ralph/prd.json | \
jq '.userStories[] | {id, passes}'
# Learnings
cat scripts/ralph/progress.txt
# Commits
git log --oneline -10
