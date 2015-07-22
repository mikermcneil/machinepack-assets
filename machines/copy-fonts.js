module.exports = {


  friendlyName: 'Copy fonts (if relevant)',


  description: 'Copy font files into the output directory.',


  extendedDescription: '',


  cacheable: false,


  sync: false,


  environment: ['req', 'res', 'sails'],


  inputs: {

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
    return exits.success();
  },



};