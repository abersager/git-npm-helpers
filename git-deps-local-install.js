/**
 * Helper script for Docker build to support private Github repo dependencies
 *
 * The script:
 * - checks out the specified commit-ish of Git repo dependencies into a separate directory
 * - runs `npm install --production` there
 * - and finally writes a new `package.json` with local file dependencies
*/

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync

function exec (cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).replace(/\s+$/g, '');
}

if (process.argv.length < 6) {
  console.log([
    'Usage:',
    process.argv[0],
    process.argv[1],
    '<input_file>',
    '<output_file>',
    '<install_dir>',
    '<github_token>'
  ].join(' '));

  exit(0);
}

var currentDir = exec('pwd');

var input = process.argv[2];
var output = process.argv[3];
var dir = process.argv[4];
var token = process.argv[5];

var pkg = require(path.resolve(currentDir, input));

if (!pkg.dependencies) {
  // Nothing to do here
  exit(0);
}

Object.keys(pkg.dependencies).forEach(function (key) {
  var value = pkg.dependencies[key];
  var matches = value.match(/([^/]+)\/([^#]+)(?:#(.*))?/);
  if (!matches) {
    return;
  }

  var user = matches[1]
  var repo = matches[2];
  var tag = matches[3] || 'master';

  exec([
    'mkdir -p ' + path.resolve(dir),
    'cd ' + path.resolve(dir),
    "git clone --depth=1 --branch " + tag  + " https://" + token + "@github.com/" + user + "/" + repo,
    'cd ' + path.resolve(dir, repo),
    "npm install --production"
  ].join(' && '));

  pkg.dependencies[key] = path.resolve(dir, repo);
})

exec('cd ' + currentDir);
fs.writeFileSync(path.resolve(currentDir, output), JSON.stringify(pkg));
