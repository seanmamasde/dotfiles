<p align="center">
  <img alt="RapidAPI" src="https://github.com/RapidAPI/feedback/blob/main/assets/rapidapi-logo-128x128.png?raw=true">
</p>

# RapidAPI Client for Visual Studio Code

RapidAPI Client is a full-featured HTTP client that lets you test and describes the APIs you build or consume. Designed to work with your VS Code themes, RapidAPI Client makes composing requests, inspecting server responses, generating client code for API calls, and typesafe objects for application development simple and intuitive.

## Why RapidAPI Client for Visual Studio Code?

The RapidAPI Client for VS Code brings API testing to your favorite code editor, so you can test APIs no matter where you are in the development cycle. You can compose requests, inspect server responses, generate client code, and export API definitions from our interface without ever switching context to another application. Beyond being a fantastic stand-alone client in VS Code, this extension establishes a bidirectional link between VS Code and RapidAPI so that users with an existing RapidAPI.com or Paw user account can log in and sync existing projects automatically.

## Features

### Call your APIs from VS Code

Test your APIs with an easy-to-use and intuitive UI

![Call your APIs from VS Code](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-call-apis.png?raw=true)

#### TIP: Right-Click a link to generate API requests

Test your APIs with a new API Developer Experience

![Right-Click a link to generate API requests](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-right-click.png?raw=true)

#### TIP: Use the create from clipboard command

Got a URL in your clipboard or a cURL command? Then you can use the RapidAPI: Create new request from clipboard command to create the request for you automatically.

If you use a cURL command, the method, headers, and body will automatically be populated.

![Use the create from clipboard command](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-clipboard.gif?raw=true)

### Environment variables

Use parameters or variables during API testing

![Environment variables](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-environment-variables.png?raw=true)

### Sync team and personal projects to the cloud

Sync team and personal projects between your RapidAPI or Paw account online and the VS Code extension so your code is always up to date

### Code and type generation

Immediately generate the type or interface when you call your API

![Code and type generation](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-code.gif?raw=true)


### Terminal link handler

When building or using tools which return API URLs in the terminal? Great, we have you covered with our optional terminal link handling. Our terminal link handler lets you generate new requests from the links logged in the console. As this overrides the default VS Code behavior, you must enable it with the `rapidapi.terminalLink.enabled` setting.

![Create requests from the VS Code terminal output](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-link-handler.gif?raw=true)

> **Important**: This feature requires you to set the `rapidapi.terminalLink.enabled` setting to `true` in your VS Code user or global settings.

### VS Code Theme Support

Use your favorite VS Code theme with the RapidAPI extension

## Keyboard shortcuts

### Linux

- `Ctrl+Shift+R`: Open the RapidAPI Client panel

### macOS

- `Cmd+Shift+R`: Open the RapidAPI Client panel

### Windows

- `Ctrl+Shift+R`: Open the RapidAPI Client panel

## Settings

The extension uses the following settings:

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `rapidapi.codegen.default` | `string` | `typescript` | The default code generator language. The extension will first try to use the most used language from your project, then fall back to this value. |
| `rapidapi.requests.sendRequestBody` | `boolean` | `false` | Always send the request body. By default the request body will not be sent for GET, HEAD, CONNECT, OPTIONS, and TRACE requests. |
| `rapidapi.requests.timeout` | `number` | `15000` | The request timeout in milliseconds. |
| `rapidapi.terminalLink.enabled` | `boolean` | `null` | Enable or disable the terminal link handler of RapidAPI. |
| `rapidapi.logging.level` | `string` | `info` | The logging level for the extension, all logs are shown in the VS Code extension output view. |

## Tutorials

- [A deep dive into RapidAPI Client for VS Code](https://rapidapi.com/guides/a-deep-dive-into-rapidapi-client-for-vs-code)
- [How to use RapidAPI Client for VS Code to test APIs](https://rapidapi.com/guides/how-to-use-rapidapi-client-for-vscode-to-test-apis)
- [Generate API call snippets using the RapidAPI Client for VS Code extension](https://rapidapi.com/guides/generate-api-call-snippets-using-rapidapi-vscode-extension)
- [Replace API Clients with VS Code using the Rapid API Extension](https://rapidapi.com/guides/replace-api-clients-with-vscode-using-the-rapidapi-extension)
- [API development in TypeScript using RapidAPI VSCode Client](https://rapidapi.com/guides/api-development-in-typescript-using-rapidapi-vscode-client)
- [Auto generate interfaces from API Response using RapidAPI VSCode Client](https://rapidapi.com/guides/auto-generate-interfaces-from-api-response-using-rapidapi-vscode-client)

## Telemetry

RapidAPI collects usage data to improve our products and services. For information, you can read our [privacy policy](https://rapidapi.com/privacy/) to find out what we collect.

## Feedback, Support, and Community

Do you love the RapidAPI for VS Code extension, or are you running into an issue? Let us know. You can submit feedback via the “Give Feedback” link in the bottom left corner of the VS Code extension UI.

![Give Feedback](https://github.com/RapidAPI/feedback/blob/main/assets/vscode-rapidapi-client/rapidapi-client-feedback.png?raw=true)

You can also tweet us [@Rapid_API](https://twitter.com/rapid_api).
