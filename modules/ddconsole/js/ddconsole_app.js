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
  .factory('DDConsoleConfig', function () {
    return Drupal.settings.dyndrop_console;
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

    $scope.addExternalUri = function () {
      if($scope.new_external_uri != undefined) {
        $scope.app.instances[0].external_uris.push($scope.new_external_uri);
        $scope.new_external_uri = '';
        $scope.update();
      }
    }

    $scope.removeExternalUri = function(uri) {
      var index = $scope.app.instances[0].external_uris.indexOf(uri);
      if(index >= 0) {
        $scope.app.instances[0].external_uris.splice(index, 1);
        $scope.update();
      }
    }

  }]);


})(jQuery);