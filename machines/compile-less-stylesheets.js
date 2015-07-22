module.exports = {


  friendlyName: 'Compile LESS stylesheets',


  description: 'Compile a LESS importer file and all connected stylesheets into CSS (this is usually the single entry point for all LESS in the project)',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: [],


  inputs: {

    lessSrcDir: {
      friendlyName: 'LESS source directory',
      description: 'The source directory of LESS stylesheets with a single `importer.less` file which serves as the entry point.',
      example: './foo/styles',
      required: true,
    },

    minify: {
      friendlyName: 'Minify?',
      description: 'Whether or not the resulting CSS should be minified.',
      example: false,
      defaultsTo: false,
    },

  },


  exits: {

    error: {
      friendlyName: 'error',
      description: 'Unexpected error occurred.',
    },

    success: {
      friendlyName: 'then',
      description: 'Normal outcome.',
      example: '.button { width: 20px; }',
    },

    doesNotExist: {
      friendlyName: 'does not exist',
      description: 'Nothing exists at the provided LESS source directory path.',
      example: 'abc123',
    },

  },


  fn: function(inputs, exits, env) {
    // Resolve path to styles directory
    require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
      "paths": [inputs.lessSrcDir]
    }).exec({
      "error": function(resolvePathToStylesDirectory) {
        exits.error3(resolvePathToStylesDirectory);
      },
      "success": function(resolvePathToStylesDirectory) {
        // Resolve path to importer.less
        require('@treelinehq/treelinehq/machinepack-paths_1.2.0').resolve({
          "paths": [inputs.lessSrcDir, "importer.less"]
        }).exec({
          "error": function(resolvePathToImporterLess) {
            exits.error2(resolvePathToImporterLess);
          },
          "success": function(resolvePathToImporterLess) {
            // Compile stylesheet
            require('@treelinehq/treelinehq/machinepack-less_1.0.0').compileStylesheet({
              "source": resolvePathToImporterLess,
              "importPaths": [resolvePathToStylesDirectory],
              "minify": inputs.minify
            }).exec({
              "error": function(compileStylesheet) {
                exits.error(compileStylesheet);
              },
              "doesNotExist": function(compileStylesheet) {
                exits.doesNotExist(compileStylesheet);
              },
              "success": function(compileStylesheet) {
                exits.success(compileStylesheet);
              }
            });

          }
        });
      }
    });

  },



};