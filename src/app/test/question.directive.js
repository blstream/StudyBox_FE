(function() {
  'use strict';

  angular
    .module('test')
    .directive('question', QuestionDirective);

  /** @ngInject */
  function QuestionDirective() {
    return {
      restrict: 'E',
      templateUrl: 'app/test/question.html'
    };
  }

})();
