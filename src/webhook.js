import async  from "async";
import prompt from "prompt";
import assert from "assert";

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

          let foundHook;

          for(var i = 0; i < data.length; i++) {
            if(hookData.url == data[i].config.url) {
              foundHook = data[i];
              break;
            }
          }

          if(foundHook) {
            checkUpdate();
          } else {
            promptCreate();
          }

          function checkUpdate() {

            let outdated = false;

            try {
              foundHook.events = foundHook.events.sort();
              hookDataEvents = hookDataEvents.sort();
              assert.deepEqual(foundHook.events, hookDataEvents);
            } catch(e) {
              outdated = true;
            }

            if(!foundHook.active) {
              outdated = true;
            }

            if(outdated) {
              return promptUpdate();
            }

            return done();

          }

          function promptUpdate() {

            if(!argv.quiet) {
              console.log(" ✘ ".red, `Webhook '${hookData.name || hookData.url}' seems to be outdated for ${org}/${repoName}`);
            }

            if(argv.yes) {
              return doUpdate();
            }

            utils.ask("  Would you like to update this webhook? (y/n)", function(err, run) {

              if(err) {
                return done(err);
              }

              if(!run) {
                return done();
              }

              return doUpdate();

            });

          }

          function doUpdate() {

            utils.req("PATCH", `repos/${org}/${repoName}/hooks/${foundHook.id}`, {
              events: hookDataEvents,
              active: true
            }, function(err) {

              if(err) {
                return done(err);
              }

              if(!argv.quiet) {
                console.log(" ✓ ".green, `Successfully modified webhook for ${org}/${repoName}`);
              }

              return done();

            });

          }

          function promptCreate() {

            if(!argv.quiet) {
              console.log(" ✘ ".red, `Webhook '${hookData.name || hookData.url}' not found for ${org}/${repoName}`);
            }

            if(argv.yes) {
              return doCreate();
            }

            utils.ask("  Would you like to add this webhook? (y/n)", function(err, run) {

              if(err) {
                return done(err);
              }

              if(!run) {
                return done();
              }

              return doCreate();

            });

          }

          function doCreate() {

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

        }, done);

      });

    });

  }

}