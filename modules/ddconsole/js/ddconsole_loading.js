 angular.module('ddconsole.loading', ['ui.bootstrap.modal'])
  .config(function ($httpProvider) {
     $httpProvider.responseInterceptors.push('onCompleteInterceptor');
  })
  .factory('onCompleteInterceptor', function ($q, $window, LoadingSrv) {
    return function (promise) {
      return promise.then(function (response) {
        // do something on success
        LoadingSrv.requestCount--;
        return response;

      }, function (errorResponse) {
        // do something on error
        LoadingSrv.requestCount--;

        var get_error_msg = function(errorResponse) {
          var errormsg = "";
          if(errorResponse.data.error !== undefined) {
            errormsg += errorResponse.data.error;
          }
          else if (typeof errorResponse.data === 'string') {
            errormsg += errorResponse.data; 
          }
          return errormsg;
        }
        switch (errorResponse.status) {
          case 401:
            LoadingSrv.errorMessages.push('Wrong usename or password');
            break;
          case 403:
            LoadingSrv.errorMessages.push('You are not allowed to do this');
            break;
          case 500:
            LoadingSrv.errorMessages.push('Server internal error: ' + get_error_msg(errorResponse));
            break;
          default:
            LoadingSrv.errorMessages.push(get_error_msg(errorResponse) + ' [' + errorResponse.status + ']');
        }
        return $q.reject(errorResponse);
      });
    };
  })
  .service('onStartInterceptor', function (LoadingSrv) {
    this.startSending = function (data, headersGetter) {
      LoadingSrv.requestCount++;
      return data;
    };
  })
  .factory('LoadingSrv', function () {
    return {
      requestCount: 0,
      isLoadingShown: function () {
        return this.requestCount > 0;
      },
      errorMessages: []
    };
  })
  .run(function ($http, onStartInterceptor) {
    $http.defaults.transformRequest.push(onStartInterceptor.startSending);
  })
  .directive('loading', function (LoadingSrv) {
    return {
      restrict: 'A',
      replace: true,
      template: '<div id="global-loading-message" ng-show="isshown"> Loading... </div>',
      controller: function ($scope, $element, $attrs, $timeout, LoadingSrv) {
        var timeout;
        $scope.$watch(function () { return LoadingSrv.requestCount; }, function (newVal) {
          var loading = LoadingSrv.isLoadingShown();

          var timeout = null;
          if(loading == false) {
            $scope.isshown = false;
          }
          else {
            //Show spinner only after a small delay, to avoid flickers
            if(timeout == null) {
              timeout = $timeout(function() {
                if(LoadingSrv.isLoadingShown()) {
                  $scope.isshown = true;
                }
                timeout = null;
              }, 500);
            }
          }
        }, true);
      }
    };
  })
  .directive('appMessages', function (LoadingSrv) {
    return {
      restrict: 'A',
      replace: true,
      template: '<div><div ng-repeat="errorMessage in errorMessages"><div class="alert alert-error"> <button type="button" class="close" data-dismiss="alert">&times;</button> <strong>Error!</strong> <span ng-bind-html-unsafe="errorMessage"></span> </div></div></div>',
      controller: function ($scope, $element, $attrs, LoadingSrv) {
        $scope.$watch(function () { return LoadingSrv.errorMessages; }, function (newVal) {
          //$scope.isshown = LoadingSrv.isLoadingShown();
          $scope.errorMessages = LoadingSrv.errorMessages;
        }, true);
      }
    };
  });
 