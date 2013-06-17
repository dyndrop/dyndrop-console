(function($) {

angular.module('ddconsole', ['ddconsole.app', 'ddconsole.settings', 'ddconsole.resource', 'ddconsole.loading', 'ddconsole.widgets', 'ddconsole.auth']).
  config(function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {controller: 'ListCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'applist.html'}).
      when('/new', {controller: 'CreateCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'app-new.html'}).
      when('/settings', {controller: 'SettingsCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'settings.html'}).
      when('/oauth/github/callback', {controller: 'AuthOauthGithubCallbackCtrl', template: '<div></div>'}).
      when('/logout', {controller: 'AuthLogoutCtrl', template: '<div></div>'}).
      when('/:repo_org/:repo_name/host', {controller: 'CreateCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'app-new-from-repo.html'}).
      when('/:repo_org/:repo_name', {controller: 'ViewCtrl', templateUrl: Drupal.settings.dyndrop_console.angular_templates + 'app.html'}).
      otherwise({redirectTo:'/'});

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix = '!'
  }).
  factory('DDConsoleConfig', function () {
    return Drupal.settings.dyndrop_console;
  }).
  run(function($location, $rootScope, DDConsoleConfig, AuthToken, Repo, User, UserCard) {

    // If unauthentified, redirect to auth
    if($.cookie('dyndrop-token') == undefined) {
      if($location.path() != '/oauth/github/callback') {
        window.location = "https://github.com/login/oauth/authorize?scope=user:email,repo&client_id=" + DDConsoleConfig.github_client_id
        return;
      }
      //Else we are in the oauth callback atm
      else {
        // We won't load the below global vars
        return;
      }
    }

    /**
     * Global data functions
     */
    // Repos
    $rootScope.reload_repos = function() {
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

        $rootScope.repos = repos;
      });
    }
    $rootScope.reload_repos();

    // User
    $rootScope.reload_user = function() {
      User.get({id: "me"}, function(user) {
        $rootScope.user = new User(user);
      });
    }
    $rootScope.reload_user();

    // User cards
    $rootScope.reload_user_cards = function() {
      UserCard.query({user_id: "me"}, function(cards) {
        $rootScope.cards = [];
        for(var i = 0; i < cards.length; i++) {
          $rootScope.cards.push(new UserCard(cards[i]));
        }
      });
    }
    $rootScope.reload_user_cards();

    // Path for the templates
    $rootScope.angular_templates_path = DDConsoleConfig.angular_templates;

  });



})(jQuery);