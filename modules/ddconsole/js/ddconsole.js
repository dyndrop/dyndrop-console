angular.module('ddconsole', ['ddconsole.app', 'ddconsole.settings', 'ddconsole.resource', 'ddconsole.loading', 'ddconsole.widgets']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller: ListCtrl, templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'applist.html'}).
      when('/app/:appName', {controller: 'ViewCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'app.html'}).
      when('/new', {controller:CreateCtrl, templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'app-new.html'}).
      when('/settings', {controller: 'SettingsCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'settings.html'}).
      otherwise({redirectTo:'/'});
  });
   
 
function ListCtrl($scope, App) {
  $scope.apps = App.query();
}
 
 
function CreateCtrl($scope, $location, App) {
  // Initiate basic App object
  $scope.app = new App();
  app_instance = { "uris": [] };
  $scope.app.instances = [];
  $scope.app.instances[0] = app_instance;

  $scope.save = function() {
    App.save($scope.app, function(app) {
      $location.path('/');
    });
  }
}
 
 
function EditCtrl($scope, $location, $routeParams, App) {
  var self = this;
 
  App.get({id: $routeParams.appId}, function(app) {
    self.original = app;
    $scope.app = new App(self.original);
  });
 
  $scope.isClean = function() {
    return angular.equals(self.original, $scope.app);
  }
 
  $scope.destroy = function() {
    self.original.destroy(function() {
      $location.path('/list');
    });
  };
 
  $scope.save = function() {
    $scope.app.update(function() {
      $location.path('/');
    });
  };
}

