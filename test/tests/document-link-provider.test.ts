import * as assert from 'assert';
import * as vscode from 'vscode';
import { IssueLinkProvider } from '../../src/shared/document-link-provider';

suite(`Issue Document Link Test`, () => {
  const linkProvider = new IssueLinkProvider([
    {
      key: 'projectA',
      expand: 'projectA',
      self: 'projectA',
      id: 'projectA',
      name: 'projectA'
    },
    {
      key: 'projectB',
      expand: 'projectB',
      self: 'projectB',
      id: 'projectB',
      name: 'projectB'
    },
    {
      key: 'projectC',
      expand: 'projectC',
      self: 'projectC',
      id: 'projectC',
      name: 'projectC'
    }
  ]);

  const tests = [
    {
      title: 'Right project',
      text: `projectA-123`,
      numberOfLinks: 1
    },
    {
      title: 'More right project',
      text: `projectA-123 
             projectB-123
             abc abc abc`,
      numberOfLinks: 2
    },
    {
      title: 'Right project with other chars',
      text: `* projectA-123 
             abc abc abc`,
      numberOfLinks: 1
    },
    {
      title: 'Right project with other chars',
      text: `/*
      * projectA-123 
      */`,
      numberOfLinks: 1
    },
    {
      title: 'Right project with other chars',
      text: `// projectA-123 test test`,
      numberOfLinks: 1
    },
    {
      title: 'Wrong project',
      text: `projectD-123`,
      numberOfLinks: 0
    },
    {
      title: 'Uppercase',
      text: `PROJECTA-123`,
      numberOfLinks: 1
    }
  ];
  tests.forEach(entry => {
    test(entry.title, async () => {
      const document = await vscode.workspace.openTextDocument({
        language: 'text',
        content: entry.text
      });
      const links: vscode.ProviderResult<vscode.DocumentLink[]> = await linkProvider.provideDocumentLinks(document);
      assert.equal((links || []).length, entry.numberOfLinks);
    });
  });
});
