(function(angular){
    'use strict';
    angular.module('login',[])
    .controller('loginCtrl',['$http','$scope',function($http,$scope){
        $scope.login = function(user){
            $http.post('api/login',user).then(function(res){
                console.log(res.data);
            });
        };
        $scope.logout = function(){
            $http.delete('api/login').then(function(res){
                console.log(res.data);
            });
        };
    }]);
})(window.angular);
