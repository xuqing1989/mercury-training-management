(function(angular){
    'use strict';
    angular.module('dashboard',['ngRoute','ui.bootstrap'])
    .controller('profileCtrl',['$http','$scope','$window',function($http,$scope,$window){
        $scope.logout = function(){
            $http.delete('api/login').then(function(res){
                $window.location.reload();
            });
        };
    }]);
})(window.angular);
