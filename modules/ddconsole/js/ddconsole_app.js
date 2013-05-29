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
  .controller('ListCtrl', ['$scope', '$location', '$routeParams', 'Repo', 'User', function ($scope, $location, $routeParams, Repo, User) {
    var self = this;
   
    Repo.query(function(repos) {

      //Add primary uri infos on the repos. To be moved on resource later.
      for(var i = 0; i < repos.length; i++) {
        if(repos[i].app != null) {
          repos[i].app.instances[0].primary_uri = repos[i].app.instances[0].uris[0];
          if(repos[i].app.instances[0].external_uris.length > 0) {
            repos[i].app.instances[0].primary_uri = repos[i].app.instances[0].external_uris[0];
          }
        }
      }

      $scope.repos = repos;
    });

    User.get({id: "me"}, function(user) {
      self.original = user;
      $scope.user = new User(self.original);
    });

  }])
  .controller('CreateFromRepoCtrl', ['$scope', '$location', '$routeParams', 'App', 'DDConsoleConfig', function ($scope, $location, $routeParams, App, DDConsoleConfig) {
    var self = this;
   
    $scope.repo_location = $routeParams.repo_org + "/" + $routeParams.repo_name;

    // Initiate basic App object
    $scope.app = new App();
    app_instance = { "uris": [] };
    $scope.app.instances = [];
    $scope.app.instances[0] = app_instance;

    $scope.app.repo = {
      provider: "github",
      location: $scope.repo_location
    }

    $scope.save = function() {
      App.save($scope.app, function(app) {
        $location.path('/');
      });
    }

  }])
  .controller('ViewCtrl', ['$scope', '$location', '$routeParams', 'App', 'Repo', 'DDConsoleConfig', function ($scope, $location, $routeParams, App, Repo, DDConsoleConfig) {
    var self = this;
   
    Repo.get({org: $routeParams.repo_org, name: $routeParams.repo_name}, function(repo) {
      self.original = repo;
      $scope.repo = new Repo(self.original);

      if($scope.repo.app == null) {
        $location.path($location.path() + "/host");
      }

      $scope.app = new App($scope.repo.app);
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
      new App(self.original.app).destroy(function() {
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
            // TODO: No Jquery here!
            $('#external-uri-help-modal').modal('show');
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