module.exports = {


  friendlyName: 'Productionify',


  description: 'Prepare the assets in this package for production, then publish to NPM.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: ['req', 'res', 'sails'],


  inputs: {

    srcDir: {
      friendlyName: 'srcDir',
      description: 'The path to the source directory where assets should be pulled from.  If specified as a relative path, this will be resolved relative to the current working directory.',
      example: '/code/treeline-assets',
      required: true,
    },

    prodPkgName: {
      friendlyName: 'prodPkgName',
      description: 'The NPM module name for the production package.  If omitted, this will simply default to the module name of the development package with a `-prod` suffix.',
      example: '@treelinehq/whatever',
    },

  },


  exits: {

    error: {
      friendlyName: 'error',
    },

    error2: {
      friendlyName: 'error2',
      void: true,
    },

    error3: {
      friendlyName: 'error3',
      void: true,
    },

    error4: {
      friendlyName: 'error4',
      void: true,
    },

    error5: {
      friendlyName: 'error5',
      void: true,
    },

    error6: {
      friendlyName: 'error6',
      void: true,
    },

    error7: {
      friendlyName: 'error7',
      void: true,
    },

    error8: {
      friendlyName: 'error8',
      void: true,
    },

    doesNotExist: {
      friendlyName: 'doesNotExist',
      void: true,
    },

    couldNotParse: {
      friendlyName: 'couldNotParse',
      void: true,
    },

    error9: {
      friendlyName: 'error9',
      void: true,
    },

    alreadyExists: {
      friendlyName: 'alreadyPublishedAtThisVersion',
      description: 'The production asset package has already been published at this version. Please use `npm version` to bump the version of this package, `git push && git push --tags`, then `npm publish` to try again.',
      void: true,
    },

    noSuchDir: {
      friendlyName: 'noSuchDir',
      void: true,
    },

    notADir: {
      friendlyName: 'notADir',
      void: true,
    },

    invalidPackage: {
      friendlyName: 'invalidPackage',
      void: true,
    },

    success: {
      friendlyName: 'success',
      example: {
        name: '@mattmueller/cheerio',
        version: '2.0.0'
      },
    },

    error10: {
      friendlyName: 'error10',
      void: true,
    },

  },


  fn: function(inputs, exits, env) {
    // Source directory (path)
    require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
      "paths": [inputs.srcDir]
    }).exec({
      "error": function(sourceDirectoryPath) {
        exits.error3(sourceDirectoryPath);
      },
      "success": function(sourceDirectoryPath) {
        // Read package.json
        require('@treelinehq/treelinehq/machinepack-fs_5.2.0').readJson({
          "source": sourceDirectoryPath + "/package.json",
          "schema": {
            version: "1.0.0",
            name: "@treelinehq/treeline-assets"
          }
        }).exec({
          "error": function(readPackageJson) {
            exits.error8(readPackageJson);
          },
          "doesNotExist": function(readPackageJson) {
            exits.doesNotExist(readPackageJson);
          },
          "couldNotParse": function(readPackageJson) {
            exits.couldNotParse(readPackageJson);
          },
          "success": function(readPackageJson) {
            // Production package name
            require('@treelinehq/treelinehq/machinepack-util_5.1.0').coalesce({
              "b": (readPackageJson && readPackageJson.name) + "-prod",
              "a": inputs.prodPkgName
            }).exec({
              "error": function(productionPackageName) {
                exits.error10(productionPackageName);
              },
              "success": function(productionPackageName) {
                // Tmp output directory (path)
                require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
                  "paths": [inputs.srcDir, ".tmp/processing"]
                }).exec({
                  "error": function(tmpOutputDirectoryPath) {
                    exits.error(tmpOutputDirectoryPath);
                  },
                  "success": function(tmpOutputDirectoryPath) {
                    // Copy fonts (if relevant)
                    require('../index').copyFonts({
                      "fontsSrcPath": sourceDirectoryPath + "/fonts",
                      "outputDir": tmpOutputDirectoryPath
                    }).exec({
                      "error": function(copyFontsIfRelevant) {
                        exits.error2(copyFontsIfRelevant);
                      },
                      "success": function(copyFontsIfRelevant) {
                        // Copy images (if relevant)
                        require('../index').copyImages({
                          "imgSrcPath": sourceDirectoryPath + "/images",
                          "outputDir": tmpOutputDirectoryPath
                        }).exec({
                          "error": function(copyImagesIfRelevant) {
                            exits.error4(copyImagesIfRelevant);
                          },
                          "success": function(copyImagesIfRelevant) {
                            // Write README and package.json
                            require('../index').writeReadmeAndPackageJson({
                              "srcDir": sourceDirectoryPath,
                              "outputDir": tmpOutputDirectoryPath,
                              "prodPkgName": productionPackageName,
                              "prodPkgVersion": (readPackageJson && readPackageJson.version)
                            }).exec({
                              "error": function(writeREADMEAndPackageJson) {
                                exits.error5(writeREADMEAndPackageJson);
                              },
                              "success": function(writeREADMEAndPackageJson) {
                                // Write compiled JavaScript (if relevant)
                                require('../index').writeMinifiedJavascript({
                                  "outputDir": tmpOutputDirectoryPath,
                                  "jsSrcDir": sourceDirectoryPath + "/js"
                                }).exec({
                                  "error": function(writeCompiledJavaScriptIfRelevant) {
                                    exits.error6(writeCompiledJavaScriptIfRelevant);
                                  },
                                  "success": function(writeCompiledJavaScriptIfRelevant) {
                                    // Write compiled stylesheet (if relevant)
                                    require('../index').writeCompiledStylesheetIfRelevant({
                                      "outputDir": tmpOutputDirectoryPath,
                                      "lessSrcDir": sourceDirectoryPath + "/styles"
                                    }).exec({
                                      "error": function(writeCompiledStylesheetIfRelevant) {
                                        exits.error7(writeCompiledStylesheetIfRelevant);
                                      },
                                      "success": function(writeCompiledStylesheetIfRelevant) {
                                        // Publish package
                                        require('@treelinehq/treelinehq/machinepack-npm_5.1.0').publish({
                                          "dir": tmpOutputDirectoryPath
                                        }).exec({
                                          "error": function(publishPackage) {
                                            exits.error9(publishPackage);
                                          },
                                          "alreadyExists": function(publishPackage) {
                                            exits.alreadyExists(publishPackage);
                                          },
                                          "noSuchDir": function(publishPackage) {
                                            exits.noSuchDir(publishPackage);
                                          },
                                          "notADir": function(publishPackage) {
                                            exits.notADir(publishPackage);
                                          },
                                          "invalidPackage": function(publishPackage) {
                                            exits.invalidPackage(publishPackage);
                                          },
                                          "success": function(publishPackage) {
                                            exits.success(publishPackage);
                                          }
                                        });

                                      }
                                    });

                                  }
                                });

                              }
                            });

                          }
                        });

                      }
                    });

                  }
                });

              }
            });

          }
        });

      }
    });
  },



};