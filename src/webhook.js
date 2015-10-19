import async  from "async";
import prompt from "prompt";

import "colors";

export default function webhook(org, utils, argv) {
  
  return function(hookData, done) {

    let hookDataEvents = hookData.events;
    delete hookData.events;

    utils.getRepositories(function(err, repositories) {

      if(err) {
        return done(err);
      }

      let repoData = [];

      async.each(repositories, function(repoName, done) {

        utils.req("GET", `repos/${org}/${repoName}/hooks`, null, function(err, hooks) {

          if(err) {
            return done(err);
          }

          repoData[repoName] = hooks;

          done();

        });

      }, function(err) {

        if(err) { 
          return done(err);
        }

        async.eachSeries(Object.keys(repoData), function(repoName, done) {

          let data = repoData[repoName];

          let found = data.some(hook => {
            return hookData.url == hook.config.url;
          });

          if(found) {
            return done();
          }

          if(!argv.quiet) {
            console.log(" ✘ ".red, `Webhook '${hookData.name || hookData.url}' not found for ${org}/${repoName}`);
          }

          function doAction() {

            utils.req("POST", `repos/${org}/${repoName}/hooks`, {
              name: "web",
              config: {
                url: hookData.url,
                content_type: hookData.content_type || 'json'
              },
              active: true,
              events: hookDataEvents
            }, function(err, response) {

              if(err) {
                return done(err);
              }

              if(response.active !== true) {
                console.error(" ✘ ".red, `Failed to add webhook: ${response}`);
                return done();
              }

              if(!argv.quiet) {
                console.log(" ✓ ".green, `Successfully added webhook to ${org}/${repoName}`);
              }

              done();

            });

          }

          if(argv.yes) {
            return doAction();
          }

          prompt.message = "";

          prompt.get({
            properties: {
              run: {
                description: "  Would you like to add this webhook? (y/n)"
              }
            }
          }, function(err, result) {

            if(err) {
              return done(err);
            }

            if(result.run !== 'y' && result.run !== 'yes') {
              return done();
            }

            return doAction();

          });

        }, done);

      });

    });

  }

}