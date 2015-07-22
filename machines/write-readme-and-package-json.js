module.exports = {


  friendlyName: 'Write README and package.json',


  description: 'Write README.md and package.json files for a production asset package.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: [],


  inputs: {

    srcDir: {
      friendlyName: 'Source directory',
      description: 'The directory where the development source lives.  It not specified as an absolute path, this will be resolved relative to the current working directory.',
      example: './my-projects/some-assets/',
      required: true,
    },

    outputDir: {
      friendlyName: 'Output directory',
      description: 'The output directory where the production assets will be temporarily written.  It not specified as an absolute path, this will be resolved relative to the current working directory.',
      example: './my-projects/some-assets/.tmp/processing',
      required: true,
    },

    prodPkgName: {
      friendlyName: 'Production package name',
      description: 'The name for the production package (i.e. `npm install XXXXX`)',
      example: '@automatic/socket.io-client',
      required: true,
    },

    prodPkgDescription: {
      friendlyName: 'Production package description',
      description: 'Description for the production package to include in the package.json file and the README.',
      example: 'This package contains the production-compressed release of an asset package (i.e. shared LESS stylesheets, client-side JavaScript files, fonts, and/or images).',
      defaultsTo: 'This package contains the production-compressed release of an asset package (i.e. shared LESS stylesheets, client-side JavaScript files, fonts, and/or images).',
    },

    prodPkgVersion: {
      friendlyName: 'Production package version',
      description: 'The NPM version for the production package (will be included in the package.json file).',
      example: '1.0.5',
      required: true,
    },

    author: {
      friendlyName: 'Author',
      description: 'The package author.',
      example: 'Automatic',
      defaultsTo: '',
    },

    copyright: {
      friendlyName: 'Copyright',
      description: 'The copyright string for the package.  If left unspecified, will attempt to generate a copyright string from the "author".',
      example: 'Copyright &copy; 2015, Guillermo Rauch',
      defaultsTo: '',
    },

    license: {
      friendlyName: 'License',
      description: 'The license string for this package.',
      example: 'MIT',
      defaultsTo: '',
    },

    homepageUrl: {
      friendlyName: 'Homepage URL',
      description: 'The homepage URL for this package.',
      example: 'http://socket.io',
      defaultsTo: '',
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

    // Resolve paths to source and working directory.
    inputs.srcDir = path.resolve(inputs.srcDir);
    inputs.workingDir = inputs.workingDir ? path.resolve(inputs.workingDir) : path.resolve(inputs.srcDir, '.tmp/processing');

    inputs.prodPkgDescription = inputs.prodPkgDescription || 'This package contains the production-compressed release of an asset package (i.e. shared LESS stylesheets, client-side JavaScript files, fonts, and/or images).';
    inputs.author = inputs.author || '';
    inputs.license = inputs.license || '';
    if (!inputs.copyright && inputs.author) {
      inputs.copyright = 'Copyright &copy; 2015, ' + inputs.author;
    }

    Filesystem.write({
      destination: path.resolve(inputs.workingDir, 'README.md'),
      string: '# ' + inputs.prodPkgName + '\n\n' + (inputs.prodPkgDescription ? inputs.prodPkgDescription + '\n\n' : '') + (inputs.license ? inputs.license + '\n' : '') + (inputs.copyright),
      force: true
    }).exec({
      error: exits.error,
      success: function() {

        Filesystem.writeJson({
          json: {
            "name": inputs.prodPkgName,
            "version": inputs.prodPkgVersion,
            "description": inputs.prodPkgDescription,
            "dependencies": {},
            "author": inputs.author,
            "license": inputs.license,
            "homepage": inputs.homepageUrl,
          },
          destination: path.resolve(inputs.workingDir, 'package.json'),
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