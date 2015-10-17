#!/usr/bin/env node

import path    from "path";
import async   from "async";
import ghauth  from "ghauth"
import request from "request";

import webhook from "./webhook";
import team    from "./team";

const filename = process.argv[2];

if(!filename) {
  console.error("Please pass a filename as an argument.");
  process.exit(1);
}

let file;

try {
  file = require(path.resolve(process.cwd(), filename));
} catch(e) {
  console.error(`There was an error loading your file: ${e}`);
  process.exit(1);
}

ghauth({
  configName: "ghdoctor",
  note: "Github Doctor",
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

  const auth = {
    user: authData.user,
    pass: authData.token
  }

  const headers = {
    'User-Agent': 'ghdoctor-' + require(path.resolve(__dirname, "../package.json")).version,
    'Accept':     'application/vnd.github.ironman-preview+json'
  }

  function req(method, endpoint, body, callback) {
    const url = `https://api.github.com/${endpoint}`;
    request({
      url,
      auth,
      body,
      method,
      headers,
      json: true
    }, function(err, data, body) {
      return callback(err, body, data.statusCode);
    });
  }

  const types = {
    webhook: webhook(file.org, req),
    team:    team(file.org, req)
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

  });

});
