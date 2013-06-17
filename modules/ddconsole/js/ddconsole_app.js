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

    $scope.repo_is_supported = function(repo) {
      var language = repo.provider_data.language;
      return (language == "PHP" || language == "JavaScript" || language == undefined);
    }

  }])
  .controller('CreateCtrl', ['$scope', '$location', '$routeParams', 'App', 'Repo', 'GitHubApi', 'LoadingSrv', function ($scope, $location, $routeParams, App, Repo, GitHubApi, LoadingSrv) {
    var self = this;

    $scope.free_plan_available = function() {
      var free_plan_count = 0;
      if($scope.repos != undefined) {
        for(var i = 0; i < $scope.repos.length; i++) {
          if($scope.repos[i].app != undefined && $scope.repos[i].app.plan == "free") {
            free_plan_count++;
          }
        }
      }
      return free_plan_count < 1;
    }

    $scope.repo_location = $routeParams.repo_org + "/" + $routeParams.repo_name;

    // Initiate basic App object
    $scope.app = new App();
    $scope.app.label = $routeParams.repo_name;
    $scope.$watch('repos', function() {
      $scope.app.plan = $scope.free_plan_available() ? "free" : "small";
    });

    app_instance = { "uris": [] };
    $scope.app.instances = [];
    $scope.app.instances[0] = app_instance;

    $scope.app.repo = {
      provider: "github",
      location: $scope.repo_location
    }

    var create = function() {
      // Switch between the "Create and host new" and "Host existing repo"
      if($scope.repo_template != undefined && $scope.repo_template != null) {
        create_repo(function() {
          create_application();
        });
      }
      else {
        create_application();
      }
    }

    var create_repo = function(cb) {
      var new_repo_name = $scope.app.instances[0].uris[0].split(".")[0].replace(/[^0-9a-z\-]/g, "");

      var new_repo = {
        name: new_repo_name,
        template: $scope.repo_template
      };
      Repo.save(new_repo, function(result) {
        $scope.app.label = new_repo_name;
        $scope.app.repo.location = result.location;
        cb();  
      });

      // GitHubApi.get('/repos/' + $scope.user.name + '/' + new_repo_name, function() {
      //   LoadingSrv.errorMessages.push("A GitHub repository named \"" + new_repo_name + "\" already exists.");
      // }, function() {
      //   GitHubApi.post('/repos/' + $scope.fork_project + '/forks', {}, function(data) {
      //     console.log("Repository being forked. Waiting for fork completion.");
      //     var repo_name = data.full_name;

      //     var cur_time = new Date().getTime();
      //     var repo_data = null;
      //     var check_completion = function(cb) {
      //       GitHubApi.get('/repos/' + repo_name, function(data) {
      //         console.log("Repository is forked.")
      //         repo_data = data;
      //         cb();
      //       },
      //       function(data) {
      //         //Try for 30s
      //         if(new Date().getTime() < cur_time + 30000) {
      //           console.log("Waiting...")
      //           setTimeout(check_completion, 2000);
      //         }
      //         else {
      //           console.log("Waited 30s to have repository forked. Probably failed.")
      //           LoadingSrv.errorMessages.push("A GitHub repository failed to be created");
      //         }
      //       });
      //     }
      //     check_completion(function() {
      //       //Let's rename the repo
      //       patch_data = {
      //         name: new_repo_name
      //       }
      //       GitHubApi.patch('/repos/' + repo_data.full_name, patch_data, function(result) {
      //         console.log("Repository renamed to " + result.full_name);
      //         $scope.app.label = new_repo_name;
      //         $scope.app.repo.location = result.full_name;
      //         cb();
      //       }, function(result) {
      //         console.log("Failed to rename repository");
      //         LoadingSrv.errorMessages.push("Failed to rename the GitHub repository we forked.");
      //       })
      //     });
            
      //   }, function(data) {
      //     console.log("Failed to fork repository \"" + $scope.fork_project + "\"");
      //     LoadingSrv.errorMessages.push("A GitHub repository failed to be created");
      //     console.log(data);
      //   });
      // });
    }

    var create_application = function() {
      App.save($scope.app, function(app) {
        $scope.reload_repos();
        $location.path('/');
      });
    }

    $scope.save = function(plan_name) {
      // Using a non-free plan and no registered cards? Show the card-adding popup
      if($scope.cards.length == 0 && $scope.app.plan != "free") {
        $('#add-card-modal').modal('show');
      }
      else {
        create();
      }
    }

    $scope.$on('userCardAdded', function(mass) {
      $('#add-card-modal').modal('hide');
      create();
    });

  }])
  .controller('ViewCtrl', ['$scope', '$location', '$routeParams', 'App', 'Repo', 'DDConsoleConfig', function ($scope, $location, $routeParams, App, Repo, DDConsoleConfig) {
    var self = this;

    //Get and load the repo object   
    $scope.$watch('repos', function() {
      var repo_location = $routeParams.repo_org + "/" + $routeParams.repo_name;
      if($scope.repos != undefined) {

        for(var i = 0; i < $scope.repos.length; i++) {
          if($scope.repos[i].location == repo_location) {
            $scope.repo = $scope.repos[i];
          }
        }
        if($scope.repo == undefined) {
          $location.path("/");
          return;
        }
        if($scope.repo.app == null) {
          $location.path($location.path() + "/host");
        }
        $scope.app = new App($scope.repo.app);
      }
    });

    $scope.setComponent = function(val) {
      $scope.component = val;
    }
    $scope.component = 'production-overview';

    $scope.update = function() {
      $scope.app.update(function() {
        $scope.reload_repos();
      });
    }

    $scope.destroy = function() {
      $scope.app.destroy(function() {
        $scope.reload_repos();
        $location.path('/list');
      });
    }

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
            $scope.reload_repos();
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
        $scope.app.update(function() {
          $scope.reload_repos();
        });
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
          $scope.reload_repos();
          $scope.app.plan = plan_name;
        });
    }

    $scope.updatePlan = function(plan_name) {
      if($scope.cards.length == 0 && plan_name != "free") {
        //Show the card-adding popup
        $scope.plan_being_chosen = plan_name;
        $('#add-card-modal').modal('show');
      }
      else {
        plan_register(plan_name);
      }
    }

    $scope.$on('userCardAdded', function(mass) {
      $('#add-card-modal').modal('hide');
      plan_register($scope.plan_being_chosen);
    });

  }]);





})(jQuery);