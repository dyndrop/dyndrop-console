
angular.module('ddconsole.resource', ['ngResource'])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = "Bearer " + Drupal.settings.dyndrop_console.auth_token;
  }])
  .factory('App', function($resource) {
    var App = $resource(Drupal.settings.dyndrop_console.server_url.replace(/:/g, '\\:') + '/1/apps/:id',
      {}, {
        update: { method: 'PUT' }
      }
    );

    App.prototype.update = function(cb) {
      return App.update({id: this._id.$oid},
        angular.extend({}, this, {_id:undefined}), cb);
    };

    App.prototype.destroy = function(cb) {
      return App.remove({id: this.name}, cb);
    };

    return App;
  });

