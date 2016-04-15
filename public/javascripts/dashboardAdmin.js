(function(angular){
    'use strict';
    angular.module('dashboard')
    .config(function($routeProvider,$locationProvider){
        $routeProvider
        .when('/userlist',{
            templateUrl: '/view/userlist',
            controller: 'userlistCtrl',
        })
        .when('/batchlist',{
            templateUrl: 'view/batchlist',
            controller: 'batchlistCtrl',
        });
    })
    .controller('mainCtrl',['$http','$scope','$sce','$location',function($http,$scope,$sce,$location){
        $location.url('userlist');
    }])
    .controller('userlistCtrl',['$http','$scope','$uibModal',function($http,$scope,$uibModal){
        $scope.$parent.activedMenu = 'userlist';
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
    }])
    .controller('batchlistCtrl',['$scope','$uibModal',function($scope,$uibModal){
        $scope.$parent.activedMenu = 'batchlist';
        $scope.newModal = function(){
            $uibModal.open({
                animation:true,
                templateUrl:'pages/batchform.html',
                controller:['$scope','$http','$uibModalInstance','$route','$templateCache', function($scope, $http, $uibModalInstance,$route,$templateCache){
                    $scope.action='new';
                    $scope.batch = {};
                    $scope.batch.type = 'Java';
                    $scope.batch.beginDate = new Date();
                    $scope.$watchGroup(['batch.type','batch.beginDate'],function(n,o){
                        $scope.batch.name = n[0]+'.'+moment(n[1]).format('MMM')+'.'+moment(n[1]).format('YYYY');
                    });
                    $scope.openDatepicker = function(){
                        $scope.datepickerOpen = true;
                    };
                    $http.get('api/userlist').then(function(res){
                        $scope.teachers = res.data.teachers;
                        $scope.batch.teacher = $scope.teachers[0]._id;
                        $scope.students = res.data.students;
                        $scope.batch.students = _.reduce(res.data.students,function(result,value,key){
                            result.push(value._id);
                            return result;
                        },[]);
                    });
                    $scope.submitBatch = function(){
                        $http.post('api/addbatch',{batchdata:$scope.batch}).then(function(res){
                            $uibModalInstance.close('submit');
                            $templateCache.remove('/view/batchlist');
                            $route.reload();
                        });
                    };
                }],
            });
        }
    }]);
})(window.angular);
