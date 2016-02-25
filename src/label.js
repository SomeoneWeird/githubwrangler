import async  from "async";
import prompt from "prompt";
import assert from "assert";

import "colors";

export default function label(org, utils, argv) {
  
  return function(labelData, done) {

    if(labelData.colour.substr(0, 1) === '#') {
      labelData.colour = labelData.colour.substr(1);
    }

    labelData.colour = labelData.colour.toLowerCase();

    utils.getRepositories(function(err, repositories) {

      if(err) {
        return done(err);
      }

      let repoData = {};

      async.each(repositories, function(repoName, done) {

        utils.req("GET", `repos/${org}/${repoName}/labels`, null, function(err, labels) {

          if(err) {
            return done(err);
          }

          repoData[repoName] = labels;

          done();

        });

      }, function(err) {

        if(err) {
          return done(err);
        }

        let missing = [];
        let update  = [];

        for(let r in repoData) {
          if(r !== 'ops')
            delete repoData[r]
        }

        async.eachSeries(Object.keys(repoData), function(repoName, done) {

          let labels = repoData[repoName];

          let needUpdate = false;
          let found      = false;

          for(let i = 0; i < labels.length; i++) {
            if(labels[i].name === labelData.name) {
              if(labels[i].color !== labelData.colour) {
                needUpdate = true;
              } else {
                found = true;
              }
              break;
            }
          }
          if(needUpdate) {
            promptUpdate();
          } else if(!found) {
            promptCreate();
          }

          function promptUpdate() {

            if(!argv.quiet) {
              console.log(" ✘ ".red, `Label '${labelData.name}' seems to be outdated for ${org}/${repoName}`);
            }

            if(argv.yes) {
              return doUpdate();
            }

            utils.ask("  Would you like to update this label? (y/n)", function(err, run) {

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

            utils.req("PATCH", `repos/${org}/${repoName}/labels/${labelData.name}`, {
              name:  labelData.name,
              color: labelData.colour
            }, function(err) {

              if(err) {
                return done(err);
              }

              if(!argv.quiet) {
                console.log(" ✓ ".green, `Successfully modified label for ${org}/${repoName}`);
              }

              return done();

            });

          }

          function promptCreate() {

            if(!argv.quiet) {
              console.log(" ✘ ".red, `Label '${labelData.name}' not found for ${org}/${repoName}`);
            }

            if(argv.yes) {
              return doCreate();
            }

            utils.ask("  Would you like to add this label? (y/n)", function(err, run) {

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

            utils.req("POST", `repos/${org}/${repoName}/labels`, {
              name:  labelData.name,
              color: labelData.colour
            }, function(err, response) {

              if(err) {
                return done(err);
              }

              if(!argv.quiet) {
                console.log(" ✓ ".green, `Successfully added label to ${org}/${repoName}`);
              }

              done();

            });

          }

        }, done);

      });

    });

  }

}