# jira-plugin README

<br>Inspired by [vscode-jira](https://github.com/KnisterPeter/vscode-jira) I decided to create my own JIRA plugin for VS Code.
I'm happy to will implement more features.<br><br>

## Install

ext install jira-plugin<br><br>

## Usage

From the command palette Ctrl-Shift-P (Windows, Linux) or Cmd-Shift-P (OSX) under <b>Jira-plugin</b> you have all the extension commands.<br><br>

## Setup

First of all your have to launch "Setup credentials" command to configure the plugin.<br>
The Jira base URL is needed and also your credentials.<br>
After that you have to setup the working project. ("Set working project" command)<br><br>
<b>n.b:</b> If you need to browse issues for various project you have to launch the command to perform the switch.<br>

![Setup](images/setup.gif)

## Config

The extension store credentials in VS Code settings.<br><br>
<b>n.b:</b> the extension store the password in VS Code internal storage so it's safe and hidden. :wink: <br>

![Settings](images/settings.png)

## Features

![Commands](images/commands.gif)

- <b>Issue by id</b><br>
  With this command you can search and view a issue by id.<br><br>
- <b>My issues filtered by status</b><br>
  With this command you can search your issues with a particular status.<br><br>
- <b>Issues filtered by status and assignee</b><br>
  With this command you can search issues with a particular assignee and status.<br><br>
- <b>Change issue status (filter: id)</b><br>
  With this command you can change an issue status. In the filter you have to specify the id. <br><br>
- <b>Change issue assignee (filter: id)</b><br>
  With this command you can change an issue assignee. In the filter you have to specify the id.<br><br>

## Resources

Based on [JIRA APIs](https://developer.atlassian.com/cloud/jira/platform/rest/)
