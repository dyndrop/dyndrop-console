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

  }]);

  })(jQuery);