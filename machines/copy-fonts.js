module.exports = {


  friendlyName: 'Copy fonts (if relevant)',


  description: 'Copy font files into the output directory.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: [],


  inputs: {

    fontsSrcPath: {
      friendlyName: 'Fonts source path',
      description: 'The path to the directory where font files should be copied from.',
      example: './foo/fonts',
      required: true,
    },

    outputDir: {
      friendlyName: 'Output directory',
      description: 'The path to the temporary directory where production assets are being compiled.',
      example: './foo/.tmp/processing',
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

    // Copy over fonts.
    Filesystem.cp({
      source: path.resolve(inputs.fontsSrcPath),
      destination: path.resolve(inputs.outputDir, 'fonts/'),
    }).exec({
      error: exits.error,
      doesNotExist: function() {
        // If there is no fonts folder, that's cool too-- just exit as "success".
        return exits.success();
      },
      success: function() {
        return exits.success();
      }
    }); //</copy fonts>

  },



};