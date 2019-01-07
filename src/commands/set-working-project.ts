import * as vscode from "vscode";
import { setConfigurationByKey } from "../shared/configuration";
import { CONFIG, LOADING } from "../shared/constants";
import { selectProject } from "../shared/select-utilities";
import { changeStateProject } from "../state/state";
import { Command } from "./shared/command";

export class SetWorkingProjectCommand implements Command {
  public id = "jira-plugin.setWorkingProjectCommand";

  public async run(): Promise<void> {
    changeStateProject(await selectProject());
  }
}
