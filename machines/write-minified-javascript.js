module.exports = {


  friendlyName: 'Write compiled JavaScript (if relevant)',


  description: 'Bundle and write a minified JavaScript file to the output directory.',


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

    jsSrcDir: {
      friendlyName: 'JavaScript source directory',
      description: 'The directory where the JavaScript source files live.  It not specified as an absolute path, this will be resolved relative to the current working directory.',
      example: './my-projects/some-assets/js',
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
    inputs.jsSrcDir = path.resolve(inputs.jsSrcDir);
    inputs.outputDir = path.resolve(inputs.outputDir);

    // Minify JavaScript files.
    thisPack.minifyJavascriptAssets({
      dir: inputs.jsSrcDir,
    }).exec({
      error: exits.error,
      // If no JavaScript assets exist, that's ok, just trigger the success exit anyways.
      doesNotExist: function() {
        return exits.success();
      },
      success: function(js) {

        // Write the resulting JS file to disk.
        Filesystem.write({
          destination: path.resolve(inputs.outputDir, 'production.min.js'),
          string: js,
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