module.exports = {


  friendlyName: 'Productionify',


  description: 'Prepare the assets in this package for production, then publish to NPM as a separate package with a `-prod` suffix.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  inputs: {

    srcDirectory: { required: true, example: './foo' },
    lessEntryPoint: { example: './foo/styles/importer.less' },
    lessImportPaths: { example: './foo/styles' },
    fontsSrcPath: { example: './foo/fonts' },
    jsSrcPath: { example: './foo/js' },

    workingDir: { example: './foo/.tmp/processing' },

    prodPkgName: { required: true, example: '@automatic/socket.io-prod' },
    prodPkgVersion: { required: true, example: '1.1.1' },
    prodPkgDescription: { example: 'This package contains the production-compressed release of shared stylesheets, client-side JavaScript files, fonts, and/or images.' },
    author: { example: 'Automatic' },
    copyright: { example: 'Copyright &copy; 2015' },
    license: { example: 'All rights reserved.' },
    homepage: { example: 'http://socket.io' },

  },


  exits: {

    error: {
      friendlyName: 'error',
      description: 'Unexpected error occurred.',
    },

    success: {
      friendlyName: 'then',
      description: 'Normal outcome.',
      void: true,
    },

    alreadyPublishedAtThisVersion: {
      friendlyName: 'already published at this version',
      description: 'The production version of this package has already been published at this version. Please use `npm version` to bump the version of this package, `git push && git push --tags`, then `npm publish` to try again.',
      example: 'abc123',
    },

  },


  fn: function(inputs, exits, env) {
    var path = require('path');
    var Filesystem = require('@treelinehq/treelinehq/machinepack-fs');
    var IfThen = require('@treelinehq/treelinehq/machinepack-ifthen');
    var LESS = require('@treelinehq/treelinehq/machinepack-less');
    var NPM = require('@treelinehq/treelinehq/machinepack-npm');
    var thisPack = require('../');

    // Set up some paths used below
    // (just pulled up here as constants for convenience)
    inputs.srcDirectory = path.resolve(inputs.srcDirectory);
    inputs.lessEntryPoint = inputs.lessEntryPoint ? path.resolve(inputs.lessEntryPoint ) : path.resolve(inputs.srcDirectory, 'styles/importer.less');
    inputs.lessImportPaths = inputs.lessImportPaths ? path.resolve(inputs.lessImportPaths ) : [ path.resolve(inputs.srcDirectory, 'styles/') ];
    inputs.fontsSrcPath = inputs.fontsSrcPath ? path.resolve(inputs.fontsSrcPath ) : path.resolve(inputs.srcDirectory, 'fonts/');
    inputs.jsSrcPath = inputs.jsSrcPath ? path.resolve(inputs.jsSrcPath ) : path.resolve(inputs.srcDirectory, 'js/');
    inputs.workingDir = inputs.workingDir ? path.resolve(inputs.workingDir ) : path.resolve(inputs.srcDirectory, '.tmp/processing');


    inputs.prodPkgDescription = inputs.prodPkgDescription || 'This package contains the production-compressed release of an asset package (i.e. shared LESS stylesheets, client-side JavaScript files, fonts, and/or images).';
    inputs.author = inputs.author || '';
    inputs.license = inputs.license || '';
    if (!inputs.copyright) {
      if (inputs.author) {
        inputs.copyright = 'Copyright &copy; 2015, '+inputs.author;
      }
    }


    // First, create a working copy of the production package on disk in a temporary directory.
    // In the process, set the version in the package.json file to match the version
    // of the original source package before writing the `package.json` file.
    Filesystem.write({
      destination: path.resolve(inputs.workingDir, 'README.md'),
      string: '# '+inputs.prodPkgName+'\n\n'+(inputs.prodPkgDescription?inputs.prodPkgDescription+'\n\n':'')+(inputs.license?inputs.license+'\n':'')+(inputs.copyright),
      force: true
    }).exec({
      error: exits.error,
      success: function (){

        Filesystem.writeJson({
          json: {
            "name": inputs.prodPkgName,
            "version": inputs.prodPkgVersion,
            "description": inputs.prodPkgDescription,
            "dependencies": {},
            "author": inputs.author,
            "license": inputs.license,
            "homepage": inputs.homepage,
          },
          destination: path.resolve(inputs.workingDir, 'package.json'),
          force: true
        }).exec({
          error: exits.error,
          success: function (){

            // Then, prepare our assets for production:

            // Minify JavaScript files.
            thisPack.minifyJavascriptFiles({
              dir: inputs.jsSrcPath,
            }).exec({
              error: exits.error,
              success: function (js) {

                // And write the resulting JS to disk.
                Filesystem.write({
                  destination: path.resolve(inputs.workingDir, 'production.min.js'),
                  string: js,
                  force: true
                }).exec({
                  error: exits.error,
                  success: function() {

                    // Compile LESS stylesheets.
                    LESS.compileStylesheet({
                      source: inputs.lessEntryPoint,
                      importPaths: inputs.lessImportPaths,
                      minify: true,
                    }).exec(function (err) {

                      IfThen.ifThenFinally({
                        bool: !err,
                        then: function (__, exits){
                          // And write the resulting CSS to disk.
                          Filesystem.write({
                            destination: path.resolve(inputs.workingDir, 'production.min.css'),
                            string: css,
                            force: true
                          }).exec({
                            error: exits.error,
                            success: exits.success
                          });
                        },
                        // The compileStylesheet machine exited out of something other than its success exit.
                        orElse: function (__, exits) {
                          // If there is no LESS importer file, we'll skip writing production.min.css
                          if (err.exit === 'doesNotExist') {
                            return exits.success();
                          }
                          return exits.error(err);
                        }
                      }).exec({
                        error: exits.error,
                        success: function (){

                          // Copy over fonts.
                          Filesystem.cp({
                            source: inputs.fontsSrcPath,
                            destination: path.resolve(inputs.workingDir, 'fonts/'),
                          }).exec({
                            error: exits.error,
                            success: function() {

                              // Publish the new version of `dropdown-prod` to NPM.
                              NPM.publish({
                                dir: inputs.workingDir,
                                restrictAccess: false,
                              }).exec({
                                error: exits.error,
                                alreadyExists: exits.alreadyPublishedAtThisVersion,
                                success: function() {

                                  // Finally, clean up leftover files.
                                  // (note that we don't actually do this right now- this is commented
                                  //  out in order to leave a trace of the most-recently compiled version
                                  //  on this machine, for debugging purposes. To re-enable in the future,
                                  //  just uncomment this stuff.)
                                  // Filesystem.rmrf({
                                  //   dir: inputs.workingDir
                                  // }).exec({
                                  //   error: exits.error,
                                  //   success: function (){
                                  return exits.success();
                                  //   }
                                  // }); // </rm -rf working dir>
                                }
                              }); // </publish to NPM>
                            }
                          }); //</copy fonts>
                        }
                      }); //</IfThen.ifThenFinally>
                    }); // </attempt to compile LESS>
                  }
                }); // </write minified js to disk>
              }
            }); // </minifyJavascriptFiles>
          }
        }); // </write package.json>
      }
    });// </write readme>


  },



};
