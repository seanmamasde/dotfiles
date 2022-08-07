# Azure Account and Sign In



The Azure Account extension provides a single Azure sign in and subscription filtering experience for all other Azure extensions. It makes Azure's Cloud Shell service available in VS Code's integrated terminal.

## Signing In/Out

There are multiple commands accessible via the [command palette](https://aka.ms/AAephuz) that may be used to sign into Azure.

![Sign in commands in the command palette](https://github.com/microsoft/vscode-azure-account/raw/main/resources/readme/signInCommands.png)

Sign out of Azure using the `Azure: Sign Out` command.

![The sign out command in the command palette](https://github.com/microsoft/vscode-azure-account/raw/main/resources/readme/signOutCommand.png)

## Azure Cloud Shell

Azure Cloud Shell instances can be started via the terminal view in VS Code. To begin, click the
dropdown arrow in the terminal view and select from either `Azure Cloud Shell (Bash)` or
`Azure Cloud Shell (PowerShell)`.

![VS Code terminal view with context menu](https://github.com/microsoft/vscode-azure-account/raw/main/resources/readme/terminalViewWithMenu.png)

If this is your first time using the Cloud Shell, the following notification will appear prompting
you to set it up.

!["Must setup cloud shell" notification](https://github.com/microsoft/vscode-azure-account/raw/main/resources/readme/mustSetupCloudShell.png)

The Cloud Shell will load in the terminal view once you've finished configuring it.

![The Azure Cloud Shell in the terminal window](https://github.com/microsoft/vscode-azure-account/raw/main/resources/readme/cloudShell.png)

You may also upload to the Cloud Shell using the `Azure: Upload to Cloud Shell` command.

## Commands

| Command |  |
| --- | --- |
| `Azure: Sign In`  | Sign in to your Azure subscription.
| `Azure: Sign In with Device Code` | Sign in to your Azure subscription with a device code. Use this in setups where the Sign In command does not work.
| `Azure: Sign In to Azure Cloud` | Sign in to your Azure subscription in one of the sovereign clouds.
| `Azure: Sign Out` | Sign out of your Azure subscription.
| `Azure: Select Subscriptions` | Pick the set of subscriptions you want to work with. Extensions should respect this list and only show resources within the filtered subscriptions.
| `Azure: Create an Account`  | If you don't have an Azure Account, you can [sign up](https://azure.microsoft.com/en-us/free/?utm_source=campaign&utm_campaign=vscode-azure-account&mktingSource=vscode-azure-account) for one today and receive $200 in free credits.
| `Azure: Upload to Cloud Shell`<sup>1</sup> | Upload a file to your Cloud Shell storage account

<sup>1</sup> On Windows: Requires Node.js 6 or later to be installed (https://nodejs.org).

## Settings

| Name | Description | Default |
| --- | --- | --- |
| `azure.resourceFilter` | The resource filter, each element is a tenant id and a subscription id separated by a slash.	 |
| `azure.showSignedInEmail` | Whether to show the email address (e.g., in the status bar) of the signed in account.	 | true
| `azure.tenant` | A specific tenant to sign in to. The default is to sign in to the common tenant and use all known tenants. |
| `azure.cloud` | The current Azure Cloud to connect to. | Azure
| `azure.ppe` | Development setting: The PPE environment for testing. |



## Telemetry

VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409) to learn more. If you don’t wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://go.microsoft.com/fwlink/?linkid=870136).

## License
[MIT](https://github.com/microsoft/vscode-azure-account/blob/main/LICENSE.md)

The Visual Studio Code logo is under the [license](https://code.visualstudio.com/license) of the Visual Studio Code product.