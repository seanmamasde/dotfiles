# IntelliCode Completions

🛠 **Visual Studio IntelliCode Completions** is an **experimental extension** which predicts up to a whole line of code based on your current context. Predictions appear as grey-text to the right of your cursor. This extension supports Python, with additional experimental support for JavaScript and TypeScript.

This extension may contain unstable, experimental code. The IntelliCode team is focused on iterating rapidly and new functionality will be added.

### How to use

![GIF demonstrating grey-text completions. Users can hit tab to accept inline completion offered as grey text.](https://github.com/MicrosoftDocs/intellicode/raw/HEAD/images/wlc.gif "Intellicode Completions in product")

Completions will appear after your cursor as you type, with a faded color. At any time, you can accept the suggestion by pressing the tab key. Additionally, you can dismiss any shown suggestion by pressing the ESC key.

![GIF demonstrating different grey-text completions shown based on IntelliSense selection. The first tab accepts the IntelliSense selection shown in grey-text, the second tab accepts the rest of the grey-text](https://github.com/MicrosoftDocs/intellicode/raw/HEAD/images/intellisenseSelection.gif)

Users' IntelliSense selection helps steer the model's prediction. When the IntelliSense window is open, pressing 'tab' once accepts the token selected in the InteliSense window, while a second 'tab' accepts the rest of the inline completion. 

To enable experimental support for JavaScript and TypeScript, search for intellicodeCompletions.language in the Settings menu.

### Let us know what you think!

IntelliCode has benefitted greatly from all the rich feedback we've received from you - thank you! We hope you'll help us continue to improve by giving the newly enhanced completions a try and letting us know what you think.

Please report any issues you see on our GitHub repo if you have them: https://github.com/MicrosoftDocs/intellicode/issues.

## Privacy and Security

- Your code does not leave your machine and is not used to train our model
- This extension collects usage metadata and sends it to Microsoft to help improve our products and services. This extension [respects the `telemetry.enableTelemetry` setting](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).
- For additional information, see [Microsoft Privacy Statement](https://privacy.microsoft.com/en-us/privacystatement)
