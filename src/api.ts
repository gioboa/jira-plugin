import { Get, Interceptor, IPretendDecoder, IPretendRequestInterceptor, Post, Pretend } from 'pretend/dist/src';
import { Jira } from './api.model';

export const createClient = (endpoint: string, username: string, password: string): Jira => {
  return Pretend.builder()
    .interceptor(impl.logger())
    .basicAuthentication(username, password)
    .requestInterceptor(impl.contentType())
    .decode(impl.decoder())
    .target(impl.JiraBlueprint, endpoint);
};

namespace impl {
  export const logger = (): Interceptor => {
    return async (chain, request) => {
      // console.log('request: ', request);
      const response = await chain(request);
      // console.log('response', response);
      return response;
    };
  };

  export const contentType = (): IPretendRequestInterceptor => {
    return request => {
      (request.options.headers as Headers).set('Content-Type', 'application/json');
      return request;
    };
  };

  export const decoder = (): IPretendDecoder => {
    return response => {
      if (response.status === 204) {
        // no-content
        return Promise.resolve();
      }
      return response.json();
    };
  };

  export class JiraBlueprint implements Jira {
    @Get('/rest/api/2/serverInfo')
    public serverInfo(): any {
      /* */
    }

    @Get('/rest/api/latest/status')
    public getStatuses(): any {
      /* */
    }

    @Post('/rest/api/2/search')
    public search(): any {
      /* */
    }

    @Get('/rest/api/2/project')
    public getProjects(): any {
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

    // @Get('/rest/api/2/issue/:issue')
    // public getIssue(): any {
    //   /* */
    // }

    // @Post('/rest/api/2/issue/:issue/comment')
    // public addComment(): any {
    //   /* */
    // }
  }
}
