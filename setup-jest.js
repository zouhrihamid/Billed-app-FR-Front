import $ from 'jquery';
global.$ = global.jQuery = $;


module.exports = {
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
  };