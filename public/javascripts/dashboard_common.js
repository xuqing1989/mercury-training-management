(function(angular){
    'use strict';
    angular.module('dashboard',['ui.bootstrap','ngRoute','ui.calendar','textAngular'])
    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })
    .filter('now',function(){
        return function(input){
            if(input) {
                return moment(input).format('h:mmA');
            }
            return moment().format('h:mmA');
        }
    })
    .filter('localDate',function(){
        return function(input,format){
            if(input && format){
                return moment(input).utcOffset(-240).format(format);
            }
            return '';
        }
    })
    .factory('sharedData',function(){
        var sharedData={};
        return sharedData;
    })
    .controller('mainCtrl',['$scope','$location','sharedData',function($scope,$location,sharedData){
        var userData;
        $scope.getServerData = function(data,batch) {
            userData = JSON.parse(data);
            sharedData.userData = userData;
            if(userData.role == 'admin') {
                $location.url('userlist');
            }
            else if(userData.role == 'teacher') {
                batch = JSON.parse(batch);
                sharedData.batchData = batch;
                if(batch.length) {
                    $location.url('batch/'+batch[0]._id+'/training');
                }
                else {
                    $location.url('');
                }
            }
            else if(userData.role == 'student'){
                $location.url('batch/'+userData.batch+'/status');
            }
        }
    }])
    .controller('profileCtrl',['$http','$scope','$window','$uibModal','sharedData','$location',function($http,$scope,$window,$uibModal,sharedData,$location){
        $scope.profileModal = function(){
            var userData = sharedData.userData;
            $uibModal.open({
                animation:true,
                templateUrl:'pages/userprofile.html',
                controller:['$scope','$uibModalInstance','$http',function($scope,$uibModalInstance,$http){
                    $scope.user = userData;
                    $scope.valid = {};
                    $scope.$watchGroup(['newPwd','confirmPwd'],function(n,o){
                        if( !n[0] && !n[1]) {
                            $scope.valid.pwd = true;
                            $scope.valid.submit = false;
                        }
                        else {
                            if(n[0] != n[1] || n[0].length < 3 || n[1].length < 3) {
                                $scope.valid.pwd = false;
                                $scope.valid.submit = false;
                            }
                            else {
                                $scope.valid.pwd = true;
                                $scope.valid.submit = true;
                            }
                        }
                    });
                    $scope.changePwd = function(){
                        $http.post('api/changepwd',{newpwd:$scope.newPwd}).then(function(res){
                            $uibModalInstance.close('submit');
                        }).then(function(res){
                            $uibModal.open({
                                animation:true,
                                templateUrl: 'pages/confirmmodal.html',
                                controller:['$scope','$uibModalInstance','$http',function($scope,$uibModalInstance,$http){
                                    $scope.title="Information";
                                    $scope.body = 'Change password success!';
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
        }
        $scope.logout = function(){
            $http.delete('api/login').then(function(res){
                $location.url('');
                $window.location.reload();
            });
        };
    }]);
})(window.angular);
