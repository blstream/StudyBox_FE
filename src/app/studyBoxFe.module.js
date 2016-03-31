(function() {
  'use strict';

  angular
    .module('studyBoxFe', [
      /* Angular modules */
      'ngAnimate',
      'ngCookies',
      'ngMaterial',
      'ngSanitize',
      'ngMessages',
      'ngAria',
      'ngFileUpload',

      /*3rd party modules*/
      'ui.router',
      'toastr',
      'pascalprecht.translate',

      /*team modules*/
      'translator',
      'backend',
      'registration',
      'deck',
      'navbar',
      'decks'
    ]);
})();
