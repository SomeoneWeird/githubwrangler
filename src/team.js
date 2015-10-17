import async  from "async";
import prompt from "prompt";

import "colors";

export default function team(org, req) {
  
  return function(checkData, done) {

    req("GET", `orgs/${org}/teams`, null, function(err, teams) {

      if(err) {
        return done(err);
      }

      let teamId;

      for(var i = 0; i < teams.length; i++) {
        if(teams[i].slug == checkData.team) {
          teamId = teams[i].id;
        }
      }

      if(!teamId) {
        return done(`Cannot find team ${checkData.team}`);
      }

      req("GET", `orgs/${org}/repos?per_page=1000`, null, function(err, repositories) {

        if(err) {
          return done(err);
        }

        const repoNames = repositories.map(r => r.name);

        async.eachSeries(repoNames, function(repoName, done) {

          req("GET", `teams/${teamId}/repos/${org}/${repoName}`, null, function(err, response, statusCode) {

            if(err) {
              return done(err);
            }

            if(statusCode === 204) {
              return done();
            }

            console.log(" ✘ ".red, `Team '${checkData.team}' does not have access to ${org}/${repoName}`);

            prompt.message = "";

            prompt.get({
              properties: {
                run: {
                  description: "  Would you like to add this team? (y/n)"
                }
              }
            }, function(err, result) {

              if(err) {
                return done(err);
              }

              if(result.run !== 'y' && result.run !== 'yes') {
                return done();
              }

              req("PUT", `teams/${teamId}/repos/${org}/${repoName}`, {
                permission: checkData.access
              }, function(err, response, statusCode) {

                if(err) {
                  return done(err);
                }

                if(statusCode !== 204) {
                  return done(`Error adding team: ${response}`);
                }

                console.log(" ✓ ".green, `Successfully added team to ${org}/${repoName}`);

                done();

              });

            });

          });

        }, done);

      });

    });

  }

}
