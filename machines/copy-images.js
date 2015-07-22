module.exports = {


  friendlyName: 'Copy images (if relevant)',


  description: 'Copy image files into the output directory.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: [],


  inputs: {

    imgSrcPath: {
      friendlyName: 'Images source path',
      description: 'The directory where the source image files live.  It not specified as an absolute path, this will be resolved relative to the current working directory.',
      example: './foo/images',
      required: true,
    },

    outputDir: {
      friendlyName: 'Output directory',
      description: 'The path to the temporary directory where production assets are being compiled.',
      example: './my-projects/some-assets/.tmp/processing',
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

    // Copy over images.
    Filesystem.cp({
      source: path.resolve(inputs.imgSrcPath),
      destination: path.resolve(inputs.outputDir, 'images/'),
    }).exec({
      error: exits.error,
      doesNotExist: function() {
        // If there is no images folder, that's cool too-- just exit as "success".
        return exits.success();
      },
      success: function() {
        return exits.success();
      }
    }); //</copy images>

  },



};