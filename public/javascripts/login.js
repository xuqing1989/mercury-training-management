(function(angular){
    'use strict';
    angular.module('login',[])
    .controller('loginCtrl',['$http','$scope',function($http,$scope){
        $scope.login = function(user){
            $http.post('api/login',user).then(function(res){
                window.location.reload();
            });
        };
    }]);
})(window.angular);
