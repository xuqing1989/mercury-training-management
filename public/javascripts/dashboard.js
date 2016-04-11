(function(angular){
    'use strict';
    angular.module('dashboard',[])
    .controller('profileCtrl',['$http','$scope',function($http,$scope){
        $scope.logout = function(){
            $http.delete('api/login').then(function(res){
                window.location.reload();
            });
        };
        $scope.test = 'test';
    }]);
})(window.angular);
