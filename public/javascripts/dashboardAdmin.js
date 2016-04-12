(function(angular){
    'use strict';
    angular.module('dashboard')
    .config(function($routeProvider,$locationProvider){
        $routeProvider
        .when('/userlist',{
            templateUrl: '/view/userlist',
            controller: 'userlistCtrl',
        });
    })
    .controller('mainCtrl',['$http','$scope','$sce','$location',function($http,$scope,$sce,$location){
        $location.url('userlist');
    }])
    .controller('userlistCtrl',['$http','$scope','$uibModal',function($http,$scope,$uibModal){
        $scope.userWindow = function(){
            $uibModal.open({
                template:'{{1+2}}',
                controller:function($scope){
                },
            });
        };
    }]);
})(window.angular);
