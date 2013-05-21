(function ($) {

angular.module('ddconsole.settings', ['ddconsole.resource'])
  .factory('DDConsoleConfig', function () {
    return Drupal.settings.dyndrop_console;
  })
  .controller('SettingsCtrl', ['$scope', '$location', '$routeParams', 'User', 'DDConsoleConfig', function ($scope, $location, $routeParams, User, DDConsoleConfig) {
    var self = this;

    $scope.setComponent = function(val) {
      $scope.component = val;
    }
    $scope.component = 'settings-profile';
   
    User.get({id: "me"}, function(user) {
      self.original = user;
      $scope.user = new User(self.original);
    });

    $scope.angular_templates_path = DDConsoleConfig.angular_templates;

  }])
  .controller('SettingsCardsCtrl', ['$scope', '$location', '$routeParams', 'UserCard', 'DDConsoleConfig', function ($scope, $location, $routeParams, UserCard, DDConsoleConfig) {
    var self = this;

    var refresh_card_infos = function() {
      UserCard.query({user_id: "me"}, function(cards) {
        self.original = cards;

        $scope.cards = [];
        for(var i = 0; i < cards.length; i++) {
          $scope.cards.push(new UserCard(cards[i]));
        }
      });
    }
    refresh_card_infos();

    $scope.paymill_token = {};
    $scope.addCard = function () {
      $('.submit-button').attr("disabled", "disabled");
      paymill_token = $scope.paymill_token;
      paymill.createToken(paymill_token, 
        function(error, result) {
          if (error) {
            // Shows the errors
            $(".payment-errors").text(error.apierror);
            $(".submit-button").removeAttr("disabled");
          } 
          else {
            var token = result.token;

            var card = {
              paymill_token: token
            }
            UserCard.save({user_id: $scope.user.email}, card, function(card) {
              $(".submit-button").removeAttr("disabled");
              refresh_card_infos();
            });
          }
      });
    }

    $scope.removeCard = function(card) {
      UserCard.delete({user_id: $scope.user.email, id: card.id}, {}, function() {
        refresh_card_infos();
      });
    }


  }]);

  })(jQuery);