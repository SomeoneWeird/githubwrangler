#!/usr/bin/env node

import path    from "path";
import async   from "async";
import ghauth  from "ghauth"
import yargs   from "yargs";

import utils from "./utils";

import webhook from "./webhook";
import team    from "./team";

const argv = yargs
  .usage("Usage: $0 -f [filename]")
  .demand([ 'f' ])
  .describe('f', 'configuration file')
  .describe('y', 'Automatically perform action(s)')
  .describe('q', 'Suppress all stdout')
  .alias('f', 'file')
  .alias('y', 'yes')
  .alias('q', 'quiet')
  .argv;


let file;

try {
  file = require(path.resolve(process.cwd(), argv.file));
} catch(e) {
  console.error(`There was an error loading your file: ${e}`);
  process.exit(1);
}

ghauth({
  configName: "githubwrangler",
  note: "Github Wrangler",
  scopes: [
    "repo",
    "admin:repo_hook",
    "admin:org"
  ]
}, function(err, authData) {

  if(err) {
    console.error(`There was an error getting a github token: ${err}`);
    process.exit(1);
  }

  const _utils = utils(file.org, authData);

  const types = {
    webhook: webhook(file.org, _utils, argv),
    team:    team(file.org, _utils, argv)
  }

  async.eachSeries(file.checks, function(e, done) {

    const t = e.type;
    delete e.type;

    if(!types[t]) {
      return done(`Type ${t} is unsupported.`);
    }

    types[t](e, done);

  }, function(err) {

    if(err) {
      console.error(`An error occured: ${err}`);
      process.exit(1);
    }

    if(!argv.quiet) {
      console.log("✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓".green, "All good 👌");
    }

    process.exit();

  });

});
