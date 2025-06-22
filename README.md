# Obsidian LLM Shortcut Plugin

A plugin for [Obsidian](https://obsidian.md) that provides a way to create shortcuts for commands powered by LLM capabilities.

## Why

The idea behind this plugin is very simple. I needed a way to manage prompts conveniently, without copy-pasting my stuff here and there.

The plugin allows you to create a directory of prompts that would automatically be mapped to Obsidian "commands" (tree-like structure would become an easily accessible list). The plugin will use the current open document as context for the selected prompt to an LLM provider of your choice.

## Features

- LLM Provider customization (base url, API key, model name, everything's stored locally)
- Selecting directory for prompts (`__prompts__` by default)
- Automatic command generation based on the prompt directory tree
- Privacy respected, nothing is stored or logged outside of your machine

## Example

Probably the best way to explain the workflow is via this little vid I made:

<https://github.com/user-attachments/assets/be6f8c74-a086-4392-9ed9-09dc6e7f2af2>

## License

MIT
