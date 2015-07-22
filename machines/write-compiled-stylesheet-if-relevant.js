module.exports = {


  friendlyName: 'Write compiled stylesheet (if relevant)',


  description: 'Bundle and write a minified CSS file to the output directory.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: [],


  inputs: {

    outputDir: {
      friendlyName: 'Output directory',
      description: 'The path to the temporary directory where production assets are being compiled.',
      example: './my-projects/some-assets/.tmp/processing',
      required: true,
    },

    lessSrcDir: {
      friendlyName: 'LESS source directory',
      description: 'The path to the source directory containing LESS stylesheets; including the entry point (i.e. importer.less).  It not specified as an absolute path, this will be resolved relative to the current working directory.',
      example: './foo/styles/',
      required: true,
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
      void: true,
    },

  },


  fn: function(inputs, exits, env) {
    var path = require('path');
    var Filesystem = require('@treelinehq/treelinehq/machinepack-fs');
    var thisPack = require('../');

    // Ensure provided paths are absolute.
    inputs.lessEntryPoint = path.resolve(inputs.lessSrcDir);
    inputs.outputDir = path.resolve(inputs.outputDir);

    // Minify LESS files.
    thisPack.compileLessStylesheets({
      lessSrcDir: inputs.lessSrcDir,
      minify: true
    }).exec({
      error: exits.error,
      // If no LESS assets exist, that's ok, just trigger the success exit anyways.
      doesNotExist: function() {
        return exits.success();
      },
      success: function(css) {

        // Write the resulting JS file to disk.
        Filesystem.write({
          destination: path.resolve(inputs.outputDir, 'production.min.css'),
          string: css,
          force: true
        }).exec({
          error: exits.error,
          success: function() {
            return exits.success();
          }
        });
      }
    });

  },



};