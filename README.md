# LLM Shortcut

[![downloads shield](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22llm-shortcut%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://www.obsidianstats.com/plugins/llm-shortcut)

Turn Markdown prompt files into Obsidian commands.

`LLM Shortcut` maps your prompt library folder to command palette entries, then runs the selected prompt against the active note using any OpenAI-compatible provider.

## Why this plugin

If you keep reusing prompts ("improve writing", "translate", "make this a bullet-list"), copy-paste gets tedious quickly.

This plugin lets you:

- keep prompts as plain `.md` files in your vault;
- organize them in folders;
- run them like native Obsidian commands.

<img width="100%" alt="Commands from prompts showcase" alt="image" src="https://github.com/user-attachments/assets/06297261-dce1-493b-a117-5ac6103487af" />

![ezgif-376a9b52f4d3e831](https://github.com/user-attachments/assets/841b9192-7f40-4039-85eb-1ceef12d1366)


> I used OpenRouter's `google/gemini-3-flash-preview` for demo

## Prerequisites

You have to use your own LLM provider and keys :)

## Features

- Use your own OpenAI-compatible providers (OpenAI, OpenRouter, and others with compatible endpoints)
- Prompt files become commands automatically (including nested folders)
- Streaming output directly into the editor selection/cursor
- Custom prompt command for one-off prompts without creating a file
- Local-first behavior: your prompt files stay in your vault

## 2-minute quick start

1. Install `LLM Shortcut` from Community Plugins.
2. Open plugin settings and fill:
   - `🔑 API key`
   - `🌐 Base URL` (example: `https://api.openai.com/v1`)
   - `🤖 Model name` (example: `gpt-4.1-mini`)
3. Create a prompt folder (default: `_prompts`).
4. Add a prompt file, for example `_prompts/Writing/Improve.md`:

```md
Improve the selected text.
Keep the original meaning, but make it clearer and more concise.
```

5. Open any note, select text (or place cursor), then run command:
   - `LLM Shortcut: Writing / Improve`

> The better you are with the prompting, the better results you get, it's mostly on you :)

## Advanced prompt features

### `info-mode` popup

This allows

### Selection-Only Commands

Some prompts work best when applied to a specific selection of text. You can mark a command as selection-only by adding frontmatter to your prompt file:

```yaml
---
llm-shortcut-selection-mode: selection-only
---
Your prompt content here...
```

When a command is marked as selection-only, it will:

- Require text to be selected before execution
- Show an error notification if you try to run it without a selection
- Only process the selected text (and the document context) when executed

This is useful for prompts that are designed to transform, analyze, or modify specific portions of text rather than working with the entire document.

<video width="350" alt="Demo Selection Only" src="https://github.com/user-attachments/assets/4eabe88a-d4c5-4928-b357-ad0928b7484b"></video>

### Context for LLM

By default, the plugin sends the entire file content to the LLM, marking the areas that should be modified (either a text selection or the caret position). The LLM uses the full file as context when making modifications.

You can limit the context window by specifying the number of characters to include before and after the selection or caret position. This is particularly useful when working with very long documents or when you want to focus the LLM's attention on a specific area.

To configure the context size, add these parameters to your prompt file's frontmatter:

```yaml
---
llm-shortcut-context-size-before: 256
llm-shortcut-context-size-after: 0
---
Your prompt content here...
```

- `llm-shortcut-context-size-before`: Number of characters to include before the selection (default: entire file)
- `llm-shortcut-context-size-after`: Number of characters to include after the selection (default: entire file)

## Built-in command: custom prompt

The plugin also adds a command for ad-hoc prompting (default label: `Custom prompt`).

You can rename this in settings via `📝 Command label`.

## Our use cases

- Improve clarity and grammar in selected paragraphs
- Translate selected text while preserving formatting
- Convert free text into a table
- Explain unfamiliar words in context
- Generate concise summaries/checklists from meeting notes

Ready-made examples are available in [`prompt-examples`](./prompt-examples).

## Integrations

- [OpenRouter setup example](./openrouter.ai.md)

## License

MIT
