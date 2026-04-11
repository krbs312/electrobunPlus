import { BrowserWindow } from "electrobun/bun";
import WindowSize from "@in/vader/window-size";



function getScreenSize(): { width: number; height: number} {
    const width = 1920
    const height = 1200
    const size = WindowSize.getSize();
    console.log(`${size.width} x ${size.height}`);
    return { width, height };
}



interface functions {
    name: string;
    func: (param: any) => void;
}

function moveto(to:number, web: BrowserWindow) {
    const interval = setInterval(() => {
        const pos = web.getPosition();
        if (pos.x <= to) {
            clearInterval(interval);
            return;
        }
        web.setPosition(pos.x - 10, pos.y);
    }, 0.1);
}

export class Notification{
    html?: string = undefined;
    script?: string = undefined;
    width? = 400;
    height? = 200;
    functions?: functions[] = undefined;
    screenSize = getScreenSize();
    notifWindow: BrowserWindow[] = [];
    constructor({html, script, width, height, functions}: { html?: string, script?: string, width?: number, height?: number, functions?: functions[] }) {
        if (html) this.html = html;
        if (script) this.script = script;
        if (width) this.width = width;
        if (height) this.height = height;
        if (functions) this.functions = functions;
        }

    Show(): BrowserWindow {
        let htmlContent = "";
        if (this.html) {
            htmlContent = this.html;}
        if (this.script) {
            htmlContent += `<script>${this.script}</script>`;
            htmlContent = htmlContent.replace(/{{\s*(\w+)\s*\(([^)]*)\)\s*}}/g, (match, funcName, params) => {
                return `window.__electrobunSendToHost({ type: "${funcName}", param: { ${params} } })`;
            })
        }
        const notifWindow = new BrowserWindow({
            title: "Notification",
            html: htmlContent,
            frame: {
                width: this.width || 400,
                height: this.height || 200,
                x: this.screenSize.width - this.width!,
                y: this.screenSize.height - (this.height || 200) * 2 - 40,
            },
            titleBarStyle: "hidden",
        });

        notifWindow.setAlwaysOnTop(true);
        notifWindow.setVisibleOnAllWorkspaces(true);

        const posx = this.screenSize.width - (this.width || 400)*2 - 40;

        notifWindow.webview.on("host-message" as any, (event: any) => {
            try {
                const message = event.data.detail;
                if (!message || typeof message !== "object") return;
                const payload = message as Record<string, unknown>;
                const type = payload.type as string | undefined;
                const param = payload.param as unknown;
                if (!type) return;
                const func = this.functions?.find(f => f.name === type);
                if (func) {
                    func.func(param);
                }
            } catch (error) {
                console.error("Error handling host-message:", error);
            }
        });

        this.notifWindow!.push(notifWindow);
        console.log("Notification shown!");
        console.log(this.notifWindow!.length);

        notifWindow.webview.on("dom-ready" as any, () => {
            console.log("domready")
            moveto(posx, notifWindow);
        })

        return notifWindow;
}

    close(){
        console.log(this.notifWindow.length);
        this.notifWindow![this.notifWindow!.length-1].close();
        this.notifWindow!.pop();
        
    }

}

export class defaultNotification extends Notification{
    clickfunction?: () => void;
    title: string;
    message: string;
    image?: string;
    style?: string;
    constructor({ title, message, image, style, clickfunction }: { title: string, message: string, image?: string, style?: string, clickfunction?: () => void }) {
        const defaultStyle = `
        body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        h3 {
            margin: 0;
            font-size: 18px;
        }
        p {
            margin: 5px 0 0;
        }
        img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
        }
        `;
        const html = `
        <style>
        ${style || defaultStyle}
        </style>
        <div>
            ${image ? `<img src="${image}" alt="Notification Image">` : ""}
            <div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        </div>

        <script>
            document.addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onNotificationClick", param: {} });
            });
        </script>
`;
        super({ html });
        this.title = title;
        this.message = message;
        if (clickfunction) {
            this.clickfunction = clickfunction;
            this.functions = [{ name: "onNotificationClick", func: clickfunction }];
        }
    }
}

export class yes_no_notification extends Notification{
    clickfunction_yes?: () => void;
    clickfunction_no?: () => void
    title: string;
    message: string;
    image?: string;
    style?: string;
    constructor({ title, message, image, style, clickfunction_yes, clickfunction_no }: { title: string, message: string, image?: string, style?: string, clickfunction_yes?: () => void, clickfunction_no?: () => void }) {
        const defaultStyle = `
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        h3 {
            margin: 0;
            font-size: 18px;
        }
        p {
            margin: 5px 0 15px;
        }
        button {
            padding: 10px 20px;
            margin: 0 10px;
            font-size: 14px;
            cursor: pointer;
        }
        #yes-btn {
            background-color: #4CAF50;
            color: white;            border: none;
            border-radius: 5px;
        }
        #no-btn {
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
        }
        `;
        const html = `
        <style>
        ${style || defaultStyle}
        </style>
        <div>
            ${image ? `<img src="${image}" alt="Notification Image">` : ""}
            <div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
            <div style="margin-top: 20px;">
                <button id="yes-btn">Yes</button>
                <button id="no-btn">No</button>
            </div>
        </div>

        <script>
            document.getElementById("yes-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onYesClick", param: {} });
            });
            document.getElementById("no-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onNoClick", param: {} });
            });
        </script>
`;
        super({ html });
        this.title = title;
        this.message = message;
        if (clickfunction_yes) {
            this.clickfunction_yes = clickfunction_yes;
            if (!this.functions) this.functions = [];
            this.functions.push({ name: "onYesClick", func: clickfunction_yes });
        }
        if (clickfunction_no) {
            this.clickfunction_no = clickfunction_no;
            if (!this.functions) this.functions = [];
            this.functions.push({ name: "onNoClick", func: clickfunction_no });
        }
    }
}








export class MessageBox{
    html?: string = undefined;
    script?: string = undefined
    width? = 400;
    height? = 200;
    functions?: functions[] = undefined;
    screenSize = getScreenSize();
    messagebox: {bw: BrowserWindow, id: number}[] = [];
    lastId = 0;
    constructor({html, script, width, height, functions}: { html?: string, script?: string, width?: number, height?: number, functions?: functions[] }) {
        if (html) this.html = html;
        if (script) this.script = script;
        if (width) this.width = width;
        if (height) this.height = height;
        if (functions) this.functions = functions;
         }
    
    Show(): BrowserWindow {
        let htmlContent = "";
        if (this.html) {
            htmlContent = this.html;}
        if (this.script) {
            htmlContent += `<script>${this.script}</script>`;
            htmlContent = htmlContent.replace(/{{\s*(\w+)\s*\(([^)]*)\)\s*}}/g, (match, funcName, params) => {
                return `window.__electrobunSendToHost({ type: "${funcName}", param: { ${params} } })`;
            })
            // replace {{close}} to window.__electrobunSendToHost({ type: "close", param: { id: 1 } })
            htmlContent = htmlContent.replace(/{{\s*close\s*}}/g, (match) => {
                return `window.__electrobunSendToHost({ type: "close", param: { id: ${this.lastId} } })`;
            });
        }
        const messagebox = new BrowserWindow({
            title: "MessageBox",
            html: htmlContent,
            frame: {
                width: this.width || 400,
                height: this.height || 200,
                x: this.screenSize.width / 2 - (this.width || 400),
                y: this.screenSize.height / 2 - (this.height || 200),
            },
            titleBarStyle: "hidden",
        });

        messagebox.setAlwaysOnTop(true);

        messagebox.webview.on("host-message" as any, (event: any) => {
            try {
                const message = event.data.detail;
                if (!message || typeof message !== "object") return;
                const payload = message as Record<string, unknown>;
                const type = payload.type as string | undefined;
                const param = payload.param as unknown;
                if (!type) return;
                const func = this.functions?.find(f => f.name === type);
                if (func) {
                    func.func(param);
                }
                if (type === "close" && typeof param === "object" && param !== null && "id" in param) {
                    const id = (param as Record<string, unknown>).id;
                    if (typeof id === "number") {
                        this.close(id);
                    }
                }
            } catch (error) {
                console.error("Error handling host-message:", error);
            }});

        this.messagebox.push({ bw: messagebox, id: this.lastId++ });
        return messagebox;
        
    }

    close(idx: number){
        //self close
        const messagebox = this.messagebox.find(mb => mb.id === idx);
        if (messagebox) {
            messagebox.bw.close();
            this.messagebox = this.messagebox.filter(mb => mb.id !== idx);
        }
    }

}



export class okMessageBox extends MessageBox{
    clickfunction_ok?: () => void
    title: string;
    message: string
    style?: string;
    constructor({ title, message, style, clickfunction_ok }: { title: string, message: string, style?: string, clickfunction_ok?: () => void }) {
        const defaultStyle = `
                html, body {
            margin: 0;
            height: 100%;
        }
        body {
            min-height: 100%;
        }
        .container {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        h3 {
            margin: 0;
            font-size: 18px;
        }
        p {
            margin: 5px 0 15px;
        }
        button {
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 5px;
        }
        .titlebar {
            width: 100%;
            height: 30px;
            background-color: #f0f0f0;
            padding: 10px;
            box-sizing: border-box;
            text-align: left;
        }
        .message {
            margin-top: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
        }
        `
        const html = `
        <style>
            ${style || defaultStyle}
        </style>
            <div class="container">
            <div class="titlebar electrobun-webkit-app-region-drag">
                ${title}
            </div>
            <div class="message">
            ${message}
            <button id="ok-btn">OK</button>
            </div>
            </div>
`;
        const script = `
        document.getElementById("ok-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onOkClick", param: {} });
                {{close}}
            });
        `
        super({ html, script });
        this.title = title;
        this.message = message;
        if (clickfunction_ok) {
            this.clickfunction_ok = clickfunction_ok;
            this.functions = [{ name: "onOkClick", func: clickfunction_ok }];
        }
    }
}

export class yesNoMessageBox extends MessageBox{
    clickfunction_yes?: () => void
    clickfunction_no?: () => void
    title: string;
    message: string;
    style?: string;
    constructor({ title, message, style, clickfunction_yes, clickfunction_no }: { title: string, message: string, style?: string, clickfunction_yes?: () => void, clickfunction_no?: () => void }) {
        const defaultStyle = `
            html, body {
            margin: 0;
            height: 100%;
        }
        body {
            min-height: 100%;
        }
        .container {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        h3 {
            margin: 0
            font-size: 18px;
        }
        p {
            margin: 5px 0 15px;
        }
        button {
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
        }
        #yes-btn {
            background-color: #4CAF50;
            color: white;
        }
        #no-btn {
            background-color: #f44336;
            color: white;
        }
        .titlebar {
            width: 100%;
            height: 30px;
            background-color: #f0f0f0;
            padding: 10px;
            box-sizing: border-box;
            text-align: left;
        }
        .message {
            margin-top: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
        }
        .button-group {
            margin-top: 20px;
        }
        `
        const html = `
        
        <style>
            ${style || defaultStyle}
        </style>

        </style>
            <div class="container">
            <div class="titlebar electrobun-webkit-app-region-drag">
                ${title}
            </div>
            <div class="message">
            ${message}
            <div class="button-group">
                <button id="yes-btn">Yes</button>
                <button id="no-btn">No</button>
            </div>
            </div>
            </div>
`;
        const script = `
        document.getElementById("yes-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onYesClick", param: {} });
                {{close}}
            });
            document.getElementById("no-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onNoClick", param: {} });
                {{close}}
            });`
        super({ html, script });
        this.title = title;
        this.message = message;
        if (clickfunction_yes) {
            this.clickfunction_yes = clickfunction_yes;
            if (!this.functions) this.functions = [];
            this.functions.push({ name: "onYesClick", func: clickfunction_yes });
        }
        if (clickfunction_no) {            this.clickfunction_no = clickfunction_no;
            if (!this.functions) this.functions = [];
            this.functions.push({ name: "onNoClick", func: clickfunction_no });
        }
    }
}

export class errorMessageBox extends MessageBox{
    clickfunction_ok?: () => void
    title: string
    message: string
    style?: string
    constructor({ title, message, style, clickfunction_ok }: { title: string, message: string, style?: string, clickfunction_ok?: () => void }) {
        const defaultStyle = `
        html, body {
            margin: 0;
            height: 100%;
        }
        body {
            min-height: 100%;
        }
        .container {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        h3 {
            margin: 0
            font-size: 18px;
            color: #f44336;
        }
        p {
            margin: 5px 0 15px;
        }
        button {
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
        }
        .titlebar {
            width: 100%;
            height: 30px;
            background-color: #f0f0f0;
            padding: 10px;
            box-sizing: border-box;
            text-align: left;
        }
        .message {
            margin-top: 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
        }
        `
        const html = `
        <style>
            ${style || defaultStyle}
        </style>
            <div class="container">
            <div class="titlebar electrobun-webkit-app-region-drag">
                ${title}
            </div>
            <div class="message">
            ${message}
            <button id="ok-btn">OK</button>
            </div>
            </div>
`;
        const script = `
        document.getElementById("ok-btn").addEventListener("click", () => {
                window.__electrobunSendToHost({ type: "onOkClick", param: {} });
                {{close}}
            });`
        super({ html, script });
        this.title = title;
        this.message = message;
        if (clickfunction_ok) {
            this.clickfunction_ok = clickfunction_ok;
            this.functions = [{ name: "onOkClick", func: clickfunction_ok }];
        }
    }
}

