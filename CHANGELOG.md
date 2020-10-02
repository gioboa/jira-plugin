## 0.22.1

### Bug Fixes

- Added work log time begins at submitted time

## 0.22.0

### Features

- Added settings option to choose filter for 'Set Working Issue' function to allow for switching to work on any issue in project. (WORKING_ISSUES (default) or ALL)
- Added ability to stop working on issue and immediately add comment and submit, or quit.
- Added Command Palette option to 'Set Working Project'
- Added Command Palette option to 'Set Working Issue'
- Added Command Palette option to 'Stop Working On Issue'
- Added color to 'No Working Issue' text in status bar for better visibility

## 0.21.0

### Features

- copy Jira Issue remote url to clipboard

### Bug Fixes

- minor fixes

## 0.20.0

### Features

- added start/stop issue timer

### Bug Fixes

- minor fixes

## 0.19.0

### Features

- added projectsToShow setting

## 0.18.4

### Bug Fixes

- removed obsolete method

## 0.18.3

### Bug Fixes

- minor fixes

## 0.18.2

### Bug Fixes

- solved problem with strictSSL

## 0.18.1

### Bug Fixes

- solved work log submitting

## 0.18.0

### Features

- added requests timeout setting

## 0.17.0

### Features

- now, after ticket creation, you can set the new ticket as working issue

## 0.16.1

### Bug Fixes

- managed error message when configuration is empty
- credentials in json format

## 0.16.0

### Features

- added auto refresh interval setting
- added show/hide working issue timer
- change working issue status after selection
- managed internal comment
- added working issue assignees setting
- save 'project' and 'working issue' settings inside workspace folder if exist

### Bug Fixes

- refresh issue list after issue creation
- minor fixes

## 0.15.3

### Bug Fixes

- time not being tracked on Jira

## 0.15.2

### Bug Fixes

- removed copy-paste lib and use new clipboard API
- solved issue in application state when there are multiple VsCode instances

## 0.15.1

### Bug Fixes

- solve issue in subtasks logic
- added groupTaskAndSubtasks setting for backward compatibility

## 0.15.0

### Features

- checkout or create git branch
- change explorer 'Group By' field
- group issue and subtasks in explorer
- added projectsToHide setting
- added strictSSL setting

### Breaking change

- remove additionalCertificate setting

## 0.14.1

### Bug Fixes

- added additional certificate settings

## 0.14.0

### Features

- you can manage your Jira unread notifications inside VsCode notification center
- managed sprint field

### Breaking change

- defaultJQLSearch now is defaultJqlSearch, so you have to copy manually the old setting in the new one

## 0.13.2

### Bug Fixes

- managed more custom fields

## 0.13.1

### Bug Fixes

- managed Tracking Time Mode: never

## 0.13.0

### Features

- you can decide how many issues are shown in list
- you can define a default JQL Search

## 0.12.4

### Bug Fixes

- solved limit in assignees list

## 0.12.3

### Bug Fixes

- Escape project name in JQL Queries

## 0.12.2

### Bug Fixes

- solve issue when Jira is in subfolder environment

## 0.12.1

### Bug Fixes

- error when base url contain port definition

## 0.12.0

### Features

- git integration workflow

### Bug Fixes

- create issue managed EpicLink field
- create issue managed Labels field
- code refactor
- minor changes and fixes

## 0.11.4

### Bug Fixes

- managed array field type with allowedValues
- improve debug logs

## 0.11.3

### Bug Fixes

- update readme with key features

## 0.11.2

### Bug Fixes

- creation of Document Link Provider

## 0.11.1

### Bug Fixes

- set const ASSIGNEES_MAX_RESULTS = 1000 (highest available)

## 0.11.0

### Features

- insert Working issue Key+Summary comment
- use favourites filters
- copy Jira Issue Key+Summary to clipboard

## 0.10.6

### Bug Fixes

- set working issue - improve workflow

## 0.10.5

### Bug Fixes

- create issue - improve workflow

## 0.10.4

### Bug Fixes

- include additionalStatuses into status list
- add category to issue and refresh commands
- create issue, detect which fields are mandatory

## 0.10.3

### Bug Fixes

- typo in addNewComment api

## 0.10.2

### Bug Fixes

- refactor explorer icons
- create issue assignee

## 0.10.1

### Bug Fixes

- solve problem with VS Code publish

## 0.10.0

### Features

- create issue functionality
- icons for all available states
- README contributors list - thanks guys :-)

## 0.9.1

### Bug Fixes

- fix jira connector issue

## 0.9.0

### Features

- current sprint functionality
- state separator in the Jira Plugin EXPLORER

## 0.8.4

### Bug Fixes

- improve error messages

## 0.8.3

### Bug Fixes

- fix solve search by Id issue

## 0.8.2

### Bug Fixes

- fix docs

## 0.8.1

### Bug Fixes

- solve error in VS Code output log

## 0.8.0

### Features

- **config** add workingIssueStatues

## 0.7.0

### Features

- replace pretend with jira-connector for Jira calls
- detect protocol and port from baseUrl

## 0.6.0

### Features

- **setting** add worklogMinimumTrackingTime
- **setting** add trackingTimeMode: `hybrid` - `always` - `vsCodeFocus`

## 0.5.2

### Bug Fixes

- solve problem with VS Code publish

## 0.5.1

### Bug Fixes

- add id in working issues list + modify labels
- modify working issue tooltip

## 0.5.0

### Features

- possibility to filter issues by status
- add config for enable/disable working issue functionality

## 0.4.0

### Features

- (status bar) add working issue functionality
- possibility to insert Jira worklog for the working issue

### Bug Fixes

- add ALL ISSUE call after switch working project

## 0.3.0

### Features

- change UI experience, the issue list now is inside the Jira Plugin EXPLORER

## 0.2.0

### Features

- add possibility to tag user in issue comment

## 0.1.2

### Features

- add particular icon for every status
- add back in multi param selection
- change status bar behaviour - now you can change working project from status bar

### Bug Fixes

- fix some logic under the hood

## 0.1.1

### Features

- add status in UI in filtered by id or summary

## 0.1.0

### Features

- add possibility to filter issues by summary

## 0.0.2

### Features

- add user Unassigned
- implement search by id + search by status and assignee
- implement change issue assignee
- working project info in status bar
- possibility to list my issues
- possibility to change working project
- add setup credentials action

### Bug Fixes

- fix in url config
- fix jira-plugin connection on startup

## 0.0.1

- include some basic commands
- initial commit
