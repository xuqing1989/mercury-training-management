(function(angular){
    'use strict';
    angular.module('dashboard')
        .config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/batch/:batchId/training', {
                    templateUrl: 'view/batch/training',
                    controller: 'trainingCtrl',
                });
        }])
        .controller('trainingCtrl', ['$scope','$route',
            function($scope,$route) {
                $scope.$parent.activedMenu = 'training';
                $scope.ctrl = {
                    studentMode:true,
                    displayMode:false,
                    action:'new',
                    eventSelected:false,
                    formType:'box-info',
                };
                $scope.$on('eventClick',function(e,data){
                    $scope.ctrl = {
                        studentMode:true,
                        displayMode:true,
                        action:'',
                        eventSelected:true,
                    };
                    switch(data.color){
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
        .controller('calendarCtrl', ['$scope', '$compile', 'uiCalendarConfig', '$http', '$route',
            function($scope, $compile, uiCalendarConfig, $http, $route) {
                var lectureEvents = {
                    color: '#00c0ef',
                    textColor: 'fff',
                    allDay:true,
                    stick : true, 
                    events: [],
                };
                var assignmentEvents = {
                    color: '#f39c12',
                    textColor: 'fff',
                    allDay:true,
                    stick : true, 
                    events: [],
                };
                var quizEvents = {
                    color: '#dd4b39',
                    textColor: 'fff',
                    allDay:true,
                    stick : true, 
                    events: [],
                };
                $http.get('/api/eventdata?batchId='+$route.current.params.batchId).then(function(res){
                    var eventData = res.data;
                    eventData.forEach(function(value){
                        if(value.type == 'lecture'){
                            lectureEvents.events.push({
                                title:value.title,
                                start:value.startDate,
                                end:moment(value.endDate).add(1,'day').toDate(),
                                id:value._id,
                            });
                        }
                        else if(value.type == 'assignment') {
                            assignmentEvents.events.push({
                                title:value.title,
                                start:value.startDate,
                                end:moment(value.endDate).add(1,'day').toDate(),
                                id:value._id,
                            });
                        }
                        else if(value.type == 'quiz') {
                            quizEvents.events.push({
                                title:value.title,
                                start:value.startDate,
                                end:moment(value.endDate).add(1,'day').toDate(),
                                id:value._id,
                            });
                        }
                    });
                });
                /* alert on eventClick */
                $scope.eventClick = function(date, jsEvent, view) {
                    $scope.$emit('eventClick',{id:date.id,color:date.color});
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
                        height: 450,
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
                $scope.eventSources = [lectureEvents,assignmentEvents,quizEvents];
            }
        ])
        .directive('eventForm',['$http','sharedData','$route','$templateCache','$uibModal',function($http,sharedData,$route,$templateCache,$uibModal) {
            return {
                templateUrl: 'pages/eventform.html',
                scope: {
                    ctrl:'=',
                    eventId:'=',
                },
                link: function(scope, element, attrs, ctrl) {
                    scope.$watch('event.type',function(n,o){
                        if(n == 'lecture'){
                            scope.ctrl.formType = 'box-info';
                        }
                        else if(n == 'assignment'){
                            scope.ctrl.formType = 'box-warning';
                        }
                        else if(n == 'quiz'){
                            scope.ctrl.formType = 'box-danger';
                        }
                    });
                    scope.$watch('eventId',function(n,o){
                        if(n) {
                            $http.get('/api/eventcontent?eventId='+n).then(function(res){
                                scope.event = res.data;
                                scope.event.startDate = new Date(res.data.startDate);
                                scope.event.endDate = new Date(res.data.endDate);
                            });
                        }
                    });
                },
            };
        }]);
})(window.angular);
