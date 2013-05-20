
angular.module('ddconsole.resource', ['ngResource'])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = "Bearer " + Drupal.settings.dyndrop_console.auth_token;
  }])
  .factory('App', function($resource) {
    var App = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/apps/:id/:action',
      {}, {
        update: { method: 'PUT' },
        update_plan: { method: 'PUT' }
      }
    );

    App.prototype.update = function(cb) {
      return App.update({id: this.name},
        angular.extend({}, this), cb);
    };

    App.prototype.update_plan = function(data, cb) {
      return App.update_plan({id: this.name, action: "plan"}, data, cb);
    }

    App.prototype.destroy = function(cb) {
      return App.remove({id: this.name}, cb);
    };

    return App;
  })
  .factory('User', function($resource) {
    var App = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/users/:id/:action',
      {}, {
        update: { method: 'PUT' }
      }
    );

    App.prototype.update = function(cb) {
      return User.update({id: this.email},
        angular.extend({}, this), cb);
    };

    App.prototype.destroy = function(cb) {
      return User.remove({id: this.email}, cb);
    };

    return App;
  });

