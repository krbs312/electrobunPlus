

interface command {
	type: string;
	payload?: (param: unknown) => void;
}

export class HHMessage_bun {

	commands: command[] = [];
    webview: any;

	constructor(commands: command[], webview?: any) {
		this.commands = commands;
		this.webview = webview;

        this.webview.on("host-message" as any, (event: any) => {
            try {
                this.handleHostMessage(event.data.detail);
            } catch (error) {
                console.error("Error handling host-message:", error);
            }
        });
	}

sendToView(message: unknown) {
	try {
		this.webview.sendMessageToWebviewViaExecute(message);
	} catch (error) {
		console.error("Failed to send message to webview:", error);
	}
}

async handleHostMessage(message: unknown) {
	if (!message || typeof message !== "object") return;
	const payload = message as Record<string, unknown>;
	const type = payload.type as string | undefined;
	const param = payload.param as unknown;

	if (!type) return;

	const command = this.commands.find((cmd) => cmd.type === type);
	if (command) {
		try {
			command.payload?.(param);
		} catch (error) {
			console.error(`Error executing command for type "${type}":`, error);
		}
	}
}

}

export class HHMessage_view {
	commands: command[] = [];


	handleHostMessage(message: Record<string, unknown>) {
		if (!message || typeof message !== "object") {
			return;
		}
		const type = message.type as string | undefined;
		const param = message.param as unknown;
		if (!type) {
			return;
		}
		const command = this.commands.find((cmd) => cmd.type === type);
		if (command) {
			try {
				command.payload?.(param);
			} catch (error) {
				console.error(`Error executing command for type "${type}":`, error);
			}
		}
	}

	sendHostCommand(command: unknown) {
		const win = window as any;
		if (typeof win.__electrobunSendToHost !== "function") {
			console.error("Electrobun host bridge is not available.");
			this.statusMessage = "Host bridge unavailable.";
			return;
		}
		win.__electrobunSendToHost(command);
	}
	statusMessage: string = "Not connected";

	setupHostBridge() {
		const win = window as any;
		if (!win.__electrobun) {
			win.__electrobun = {};
		}
		win.__electrobun.receiveMessageFromBun = (message: unknown) => {
			this.handleHostMessage(message as Record<string, unknown>);
		};
	}

	constructor(commands: command[]) {
		this.commands = commands;
		this.setupHostBridge();
	}

}