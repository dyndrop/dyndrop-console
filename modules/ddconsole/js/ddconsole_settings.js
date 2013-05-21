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
  .controller('SettingsCardsCtrl', ['$scope', '$location', '$routeParams', 'UserCard', 'DDConsoleConfig', 'LoadingSrv', function ($scope, $location, $routeParams, UserCard, DDConsoleConfig, LoadingSrv) {
    var self = this;

    refresh_card_infos = function() {
      UserCard.query({user_id: "me"}, function(cards) {
        self.original = cards;

        $scope.cards = [];
        for(var i = 0; i < cards.length; i++) {
          $scope.cards.push(new UserCard(cards[i]));
        }
      });
    }
    refresh_card_infos();

    $scope.$on('userCardAdded', function(mass) {
      refresh_card_infos();
    });

    $scope.removeCard = function(card) {
      UserCard.delete({user_id: $scope.user.email, id: card.id}, {}, function() {
        refresh_card_infos();
      });
    }
  }])
  .controller('SettingsCardAddCtrl', ['$scope', '$location', '$routeParams', 'UserCard', 'DDConsoleConfig', 'LoadingSrv', function ($scope, $location, $routeParams, UserCard, DDConsoleConfig, LoadingSrv) {
    var self = this;


    $scope.paymill_token = {
      number: "",
      cvc: "",
      exp_year: new Date().getFullYear(),
      exp_month: new Date().getMonth() + 1
    };

    $scope.newCardIsInvalid = function() {
      //Checking Expiry (which is difficult with directive), and presence of number and cvc
      return (
        paymill.validateExpiry($scope.paymill_token.exp_month, $scope.paymill_token.exp_year) ==false || 
        $scope.paymill_token.number.length == 0 ||
        $scope.paymill_token.cvc.length == 0);
    }

    $scope.addCard = function () {
      //TODO: Later, move this DOM-altering bit of code
      $('.form-row-submit button').attr("disabled", "disabled");

      LoadingSrv.requestCount++;
      paymill.createToken($scope.paymill_token, 
        function(error, result) {
          LoadingSrv.requestCount--;
          if (error) {
            //Error string here: error.apierror
            //TODO: Later, move this DOM-altering bit of code
            $('.form-row-submit button').removeAttr("disabled");
          } 
          else {
            var token = result.token;

            var card = {
              paymill_token: token
            }
            UserCard.save({user_id: "me"}, card, function(card) {
              //TODO: Later, move this DOM-altering bit of code
              $('.form-row-submit button').removeAttr("disabled");
              $scope.paymill_token.number = "";
              $scope.paymill_token.cvc = "";
              $scope.paymill_token.exp_year = new Date().getFullYear();
              $scope.paymill_token.exp_month = new Date().getMonth() + 1;

              $scope.$emit('userCardAdded');
            });
          }
      });
    }

  }]);


  })(jQuery);