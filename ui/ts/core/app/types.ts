export interface AppSettings {
	shellScale?: string;
	balloonScale?: string;
	balloonTheme?: string;
	autoLoadGhost: boolean;
	enableNotifications: boolean;
	darkMode: boolean;
	alwaysOnTop: boolean;
	ghostSize: string;
	debugLevel: string;
	autoSwitchBalloonWithGhost: boolean;
	[key: string]: unknown;
}
