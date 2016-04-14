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
        $scope.newModal = function(type){
            $uibModal.open({
                animation:true,
                templateUrl:'pages/userform.html',
                controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                    $scope.user = {};
                    $scope.valid = {};
                    $scope.action = 'new';
                    $scope.user.role = type;
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
                            $http.post('api/adduser',{userdata:$scope.user}).then(function(res){
                                $uibModalInstance.close('submit');
                                $templateCache.remove('/view/userlist');
                                $route.reload();
                                return res;
                            }).then(function(res){
                                $uibModal.open({
                                    animation:true,
                                    templateUrl: 'pages/confirmmodal.html',
                                    controller:['$scope','$uibModalInstance','$http',function($scope,$uibModalInstance,$http){
                                        $scope.title="Information";
                                        $scope.body = 'The password of user ' + name + ' is: ' + res.data.password;
                                        $scope.yesButtonText = "OK";
                                        $scope.cancel = function() {
                                            $uibModalInstance.close('cancel');
                                        }
                                        $scope.yesButton = $scope.cancel;
                                    }],
                                })
                            });
                        }
                    };
                }],
            });
        };
        $scope.removeUser = function(userid){
            $uibModal.open({
                animation:true,
                templateUrl: 'pages/confirmmodal.html',
                controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                    $scope.title="Confirm";
                    $scope.body = "Are you sure to delete this user?";
                    $scope.yesButtonText = "Yes";
                    $scope.cancel = function() {
                        $uibModalInstance.close('cancel');
                    }
                    $scope.yesButton = function(){
                        $http.post('api/deluser',{userdata:{id:userid}}).then(function(res){
                            $uibModalInstance.close('submit');
                            $templateCache.remove('/view/userlist');
                            $route.reload();
                        });
                    }
                }],
            });
        };
        $scope.resetUserPwd = function(userid){
            $uibModal.open({
                animation:true,
                templateUrl: 'pages/confirmmodal.html',
                controller:['$scope','$uibModalInstance','$http',function($scope,$uibModalInstance,$http){
                    $scope.title="Confirm";
                    $scope.body = "Are you sure to reset the password?";
                    $scope.yesButtonText = "Yes";
                    $scope.cancel = function() {
                        $uibModalInstance.close('cancel');
                    }
                    $scope.yesButton = function(){
                        $http.post('api/resetpwd',{userdata:{id:userid}}).then(function(res){
                            $uibModalInstance.close('submit');
                            return res;
                        }).then(function(res){
                            $uibModal.open({
                                animation:true,
                                templateUrl: 'pages/confirmmodal.html',
                                controller:['$scope','$uibModalInstance','$http',function($scope,$uibModalInstance,$http){
                                    $scope.title="Information";
                                    $scope.body = 'The password of user ' + name + ' is: ' + res.data.password;
                                    $scope.yesButtonText = "OK";
                                    $scope.cancel = function() {
                                        $uibModalInstance.close('cancel');
                                    }
                                    $scope.yesButton = $scope.cancel;
                                }],
                            })
                        });
                    }
                }],
            });
        };
    }]);
})(window.angular);
