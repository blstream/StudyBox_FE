(function () {
  'use strict';

  angular
    .module('deck')
    .controller('DeckEditController', DeckEditController);

  /** @ngInject */
  function DeckEditController($stateParams, $state, BackendService, $log, DeckService, $mdDialog, LoginHelperService, $translate) {
    var vm = this;
    vm.deckId = $stateParams.deckId;
    vm.selectedDeck = new BackendService.Deck();
    vm.deckDataChange = deckDataChange;
    vm.selectDeck = selectDeck;
    vm.editDeck = editDeck;
    vm.saveDeck = saveDeck;
    vm.selectCard = selectCard;
    vm.editCard = editCard;
    vm.removeCard = removeCard;
    vm.clear = clear;
    vm.emptyNameError = DeckService.getEmptyNameError();
    vm.access = $stateParams.access;

    if(!LoginHelperService.isLogged())
    {
      alert($translate.instant('authenticationWarning'));
      $state.go("login");
    }

    function deckDataChange(item) {
      if (item) return;
      if (vm.selectedDeck.name != vm.searchText) {
        vm.dataChanged = true;
      } else vm.dataChanged = vm.selectedDeck.isPublic != accessToBool(vm.deckAccess);
      if (vm.dataChanged){
        DeckService.setNewDeck({name: vm.searchText, access:vm.deckAccess});
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

    function saveDeck(){
      vm.selectedDeck.updateDeck(vm.searchText, vm.deckAccess)
        .then(function success() {
          $state.go("deck.addCard", {deckId: vm.selectedDeck.id});
          $state.reload("deck");
        },
        function error() {
          var message = 'I cant update Deck name';
          alert(message);
          throw message;
        })
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
            vm.dataChanged = false;
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
