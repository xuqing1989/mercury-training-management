(function(angular) {
    'use strict';
    angular.module('dashboard')
        .config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {
                $routeProvider
                    .when('/batch/:batchId/training', {
                        templateUrl: 'view/batch/training',
                        controller: 'trainingCtrl',
                    })
                    .when('/batch/:batchId/status', {
                        templateUrl: 'view/batch/status',
                        controller: 'statusCtrl',
                    });
            }
        ])
        .controller('trainingCtrl', ['$scope', '$route',
            function($scope, $route) {
                $scope.$parent.activedMenu = 'training';
                $scope.ctrl = {
                    studentMode: true,
                    displayMode: false,
                    action: 'new',
                    eventSelected: false,
                    formType: 'box-info',
                };
                $scope.$on('eventClick', function(e, data) {
                    $scope.ctrl = {
                        studentMode: true,
                        displayMode: true,
                        action: '',
                        eventSelected: true,
                    };
                    switch (data.color) {
                        case '#dd4b39':
                            $scope.ctrl.formType = "box-danger";
                            break;
                        case '#f39c12':
                            $scope.ctrl.formType = "box-warning";
                            break;
                        case '#00c0ef':
                            $scope.ctrl.formType = "box-info";
                            break;
                    };
                    $scope.eventId = data.id;
                });
            }
        ])
        .controller('trainingCalCtrl', ['$scope', '$compile', 'uiCalendarConfig', '$http', '$route',
            function($scope, $compile, uiCalendarConfig, $http, $route) {
                var lectureEvents = {
                    color: '#00c0ef',
                    textColor: 'fff',
                    allDay: true,
                    stick: true,
                    events: [],
                };
                var assignmentEvents = {
                    color: '#f39c12',
                    textColor: 'fff',
                    allDay: true,
                    stick: true,
                    events: [],
                };
                var quizEvents = {
                    color: '#dd4b39',
                    textColor: 'fff',
                    allDay: true,
                    stick: true,
                    events: [],
                };
                $http.get('/api/eventdata?batchId=' + $route.current.params.batchId).then(function(res) {
                    var eventData = res.data;
                    eventData.forEach(function(value) {
                        if (value.type == 'lecture') {
                            lectureEvents.events.push({
                                title: value.title,
                                start: value.startDate,
                                end: moment(value.endDate).add(1, 'day').toDate(),
                                id: value._id,
                            });
                        } else if (value.type == 'assignment') {
                            assignmentEvents.events.push({
                                title: value.title,
                                start: value.startDate,
                                end: moment(value.endDate).add(1, 'day').toDate(),
                                id: value._id,
                            });
                        } else if (value.type == 'quiz') {
                            quizEvents.events.push({
                                title: value.title,
                                start: value.startDate,
                                end: moment(value.endDate).add(1, 'day').toDate(),
                                id: value._id,
                            });
                        }
                    });
                });
                /* alert on eventClick */
                $scope.eventClick = function(date, jsEvent, view) {
                    $scope.$emit('eventClick', {
                        id: date.id,
                        color: date.color
                    });
                };

                /* Change View */
                $scope.changeView = function(view, calendar) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
                };
                /* Change View */
                $scope.renderCalender = function(calendar) {
                    if (uiCalendarConfig.calendars[calendar]) {
                        uiCalendarConfig.calendars[calendar].fullCalendar('render');
                    }
                };
                /* Render Tooltip */
                $scope.eventRender = function(event, element, view) {
                    element.attr({
                        'tooltip': event.title,
                        'tooltip-append-to-body': true
                    });
                    $compile(element)($scope);
                };
                /* config object */
                $scope.uiConfig = {
                    calendar: {
                        height: 500,
                        editable: false,
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        eventClick: $scope.eventClick,
                        eventRender: $scope.eventRender
                    }
                };
                /* event sources array*/
                $scope.eventSources = [lectureEvents, assignmentEvents, quizEvents];
            }
        ])
        .directive('eventForm', ['$http', 'sharedData', '$route', '$templateCache', '$uibModal',
            function($http, sharedData, $route, $templateCache, $uibModal) {
                return {
                    templateUrl: 'pages/eventform.html',
                    scope: {
                        ctrl: '=',
                        eventId: '=',
                    },
                    link: function(scope, element, attrs, ctrl) {
                        scope.$watch('event.type', function(n, o) {
                            if (n == 'lecture') {
                                scope.ctrl.formType = 'box-info';
                            } else if (n == 'assignment') {
                                scope.ctrl.formType = 'box-warning';
                            } else if (n == 'quiz') {
                                scope.ctrl.formType = 'box-danger';
                            }
                        });
                        scope.$watch('eventId', function(n, o) {
                            if (n) {
                                $http.get('/api/eventcontent?eventId=' + n).then(function(res) {
                                    scope.event = res.data;
                                    scope.event.startDate = new Date(res.data.startDate);
                                    scope.event.endDate = new Date(res.data.endDate);
                                });
                            }
                        });
                    },
                };
            }
        ])
        .controller('statusCtrl', ['$scope','$http','$templateCache', '$route', '$uibModal',
            function($scope,$http,$templateCache, $route, $uibModal) {
                $scope.$parent.activedMenu = 'status';
                $scope.statusObj = {};
                $http.get('/api/selfstatus').then(function(res){
                    if(res.data.length){
                        var reports = res.data;
                        var recentReport = _.maxBy(reports,'checkInTime');
                        $scope.recentReport = recentReport;
                        $scope.$broadcast('reportData',reports);
                        if(recentReport.checkInTime &&
                            moment(recentReport.checkInTime).utcOffset(-240).format('YYYY-MM-DD') == moment().utcOffset(-240).format('YYYY-MM-DD')){
                            $scope.finCheckin = true;
                            $scope.statusObj = recentReport;
                            if(recentReport.checkOutTime){
                                $scope.finCheckout = true;
                            }
                            if(recentReport.report){
                                $scope.finReport = true;
                            }
                        }
                    }
                });
                $scope.checkIn = function(){
                    $http.post('/api/checkin').then(function(res){
                        $templateCache.remove('view/batch/status');
                        $route.reload();
                    });
                }
                $scope.checkOut = function(){
                    $uibModal.open({
                        animation:true,
                        templateUrl: 'pages/confirmmodal.html',
                        controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                            $scope.title="Confirm";
                            $scope.body = "Now is "+ moment().utcOffset(-240).format('h:mmA') +". Are you sure to check-out?";
                            $scope.yesButtonText = "Yes";
                            $scope.cancel = function() {
                                $uibModalInstance.close('cancel');
                            }
                            $scope.yesButton = function(){
                                $http.post('/api/checkout').then(function(res){
                                    $uibModalInstance.close('submit');
                                    $templateCache.remove('view/batch/status');
                                    $route.reload();
                                });
                            }
                        }],
                    })
                }
                $scope.clearInput = function(){
                    $scope.reportContent = '';
                }
                $scope.submitReport = function(){
                    var reportContent = $scope.reportContent;
                    var statusId = $scope.statusObj._id;
                    $uibModal.open({
                        animation:true,
                        templateUrl: 'pages/confirmmodal.html',
                        controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                            $scope.title="Confirm";
                            $scope.body = "Now is "+ moment().utcOffset(-240).format('h:mmA') +". Are you sure to submit report? You can not edit once it's been submitted.";
                            $scope.yesButtonText = "Yes";
                            $scope.cancel = function() {
                                $uibModalInstance.close('cancel');
                            }
                            $scope.yesButton = function(){
                                $http.post('/api/submitreport',{statusId:statusId,report:reportContent}).then(function(res){
                                    $uibModalInstance.close('submit');
                                    $templateCache.remove('view/batch/status');
                                    $route.reload();
                                });
                            }
                        }],
                    })
                }
                $scope.$on('eventClick',function(e,data){
                    $http.get('/api/statusdata?statusId='+data.id).then(function(res){
                        $scope.statusObj = res.data;
                    });
                });
            }
        ])
        .controller('statusCalCtrl', ['$scope', '$compile', 'uiCalendarConfig', '$http', '$route','sharedData', 
            function($scope, $compile, uiCalendarConfig, $http, $route, sharedData) {
                var events = [];
                /* alert on eventClick */
                $scope.eventClick = function(date, jsEvent, view) {
                    $scope.$emit('eventClick', {
                        id: date.id,
                    });
                };

                /* Change View */
                $scope.changeView = function(view, calendar) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
                };
                /* Change View */
                $scope.renderCalender = function(calendar) {
                    if (uiCalendarConfig.calendars[calendar]) {
                        uiCalendarConfig.calendars[calendar].fullCalendar('render');
                    }
                };
                /* Render Tooltip */
                $scope.eventRender = function(event, element, view) {
                    element.attr({
                        'tooltip': event.title,
                        'tooltip-append-to-body': true
                    });
                    $compile(element)($scope);
                };
                $scope.uiConfig = {
                    calendar: {
                        height: 500,
                        editable: false,
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        eventClick: $scope.eventClick,
                        eventRender: $scope.eventRender
                    }
                };
                $scope.$on('reportData',function(e,data){
                    data.forEach(function(value){
                        var hasReport = '';
                        var eventColor = '#00c0ef';
                        if(value.report){
                            hasReport = ' (Report submitted)';
                        }
                        if(!!value.checkInTime && !value.checkOutTime){
                            eventColor = '#f0ad4e';
                        }
                        else {
                            eventColor = '#5cb85c';
                        }
                        events.push({
                            title:sharedData.userData.name+hasReport,
                            start:new Date(value.checkInTime),
                            allDay:true,
                            color:eventColor,
                            id:value._id,
                        });
                    });
                });
                $scope.eventSources = [events];
            }
        ]);
})(window.angular);
