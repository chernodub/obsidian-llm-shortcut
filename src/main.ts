import { Plugin } from 'obsidian';

interface AIGuidedJournalingSettings {
    readonly apiKey: string;
    readonly providerUrl: string;
    readonly memoryDirectory: string;
}

export default class AIGuidedJournalingPlugin extends Plugin {
    private settings?: AIGuidedJournalingSettings;
    
    override async onload() {
        await this.loadSettings();
    }

    override onunload() {}

    async loadSettings() {
        this.settings = {...await this.loadData()};
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}