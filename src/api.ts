import { Get, Interceptor, IPretendDecoder, IPretendRequestInterceptor, Post, Pretend } from 'pretend';

export interface Jira {
  serverInfo(): Promise<ServerInfo>;
  search(params: { jql: string }): Promise<Issues>;
  getIssue(issue: string): Promise<Issue>;
  getTransitions(issue: string): Promise<Transitions>;
  doTransition(issue: string, body: DoTransitionBody): Promise<void>;
  addComment(issue: string, body: AddCommentBody): Promise<AddCommentResponse>;
  getProjects(): Promise<Project[]>;
}

export interface AddCommentBody {
  body: string;
}

export interface AddCommentResponse {
  id: string;
}

export interface ServerInfo {
  version: string;
  versionNumbers: number[];
}

export interface Issues {
  issues: Issue[] | undefined;
  maxResults: number;
  startAt: number;
  total: number;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
  };
}

export interface Transitions {
  transitions: Transition[];
}

export interface Transition {
  id: string;
  name: string;
  to: {
    name: string;
  };
}

export interface DoTransitionBody {
  transition: {
    id: string;
  };
}

export interface Project {
  key: string;
  expand: string;
  self: string;
  id: string;
  name: string;
}

export function createClient(endpoint: string, username: string, password: string): Jira {
  return Pretend.builder()
    .interceptor(impl.logger())
    .basicAuthentication(username, password)
    .requestInterceptor(impl.contentType())
    .decode(impl.decoder())
    .target(impl.JiraBlueprint, endpoint);
}

namespace impl {
  export function logger(): Interceptor {
    return async (chain, request) => {
      // console.log('request: ', request);
      const response = await chain(request);
      // console.log('response', response);
      return response;
    };
  }

  export function contentType(): IPretendRequestInterceptor {
    return request => {
      (request.options.headers as Headers).set('Content-Type', 'application/json');
      return request;
    };
  }

  export function decoder(): IPretendDecoder {
    return response => {
      if (response.status === 204) {
        // no-content
        return Promise.resolve();
      }
      return response.json();
    };
  }

  export class JiraBlueprint implements Jira {
    @Get('/rest/api/2/serverInfo')
    public serverInfo(): any {
      /* */
    }

    @Post('/rest/api/2/search')
    public search(): any {
      /* */
    }

    @Get('/rest/api/2/issue/:issue')
    public getIssue(): any {
      /* */
    }

    @Get('/rest/api/2/issue/:issue/transitions')
    public getTransitions(): any {
      /* */
    }

    @Post('/rest/api/2/issue/:issue/transitions')
    public doTransition(): any {
      /* */
    }

    @Get('/rest/api/2/project')
    public getProjects(): any {
      /* */
    }

    @Post('/rest/api/2/issue/:issue/comment')
    public addComment(): any {
      /* */
    }
  }
}
