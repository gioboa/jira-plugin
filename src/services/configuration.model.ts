import { WorkspaceConfiguration } from 'vscode';

export interface IConfiguration extends WorkspaceConfiguration {
  baseUrl?: string;
  username?: string;
  workingProject?: string;
  enableWorkingIssue?: boolean;
  trackingTimeMode?: string;
  trackingTimeModeHybridTimeout?: number;
  worklogMinimumTrackingTim?: number;
}

export interface IPickValue {
  pickValue: any;
  label: any;
  description: any;
}
