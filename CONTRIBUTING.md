## Contributing

Hi there! We're thrilled that you'd like to contribute to this project. <br>
Your help is essential for keeping it great.

## Submitting a pull request

1.  [Fork](https://github.com/gioboa/jira-plugin/fork) and clone the repository
1.  Configure and install the dependencies: `npm install`
1.  Compile code: `npm run compile`
1.  Make sure the tests pass on your machine: `npm run test`
1.  Create your feature branch: `git checkout -b my-new-feature`
1.  Make your change, add tests, and make sure the tests still pass
1.  Add your changes: `git add .`
1.  Commit your changes: `git commit -am 'Add some feature'`
1.  Push to the branch: `git push origin my-new-feature`
1.  Submit a [pull request](https://github.com/gioboa/jira-plugin/compare)
1.  Pat yourself on the back and wait for your pull request to be reviewed and merged.

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- Write and update tests.
- Keep your change as focused as possible. If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).

## Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

### Revert

If the commit reverts a previous commit it should begin with `revert:`, followed by the SHA of the reverted commit. <br> e.g: `revert: commit <SHA>.`

### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies
- **chore**: Maintain
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests

## Building standalone local version

To build a standalone local `vsix` file you can install into VSCode, perform the following:

Install vsce:

_Make sure you have Node.js installed. Then run:_

```bash
npm install -g vsce
```

Check out the GitHub repo/branch you want.

Depending on the project, you may need to install its dependencies (npm install or whatever package manager you use). Some can be packaged without dependencies.

Run the following in the root of the project (see the official docs for more detail about the process):

```bash
vsce package  # Generates a .vsix file
code --install-extension my-extension-0.0.1.vsix
```

Note: The above instructions were found on [https://stackoverflow.com/a/54409592/5889983](https://stackoverflow.com/a/54409592/5889983)
