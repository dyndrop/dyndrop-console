(function ($) {

angular.module('ddconsole.auth', ['ddconsole.resource'])
  .controller('AuthOauthGithubCallbackCtrl', ['$scope', '$location', '$routeParams', 'User', 'DDConsoleConfig', function ($scope, $location, $routeParams, User, DDConsoleConfig) {
    var self = this;

    console.log(window.location.search);


  }]);


  })(jQuery);