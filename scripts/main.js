var balance = 500;
var betAmount = 100;
var potValue = 0;
var cardNumValue = 0;


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
  $(".gameMessageText").text("SELECT YOUR BET");
  $(".amountInPlay").text("Amount Bet: $" + potValue);
  disableButton($(".hitButton"));
  disableButton($(".stayButton"));
  disableButton($(".doubleDownButton"));


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
    $(".gameMessageText").text("HIT, STAY, OR DOUBLE DOWN");
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

  function handleDoubleDownClick(){
    balance -= potValue;
    potValue *= 2;
    $(".amountInPlay").text("Amount Bet: $" + potValue);
    $(".balanceText").text("Current Balance: $" + balance);
    disableButton($(".hitButton"));
    disableButton($(".stayButton"));
    disableButton($(".doubleDownButton"));
    enableButton($(".betButton"));
  }

  $(window).load(function() {
    $(".betButton").click(function() {
      startNewHand();
      var playerHandValue = 0;
      var dealerHandValue = 0;
      var playerValuesArr = [];
      var dealerValuesArr = [];

      $.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", function(data) {
        var deckID = data["deck_id"]
        handleBetButton();

        function dealPlayerCards(cardsDealt) {
          for (var i = 0; i < cardsDealt.length; i++) {
            var cardValue = cardsDealt[i]["value"];
            var cardImage = cardsDealt[i]["image"];
            handleNewPlayerCardImage(cardImage);
            cardNumValue = values[cardValue];
            playerHandValue += cardNumValue;
            playerValuesArr.push(cardNumValue);
          }
        }

        function dealDealerCards(cardsDealt) {
          for (var i = 0; i < cardsDealt.length; i++) {
            var cardValue = cardsDealt[i]["value"];
            var cardImage = cardsDealt[i]["image"];
            handleNewDealerCardImage(cardImage);
            dealerValuesArr.push(cardNumValue);
          }
        }

        function handleNewPlayerCard() {
          for (var i = 0; i < playerValuesArr.length; i++) {
            if (playerHandValue > 21) {
              var aceIndex = playerValuesArr.lastIndexOf(11);
              if (aceIndex > -1) {
                playerValuesArr[aceIndex] = 1;
                playerHandValue -= 10;
              }
            }
            if (playerHandValue > 21) {
              $(".gameMessageText").text("BUST");
              disableButton($(".hitButton"));
              disableButton($(".stayButton"));
              disableButton($(".doubleDownButton"));
              enableButton($(".betButton"));
              $(".hitButton").unbind('click');
            }
          }
        }

        //Player
        $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=2", function(twoCards) {
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
          });
        })

        //Dealer
        $.get("https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1", function(dealerFirstCard) {
          var oneCardDrawn = dealerFirstCard["cards"];
          dealDealerCards(oneCardDrawn);
          createBackCardImage();
        })
      })
    });
  });


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


});
