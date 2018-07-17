# jira-plugin README

<br>Inspired by [vscode-jira](https://github.com/KnisterPeter/vscode-jira) I decided to create my own JIRA plugin for VS Code.<br>
I'm happy to will implement more features. :blush: <br><br>

## Install

ext install jira-plugin<br><br>

## Usage

From the command palette Ctrl-Shift-P (Windows, Linux) or Cmd-Shift-P (OSX) under **Jira-plugin** you have all the extension commands.<br><br>

## Setup

First of all your have to launch "Setup credentials" command to configure the plugin.<br>
The Jira base URL is needed and also your credentials.<br>

![Setup](images/readme/setup.gif)

## Set working project

After setup you have to set the working project, you can click on status-bar icon or use "Set working project" command.<br><br>
**n.b:** If you need to browse issues for various project you have to switch the working project.<br>

![Set-working-project](images/readme/set-working-project.gif)

## Config

The extension store credentials in VS Code settings.<br><br>
**n.b:** the extension store the password in VS Code internal storage so it's safe and hidden. :wink: <br>

![Settings](images/readme/settings.png)

## Features

![Commands](images/readme/commands.gif)

- **Issue by id**<br>
  With this command you can search and view a issue by id.<br><br>
- **My issues filtered by status**<br>
  With this command you can search your issues with a particular status.<br><br>
- **Issues filtered by status and assignee**<br>
  With this command you can search issues with a particular assignee and status.<br><br>
- **Issues filtered by summary**<br>
  With this command you can search issues with a particular summary.<br><br>
- **Change issue status**<br>
  With this command you can change an issue status.<br><br>
- **Change issue assignee**<br>
  With this command you can change an issue assignee.<br><br>
- **Add comment**<br>
  With this command you can add comment. [@] is the placeholder for tag a user.<br>**e.g:** 'This is the placeholder for tag user -> [@]'<br><br>

## Explorer

- In the explorer you can use all the extension command

![Explorer](images/readme/explorer.gif)

## Status bar

### Working project

- The extension in the status bar show the **working project**, you can also change it from here.

![StatusBar](images/readme/status-bar.png)

### Working issue

- The extension in the status bar show the **working issue**, you can also change it from here. <br>
  You can choose working issue from your **In Progress** issues. <br>
  The extension trace the time spended on the working issue and you can also create the Jira worklog for the activity. <br>
  Jira worklog allow only time in minute so the extension round your activity time. <br>
  The extension **every 60 second** store in iternal storage the current working activity so if you close and reopen VS Code the extension retrive (if needed) the pending working issue.

![Working issue](images/readme/working-issue.gif)

## Resources

Based on [JIRA APIs](https://developer.atlassian.com/cloud/jira/platform/rest/)
