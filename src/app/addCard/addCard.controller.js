(function() {
  'use strict';

  angular
    .module('studyBoxFe')
    .controller('AddCardController', AddCardController);


  /** @ngInject */
  function AddCardController($stateParams, $state, $document, BackendService, DeckService) {
    var vm = this;
    vm.deckId = $stateParams.deckId;
    vm.cardId = $stateParams.cardId;

    vm.decks = null;
    vm.load = false;

    if (vm.cardId){
      vm.card = DeckService.getCardObj();
      if (vm.card){
        vm.question = vm.card.question;
        vm.answer = vm.card.answer;
        vm.editMode=true
      }
    }

    vm.toggleStatus = false;

    vm.toggleButton = function ()
    {
      if(vm.toggleStatus === false)
        angular.element($document[0].querySelector('#hint')).css("display", "block");
      else
        angular.element($document[0].querySelector('#hint')).css("display", "none");

      vm.toggleStatus = !vm.toggleStatus;
    };

    vm.submitCard = function ()
    {
      //alert('deckName: '+vm.deckName+'\n'+'deckId: ('+$stateParams.deckId+')\n'+'cardId: '+$stateParams.cardId+'\n'+'vm.question: '+vm.question+'\n'+'vm.answer: '+vm.answer);
      //Jeżeli pola nie są puste
      if(angular.isDefined(vm.question) && angular.isDefined(vm.answer))
      {
        if($stateParams.cardId)
        {
          //Edycja
          BackendService.getDeckById($stateParams.deckId)
            .then(function success(data) {
              vm.newDeck = data;

              vm.newDeck.updateFlashcard($stateParams.cardId, vm.question, vm.answer)
                .then(function success() {
                  //alert("Zedytowano fiszkę");
                  DeckService.setCardObj(vm.card);
                  $state.go("deck", {deckId: vm.newDeck.id});
                  $state.reload()
                },
                function error(){
                  var message = 'I cant update a flash card';
                  alert(message);
                  throw message;
                });
            },
            function error(){
              var message = 'I cant create new deck';
              alert(message);
              throw message;
            });
        }
        else
        {
          if($stateParams.deckId)
          {
            //alert('im here');
            BackendService.getDeckById($stateParams.deckId)
              .then(function success(data) {
                vm.newDeck = data;

                vm.newDeck.createFlashcard(vm.question, vm.answer)
                  .then(function success() {
                    //alert("Dodano nową fiszkę do aktualnej talii");
                    $state.go("deck.addCard", {deckId: vm.newDeck.id});
                    $state.reload("deck");
                  },
                  function error(){
                    var message = 'I cant create a flash card';
                    alert(message);
                    throw message;
                  });
              },
              function error(){
                var message = 'I cant create new deck';
                alert(message);
                throw message;
              });
          }
          else
          {
            BackendService.createNewDeck(DeckService.getDeckObj().name)
              .then(function success(data) {
                vm.newDeck = data;

                vm.newDeck.createFlashcard(vm.question, vm.answer)
                  .then(function success() {
                    //alert("Dodano nową fiszkę do nowej talii");
                    $state.go("deck.addCard", {deckId: vm.newDeck.id});
                  },
                  function error(){
                    var message = 'I cant create a flash card';
                    alert(message);
                    throw message;
                  });
              },
              function error(){
                var message = 'I cant create new deck';
                alert(message);
                throw message;
              });
          }
        }
      }

    }
  }

})();
