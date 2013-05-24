(function ($) {

angular.module('ddconsole.auth', ['ddconsole.resource', 'ngCookies'])
  .factory('AuthToken', function () {
    var auth_token = {
      val: $.cookie('dyndrop-token'),

      put: function(token) {
        auth_token.val = token;
      },

      get: function(token) {
        return auth_token.val;
      }
    };

    return auth_token;
  })
  .controller('AuthOauthGithubCallbackCtrl', ['$scope', '$location', '$routeParams', 'User', function ($scope, $location, $routeParams, User) {
    var self = this;

    var code = $location.search().code;

    User.oauth_github_callback({code: code}, function(data) {
      $.cookie('dyndrop-token', data.token, { expires: 7, path: '/' });

      window.location = '/';
    });
  }])
  .controller('AuthLogoutCtrl', ['$scope', '$location', '$routeParams', 'User', function ($scope, $location, $routeParams, User) {
    var self = this;

    $.removeCookie('dyndrop-token');
    window.location = 'http://www.dyndrop.com/';
  }]);


})(jQuery);