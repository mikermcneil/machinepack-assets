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
      description: '',
      example: './my-projects/some-assets/',
      required: true,
    },

  },


  exits: {

    error: {
      friendlyName: 'error',
    },

    error2: {
      friendlyName: 'error2',

    },

    error3: {
      friendlyName: 'error3',

    },

    success: {
      friendlyName: 'then',

    },

    error4: {
      friendlyName: 'error4',

    },

    error5: {
      friendlyName: 'error5',

    },

    error6: {
      friendlyName: 'error6',

    },

  },


  fn: function(inputs, exits, env) {
    // Determine tmp output path
    require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
      "paths": [inputs.srcDir, ".tmp/processing"]
    }).exec({
      "error": function(determineTmpOutputPath) {
        exits.error4(determineTmpOutputPath);
      },
      "success": function(determineTmpOutputPath) {
        // Determine LESS src path
        require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
          "paths": [inputs.srcDir, "styles"]
        }).exec({
          "error": function(determineLESSSrcPath) {
            exits.error5(determineLESSSrcPath);
          },
          "success": function(determineLESSSrcPath) {
            // Determine JavaScript src path
            require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
              "paths": [inputs.srcDir, "js"]
            }).exec({
              "error": function(determineJavaScriptSrcPath) {
                exits.error6(determineJavaScriptSrcPath);
              },
              "success": function(determineJavaScriptSrcPath) {
                // Write README and package.json
                require('../index').writeReadmeAndPackageJson({
                  "srcDir": inputs.srcDir,
                  "outputDir": determineTmpOutputPath,
                  "prodPkgName": "somepack",
                  "prodPkgVersion": "1.0.0"
                }).exec({
                  "error": function(writeREADMEAndPackageJson) {
                    exits.error(writeREADMEAndPackageJson);
                  },
                  "success": function(writeREADMEAndPackageJson) {
                    // Write compiled JavaScript (if relevant)
                    require('../index').writeMinifiedJavascript({
                      "outputDir": determineTmpOutputPath,
                      "jsSrcDir": determineJavaScriptSrcPath
                    }).exec({
                      "error": function(writeCompiledJavaScriptIfRelevant) {
                        exits.error2(writeCompiledJavaScriptIfRelevant);
                      },
                      "success": function(writeCompiledJavaScriptIfRelevant) {
                        // Write compiled stylesheet (if relevant)
                        require('../index').writeCompiledStylesheetIfRelevant({
                          "outputDir": determineTmpOutputPath,
                          "lessSrcDir": determineLESSSrcPath
                        }).exec({
                          "error": function(writeCompiledStylesheetIfRelevant) {
                            exits.error3(writeCompiledStylesheetIfRelevant);
                          },
                          "success": function(writeCompiledStylesheetIfRelevant) {
                            exits.success(writeCompiledStylesheetIfRelevant);
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
