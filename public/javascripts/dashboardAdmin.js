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
        $scope.addTeaModal = function(){
            $uibModal.open({
                animation:true,
                templateUrl:'pages/userform.html',
                controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                    $scope.user = {};
                    $scope.valid = {};
                    $scope.action = 'new';
                    $scope.user.role = 'teacher';
                    $scope.$watchGroup(['userModal.email.$pristine','user.email'],function(n,o){
                        if(n[0] || n[1])$scope.valid.email = true;
                        else $scope.valid.email = false;
                    });
                    $scope.$watchGroup(['userModal.name.$pristine','user.name'],function(n,o){
                        if(n[0] || n[1])$scope.valid.name = true;
                        else $scope.valid.name = false;
                    });
                    $scope.submitUserModal = function(){
                        var name = $scope.user.name;
                        var email = $scope.user.email;
                        if(!name){
                            $scope.valid.name = false;
                        }
                        if(!email){
                            $scope.valid.email = false;
                        }
                        if(name && email){
                            $http.post('api/adduser',$scope.user).then(function(res){
                            });
                            console.log($scope.user);
                            $uibModalInstance.close('submit');
                            $templateCache.remove('/view/userlist');
                            $route.reload();
                        }
                    };
                }],
            });
        };
    }]);
})(window.angular);
