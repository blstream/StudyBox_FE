(function() {
  'use strict';

  angular
    .module('studyBoxFe')
    .controller('AddCardController', AddCardController);


  /** @ngInject */
  function AddCardController($stateParams, $state, BackendService, DeckService, $log, $translate) {
    var vm = this;
    vm.deckId = $stateParams.deckId;
    vm.cardId = $stateParams.cardId;
    vm.deck = DeckService.getDeckObj();
    vm.submitCard = submitCard;
    vm.decks = null;
    vm.load = false;
    vm.toggleStatus = false;
    vm.trimInput = trimInput;
    vm.pasteChecker = pasteChecker;
    vm.hints = [];
    vm.addHint = addHint;
    vm.removeHint = removeHint;
    vm.addHintTranslate = $translate.instant("addCard-HINT");
    vm.maxHintCount = 5;
    vm.trimString = trimString;
    vm.isHidden = false;

    if (vm.cardId){
      vm.card = DeckService.getCardObj();
      if (vm.card){
        vm.question = vm.card.question;
        vm.answer = vm.card.answer;
        vm.editMode=true;
        vm.isHidden = vm.card.isHidden;
      }
    }

    function trimInput(field){
      if(vm.paste){
        if(vm.questionFocus){
          field.question = field.question.substring(0, 1000);
        }
        else if(vm.answerFocus){
          field.answer = field.answer.substring(0, 1000);
        }
        vm.paste = false;
      }
    }

    function pasteChecker(){
        vm.paste = true;
    }

    function trimString(str) {
      return str.replace(/^\s+|\s+$/g, '');
    }

    function addHint(){
      if(vm.hints.length < vm.maxHintCount){
        vm.hintNumber = vm.hints.length + 1;
        vm.hints.push({'id':'id' + vm.hintNumber});
        vm.addHintTranslate = $translate.instant("addCard-ANOTHER_HINT");
      }
    }

    function removeHint(index){
      vm.hints.splice(index, 1);
      if(vm.hints.length == 0)
        vm.addHintTranslate = $translate.instant("addCard-HINT");
    }

    function submitCard(isValid) {
      //gdy formularz nie przechodzi walidacji
      if(!isValid) return;
      if(!vm.answer || vm.answer.length > 1000) return;
      if(!vm.question || vm.question.length > 1000) return;

      //ucina spacje przed i za
      vm.question = trimString(vm.question);
      vm.answer = trimString(vm.answer);

      vm.newDeck = DeckService.getNewDeck();

      //sprawdzenie nazwy talii
      if (!vm.newDeck) {
        $log.warn("pusta nazwa talii");
        DeckService.setEmptyNameError(true);
        return $state.reload()
      }
      //sprawdzenie zmiany nazwy talii
      if (vm.deck && vm.newDeck.name != vm.deck.name) {
        $log.warn("zmieniono nazwe talii");
        var nameChange = true;
      }
      //Jeżeli pola nie są puste
      var cardInDeck;
        if($stateParams.cardId) {
          cardInDeck = editFlashCard()
        } else {
          if($stateParams.deckId) {
            cardInDeck = createFlashCard()
          } else {
            cardInDeck = createDeckWithFlashCard()
          }
        }
      //update deck name
      if (nameChange) {
        cardInDeck
          .then(function success() {
            return vm.deck.updateDeck(vm.newDeck.name, vm.newDeck.access)
          },
          function error() {
            var message = 'I cant create/update card';
            alert(message);
            throw message;
          })
          .then(function success() {
            $state.go("deck.addCard", {deckId: vm.deck.id});
            $state.reload("deck");
          },
          function error() {
            var message = 'I cant update Deck name';
            alert(message);
            throw message;
          })
      }

    }

    function editFlashCard(){
      return BackendService.getDeckById($stateParams.deckId)
        .then(function success(data) {
          vm.deck = data;
          return vm.deck.updateFlashcard($stateParams.cardId, vm.question, vm.answer, vm.isHidden)
        },
        function error(){
          var message = 'I cant get deck';
          alert(message);
          throw message;
        })
        .then(function success() {
          DeckService.setCardObj(vm.card);
          setCardToService();
          $state.go("deck.addCard", {deckId: vm.deck.id, cardId: null});
          $state.reload();
        },
        function error(){
          var message = 'I cant update a flash card';
          alert(message);
          throw message;
        });
    }

    function createFlashCard(){
      return BackendService.getDeckById($stateParams.deckId)
        .then(function success(data) {
          vm.deck = data;
          return vm.deck.createFlashcard(vm.question, vm.answer, vm.isHidden)
        },
        function error(){
          var message = 'I cant get deck';
          alert(message);
          throw message;
        })
        .then(function success() {
          setCardToService();
          $state.go("deck.addCard", {deckId: vm.deck.id});
          $state.reload("deck");
        },
        function error(){
          var message = 'I cant create a flash card';
          alert(message);
          throw message;
        });
    }

    function createDeckWithFlashCard(){
      return BackendService.createNewDeck(vm.newDeck.name, vm.newDeck.access)
        .then(function success(data) {
          vm.deck = data;
          return vm.deck.createFlashcard(vm.question, vm.answer, vm.isHidden)
        },
        function error(){
          var message = 'I cant create new deck';
          alert(message);
          throw message;
        })
        .then(function success() {
          $state.go("deck.addCard", {deckId: vm.deck.id, cardId: null});
        },
        function error(){
          var message = 'I cant create a flash card';
          alert(message);
          throw message;
        });
    }

    function setCardToService(){
      var card = {
        id: $stateParams.cardId,
        question: vm.question,
        answer: vm.answer,
        isHidden: vm.isHidden
      };
      DeckService.setCardObj(card);
    }

  }

})();
