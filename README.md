# LLM Shortcut Plugin

[![downloads shield](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22llm-shortcut%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://www.obsidianstats.com/plugins/llm-shortcut)

A plugin for [Obsidian](https://obsidian.md) that provides a way to create shortcuts for commands powered by LLM capabilities.

## Why

The idea behind this plugin is very simple. I needed a way to manage prompts conveniently, without copy-pasting my stuff here and there.

The plugin allows you to create a directory of prompts that would automatically be mapped to Obsidian "commands" (tree-like structure would become an easily accessible list). The plugin will use the current open document as context for the selected prompt to an LLM provider of your choice.

So, this file-tree:

<img width="350" alt="Screenshot 2025-06-29 at 09 44 06" src="https://github.com/user-attachments/assets/e63282b5-86ee-41e3-a771-d4ed8c36255f" />

Becomes a list of commands:

<img width="350" alt="Screenshot 2025-06-29 at 09 44 16" src="https://github.com/user-attachments/assets/63296207-b950-4692-bb08-afddff9e7247" />

## Features

- 🤖 Multi-Provider Support: Works with any OpenAI-compatible API provider
- 🔒 Privacy respected, nothing is stored or logged outside of your machine
- 📚 Prompt Library: Organize prompts in a folder structure
- 🔥 Instant Commands: Your prompts transform into Obsidian commands

## Extra Features

### Custom Prompt Command

The plugin includes a customizable command that allows you to enter a prompt directly without creating a prompt file. By default, this command appears as "Custom prompt" in the command palette. You can customize the label for this command in plugin settings.

## Customization

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

## Example

Probably the best way to explain the workflow is via this little vid I made:

<https://github.com/user-attachments/assets/be6f8c74-a086-4392-9ed9-09dc6e7f2af2>

[OpenRouter AI integration example](./openrouter.ai.md)

## License

MIT
