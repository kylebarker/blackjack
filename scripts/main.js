var balance = 500;
var betAmount = 100;
var potValue = 0;
var cardNumValue = 0;
var betAmount = 100;

var values = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "JACK": 10,
  "QUEEN": 10,
  "KING": 10,
  "ACE": 11
}

$(document).ready(function() {
  console.log("ready!");

  $(".balanceText").text("Current Balance: $" + balance);
  $(".betText").text("Bet Amount: $" + betAmount);
  $(".gameMessageText").text("Select Your Bet");
  $(".amountInPlay").text("Amount Bet: $" + potValue);
  $(".playerCardTotal").text("User Value: 0")
  $(".dealerCardTotal").text("Dealer Value: 0")
  disableButton($(".hitButton"));
  disableButton($(".stayButton"));
  disableButton($(".doubleDownButton"));

  $(".increaseBet").click(function() {
    if (betAmount < balance) {
      betAmount += 10;
      $(".betText").text("Bet Amount: $" + betAmount);
    }
  })

  $(".decreaseBet").click(function() {
    if (betAmount > 10) {
      betAmount -= 10;
      $(".betText").text("Bet Amount: $" + betAmount);
    }
  })


  function disableButton(theButton) {
    if (theButton[0].disabled === false) {
      theButton[0].disabled = true;
      theButton.css({
        "background-color": "grey",
        "color": "lightgrey",
        "cursor": "default"
      });
    }
  }

  function enableButton(theButton) {
    if (theButton[0].disabled === true) {
      theButton[0].disabled = false;
      theButton.css({
        "background-color": "#6EB43F",
        "color": "white",
        "cursor": "pointer"
      });

      theButton.hover(function() {
        $(this).css("background-color", "#3E8E41").mouseout(function() {
          $(this).css("background-color", "#6EB43F");
        });
      });
    }
  }

  function handleBetButton() {
    enableButton($(".hitButton"));
    enableButton($(".stayButton"));
    enableButton($(".doubleDownButton"));
    disableButton($(".betButton"));
    $(".gameMessageText").text("Hit, Stay, OR Double Down");
    potValue += betAmount;
    $(".amountInPlay").text("Amount Bet: $" + potValue);
    balance -= betAmount;
    $(".balanceText").text("Current Balance: $" + balance);
  }

  function handleNewPlayerCardImage(cardImage) {
    $('<img />').attr({
      'src': cardImage,
      'class': 'playerCard',
    }).appendTo('.playerCards');
  }

  function handleNewDealerCardImage(cardImage) {
    $('<img />').attr({
      'src': cardImage,
      'class': 'dealerCard',
    }).appendTo('.dealerCards');
  }

  function createBackCardImage() {
    $('<img />').attr({
      'src': "../images/backOfCard.jpg",
      'class': 'dealerCard',
      'id': 'dealerBackCard'
    }).appendTo('.dealerCards');
  }

  function handleBlackjack() {
    disableButton($(".hitButton"));
    disableButton($(".stayButton"));
    disableButton($(".doubleDownButton"));
    enableButton($(".betButton"));
    $(".gameMessageText").text("BLACKJACK!!!");
    balance += (1.1 * (potValue * 2));
    $(".balanceText").text("Current Balance: $" + balance);
    potValue = 0;
    $(".amountInPlay").text("Amount Bet: $" + potValue);
  }

  function startNewHand() {
    $(".playerCard").remove();
    $(".dealerCard").remove();
    potValue = 0;
    $(".amountInPlay").text("Amount Bet: $" + potValue);
    
  }

  function handleDoubleDownClick() {
    balance -= potValue;
    potValue *= 2;
    $(".amountInPlay").text("Amount Bet: $" + potValue);
    $(".balanceText").text("Current Balance: $" + balance);
    disableButton($(".hitButton"));
    disableButton($(".stayButton"));
    disableButton($(".doubleDownButton"));
    enableButton($(".betButton"));
  }



  // function isEndOfGame(){
  //   if(balance <= 0){
  //     $(".gameMessageText").text("You lost all your money, start again");
  //     balance = 500;
  //   }
  // }

  $(window).load(function() {
    $(".betButton").click(function() {
      startNewHand();
      var playerHandValue = 0;
      var dealerHandValue = 0;
      var playerValuesArr = [];
      var dealerValuesArr = [];

      function checkWin() {
        if (playerHandValue > 21) {
          $(".gameMessageText").text("BUST");
          disableButton($(".hitButton"));
          disableButton($(".stayButton"));
          disableButton($(".doubleDownButton"));
          enableButton($(".betButton"));
        } else if (dealerHandValue > playerHandValue && dealerHandValue < 22) {
          $(".gameMessageText").text("You Lose");
        } else if (dealerHandValue === playerHandValue){
          $(".gameMessageText").text("Push");
        } else if (dealerHandValue < playerHandValue && dealerHandValue > 16) {
          $(".gameMessageText").text("You Win!");
          balance += potValue;
          $(".balanceText").text("Current Balance: $" + balance);
        } else if (dealerHandValue > 21) {
          $(".gameMessageText").text("Dealer Bust. You Win!");
          balance += potValue;
          $(".balanceText").text("Current Balance: $" + balance);
        }
      }

      $.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", function(data) {
        $(".hitButton").unbind('click');
        $(".doubleDownButton").unbind('click');
        var deckID = data["deck_id"]
        handleBetButton();
        if (betAmount > balance) {
          $(".betText").text("Bet Amount: $" + balance);
        }

        function dealPlayerCards(cardsDealt) {
          for (var i = 0; i < cardsDealt.length; i++) {
            var cardValue = cardsDealt[i]["value"];
            var cardImage = cardsDealt[i]["image"];
            handleNewPlayerCardImage(cardImage);
            cardNumValue = values[cardValue];
            playerHandValue += cardNumValue;
            playerValuesArr.push(cardNumValue);
            $(".playerCardTotal").text("User Value: " + playerHandValue);
          }
        }

        function dealDealerCards(cardsDealt) {
          for (var i = 0; i < cardsDealt.length; i++) {
            var cardValue = cardsDealt[i]["value"];
            var cardImage = cardsDealt[i]["image"];
            handleNewDealerCardImage(cardImage);
            cardNumValue = values[cardValue];
            dealerHandValue += cardNumValue;
            dealerValuesArr.push(cardNumValue);
            $(".dealerCardTotal").text("Dealer Value: " + dealerHandValue);
          }
        }

        function handleNewPlayerCard() {
          for (var i = 0; i < playerValuesArr.length; i++) {
            if (playerHandValue > 21) {
              var aceIndex = playerValuesArr.lastIndexOf(11);
              if (aceIndex > -1) {
                playerValuesArr[aceIndex] = 1;
                playerHandValue -= 10;
                $(".playerCardTotal").text("User Value: " + playerHandValue);
              }
            }
            if (playerHandValue > 21) {
              $(".gameMessageText").text("BUST");
              disableButton($(".hitButton"));
              disableButton($(".stayButton"));
              disableButton($(".doubleDownButton"));
              enableButton($(".betButton"));
            }
          }
        }

        function handleNewDealerCard() {
          for (var i = 0; i < dealerValuesArr.length; i++) {
            if (dealerHandValue > 21) {
              var aceIndex = dealerValuesArr.lastIndexOf(11);
              if (aceIndex > -1) {
                dealerValuesArr[aceIndex] = 1;
                dealerHandValue -= 10;
                $(".dealerCardTotal").text("User Value: " + dealerHandValue);
              }
            }
            checkWin()
          }
        }



        $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=2", function(twoCards) {
          $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(dealerFirstCard) {
            var oneDealerCardDrawn = dealerFirstCard["cards"];
            dealDealerCards(oneDealerCardDrawn);
            createBackCardImage();
          })



          var twoCardsDrawn = twoCards["cards"];
          dealPlayerCards(twoCardsDrawn);

          for (var i = 0; i < playerValuesArr.length; i++) {
            if (playerHandValue === 22) {
              playerValuesArr[0] = 1;
              playerHandValue -= 10;
            } else if (playerHandValue === 21) {
              handleBlackjack();
            }
          }

          $(".hitButton").click(function() {
            $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(oneCard) {
              var oneCardDrawn = oneCard["cards"];
              disableButton($(".doubleDownButton"));
              $(".gameMessageText").text("HIT OR STAY");
              dealPlayerCards(oneCardDrawn);
              handleNewPlayerCard();
            });
          })

          $(".doubleDownButton").click(function() {
            $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(oneCard) {
              var doubleDownCard = oneCard["cards"];
              handleDoubleDownClick();
              dealPlayerCards(doubleDownCard);
              handleNewPlayerCard();
            });

            function giveDealerCards() {
              if (dealerHandValue < playerHandValue && dealerHandValue < 17) {
                $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(newDealerCard) {
                  $("#dealerBackCard").remove()
                  var oneDealerCardDrawn = newDealerCard["cards"];
                  dealDealerCards(oneDealerCardDrawn);
                  handleNewDealerCard();
                  giveDealerCards();
                });
              } else {
                checkWin();
              }
            }
            giveDealerCards();
          })

          $(".stayButton").click(function() {
            function giveDealerCards() {
              if (dealerHandValue < playerHandValue && dealerHandValue < 17) {
                $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(newDealerCard) {
                  $("#dealerBackCard").remove()
                  var oneDealerCardDrawn = newDealerCard["cards"];
                  dealDealerCards(oneDealerCardDrawn);
                  handleNewDealerCard();
                  giveDealerCards();
                });
              } else {
                checkWin();
              }
            }
            giveDealerCards();
          })

        })
      });
    });
  });
});
