(function () {
  'use strict';

  angular
    .module('deck')
    .controller('DeckEditController', DeckEditController);

  /** @ngInject */
  function DeckEditController($stateParams, $state, BackendService, $log, DeckService, $mdDialog, $translate, $mdConstant) {
    var vm = this;
    vm.deckId = $stateParams.deckId;
    vm.selectedDeck = new BackendService.Deck();
    vm.deckNameChange = deckNameChange;
    vm.deckAccessChange = deckAccessChange;
    vm.selectDeck = selectDeck;
    vm.editDeck = editDeck;
    vm.saveDeck = saveDeck;
    vm.selectCard = selectCard;
    vm.editCard = editCard;
    vm.removeCard = removeCard;
    vm.clear = clear;
    vm.emptyNameError = DeckService.getEmptyNameError();
    vm.access = $stateParams.access;
    vm.changeVisibility = changeVisibility;
    vm.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
    vm.tags = [];


    function changeVisibility(card){
      return BackendService.getDeckById($stateParams.deckId)
        .then(function success(data) {
          vm.deck = data;
          return vm.deck.updateFlashcard(card.id, card.question, card.answer, !card.isHidden)
        },
        function error(){
          var message = 'I cant get deck';
          alert(message);
          throw message;
        })
        .then(function change(){
          card.isHidden = !card.isHidden;
        })
    }

    function deckNameChange(item) {
      if (item) return;
      if (!vm.selectedDeck){
        DeckService.setNewDeck({name: vm.searchText, access:accessToBool(vm.deckAccess)});
        return;
      }
      vm.nameChanged = vm.selectedDeck.name != vm.searchText;
    }

    function deckAccessChange() {
      var access= !accessToBool(vm.deckAccess);
      if (!vm.selectedDeck){
        DeckService.setNewDeck({name: vm.searchText, access:access});
      } else {
        saveDeck(vm.selectedDeck.name, access);
      }
    }

    function accessToBool(access){
      return access === 'public';
    }

    function createDeck(){
      $state.go("deck.addCard", {deckId:null , cardId: null});
    }


    function editDeck(){
      $state.go("deck.addCard", {deckId:vm.selectedDeck.id , cardId: null});
    }

    function selectDeck(deck) {
      if (deck) {
        DeckService.setDeckObj(deck);
        if (deck.id && deck.id != $stateParams.deckId) {
          $stateParams.deckId = deck.id;
          $stateParams.cardId = null;
          $state.go($state.current, {deckId: deck.id}, {notify: false});
          initDeck(deck.id);
        }
        else if (!deck.id) {
          createDeck();
        }
      }
    }

    function saveDeck(name, access){
      if (angular.isUndefined(access)){
        access = accessToBool(vm.deckAccess);
      }
      vm.selectedDeck.updateDeck(name, access)
        .then(function success() {
          $state.go("deck.addCard", {deckId: vm.selectedDeck.id});
          $state.reload("deck");
        },
        function error() {
          var message = 'I cant update Deck name';
          alert(message);
          throw message;
        });
    }

    function selectCard(card) {
      DeckService.setCardObj(card);
      //for selecting on ui (ng-repeat)
      if(card.id !=vm.selectedCardId) {
        pickUpCard(card.id);
        $state.go($state.current, {cardId: card.id}, {notify:true});
      } else {
        pickUpCard(false);
        $state.go($state.current, {cardId: null}, {notify:true});
      }
    }

    function pickUpCard(cardId) {
      vm.selectedCardId = cardId;
    }

    function editCard(card){
      DeckService.setCardObj(card);
      $state.go("deck.addCard", {deckId: vm.selectedDeck.id , cardId: card.id});
    }

    function removeCard(cardId){
      deleteCardDialog(cardId, vm.cards.length );
    }

    //LOCAL FUNCTIONS
    function clear() {
      vm.searchText = null;
    }

    function getCards() {
      vm.selectedDeck.getFlashcards()
        .then(function (result) {
          vm.cards = result;
        }, function (e) {
          $log.error(e);
        });
    }

    //init current deck
    function initDeck(value) {
      if(value){
        BackendService.getDeckById(value)
          .then(function (result) {
            vm.selectedDeck = result;
            vm.selectedItem = vm.selectedDeck;
            if (result.isPublic){
              vm.deckAccess = 'public';
            } else {
              vm.deckAccess = 'private';
            }
            vm.searchText = vm.selectDeck.name;
            DeckService.setNewDeck({name: vm.selectedDeck.name, access: vm.deckAccess});
            getCards();
            vm.nameChanged = false;
          }, function (e) {
            $log.error(e);
          });
      } else {
        vm.selectedDeck = DeckService.getDeckObj();
        DeckService.setDeckObj(null);
        vm.selectedItem = vm.selectedDeck;
        vm.deckAccess = 'private';
        vm.dataChanged = false;
      }
      pickUpCard($stateParams.cardId);
    }
    initDeck($stateParams.deckId);

    //DELETE CARD DIALOG
    function deleteCardDialog(cardId, cardNo) {
      var content = $translate.instant("deck-REMOVE_CARD_MODAL");
      //info for last card
      if (cardNo < 2) {
        content = ($translate.instant("deck-REMOVE_LAST_CARD_MODAL"));
      }
      var confirm = $mdDialog.confirm()
        .title($translate.instant("deck-REMOVE_CARD"))
        .textContent(content)
        .ok($translate.instant("deck-REMOVE_CARD"))
        .cancel($translate.instant("deck-NO"));
        $mdDialog.show(confirm)
          .then(function () {
              //delete card
            vm.selectedDeck.removeFlashcard(cardId)
              .then(function (result) {
                //delete deck if last card
                if (cardNo < 2) {
                  $log.warn('last one flashcard');
                  vm.selectedDeck.remove().then(function () {
                    $state.go('decks');
                  });
                } else {
                  $state.go("deck.addCard", {deckId: vm.selectedDeck.id, cardId: null});
                  getCards();
                  $log.log(result);
                }
              }, function (e) {
                $log.error(e);
              });
          }
          , function () {
            $log.log('do nothing')
          }
        )
    }
  }
})();
