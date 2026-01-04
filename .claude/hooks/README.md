# Status Line: Message Counter

Display real-time message count in your Claude Code CLI footer.

## Quick Setup

1. **Configure Claude Code settings** (`.claude/settings.local.json`):

```json
{
  "statusLine": ".claude/hooks/message-counter.sh"
}
```

2. **Restart Claude Code** to activate the status line

3. **See the counter** at the bottom of your CLI:
   ```
   💬 Messages: 42
   ```

## How It Works

- Script runs **locally** (zero token cost)
- Reads transcript JSONL path from stdin
- Counts **user messages only** (excludes system reminders) using `grep`
- Updates automatically after each interaction

## Requirements

- `jq` for parsing JSON input (pre-installed on most systems)
- `grep` for counting messages (pre-installed on all Unix systems)

## Script Location

`.claude/hooks/message-counter.sh`

## Troubleshooting

**No display?**
- Check settings path is correct
- Verify script is executable: `chmod +x .claude/hooks/message-counter.sh`
- Test manually: `echo '{"transcript_path":"path/to/transcript.jsonl"}' | .claude/hooks/message-counter.sh`

**Shows "—"?**
- Transcript file not found (normal for new sessions)
- Wait for first message exchange

**Shows "0"?**
- If messages exist but counter shows 0, ensure script is using the correct JSONL format parsing
- Check transcript file: `grep '"type":"user"' path/to/transcript.jsonl | grep -v '<system-reminder>' | wc -l`

## Customization

Edit `.claude/hooks/message-counter.sh` to customize:
- Change emoji: `💬` → `📊`, `🔢`, etc.
- Add token count from `context_window.total_input_tokens`
- Format differently: `"Msgs: 42 | Tokens: 15k"`
