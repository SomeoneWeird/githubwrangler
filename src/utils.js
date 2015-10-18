import request from "request";
import path    from "path";

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

  let repoNames, repoData;

  function getRepositories(callback) {
    if(repoNames && repoData) {
      return callback(null, repoNames, repoData);
    }
    req("GET", `orgs/${org}/repos?per_page=1000`, null, function(err, repositories) {
      if(err) return callback(err);
      repoNames = repositories.map(r => r.name);
      repoData = repositories;
      return callback(null, repoNames, repoData);
    });
  }

  return {
    req,
    getRepositories
  }

}