(function($) {

angular.module('ddconsole.resource', ['ngResource'])
  .config(['$httpProvider', function ($httpProvider) {
    if($.cookie('dyndrop-token')) {
      $httpProvider.defaults.headers.common['Authorization'] = "Bearer " + $.cookie('dyndrop-token');
    }
  }])
  .factory('App', function($resource) {
    var App = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/apps/:id/:action',
      {}, {
        update: { method: 'PUT' },
        update_plan: { method: 'PUT' },
        dns_check: { method: 'GET', isArray: true }
      }
    );

    App.prototype.update = function(cb, errorcb) {
      return App.update({id: this.name},
        angular.extend({}, this), cb, errorcb);
    };

    App.prototype.update_plan = function(data, cb) {
      return App.update_plan({id: this.name, action: "plan"}, data, cb);
    }

    App.prototype.dns_check = function(cb) {
      return App.dns_check({id: this.name, action: "dns_check"}, cb);
    };

    App.prototype.destroy = function(cb) {
      return App.remove({id: this.name}, cb);
    };

    return App;
  })
  .factory('Repo', function($resource) {
    var Repo = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/repos/:org/:name/:action',
      {}, {
      }
    );

    return Repo;
  })
  .factory('User', function($resource) {
    var User = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/users/:id/:action/:param1/:param2',
      {}, {
        oauth_github_callback: { method: 'POST', params: {action: "oauth", param1: "github", param2: "callback"} },
        update: { method: 'PUT' }
      }
    );

    User.prototype.oauth_github_callback = function(data, cb) {
      return User.oauth_github_callback({id: this.name, action: "oauth", param1: "github", param2: "callback"}, data, cb);
    }

    User.prototype.update = function(cb) {
      return User.update({id: this.email},
        angular.extend({}, this), cb);
    };

    User.prototype.destroy = function(cb) {
      return User.remove({id: this.email}, cb);
    };

    return User;
  })
  .factory('UserCard', function($resource) {
    var UserCard = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/users/:user_id/cards/:id',
      {}, {
      }
    );

    UserCard.prototype.destroy = function(cb) {
      return UserCard.remove({user_id: this.email}, cb);
    };

    return UserCard;
  });


})(jQuery);