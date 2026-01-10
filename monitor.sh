#!/bin/bash

# Story status
cat scripts/ralph/prd.json | \
jq '.userStories[] | {id, passes}'
# Learnings
cat scripts/ralph/progress.txt
# Commits
git log --oneline -10
