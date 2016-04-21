(function(angular) {
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
                $scope.$parent.activedPMenu = $route.current.params.batchId;
                $scope.$parent.activedCMenu = $route.current.params.batchId+'/training';
                $scope.ctrl = {
                    displayMode:false,
                    action:'new',
                    eventSelected:false,
                    formType:'box-info',
                };
                $scope.$on('eventClick',function(e,data){
                    $scope.ctrl = {
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

                    scope.event = {};
                    scope.valid = {};
                    scope.event.startDate = moment().toDate();
                    scope.event.endDate = moment().toDate();
                    scope.event.type = 'lecture';
                    scope.openEndDatepicker = function(){
                        scope.endPickerOpen = true;
                    };
                    scope.openStartDatepicker = function(){
                        scope.startPickerOpen = true;
                    };
                    scope.$watch('event.startDate',function(n,o){
                        if(scope.event.endDate < n){
                            scope.event.endDate = n;
                        }
                        scope.endOptions.minDate = n;
                    });
                    scope.$watchGroup(['eventModal.title.$pristine','event.title'],function(n,o){
                        if(n[0] || n[1])scope.valid.title = true;
                        else scope.valid.title = false;
                    });
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
                    scope.clearInput = function(){
                        scope.ctrl = {
                            displayMode:false,
                            action:'new',
                            eventSelected:false,
                            formType:'box-info',
                        };
                        scope.event._id = '';
                        scope.event.title = '';
                        scope.eventModal.title.$pristine = true;
                        scope.event.startDate = moment().toDate();
                        scope.event.endDate = moment().toDate();
                        scope.event.type = 'lecture';
                        scope.event.content = '';
                    };
                    scope.editEvent = function(){
                        scope.ctrl = {
                            displayMode:false,
                            action:'edit',
                            eventSelected:true,
                        };
                    }
                    scope.deleteEvent = function(){
                        if(scope.eventId){
                            var eventId = scope.eventId;
                            $uibModal.open({
                                animation:true,
                                templateUrl: 'pages/confirmmodal.html',
                                controller:['$scope','$uibModalInstance','$http','$route','$templateCache',function($scope,$uibModalInstance,$http,$route,$templateCache){
                                    $scope.title="Confirm";
                                    $scope.body = "Are you sure to delete this event?";
                                    $scope.yesButtonText = "Yes";
                                    $scope.cancel = function() {
                                        $uibModalInstance.close('cancel');
                                    }
                                    $scope.yesButton = function(){
                                        $http.post('api/deleteevent',{eventId:eventId}).then(function(res){
                                            $uibModalInstance.close('submit');
                                            $templateCache.remove('view/batch/training');
                                            $route.reload();
                                        });
                                    }
                                }],
                            });
                        }
                    }
                    scope.submitEvent = function(){
                        if(!scope.event.title){
                            scope.valid.title = false;
                            return;
                        }
                        scope.event.batch = $route.current.params.batchId;
                        scope.event.startDate = moment(scope.event.startDate).hour(12);
                        scope.event.endDate = moment(scope.event.endDate).hour(12);
                        if(scope.ctrl.action == 'new') {
                            $http.post('/api/addevent',{eventData:scope.event}).then(function(res){
                                $templateCache.remove('view/batch/training');
                                $route.reload();
                            });
                        }
                        else if(scope.ctrl.action == 'edit'){
                            $http.post('/api/editevent',{eventData:scope.event,eventId:scope.eventId}).then(function(res){
                                $templateCache.remove('view/batch/training');
                                $route.reload();
                            });
                        }
                    };
                },
            };
        }]);
})(window.angular);
