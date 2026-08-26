export function getPresetLoadingMessage(presetName: string): string {
  const label = presetName.trim() || "LLM";
  return `${label} thinking...`;
}
