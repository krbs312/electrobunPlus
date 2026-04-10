# electrobun-hhm

`electrobun-hhm` provides a lightweight message bridge between Electrobun Bun host code and the webview frontend. It is designed for simple RPC-style messaging in Electrobun applications.

---

## English

### Concept

The library exposes two classes:

- `HHMessage_bun` — for Bun host-side code.
- `HHMessage_view` — for the webview / UI side.

Both sides exchange messages shaped like:

```ts
{ type: string, param?: unknown }
```

### Installation

```bash
npm install electrobun-hhm
```

or

```bash
bun add electrobun-hhm
```

### HHMessage_bun

#### Import

```ts
import { HHMessage_bun } from "electrobun-hhm";
```

#### Description

`HHMessage_bun` accepts a list of commands and an Electrobun `webview` object. It listens for host messages and invokes the matching handler.

#### Example

```ts
const hhmMainWind = new HHMessage_bun(
  [
    {
      type: "rpc-test",
      payload: (param) => {
        console.log("Received RPC test from webview", param);
        hhmMainWind.sendToView({
          type: "rpc-test-response",
          param: { message: "ok" },
        });
      },
    },
  ],
  mainWindow.webview,
);
```

#### Methods

- `sendToView(message: unknown)` — sends a message to the webview via `webview.sendMessageToWebviewViaExecute(message)`.
- `handleHostMessage(message: unknown)` — executes the matching command handler when a message arrives from the webview.

### HHMessage_view

#### Import

```ts
import { HHMessage_view } from "electrobun-hhm";
```

#### Description

`HHMessage_view` sets up the Electrobun bridge in the browser and sends commands to the host.

#### Example

```ts
const hhmView = new HHMessage_view([
  {
    type: "rpc-test-response",
    payload: (param) => {
      console.log("Received RPC response from Bun", param);
    },
  },
]);

function sendRpc() {
  hhmView.sendHostCommand({ type: "rpc-test", param: { t1: "hello" } });
}
```

#### Methods and properties

- `sendHostCommand(command: unknown)` — sends a command object to the host via `window.__electrobunSendToHost`.
- `handleHostMessage(message: Record<string, unknown>)` — processes incoming host messages.
- `setupHostBridge()` — creates `window.__electrobun.receiveMessageFromBun` so the host can deliver messages to the webview.
- `statusMessage: string` — status text, for example `"Not connected"` or `"Host bridge unavailable."`.

### Message format

Messages should follow this shape:

```ts
{
  type: string;
  param?: unknown;
}
```

`type` identifies the command, and `param` carries optional payload data.

### Full example

#### Bun side

```ts
const hhmMainWind = new HHMessage_bun(
  [
    {
      type: "rpc-test",
      payload: (param) => {
        console.log("Received RPC test response from webview", param);
        hhmMainWind.sendToView({
          type: "rpc-test-response",
          param: { success: true },
        });
      },
    },
  ],
  mainWindow.webview,
);
```

#### Webview side

```ts
const hhmView = new HHMessage_view([
  {
    type: "rpc-test-response",
    payload: (param) => {
      console.log("Received RPC test response from Bun", param);
    },
]);

hhmView.sendHostCommand({ type: "rpc-test", param: { t1: "hello" } });
```

### Limitations

- The webview must support `window.__electrobunSendToHost`.
- The host must pass the correct `webview` object when creating `HHMessage_bun`.
- `commands` should use unique `type` values.

### Tips

- Use `type` as a unique command identifier.
- Keep message handling logic inside `payload` to simplify debugging.
- Check for `window.__electrobunSendToHost` before sending commands.

---

## Russian / Русский

### Концепция

В библиотеке реализованы два класса:

- `HHMessage_bun` — для использования из Bun-кода хоста.
- `HHMessage_view` — для использования внутри веб-просмотра / UI.

Обе стороны обмениваются объектами вида:

```ts
{ type: string, param?: unknown }
```

### Установка

```bash
npm install electrobun-hhm
```

или

```bash
bun add electrobun-hhm
```

### HHMessage_bun

#### Импорт

```ts
import { HHMessage_bun } from "electrobun-hhm";
```

#### Описание

`HHMessage_bun` принимает список команд и объект `webview` Electrobun. Он слушает события хоста и выполняет соответствующую функцию обработчика.

#### Пример

```ts
const hhmMainWind = new HHMessage_bun(
  [
    {
      type: "rpc-test",
      payload: (param) => {
        console.log("Received RPC test from webview", param);
        hhmMainWind.sendToView({
          type: "rpc-test-response",
          param: { message: "ok" },
        });
      },
    },
  ],
  mainWindow.webview,
);
```

#### Методы

- `sendToView(message: unknown)` — отправляет сообщение в веб-просмотр через `webview.sendMessageToWebviewViaExecute(message)`.
- `handleHostMessage(message: unknown)` — вызывает соответствующий обработчик из списка команд при получении сообщения от веб-просмотра.

### HHMessage_view

#### Импорт

```ts
import { HHMessage_view } from "electrobun-hhm";
```

#### Описание

`HHMessage_view` регистрирует мост Electrobun в браузерной части и отправляет команды обратно в хост.

#### Пример

```ts
const hhmView = new HHMessage_view([
  {
    type: "rpc-test-response",
    payload: (param) => {
      console.log("Received RPC response from Bun", param);
    },
  },
]);

function sendRpc() {
  hhmView.sendHostCommand({ type: "rpc-test", param: { t1: "hello" } });
}
```

#### Методы и свойства

- `sendHostCommand(command: unknown)` — отправляет объект команды в хост через `window.__electrobunSendToHost`.
- `handleHostMessage(message: Record<string, unknown>)` — обрабатывает входящие сообщения от хоста.
- `setupHostBridge()` — создает `window.__electrobun.receiveMessageFromBun`, чтобы хост мог передавать сообщения в веб-просмотр.
- `statusMessage: string` — строка состояния, например `"Not connected"` или `"Host bridge unavailable."`.

### Формат сообщений

Команды должны иметь структуру:

```ts
{
  type: string;
  param?: unknown;
}
```

`type` определяет команду, а `param` может передавать произвольные данные.

### Пример полного сценария

#### В Bun-коде

```ts
const hhmMainWind = new HHMessage_bun(
  [
    {
      type: "rpc-test",
      payload: (param) => {
        console.log("Received RPC test response from webview", param);
        hhmMainWind.sendToView({
          type: "rpc-test-response",
          param: { success: true },
        });
      },
    },
  ],
  mainWindow.webview,
);
```

#### В веб-просмотре

```ts
const hhmView = new HHMessage_view([
  {
    type: "rpc-test-response",
    payload: (param) => {
      console.log("Received RPC test response from Bun", param);
    },
]);

hhmView.sendHostCommand({ type: "rpc-test", param: { t1: "hello" } });
```

### Ограничения

- Веб-просмотр должен поддерживать `window.__electrobunSendToHost`.
- Хост должен передать правильный объект `webview` при создании `HHMessage_bun`.
- `commands` должны содержать уникальные `type`.

### Полезные советы

- Используйте `type` как уникальный идентификатор для каждой команды.
- Всю логику обработки сообщений держите в `payload`, чтобы отладка оставалась простой.
- Проверяйте наличие `window.__electrobunSendToHost` перед отправкой команд.
