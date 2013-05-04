angular.module('ddconsole.widgets', [])
  .factory('DDConsoleConfig', function () {
    return Drupal.settings.dyndrop_console;
  })
  .directive('suffixedUrlField', function(DDConsoleConfig) {
    return {
      require: 'ngModel',
      template: '<div class="input-prepend input-append"> <span class="add-on">http://</span> <input type="text"> <span class="add-on">.{{default_cf_dns_suffix}}</span> </div>',
      link: function(scope, elm, attrs, ctrl) {
        var get_value = function (elm) {
          return elm.find('input').val() + "." + Drupal.settings.dyndrop_console.default_cf_dns_suffix;
        };

        // view -> model
        scope.default_cf_dns_suffix = DDConsoleConfig.default_cf_dns_suffix;
        elm.find('input').bind('keyup', function() {
          scope.$apply(function() {
            ctrl.$setViewValue(get_value(elm));
          });
        });

        // model -> view
        ctrl.$render = function() {
          //elm.html(ctrl.$viewValue); //TODO
        };

        //Validator
        ctrl.$parsers.unshift(function(viewValue) {
          var DNS_REGEXP = /^(?!\.)([\da-z\.-]+)\.([a-z]{2,6})$/g;
          var value = get_value(elm);
          if (DNS_REGEXP.test(value)) {
            // it is valid
            ctrl.$setValidity('dns', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('dns', false);
            return undefined;
          }
        });

        // load init value from DOM
        ctrl.$setViewValue(get_value(elm));
      }
    };
  });