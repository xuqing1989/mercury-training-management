(function(angular){
    'use strict';
    angular.module('dashboard',['ui.bootstrap','ngRoute'])
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })
    .controller('profileCtrl',['$http','$scope','$window',function($http,$scope,$window){
        $scope.logout = function(){
            $http.delete('api/login').then(function(res){
                $window.location.reload();
            });
        };
    }]);
})(window.angular);
