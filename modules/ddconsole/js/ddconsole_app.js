(function ($) {

angular.module('ddconsole.app', ['ddconsole.resource'])
  .directive('navlist',function() {
    return function(scope, elm, attrs) {
      $(".active",elm).append('<div class="arrow-left"></div>');
      scope.setActive = function(evt)
      {
        $(".arrow-left",elm).remove();
        $(".active",elm).removeClass("active");
        angular.element(evt.currentTarget).addClass("active");
        $(".active",elm).append('<div class="arrow-left"></div>');
      }

    };
  })
  .controller('ViewCtrl', ['$scope', '$location', '$routeParams', 'App', 'DDConsoleConfig', function ($scope, $location, $routeParams, App, DDConsoleConfig) {
    var self = this;
   
    App.get({id: $routeParams.appName}, function(app) {
      self.original = app;
      $scope.app = new App(self.original);
    });

    $scope.setComponent = function(val) {
      $scope.component = val;
    }
    $scope.component = 'production-overview';

    $scope.update = function() {
      $scope.app.update(function() {
        //success
      });
    }

    $scope.destroy = function() {
      self.original.destroy(function() {
        $location.path('/list');
      });
    }

    $scope.angular_templates_path = DDConsoleConfig.angular_templates;

  }])
.controller('ViewProductionDomainsCtrl', ['$scope', '$location', '$routeParams', 'App', 'DDConsoleConfig', function ($scope, $location, $routeParams, App, DDConsoleConfig) {
    var self = this;

    var dns_check = function() {
      $scope.app.dns_check(function(data) {
          $scope.dns_checks = [];
          for(var i = 0; i < data.length; i++) {
            $scope.dns_checks[data[i].uri] = data[i].check;
          }
        });
    }

    $scope.addExternalUri = function () {
      if($scope.new_external_uri != undefined) {
        var new_external_uri = $scope.new_external_uri;
        $scope.new_external_uri = '';
        $scope.app.instances[0].external_uris.push(new_external_uri);
        $scope.app.update(function() {
            dns_check();
          }, 
          function() {
            var index = $.inArray(new_external_uri, $scope.app.instances[0].external_uris);
            if(index >= 0) {
              $scope.app.instances[0].external_uris.splice(index);
            }
        });
      }
    }

    $scope.removeExternalUri = function(uri) {
      var index = $scope.app.instances[0].external_uris.indexOf(uri);
      if(index >= 0) {
        $scope.app.instances[0].external_uris.splice(index, 1);
        $scope.app.update();
      }
    }

    $scope.$watch('app', function(newValue, oldValue) {
      if(newValue != undefined) {
        dns_check();
      }
    });
    

  }])
  .controller('ViewConfigureProjectCtrl', ['$scope', '$location', '$routeParams', 'App', 'DDConsoleConfig', 'UserCard', function ($scope, $location, $routeParams, App, DDConsoleConfig, UserCard) {
    var self = this;

    var plan_register = function(plan_name) {
      //Register to the plan
      $scope.app.update_plan({
          name: plan_name
        }, function() {
          // Success
           $scope.app.plan = plan_name;
        });
    }

    $scope.updatePlan = function(plan_name) {
      //Check that the user have a credit card
      UserCard.query({user_id: "me"}, function(cards) {
        if(cards.length == 0 && plan_name != "free") {
          //Show the card-adding popup
          $scope.plan_being_chosen = plan_name;
          $('#add-card-modal').modal('show');
        }
        else {
          plan_register(plan_name);
        }
      });
    }

    $scope.$on('userCardAdded', function(mass) {
      $('#add-card-modal').modal('hide');
      plan_register($scope.plan_being_chosen);
    });

  }]);





})(jQuery);