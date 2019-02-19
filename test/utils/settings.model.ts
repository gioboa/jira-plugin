export interface ISettings {
  baseUrl: string;
  username: string;
  password: string;
  workingProject: string;
  enableWorkingIssue: boolean;
  workingIssueStatues: string;
  counter: number;
  workingIssue: any;
}

// START - settings example file

// import { ISettings } from "./configuration.model";

// export const settings: ISettings = {
//   baseUrl: 'xxx',
//   username: 'xxx',
//   password: 'xxx',
//   workingProject: '',
//   enableWorkingIssue: false,
//   workingIssueStatues: 'In Progress',
//   counter: 0,
//   workingIssue: undefined
// };

// END - configuration example file
