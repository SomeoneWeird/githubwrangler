import request from "request";
import path    from "path";
import prompt  from "prompt";

export default function(org, authData) {
  
  const auth = {
    user: authData.user,
    pass: authData.token
  }

  const headers = {
    'User-Agent': 'githubwrangler-' + require(path.resolve(__dirname, "../package.json")).version,
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

  let repoNames, repoData = [];

  function getRepositories(callback, page = 1) {
    if(repoNames && repoData) {
      return callback(null, repoNames, repoData);
    }
    function done() {
      repoNames = repoData.map(r => r.name);
      return callback(null, repoNames, repoData);
    }
    req("GET", `orgs/${org}/repos?per_page=100&page=${page}`, null, function(err, repositories) {
      if(err) return callback(err);
      repoData = repoData.concat(repositories);
      if(repositories.length === 0) {
        return done();
      }
      getRepositories(callback, ++page);
    });
  }

  function ask(description, callback) {

    prompt.message = "";

    prompt.get({
      properties: {
        run: {
          description
        }
      }
    }, function(err, result) {

      if(err) {
        return callback(err);
      }

      let run = false;

      if(result.run === 'y' || result.run === 'yes') {
        run = true;
      }

      return callback(null, run);

    });

  }

  return {
    req,
    getRepositories,
    ask
  }

}