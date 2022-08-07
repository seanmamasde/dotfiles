# Change Log

<!-- ![new](https://img.shields.io/badge/-NEW-gray.svg?colorB=5792EC) -->
<!-- ![improvement](https://img.shields.io/badge/-IMPROVEMENT-gray.svg?color=487E83) -->
<!-- ![breaking](https://img.shields.io/badge/-BREAKING-gray.svg?color=C2475D) -->
<!-- ![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700) -->
<!-- ![docs](https://img.shields.io/badge/-DOCS-gray.svg?color=978CD4) -->

## 1.3.0 [2022-08-04]

![improvement](https://img.shields.io/badge/-IMPROVEMENT-gray.svg?color=487E83)

- [#11](https://github.com/RapidAPI/feedback/issues/11): Get GraphQL schema from private APIs

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- [#26](https://github.com/RapidAPI/feedback/issues/26): Fix basic authentication base64 encoding

## 1.2.0 [2022-08-03]

![improvement](https://img.shields.io/badge/-IMPROVEMENT-gray.svg?color=487E83)

- DEVTOOLS-3153: Implementation of the bearer auth for VS Code
- DEVTOOLS-3165: multiform data parsing
- [#10](https://github.com/RapidAPI/feedback/issues/10): Set the `extensionKind` to `ui` in order to install the extension locally
- [#11](https://github.com/RapidAPI/feedback/issues/11): Ability to reload the GraphQL schema
- [#18](https://github.com/RapidAPI/feedback/issues/18): Dart language support added for codegen

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- DEVTOOLS-3156: JSON conversion fix in TS
- DEVTOOLS-3156: Fix issue with JSON parsing in TypeScript codegen
- [#27](https://github.com/RapidAPI/feedback/issues/27): Fix for themes with incorrect HEX color values

## 1.1.0 [2022-08-01]

![improvement](https://img.shields.io/badge/-IMPROVEMENT-gray.svg?color=487E83)

- [#12](https://github.com/RapidAPI/feedback/issues/12): Add new action for renaming `requests` and `groups` in the Request List

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- DEVTOOLS-3147: Fix `UTF-16LE` JSON encoded string issue
- [#14](https://github.com/RapidAPI/feedback/issues/14): Update minimal VS Code version to `1.66.2`

## 1.0.3 [2022-07-29]

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- [#1](https://github.com/RapidAPI/feedback/issues/1): Fix issue with VS Code theme color conversion to Monaco editor

## 1.0.2 [2022-07-29]

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- Added theme information to output

## 1.0.1 [2022-07-28]

![fix](https://img.shields.io/badge/-FIX-gray.svg?color=E28700)

- Improved logging of errors to output

## 1.0.0 [2022-07-27]

![new](https://img.shields.io/badge/-NEW-gray.svg?colorB=5792EC)

- Initial release

<br />
<br />

## Alpha changelog

### 2022-07-26

- Walkthroughs added
- Changes to the GET request with body dialog

### 2022-07-25

- Welcome command added
- Allow the type export to be saved
- Change Paw Beta reference to RapidAPI Beta
- Removing beta/demo settings
- Improving the readme
- DEVTOOLS-3116: Button tag colors in dynamic fields menu

### 2022-07-21

- Remove build reference

### 2022-07-20

- DEVTOOLS-3065: Create request from cURL command

### 2022-07-18

- DEVTOOLS-3072: Fix for showing the body warning on new requests
- DEVTOOLS-3073: Fix environment selection in requests

### 2022-07-14

- Check if logged in on project creation to show the local or remote project option
- DEVTOOLS-2879: Add alert when using a body on a GET request

### 2022-07-12

- Project selection fix after logging in
- Fix selection highlight color in some themes

### 2022-07-11

- DEVTOOLS-2830: Fix for sign-in

### 2022-07-08

- Fix for `0` in error status message
- Style fix on GraphQL editor input
- DEVTOOLS-2937: Fix api calls without a protocol
- DEVTOOLS-2884: Rename fix for the environments view
- DEVTOOLS-2850: Update the project icon tooltip to `Create or open a project`
- DEVTOOLS-2851: Improvements for project selector

### 2022-07-05

- Response time added to notification

### 2022-07-04

- DEVTOOLS-2526: Show all response tabs when no content-type is passed

### 2022-06-30

- DEVTOOLS-2502: Fix node language code highlighting

### 2022-06-29

- Fix for invalid default project state
- DEVTOOLS-2479: Removed `creation` category from project selector
- DEVTOOLS-2480: Remove unnecessary update of the environment panels when open
- DEVTOOLS-2481: Fix background of radio button
- DEVTOOLS-2484: Debounce the sync call + word wrapping of the Monaco editor

### 2022-06-22

- Foreground color change on request items hover
- DEVTOOLS-2434: Updated design for cancelling a request
- DEVTOOLS-2435: Show a sending message on the response zone when sending a request
- DEVTOOLS-399: Fix for GraphQL background

### 2022-06-21

- DEVTOOLS-2418: Fix auth dialog switcher
- DEVTOOLS-2434: Cancel and timeout requests

### 2022-06-20

- Fix project creation on RapidAPI
- DEVTOOLS-397: Text and dynamic field selection background fix
- DEVTOOLS-2389: Update ui-lib + fix group menu
- DEVTOOLS-2421: Fix background of dynamic value dialogs

### 2022-06-17

- Add an option to enable the terminal link handler
- DEVTOOLS-2400: Dynamic value background and foreground styling

### 2022-06-16

- Color updates for panel view
- Color updates for request list items
- Color updates for selected tabs
- Handle terminal links by the extension
- Fix for post messages that were duplicated in the panel

### 2022-06-15

- Better input/background contrast ratio for dark themes on the request view

### 2022-06-14

DEVTOOLS-394 - Checkbox color and background fixes
DEVTOOLS-392 - Changes to the background and elements of the request view

### 2022-06-10

- Added `x-rapidapi-key` to the header autocompletion

### 2022-06-09

- DEVTOOLS-2062 - Dismiss panel selection

### 2022-06-08

- GraphQL syntax highlighting

### 2022-06-07

- DEVTOOLS-1968: Better VS Code theme conversion to Monaco

### 2022-06-03

- Allow changing the request title on double-click

### 2022-06-01

- DEVTOOLS-1928 - Fix for response info tab with cached data

### 2022-05-31

- Markdown controls for the description field
- DEVTOOLS-1906: Updated the UI lib to fix checkbox icon color issue

### 2022-05-30

- Implementation of the team project selector

### 2022-05-25

- Small fix to show the sync icon

### 2022-05-24

- Show project title in a panel section
- Allow to switch local project between workspace and global state

### 2022-05-23

- Fix for project selector where multiple instances were initiated
- Small style fixes for the VS Code to Monaco editor theme conversion
- Clear HTTP Exchange cache command
- DEVTOOLS-1830: Fix for rendering request with large responses
- DEVTOOLS-1831: Fix for VS Code theme in Monaco editor on GQL tab

### 2022-05-20

- Project selection
- Working locally or in the cloud
- Project creation
- Fix for request creation from URL or clipboard

### 2022-05-19

- Automatically select request when created in a group
- Automatically create a request on group creation

### 2022-05-17

- Updates for the sync logic
- Description update of the `rapidapi.requests.sendRequestBody` setting

### 2022-05-13

- Sync the HTTP Exchanges between the tabs
- Layout improvements to keep environments at the top and make only the request list scrollable
- Request tab spinner on load
- Automatically setting the current request if it was previously already requested
- Added the `rapidapi.requests.sendRequestBody` setting to specify if you allow the PAW to send the request body on GET, HEAD, OPTIONS, and DELETE requests
- SVG Support added for the image requests
- DEVTOOLS-1701: Revert the method type switch to POST on opening the body tab

### 2022-05-11

- Start project sync after login
- Fix an issue with project token retrieval
- Syncing status bar message + icon
- Fixing headers and query params

### 2022-05-10

- Fix for authentication provider after re-installing VS Code
- Better sync logic
- Pop-over color fix
- React router fixes for the panel
- Feedback message + layout changes

### 2022-05-09

- Merged with latest DEV branch version

### 2022-05-04

- DEVTOOLS-1552: Update for request list item styling
- Hide unnecessary response tabs based on the returned response type
- Set the JSON text view as default for JSON response
- Style fix for long request titles

### 2022-05-03

- DEVTOOLS-1506: Fix for local dev certs

### 2022-04-28

- Merge to the latest version of the client codebase
- Fixes for copy/paste in inputs
- Style fixes for groups
- Conversion fix for Atom One Dark to Monaco theme

### 2022-04-27

- Fix to open request on creation

### 2022-04-22

- Update color of the hover tab border

### 2022-04-21

- Various style fixes

### 2022-04-19

- Added feedback link
- Fix in regex for URLs

### 2022-04-14

- Fix environment sync between requests
- Store the environment information to the VS Code state in order to persist the latest used environment settings

### 2022-04-13

- DEVTOOLS-982: Fix for grouped request view that closes on update
- DEVTOOLS-983: Fix for keeping moving requests in and out of a group
- DEVTOOLS-984: Fix for keeping the order in the panel

### 2022-04-11

- Sample walkthrough added
- Style fix: Adding bottom margin for Shiki code editor
- Style fix: Border color of Shiki code editor

### 2022-04-04

- Update the description markdown preview to use the full zone height
- Fix for always showing the `send` button

### 2022-03-30

- URL parsing for snippet generation -> Fixes issue on failed validation
- Setting default client for snippet target
- Switch to `POST` method when body tab gets opened

### 2022-03-29

- Height fix for JSON Text control
- Styling of the environment management view
- Selecting the first environment in the environment management view
- When creating a new environment/domain group, open the environments management view with the new group selected
- Perform data sync to the environment management view when it is open
- Better support for light+ and dark+ theme

### 2022-03-28

- DEVTOOLS-578: Fix environment selector for the request
- DEVTOOLS-578: Allow updates to the environments and the related key/values
- DEVTOOLS-578: Fix for deleting an environment that is selected

### 2022-03-25

- Updates to the latest version of the UI lib
- Layout fixes for environment variables popover
- First implementation of the environments view
- DEVTOOLS-577: Added demo link + settings

### 2022-03-24

- Command to view the changelog of the extension
- Command to create new request by the last record in your clipboard
- Added version number to the request panel so that it can be copied
- DEVTOOLS-553: Apply fix for request menu overflow where ellipsis is not shown
- DEVTOOLS-562: Filter out duplicates from header value menu
- DEVTOOLS-558: Alignment of the select component its items
- DEVTOOLS-393: Transparent background of the menu items

### 2022-03-23

- DEVTOOLS-402: Command/Shortcut to take a URL and test/browse it in Build quickly

### 2022-03-22

- DEVTOOLS-389: fix for theme conversion 
- Update tracking event names
- Hide scroll shadow in Monaco editors

### 2022-03-21

- Change `request.json` to VS Code state
