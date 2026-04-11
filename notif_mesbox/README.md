# electrobun-better-notif-and-mesbox

`electrobun-better-notif-and-mesbox` provides elegant notification and message box components for Electrobun applications. It offers a simple API for creating desktop notifications and modal dialogs with full customization support, RPC-style communication between host and webview, and smooth animations.

---

## English

### Concept

The library exposes two main categories of UI components:

- **Notification classes** — for creating desktop notifications that appear in the corner of the screen
  - `Notification` — base class for custom notifications
  - `defaultNotification` — simple notification with title, message and optional image
  - `yes_no_notification` — notification with Yes/No action buttons

- **MessageBox classes** — for creating modal dialog windows centered on screen
  - `MessageBox` — base class for custom dialogs
  - `okMessageBox` — simple OK dialog with title bar
  - `yesNoMessageBox` — Yes/No confirmation dialog
  - `errorMessageBox` — Error-styled dialog with red theme

All components support:
- Custom HTML/CSS styling
- Two-way RPC communication between Bun host and webview
- Template syntax for host function calls: `{{functionName(param:"value")}}`
- Automatic window management and cleanup

### Installation

```bash
npm install electrobun-better-notif-and-mesbox
```

or

```bash
bun add electrobun-better-notif-and-mesbox
```

### Notifications

#### Notification (Base Class)

The base class for creating custom notifications with full control over content and behavior.

##### Constructor Options

```ts
interface NotificationOptions {
  html?: string;        // Custom HTML content
  script?: string;      // JavaScript code with template syntax support
  width?: number;       // Window width (default: 400)
  height?: number;      // Window height (default: 200)
  functions?: Array<{   // Host-side function handlers
    name: string;
    func: (param: any) => void;
  }>;
}
```

##### Template Syntax in Scripts

Use `{{functionName(param:"value")}}` syntax to call host functions from webview:

```ts
const notif = new Notification({
  html: `<button id="btn">Click me</button>`,
  script: `
    document.getElementById("btn").addEventListener("click", () => {
      {{onClick(data: "hello", id: 123)}}
    });
  `,
  functions: [
    {
      name: "onClick",
      func: (param) => {
        console.log(param.data, param.id); // "hello", 123
        notif.close();
      }
    }
  ]
});
```

##### Methods

- `Show(): BrowserWindow` — Creates and shows the notification window with slide-in animation
- `close(): void` — Closes the most recent notification instance

##### Example

```ts
const Notif = new Notification({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
      <h2>Do you like this notification?</h2>
      <div style="margin-top: 20px;">
        <button id="yes-btn" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">Yes</button>
        <button id="no-btn" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 5px;">No</button>
      </div>
    </div>
  `,
  script: `
    document.getElementById("yes-btn").addEventListener("click", () => {
      console.log("User clicked YES");
      {{onYesClick(s1:"1", s2:"2")}}
    });
    document.getElementById("no-btn").addEventListener("click", () => {
      window.__electrobunSendToHost({ type: "onNoClick", param: "no" });
    });
  `,
  functions: [
    {
      name: "onYesClick",
      func: (param) => {
        console.log("Param received:", param.s1, param.s2);
        Notif.close();
      }
    },
    {
      name: "onNoClick",
      func: () => {
        console.log("User clicked NO");
        Notif.close();
      }
    }
  ]
});

Notif.Show();
```

#### defaultNotification

Simple notification with title, message, and optional image. Supports click-to-dismiss.

##### Constructor Options

```ts
interface DefaultNotificationOptions {
  title: string;           // Notification title
  message: string;         // Notification message
  image?: string;          // Optional image URL
  style?: string;          // Optional custom CSS
  clickfunction?: () => void;  // Click handler
}
```

##### Example

```ts
const defaultNotif = new defaultNotification({
  title: "Hello!",
  message: "This is a default notification with an image.",
  clickfunction: () => {
    console.log("Default notification clicked!");
    defaultNotif.close();
  }
});

defaultNotif.Show();
```

#### yes_no_notification

Notification with Yes and No buttons for user confirmation.

##### Constructor Options

```ts
interface YesNoNotificationOptions {
  title: string;
  message: string;
  image?: string;
  style?: string;          // Custom CSS (optional)
  clickfunction_yes?: () => void;
  clickfunction_no?: () => void;
}
```

##### Example

```ts
const yesNoNotif = new yes_no_notification({
  title: "Question",
  message: "Do you want to proceed?",
  clickfunction_yes: () => {
    console.log("User clicked YES");
    yesNoNotif.close();
  },
  clickfunction_no: () => {
    console.log("User clicked NO");
    yesNoNotif.close();
  },
  style: `
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f0f0;
    }
    #yes-btn {
      background-color: #604caf;
    }
    #no-btn {
      background-color: #44063a;
    }
  `
});

yesNoNotif.Show();
```

### MessageBoxes

#### MessageBox (Base Class)

Base class for creating modal dialogs with title bars and custom content.

##### Constructor Options

Same as `Notification`, but with additional template: `{{close}}` — automatically closes the message box.

##### Special Template Syntax

- `{{close}}` — Triggers automatic closing of the message box after the function call
- `{{functionName(params)}}` — Calls host function (same as Notification)

##### Methods

- `Show(): BrowserWindow` — Creates and shows the modal dialog
- `close(id: number): void` — Closes specific message box by ID

##### Example

```ts
const msgBox = new MessageBox({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
      <h2>This is a message box</h2>
      <p>You can put any content here.</p>
      <button id="close-btn" style="padding: 10px 20px; background-color: #007BFF; color: white; border: none; border-radius: 5px;">Close</button>
    </div>
  `,
  script: `
    document.getElementById("close-btn").addEventListener("click", () => {
      console.log("Message box closed");
      {{closeMessageBox()}}
      {{close}}
    });
  `,
  functions: [
    {
      name: "closeMessageBox",
      func: () => {
        console.log("Closing message box from host function");
      }
    }
  ]
});

msgBox.Show();
```

#### okMessageBox

Standard OK dialog with title bar and OK button.

##### Constructor Options

```ts
interface OkMessageBoxOptions {
  title: string;           // Window title
  message: string;         // Message content (HTML supported)
  style?: string;          // Optional custom CSS
  clickfunction_ok?: () => void;
}
```

##### Example

```ts
const okMsgBox = new okMessageBox({
  title: "OK Message Box",
  message: "This is an OK message box. Click OK to close.",
  clickfunction_ok: () => {
    console.log("OK button clicked");
  }
});

okMsgBox.Show();
```

#### yesNoMessageBox

Confirmation dialog with Yes and No buttons.

##### Constructor Options

```ts
interface YesNoMessageBoxOptions {
  title: string;
  message: string;
  style?: string;
  clickfunction_yes?: () => void;
  clickfunction_no?: () => void;
}
```

##### Example

```ts
const yesNoMsgBox = new yesNoMessageBox({
  title: "Yes/No Message Box",
  message: "This is a Yes/No message box. Click a button to respond.",
  clickfunction_yes: () => {
    console.log("YES button clicked");
  },
  clickfunction_no: () => {
    console.log("NO button clicked");
  }
});

yesNoMsgBox.Show();
```

#### errorMessageBox

Error-styled dialog with red theme for displaying errors.

##### Constructor Options

```ts
interface ErrorMessageBoxOptions {
  title: string;
  message: string;
  style?: string;
  clickfunction_ok?: () => void;
}
```

##### Example

```ts
const errorMsgBox = new errorMessageBox({
  title: "Error Message Box",
  message: "This is an error message box. Click OK to close.",
  clickfunction_ok: () => {
    console.log("OK button clicked in error dialog");
  }
});

errorMsgBox.Show();
```

### Styling

#### Notification Positioning

Notifications automatically appear in the bottom-right corner of the screen and stack automatically. The library detects screen size and positions windows at:
- X: `screenWidth - notificationWidth`
- Y: `screenHeight - (notificationHeight * 2) - 40`

#### MessageBox Positioning

Message boxes appear centered on screen:
- X: `screenWidth / 2 - windowWidth`
- Y: `screenHeight / 2 - windowHeight`

#### CSS Classes

For MessageBox title bars, use the class `electrobun-webkit-app-region-drag` to enable window dragging:

```html
<div class="titlebar electrobun-webkit-app-region-drag">
  Window Title
</div>
```

### Communication Protocol

All components use Electrobun's `window.__electrobunSendToHost` for webview-to-host communication and `webview.sendMessageToWebviewViaExecute` for host-to-webview communication.

Message format:
```ts
{
  type: string;      // Function name to invoke
  param?: unknown;   // Optional parameters
}
```

---

## Russian / Русский

### Концепция

Библиотека предоставляет два типа UI-компонентов:

- **Классы уведомлений (Notification)** — для создания всплывающих уведомлений в углу экрана
  - `Notification` — базовый класс для кастомных уведомлений
  - `defaultNotification` — простое уведомление с заголовком и текстом
  - `yes_no_notification` — уведомление с кнопками Да/Нет

- **Классы диалогов (MessageBox)** — для создания модальных окон по центру экрана
  - `MessageBox` — базовый класс для кастомных диалогов
  - `okMessageBox` — диалог с кнопкой OK
  - `yesNoMessageBox` — диалог подтверждения Да/Нет
  - `errorMessageBox` — диалог ошибок с красной темой

### Установка

```bash
npm install electrobun-better-notif-and-mesbox
```

или

```bash
bun add electrobun-better-notif-and-mesbox
```

### Уведомления (Notifications)

#### Notification (Базовый класс)

Создание кастомных уведомлений с полным контролем содержимого.

##### Опции конструктора

```ts
interface NotificationOptions {
  html?: string;        // HTML содержимое
  script?: string;      // JavaScript с поддержкой шаблонного синтаксиса
  width?: number;       // Ширина окна (по умолчанию: 400)
  height?: number;      // Высота окна (по умолчанию: 200)
  functions?: Array<{   // Обработчики на стороне хоста
    name: string;
    func: (param: any) => void;
  }>;
}
```

##### Шаблонный синтаксис

Используйте `{{functionName(param:"value")}}` для вызова функций хоста:

```ts
const notif = new Notification({
  html: `<button id="btn">Нажми меня</button>`,
  script: `
    document.getElementById("btn").addEventListener("click", () => {
      {{onClick(data: "привет", id: 123)}}
    });
  `,
  functions: [
    {
      name: "onClick",
      func: (param) => {
        console.log(param.data, param.id);
        notif.close();
      }
    }
  ]
});
```

#### defaultNotification

Простое уведомление с заголовком, текстом и опциональным изображением.

```ts
const defaultNotif = new defaultNotification({
  title: "Привет!",
  message: "Это тестовое уведомление.",
  clickfunction: () => {
    console.log("Уведомление закрыто");
    defaultNotif.close();
  }
});
```

#### yes_no_notification

Уведомление с кнопками Да и Нет.

```ts
const yesNoNotif = new yes_no_notification({
  title: "Вопрос",
  message: "Вы хотите продолжить?",
  clickfunction_yes: () => {
    console.log("Нажато ДА");
    yesNoNotif.close();
  },
  clickfunction_no: () => {
    console.log("Нажато НЕТ");
    yesNoNotif.close();
  }
});
```

### Диалоговые окна (MessageBoxes)

#### MessageBox (Базовый класс)

Базовый класс для модальных окон с заголовком.

##### Специальный синтаксис

- `{{close}}` — автоматически закрывает диалог после вызова функции
- `{{functionName(params)}}` — вызывает функцию хоста

#### okMessageBox

Диалог с кнопкой OK.

```ts
const okMsgBox = new okMessageBox({
  title: "Информация",
  message: "Операция выполнена успешно.",
  clickfunction_ok: () => {
    console.log("Нажато OK");
  }
});
```

#### yesNoMessageBox

Диалог подтверждения с кнопками Да/Нет.

```ts
const yesNoMsgBox = new yesNoMessageBox({
  title: "Подтверждение",
  message: "Вы уверены?",
  clickfunction_yes: () => {
    console.log("Нажато ДА");
  },
  clickfunction_no: () => {
    console.log("Нажато НЕТ");
  }
});
```

#### errorMessageBox

Диалог ошибок с красным оформлением.

```ts
const errorMsgBox = new errorMessageBox({
  title: "Ошибка",
  message: "Произошла ошибка при выполнении операции.",
  clickfunction_ok: () => {
    console.log("Ошибка подтверждена");
  }
});
```

### Стилизация

#### Позиционирование

- **Уведомления** — правый нижний угол экрана с анимацией появления
- **Диалоги** — центр экрана

#### CSS-классы

Для перетаскиваемой области заголовка используйте класс `electrobun-webkit-app-region-drag`:

```html
<div class="titlebar electrobun-webkit-app-region-drag">
  Заголовок окна
</div>
```

### Примеры использования

#### Полный пример уведомления

```ts
const Notif = new Notification({
  html: `
    <div style="padding: 20px; font-family: Arial;">
      <h3>Кастомное уведомление</h3>
      <button id="action">Действие</button>
    </div>
  `,
  script: `
    document.getElementById("action").addEventListener("click", () => {
      {{handleAction(value: "test")}}
    });
  `,
  functions: [
    {
      name: "handleAction",
      func: (param) => {
        console.log("Действие:", param.value);
        Notif.close();
      }
    }
  ]
});

Notif.Show();
```

#### Полный пример MessageBox

```ts
const msgBox = new MessageBox({
  html: `
    <div style="text-align: center; padding: 20px;">
      <h2>Подтвердите действие</h2>
      <button id="confirm">Подтвердить</button>
    </div>
  `,
  script: `
    document.getElementById("confirm").addEventListener("click", () => {
      {{onConfirm()}}
      {{close}}
    });
  `,
  functions: [
    {
      name: "onConfirm",
      func: () => {
        console.log("Подтверждено!");
      }
    }
  ]
});

msgBox.Show();
```

### Ограничения

- Требуется Electrobun с поддержкой `window.__electrobunSendToHost`
- Уведомления автоматически не закрываются по таймауту (требуется явный вызов `close()`)
- Для MessageBox необходимо использовать `{{close}}` или вызывать `close(id)` для закрытия конкретного окна

### Полезные советы

- Используйте `{{close}}` в MessageBox для автоматического закрытия после обработки
- Для уведомлений вызывайте `close()` в обработчиках функций
- Имена функций в `functions` должны совпадать с именами в шаблонном синтаксисе
- Используйте уникальные имена для разных экземпляров, чтобы избежать конфликтов
