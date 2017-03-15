# git-npm-helpers

Helper scripts for maintaining private npm modules without a registry.

## Why

npm allows you to add dependencies to modules maintained in git repos. This is a great solution for modules you'd like to use private and when you don't have a private npm registry server available.

This solution is a little problematic when you need to compile your code into a readily usable format, e.g. when you maintain your source in Typescript or ES2017. When you use the npm registry, this is not a problem, because you can always gitignore the compiled files and publish them to the registry.

However, when you maintain the module in a git repo, the compiled files need to maintained in the repo itself. This works but it does make code reviews more difficult, because the compiled files cannot be gitignored and therefore show up in pull requests.

`git-npm-helpers` allows you to keep your pull requests clean yet maintain compiled files in the repository

## How

`git-npm-helpers` provides the following scripts:

- `git-hide`: This forces git to ignore changes in a given directory.
- `git-unhide`: This reverses the change and makes changes visible again.

Typically, you use the scripts for the directory where your files get compiled to. In the following example, our compiled files end up in a directory called `dist`.

1. Add the directory to `.gitignore`

```
dist
```

2. Use the scripts in your private npm module's `package.json` to implement your workflow

For example:

```
{
  "name": "my-private-git-module",
  "version": "0.1.1",
  "scripts": {
    // ...
    "preversion": "npm run lint && npm test",
    "version": "npm run build && git-unhide dist",
    "postversion": "git-hide dist && git push && git push --tags"
    // ...
  }
}
```

With this in place, you can release new versions of your module by running the standard `npm version <version|level>` command. npm tags versions automatically following the schema `v<version>`. For instance, in order to release a new minor version of your module, run:

```
npm version minor
```

This create a new build, bump the version, commit the changed files, tag the commit with the new version, and push the result back.

3. Use the module in your project

```
{
  "name": "my-private-project",
  "dependencies": {
    "my-private-git-module": "git://git@mygitserver.com:owner/my-private-git-module.git#v0.2.0"
  }
}


## Known issues

- Sometimes, git gets unhappy about the changes in the dist directory when changing branches during development. Since these are throwaway files anyway, simply delete the files and rebuild.
