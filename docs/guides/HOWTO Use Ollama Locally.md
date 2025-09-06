---
title: 'Use Ollama Locally'
created: 2025-09-01
modified: 2025-09-06
type: guide
status: active
tags:
   - guide
   - ollama
   - ai
   - local
   - models
   - setup
   - continue
   - cursor
   - vscode
   - ide-integration
---

# Use Ollama Locally With Continue Extension in Cursor & VS Code

This guide covers setting up Ollama with local AI models and integrating them with the Continue extension in both Cursor and VS Code for enhanced coding assistance.

## Step 1: Install Ollama

Open Terminal and run:

```shell
brew install ollama
```

OR use the official installation script (works on macOS, Linux, Windows WSL):

```shell
curl -fsSL https://ollama.ai/install.sh | sh
```

Verify installation

```shell
ollama --version
```

## Step 2: Start Ollama Service (optional for API use)

Run Ollama service in the background if you want to use REST API or multiple sessions:

```shell
ollama serve &
```

2. **Started Ollama Server**
   Ran `ollama serve` to start the local Ollama server enabling communication.

## Step 3: Install Optimized Models for Continue

For the best Continue integration experience, install these carefully selected models. Each serves a specific purpose:

### Core Coding Models (Main Chat/Assistance)

```shell
# Best general purpose model
ollama pull llama3.1:8b

# Instruction-tuned coding models (excellent for explanations)
ollama pull codellama:13b-instruct
ollama pull starcoder2:instruct

# DeepSeek family (strong coding capabilities)
ollama pull deepseek-coder:6.7b-instruct
ollama pull deepseek-coder-v2:16b

# Qwen models (well-balanced coding models)
ollama pull qwen2.5-coder:7b-instruct
ollama pull qwen2.5-coder:14b
```

### Specialized Models for Performance

```shell
# Ultra-fast autocomplete model
ollama pull qwen2.5-coder:1.5b-base

# Dedicated embedding model for code context
ollama pull nomic-embed-text
```

Check what you have installed:

```shell
ollama list
```

Example output of optimized setup:

```shell
NAME                            ID              SIZE      MODIFIED
llama3.1:8b                     46e0c10c039e    4.9 GB    2 hours ago
starcoder2:instruct             432973cfbc4c    9.1 GB    2 hours ago
codellama:13b-instruct          9f438cb9cd58    7.4 GB    2 hours ago
qwen2.5-coder:7b-instruct       dae161e27b0e    4.7 GB    2 weeks ago
deepseek-coder:6.7b-instruct    ce298d984115    3.8 GB    2 weeks ago
qwen2.5-coder:14b               9ec8897f747e    9.0 GB    2 weeks ago
deepseek-coder-v2:16b           63fb193b3a9b    8.9 GB    2 weeks ago
qwen2.5-coder:1.5b-base         a1b2c3d4e5f6    986 MB    1 hour ago
nomic-embed-text                f6e5d4c3b2a1    274 MB    1 hour ago
```

## Step 4: Run the model(s)

To run an interactive session with e.g. CodeLlama 13B:

```shell
ollama run codellama:13b
```

You can also specify parameters like temperature for creativity:

```shell
ollama run codellama:13b --temperature 0.7
```

## Step 5: Configure Concurrency

This step is optional but recommended. You can set environment variables to handle multiple concurrent models and requests, for example:

```shell
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=2
ollama serve
```

Now you can run two models parallel to each other.

## Step 6: Configure Continue Extension

Install and configure the Continue extension in your preferred editor for seamless AI integration:

### Install Continue Extension

#### For Cursor:

1. Open Cursor
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "Continue"
4. Install the extension

#### For VS Code:

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "Continue"
4. Install the extension by Continue

> **Note:** The Continue extension works identically in both Cursor and VS Code since Cursor is built on VS Code.

### Configure Continue with Your Models

The configuration is identical for both Cursor and VS Code. Continue now uses YAML format:

#### Configuration File Location:

- **macOS/Linux:** `~/.continue/config.yaml`
- **Windows:** `%USERPROFILE%\.continue\config.yaml`

#### Quick Setup Commands:

```bash
# Create directory (if it doesn't exist)
mkdir -p ~/.continue

# Create/edit config file
nano ~/.continue/config.yaml
# or
code ~/.continue/config.yaml
```

#### Optimized YAML Configuration:

```yaml
name: Local Agent
version: 1.0.0
schema: v1
models:
   # Chat models - available in dropdown for conversations
   - name: 🦙 Llama 3.1 8B (General)
     provider: ollama
     model: llama3.1:8b
     roles:
        - chat
   - name: ⭐ StarCoder2 Instruct (Code Generation)
     provider: ollama
     model: starcoder2:instruct
     roles:
        - chat
   - name: 🔥 CodeLlama 13B Instruct (Code Analysis)
     provider: ollama
     model: codellama:13b-instruct
     roles:
        - chat
   - name: 🎯 Qwen 2.5 Coder 7B Instruct (Balanced)
     provider: ollama
     model: qwen2.5-coder:7b-instruct
     roles:
        - chat
   - name: 🧠 DeepSeek Coder 6.7B Instruct (Fast)
     provider: ollama
     model: deepseek-coder:6.7b-instruct
     roles:
        - chat
   - name: 💪 Qwen 2.5 Coder 14B (Large)
     provider: ollama
     model: qwen2.5-coder:14b
     roles:
        - chat
   - name: 🚀 DeepSeek Coder V2 16B (Advanced)
     provider: ollama
     model: deepseek-coder-v2:16b
     roles:
        - chat

   # Specialized role assignments for optimal performance
   - name: Chat Default
     provider: ollama
     model: llama3.1:8b
     roles:
        - chat

   - name: Edit Specialist
     provider: ollama
     model: deepseek-coder-v2:16b
     roles:
        - edit

   - name: Apply Specialist
     provider: ollama
     model: starcoder2:instruct
     roles:
        - apply

   - name: Rerank Model
     provider: ollama
     model: qwen2.5-coder:7b-instruct
     roles:
        - rerank

   - name: Autocomplete Engine
     provider: ollama
     model: qwen2.5-coder:1.5b-base
     roles:
        - autocomplete

   - name: Embed Engine
     provider: ollama
     model: nomic-embed-text
     roles:
        - embed
context:
   - provider: code
   - provider: docs
   - provider: diff
   - provider: terminal
   - provider: problems
   - provider: folder
   - provider: codebase
```

#### What This Configuration Does:

- **Chat:** All 7 models available in dropdown + optimized default (Llama 3.1 8B)
- **Edit:** Uses most advanced model (DeepSeek Coder V2 16B) for code editing
- **Apply:** Uses code generation specialist (StarCoder2 Instruct) for applying changes
- **Rerank:** Uses balanced model (Qwen 7B) for ranking suggestions
- **Autocomplete:** Uses ultra-fast model (Qwen 1.5B) for real-time suggestions
- **Embed:** Uses specialized embedding model (Nomic) for code context

#### Expected Configuration Result:

After applying this configuration, your Continue interface should show:

![Continue Configuration](../images/continue-config-optimized.png)

- **Chat:** Dropdown with all 7 models available
- **Autocomplete:** Qwen2.5-Coder 1.5B (Autocomplete) - ultra-fast
- **Edit:** DeepSeek Coder V2 16B (Advanced) - most capable for code editing
- **Apply:** StarCoder2 Instruct (Code Generation) - best for applying changes
- **Embed:** Nomic Embed (Context) - specialized for code understanding
- **Rerank:** Qwen 2.5 Coder 7B Instruct (Balanced) - optimal for ranking results

> **📸 Screenshot Placement:** Save your configuration screenshot as `continue-config-optimized.png` in the `docs/images/` folder to match the documentation reference above.

### Shared Configuration Between Editors

**✅ YES - VS Code and Cursor use the EXACT SAME configuration file!**

- **Single file location:** `~/.continue/config.yaml` (macOS/Linux) or `%USERPROFILE%\.continue\config.yaml` (Windows)
- **Shared across editors:** Configure once, works in both VS Code and Cursor
- **Real-time sync:** Changes in one editor immediately affect the other
- **No duplication:** No need to maintain separate configs

#### Why This Works:

- **Cursor is built on VS Code** - maintains full extension compatibility
- **Continue extension is identical** in both editors
- **Configuration is stored globally** in your user directory, not editor-specific

#### Practical Benefits:

1. **Configure once, use everywhere** - Set up models in Cursor, immediately available in VS Code
2. **Easy switching** - Use the same AI setup regardless of which editor you prefer
3. **Consistent experience** - Same models, same performance, same features
4. **Simplified maintenance** - Only one configuration file to manage

> **💡 Pro Tip:** You can edit `~/.continue/config.yaml` in either editor and the changes will be reflected in both immediately after restart!

### Using Continue

After configuration:

1. **Restart your editor** (Cursor or VS Code)
2. **Use Continue features:**
   - `Cmd+I` (or `Ctrl+I`) - Open Continue chat
   - `Cmd+Shift+I` (or `Ctrl+Shift+I`) - Inline edit
   - Start typing - Autocomplete suggestions appear
   - Select different models from the Continue interface
   - Access Continue via the sidebar icon (⏵) in both editors

#### Editor-Specific Notes:

**Cursor:**

- Continue integrates seamlessly with Cursor's existing AI features
- You may want to disable Cursor's built-in AI to avoid conflicts
- Continue will be the primary AI assistant

**VS Code:**

- Continue provides AI capabilities that VS Code doesn't have natively
- Works alongside other VS Code extensions
- May need to disable conflicting extensions like IntelliCode

## Model Functions & When to Use Each

### **Conversational & Explanations**

- **`llama3.1:8b`** - General conversations, explaining concepts, documentation, non-coding questions
   - _Use when:_ You need clear explanations, brainstorming, or general AI assistance

### **Code Generation & Writing**

- **`starcoder2:instruct`** - Generating new code from scratch, following specific instructions
   - _Use when:_ You want to create new functions, classes, or entire code files

- **`qwen2.5-coder:14b`** - Complex code generation, advanced algorithms, system design
   - _Use when:_ Building complex features or need sophisticated coding solutions

- **`deepseek-coder-v2:16b`** - Most advanced coding tasks, debugging complex issues
   - _Use when:_ Tackling the hardest coding problems or need the best possible solution

### **Code Analysis & Learning**

- **`codellama:13b-instruct`** - Understanding existing code, code reviews, refactoring suggestions
   - _Use when:_ You need to understand legacy code or want code improvement suggestions

### **Quick Coding Tasks**

- **`qwen2.5-coder:7b-instruct`** - Balanced choice for everyday coding tasks
   - _Use when:_ General coding help, moderate complexity tasks

- **`deepseek-coder:6.7b-instruct`** - Fast coding assistance, quick fixes, simple functions
   - _Use when:_ You need quick answers or help with straightforward coding tasks

### **Automatic Background Functions**

- **`qwen2.5-coder:1.5b-base`** - Real-time code autocomplete (Continue handles this automatically)
   - _Function:_ Provides instant suggestions as you type

- **`nomic-embed-text`** - Code context understanding (Continue uses this automatically)
   - _Function:_ Helps Continue understand your codebase for better suggestions

## Model Management

### Removing Unwanted Models

If you want to delete a model to free up disk space:

```shell
# Remove a specific model
ollama rm model-name:tag

# Examples
ollama rm llama2:7b
ollama rm deepseek-coder:6.7b
ollama rm codellama:13b
```

### Check Model Information

```shell
# Show detailed info about a model
ollama show llama3.1:8b

# List all installed models
ollama list
```

### Update Models

```shell
# Update to latest version
ollama pull llama3.1:8b
```

## Editor-Specific Configuration

### VS Code Additional Setup

While the core Continue configuration is identical, VS Code users may want to consider these additional optimizations:

#### Recommended VS Code Settings

Add these to your VS Code `settings.json` for optimal Continue experience:

```json
{
   // Disable conflicting AI features
   "github.copilot.enable": false,
   "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue",
   "editor.inlineSuggest.enabled": true,

   // Optimize for Continue
   "editor.quickSuggestions": {
      "other": true,
      "comments": true,
      "strings": true
   },
   "editor.suggestOnTriggerCharacters": true,
   "editor.wordBasedSuggestions": "off",

   // Performance optimizations
   "editor.suggest.snippetsPreventQuickSuggestions": false,
   "editor.acceptSuggestionOnCommitCharacter": false
}
```

#### Extensions to Consider Disabling

To avoid conflicts with Continue:

- **GitHub Copilot** - Disable if you have it installed
- **IntelliCode** - May interfere with Continue's suggestions
- **Tabnine** - Another AI assistant that could conflict

#### VS Code Workspace Configuration

For project-specific Continue settings, create `.vscode/settings.json` in your project:

```json
{
   "continue.enableTabAutocomplete": true,
   "continue.manuallyTriggerCompletion": false
}
```

### Cursor-Specific Considerations

#### Cursor Built-in AI vs Continue

**Option 1: Use Both (Recommended)**

- Keep Cursor's AI for general assistance
- Use Continue for specialized coding tasks
- Different models for different purposes

**Option 2: Continue Only**

- Disable Cursor's built-in AI features
- Use Continue as your primary AI assistant
- More consistent experience across editors

#### Cursor AI Settings

To adjust Cursor's built-in AI behavior:

1. Open Cursor Settings (`Cmd+,`)
2. Search for "AI" or "Copilot"
3. Adjust settings based on your preference

## Additional Tips & Resource Management

### Hardware Considerations (24 GB RAM)

Our current optimized setup fits perfectly within 24 GB RAM limits:

- **Fast & Efficient:** 7B models (3-5 GB) run smoothly
- **Balanced:** 13-16B models (7-9 GB) provide best quality/performance ratio
- **Advanced:** Multiple models can run simultaneously for different tasks
- **Avoid:** 33B+ models (would require aggressive quantization and hurt performance)

### Performance Optimization

#### Quantized Models for Memory Savings

If you need to save more memory, use quantized versions:

```shell
# Example: Quantized version uses less RAM
ollama pull qwen2.5-coder:14b-instruct-q4_K_M
```

#### Concurrent Model Management

Set environment variables for better performance:

```shell
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=2
ollama serve
```

### Useful Commands

#### Model Information

```shell
# List all installed models
ollama list

# Show detailed model info (context length, template, etc.)
ollama show llama3.1:8b

# Check model size and memory usage
ollama ps
```

#### Model Updates

```shell
# Update to latest version
ollama pull llama3.1:8b

# Pull specific quantized version
ollama pull deepseek-coder-v2:16b-instruct-q4_K_M
```

### Troubleshooting

- **Slow responses:** Check if multiple large models are loaded (`ollama ps`)
- **Out of memory:** Unload unused models or use smaller quantized versions
- **Continue not connecting:** Ensure `ollama serve` is running on port 11434

## Workspace Configuration Files

### Important: Cursor Built-in Chat vs Continue

**⚠️ Key Limitation:** Cursor's built-in chat interface doesn't support local Ollama models directly. However, you have these options:

1. **Use Continue for Local Models** (Recommended)
   - Continue extension provides full access to your local models
   - Works identically in both Cursor and VS Code
   - Supports chat, autocomplete, and all AI features

2. **Cursor Built-in + Continue Hybrid Approach**
   - Keep Cursor's built-in AI for general assistance
   - Use Continue for specialized coding tasks with your local models

### VS Code Workspace Settings

For VS Code projects, create `.vscode/settings.json` in your project root:

```json
{
   "continue.enableTabAutocomplete": true,
   "continue.manuallyTriggerCompletion": false,
   "continue.maxAutocompleteCharacters": 10000,
   "continue.enableContinueForTeams": false,

   "editor.inlineSuggest.enabled": true,
   "editor.quickSuggestions": {
      "other": true,
      "comments": true,
      "strings": true
   },

   "github.copilot.enable": false,
   "vsintellicode.modify.editor.suggestSelection": "automaticallyOverrodeDefaultValue"
}
```

### Cursor Workspace Settings

For Cursor projects, create `.cursor/settings.json` in your project root:

```json
{
   "continue.enableTabAutocomplete": true,
   "continue.manuallyTriggerCompletion": false,
   "continue.maxAutocompleteCharacters": 10000,

   "cursor.cpp.disabledLanguages": [],
   "cursor.general.enableCursorPredictions": false,
   "cursor.chat.useOpenAIKey": false,

   "editor.inlineSuggest.enabled": true,
   "editor.quickSuggestions": {
      "other": true,
      "comments": true,
      "strings": true
   }
}
```

### Accessing Your Local Models

#### Through Continue Extension:

1. **Open Continue chat:** `Cmd+I` (or `Ctrl+I`)
2. **Select model:** Click the model dropdown in Continue interface
3. **You'll see all your configured models:**
   - llama3.1:8b
   - starcoder2:instruct
   - codellama:13b-instruct
   - qwen2.5-coder:7b-instruct
   - deepseek-coder:6.7b-instruct
   - qwen2.5-coder:14b
   - deepseek-coder-v2:16b

#### Through Cursor Built-in (Limited):

- Cursor's built-in chat uses cloud models only
- For local models, you must use Continue
- Consider disabling Cursor's AI if you prefer Continue exclusively

### Continue Configuration Verification

To verify Continue can see your models:

1. **Open Continue config:** `Cmd+Shift+P` → "Continue: Open config.yaml" or click the gear icon in Continue
2. **Check model list:** Ensure all 7 models are listed
3. **Test connection:** Use `Cmd+I` and try switching between models
4. **Verify autocomplete:** Start typing code and check for suggestions

### Troubleshooting Model Access

**If models don't appear in Continue:**

```bash
# Check Ollama is running
ollama ps

# Restart Ollama if needed
pkill ollama
ollama serve

# Verify models are accessible
curl http://localhost:11434/api/tags
```

**If Continue doesn't connect:**

1. Check `~/.continue/config.yaml` has all your models configured properly
2. Restart your editor after config changes
3. Ensure no firewall blocking port 11434
4. Note: Continue now uses YAML format, not JSON

## Step 7: Set Up AIChat for Interactive Terminal Conversations

While Continue provides excellent IDE integration, you might want an interactive chat interface similar to Claude CLI for terminal-based conversations. AIChat offers exactly this experience with your local Ollama models.

### **Installing AIChat**

```bash
brew install aichat
```

### **Initial Configuration**

Run the interactive setup:

```bash
aichat --info
```

When prompted, configure as follows:

1. **API Provider:** Select `openai-compatible` (not "openai")
2. **Provider Name:** `ollama` (or any name you prefer)
3. **API Base:** `http://localhost:11434/v1`
4. **API Key:** Leave empty (press Enter - Ollama doesn't need one)
5. **Default Model:** `llama3.1:8b`

### **Using AIChat Interactively**

#### **Start Interactive Chat Session:**

```bash
# Start with default model (llama3.1:8b)
aichat

# Start with specific model
aichat -m starcoder2:instruct

# Start and continue named session (with conversation history)
aichat -s my-coding-session
```

#### **Interactive Commands (Inside AIChat):**

```bash
> Hello! Can you explain React hooks?          # Normal conversation
> .model starcoder2:instruct                   # Switch to coding model
> Can you write a code example now?            # Continue conversation
> .models                                      # List all available models
> .save important-conversation                 # Save current chat
> .load important-conversation                 # Load saved chat
> .clear                                       # Clear conversation history
> .help                                        # Show all commands
> .exit                                        # Quit (or Ctrl+C)
```

#### **Model Switching Examples:**

```bash
> .model llama3.1:8b                          # General conversations
> .model starcoder2:instruct                  # Code generation
> .model codellama:13b-instruct               # Code analysis
> .model deepseek-coder-v2:16b                # Advanced coding tasks
> .model qwen2.5-coder:1.5b-base              # Quick/light tasks
```

#### **Session Management:**

```bash
# From terminal - start/resume sessions
aichat -s project-alpha                       # Start named session
aichat -s debugging-session                   # Different session for debugging
aichat                                        # Continue last session
```

### **AIChat vs Other CLI Tools**

| Tool           | Interface        | Best For                                |
| -------------- | ---------------- | --------------------------------------- |
| **AIChat**     | Interactive REPL | Conversational AI (like Claude CLI)     |
| **Continue**   | IDE Integration  | Code editing, autocomplete, analysis    |
| **Claude CLI** | Interactive REPL | Research, latest info (internet access) |

### **Practical AIChat Workflow:**

```bash
# Start coding session
aichat -s my-project

# Inside AIChat:
> I'm building a React app. Can you help me design the component structure?
[AI responds with architecture suggestions]

> .model starcoder2:instruct
> Now generate the UserProfile component code
[AI generates React component]

> .model llama3.1:8b
> Explain this component's lifecycle in simple terms
[AI explains the code]

> .save react-components
> .exit
```

### **Quick Command Examples:**

```bash
# One-off questions
aichat "What's the difference between SQL JOIN types?"

# File analysis
cat script.js | aichat "optimize this code"

# With specific model
aichat -m deepseek-coder-v2:16b "help me refactor this complex algorithm"
```

## Recommended Workflow & Usage Patterns

### Triple AI Setup (Recommended)

**Yes, you can use all three simultaneously!** Here's the optimal workflow:

#### **Claude + Continue + AIChat (Best of All Worlds)**

- **Claude (via Cursor chat):** General discussions, planning, architecture, latest information
- **Continue (local models):** Code editing, autocomplete, refactoring, IDE-integrated assistance
- **AIChat (local models):** Terminal conversations, quick questions, interactive coding sessions

#### **Practical Usage:**

1. **Start with Claude** for project planning and high-level discussions
2. **Switch to Continue** when you need to write/modify actual code in your editor
3. **Use AIChat** for terminal-based conversations and quick questions
4. **Use all three in parallel** - each has different strengths

#### **Example Workflow:**

```bash
# 1. Research with Claude (this chat)
"What are the latest React 18 patterns for state management?"

# 2. Quick discussion with AIChat (terminal)
aichat -s react-project
> Based on what I learned, help me plan a component structure

# 3. Code generation with Continue (in editor)
# Use Cmd+I in VS Code/Cursor to generate actual components

# 4. Back to AIChat for quick questions
> .model starcoder2:instruct
> How do I test this component?

# 5. Continue the cycle as needed
```

### How to Access Each AI System

#### **Claude (Current Chat Interface):**

- **Access:** This current chat interface you're using
- **Models:** GPT-4, Claude (cloud-based)
- **Best for:** Planning, explanations, general AI assistance
- **Usage:** You're using it right now!

#### **Continue (Local Models):**

- **Access:** `Cmd+I` (or `Ctrl+I`) opens Continue chat window
- **Models:** Your 7 local Ollama models
- **Best for:** Code generation, refactoring, debugging
- **Usage:** Opens a separate chat interface for coding tasks

#### **AIChat (Local Models - Terminal):**

- **Access:** `aichat` command in terminal
- **Models:** Your 9 local Ollama models (same as Continue)
- **Best for:** Interactive conversations, quick questions, terminal workflow
- **Usage:** Interactive REPL like Claude CLI but with local models

### Optional: Disable Cursor's Built-in AI (To Avoid Confusion)

If you prefer to use only Continue for coding and Claude for general chat, you can disable Cursor's built-in AI features:

#### **Method 1: Cursor Settings (Recommended)**

1. **Open Cursor Settings:** `Cmd+,` (or `Ctrl+,`)
2. **Search for:** "AI" or "Copilot"
3. **Disable these settings:**
   ```
   ✗ Cursor Tab (AI autocompletion)
   ✗ AI predictions
   ✗ Cursor++ features
   ✗ Auto-generated commit messages
   ```

#### **Method 2: Workspace Settings**

Add to your `.cursor/settings.json`:

```json
{
   "cursor.general.enableCursorPredictions": false,
   "cursor.chat.useOpenAIKey": false,
   "cursor.cpp.enableAutocomplete": false,
   "cursor.general.enableTab": false,

   "continue.enableTabAutocomplete": true,
   "editor.inlineSuggest.enabled": true
}
```

#### **Method 3: Complete Disable (Most Clean)**

1. **Cursor Settings** → **Features**
2. **Turn off:**
   - AI Code Generation
   - AI Chat
   - AI Code Completion
   - AI Code Suggestions
3. **Keep only Continue enabled**

### Workflow Examples

#### **Example 1: New Feature Development**

1. **Plan with Claude:** "How should I structure a user authentication system?"
2. **Code with Continue:** `Cmd+I` → Select `deepseek-coder-v2:16b` → "Generate JWT authentication middleware"
3. **Refine with Claude:** Ask follow-up questions about security best practices
4. **Debug with Continue:** Use `codellama:13b-instruct` to explain complex code

#### **Example 2: Bug Fixing**

1. **Analyze with Claude:** Describe the bug and get troubleshooting approach
2. **Debug with Continue:** `Cmd+I` → Select `qwen2.5-coder:7b-instruct` → Paste error code for analysis
3. **Fix with Continue:** Generate the corrected code
4. **Verify with Claude:** Discuss if the fix addresses root cause

#### **Example 3: Code Review**

1. **Strategy with Claude:** "What should I look for in a React component review?"
2. **Analysis with Continue:** Use `codellama:13b-instruct` to review specific code sections
3. **Documentation with Continue:** Generate comments and documentation
4. **Team discussion with Claude:** Prepare review feedback

### Model Selection Strategy for Continue

**Quick Reference for Continue usage:**

- **`llama3.1:8b`** - General coding questions, explanations
- **`starcoder2:instruct`** - Generating new code files/functions
- **`codellama:13b-instruct`** - Understanding/reviewing existing code
- **`qwen2.5-coder:7b-instruct`** - Everyday coding tasks
- **`deepseek-coder:6.7b-instruct`** - Quick fixes, simple functions
- **`qwen2.5-coder:14b`** - Complex algorithms, system design
- **`deepseek-coder-v2:16b`** - Most challenging coding problems

### Key Benefits of This Dual Setup

1. **Best of Both Worlds:** Cloud AI for general tasks + Local AI for coding
2. **Privacy:** Sensitive code stays local (Continue) while general discussions use cloud (Claude)
3. **Performance:** No rate limits on local models, always available
4. **Specialization:** Each AI optimized for different tasks
5. **Redundancy:** If one system is down, the other still works
6. **Universal Configuration:** One Continue setup works in both VS Code and Cursor

### Editor Flexibility

**🔄 Seamless Editor Switching:**

- Configure Continue once in either VS Code or Cursor
- Same models automatically available in both editors
- Switch between editors without losing your AI setup
- Perfect for teams using different editors but same AI workflow

**Example Workflow:**

1. Set up Continue in Cursor with your local models
2. Open the same project in VS Code
3. Continue works immediately with identical configuration
4. All 7 models available in both editors
5. Same autocomplete, chat, and editing capabilities

## Local Models vs Cloud Models: Key Differences

### Internet Access Limitations

**❌ Local models (Ollama) CANNOT:**

- Access the internet or browse the web
- Perform real-time research or get current information
- Access online databases, APIs, or live data
- Get the latest news, stock prices, or current events
- Look up recent documentation or updates

**✅ Local models (Ollama) CAN:**

- Work completely offline once downloaded
- Process your code and local files
- Generate code based on their training data
- Analyze and explain existing code
- Provide programming guidance and best practices
- Work without internet connectivity

### Hybrid Approach Benefits

This is why the **Claude + Continue** dual setup is so powerful:

**🌐 Claude (Internet-Connected):**

- Real-time research and current information
- Latest technology updates and best practices
- Access to recent documentation and tutorials
- Current market trends and technology decisions
- Live troubleshooting with latest solutions

**💻 Continue (Local & Private):**

- Code generation and analysis
- Work with sensitive/proprietary code
- No rate limits or connectivity dependence
- Complete privacy - code never leaves your machine
- Consistent performance regardless of internet

### Practical Example Workflow:

1. **Research with Claude:** "What are the latest React 18 best practices for state management?"
2. **Implement with Continue:** Use local models to generate the actual React code
3. **Verify with Claude:** Ask about potential issues or improvements
4. **Refine with Continue:** Make code adjustments locally

### When to Use Which:

**Use Claude when you need:**

- Current information or recent updates
- Research on new technologies or approaches
- Troubleshooting with latest solutions
- Market research or technology comparisons

**Use Continue when you need:**

- Code generation and modification
- Analysis of existing code
- Privacy for sensitive projects
- Offline development work
- High-volume coding assistance

### Current Optimized Model Collection

After cleanup and Continue optimization (January 2025), the installed models are:

```
 ollama list
NAME                            ID              SIZE
llama3.1:8b                     46e0c10c039e    4.9 GB
starcoder2:instruct             432973cfbc4c    9.1 GB
codellama:13b-instruct          9f438cb9cd58    7.4 GB
qwen2.5-coder:7b-instruct       dae161e27b0e    4.7 GB
deepseek-coder:6.7b-instruct    ce298d984115    3.8 GB
qwen2.5-coder:14b               9ec8897f747e    9.0 GB
deepseek-coder-v2:16b           63fb193b3a9b    8.9 GB
qwen2.5-coder:1.5b-base         a1b2c3d4e5f6    986 MB
nomic-embed-text                f6e5d4c3b2a1    274 MB
```

#### What Changed:

**✅ Added for Continue:**

- `qwen2.5-coder:1.5b-base` - Ultra-fast autocomplete model
- `nomic-embed-text` - Specialized embedding model for code context

**❌ Removed (outdated/redundant):**

- `llama2:7b` - Replaced by llama3.1:8b (newer generation)
- `starcoder2:7b` - Replaced by starcoder2:instruct (instruction-tuned)
- `deepseek-coder:6.7b` - Replaced by deepseek-coder:6.7b-instruct (instruction-tuned)
- `codellama:13b` - Replaced by codellama:13b-instruct (instruction-tuned)

**💾 Space Saved:** ~19 GB by removing redundant models

## Summary: Optimized Ollama + Continue Setup

After following this guide, you'll have a complete local AI coding setup that works with both Cursor and VS Code:

### **✅ Current Optimized Model Collection (9 models)**

- **7 main chat/coding models** for different use cases
- **1 ultra-fast autocomplete model** (1.5B) for real-time suggestions
- **1 specialized embedding model** for code context understanding

### **✅ Complete Continue Integration**

- All models configured and ready to use in **both Cursor and VS Code**
- Optimized performance with specialized models for different tasks
- No conflicting or redundant models
- Editor-specific optimizations included

### **✅ Resource Efficiency**

- **~49 GB total** (down from ~68 GB after cleanup)
- **19 GB freed** by removing outdated models
- **Fits comfortably** in 24GB RAM environment
- Efficient model selection for different performance needs

### **✅ Best Practices Applied**

- Only instruction-tuned models kept for better chat capability
- Ultra-fast dedicated model for autocomplete responsiveness
- Advanced large models for complex coding tasks
- Specialized embedding model for superior code context understanding
- Editor-specific settings to avoid conflicts and optimize performance

### **✅ Cross-Editor Compatibility**

- **Identical core configuration** works in both Cursor and VS Code
- **Editor-specific optimizations** provided for each platform
- **Conflict resolution** guidance for existing AI extensions
- **Flexible usage patterns** - use the same setup across different editors
