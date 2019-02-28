import { configuration } from '../services';
import { CONFIG } from './constants';

const cleanOptions = (options: any): void => {
  if (!!options.headers && Object.keys(options.headers).length === 0) {
    delete options.header;
  }
  if (!!options.body && Object.keys(options.body).length === 0) {
    delete options.body;
  }
  if (!!options.qs && Object.keys(options.qs).length === 0) {
    delete options.qs;
  }
};

export const patchJiraInstance = (jiraInstance: any) => {
  // custom event
  // solve this issue -> https://github.com/floralvikings/jira-connector/issues/115
  const customGetAllProjects = (opts: any, callback: any) => {
    const options = jiraInstance.project.buildRequestOptions(opts, '', 'GET');
    cleanOptions(options);
    return jiraInstance.makeRequest(options, callback);
  };
  jiraInstance.project.getAllProjects = customGetAllProjects;

  const customRequest = (method: 'GET' | 'POST', uri: string, headers?: {}, body?: {}) => {
    const options = jiraInstance.project.buildRequestOptions({}, '', method, body || {});
    for (const key of Object.keys(headers || {})) {
      if (!options.headers) {
        options.headers = {};
      }
      options.headers[key] = (<any>headers)[key];
    }
    options.uri = uri;
    cleanOptions(options);
    return jiraInstance.makeRequest(options, undefined);
  };
  jiraInstance.project.customRequest = customRequest;

  jiraInstance.originalRequestLib = jiraInstance.requestLib;
  const customRequestLib = (options: any) => {
    if (!!options && !!options.headers && options.headers.deleteAuth) {
      delete options.auth;
      delete options.headers.deleteAuth;
    }
    return jiraInstance.originalRequestLib(options);
  };
  jiraInstance.requestLib = customRequestLib;

  jiraInstance.originalMakeRequest = jiraInstance.makeRequest;
  const customMakeRequest = (options: any, callback: any, successString: any) => {
    const strictSSL = configuration.get(CONFIG.STRICT_SSL);
    if (strictSSL !== '') {
      options.strictSSL = strictSSL === 'true';
    }
    return jiraInstance.originalMakeRequest(options, callback, successString);
  };
  jiraInstance.makeRequest = customMakeRequest;
};
