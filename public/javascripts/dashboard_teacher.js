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
        .controller('trainingCtrl', ['$scope', '$compile',
            function($scope, $compile) {
                $scope.eventAction = 'new';
            }
        ])
        .controller('calendarCtrl', ['$scope', '$compile', 'uiCalendarConfig', '$http', '$route',
            function($scope, $compile, uiCalendarConfig, $http, $route) {
                var lectureEvents = {
                    color: '#00c0ef',
                    textColor: 'fff',
                    allDay:true,
                    events: [], 
                };
                var assignmentEvents = {
                    color: '#f39c12',
                    textColor: 'fff',
                    allDay:true,
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
                                id:value._id
                            });
                        }
                        else if(value.type == 'assignment') {
                            assignmentEvents.events.push({
                                title:value.title,
                                start:value.startDate,
                                end:moment(value.endDate).add(1,'day').toDate(),
                                id:value._id
                            });
                        }
                    });
                });

                /* alert on eventClick */
                $scope.alertOnEventClick = function(date, jsEvent, view) {
                    $scope.alertMessage = (date.title + ' was clicked ');
                };
                /* remove event */
                $scope.remove = function(index) {
                    $scope.events.splice(index, 1);
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
                        eventClick: $scope.alertOnEventClick,
                        eventRender: $scope.eventRender
                    }
                };
                /* event sources array*/
                $scope.eventSources = [lectureEvents,assignmentEvents];
            }
        ])
        .directive('eventForm',['$http','sharedData','$route','$templateCache',function($http,sharedData,$route,$templateCache) {
            return {
                templateUrl: 'pages/eventform.html',
                scope: {
                    action:'=',
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

                    scope.clearInput = function(){
                        scope.event.title = '';
                        scope.eventModal.title.$pristine = true;
                        scope.event.startDate = moment().toDate();
                        scope.event.endDate = moment().toDate();
                        scope.event.type = 'lecture';
                        scope.event.content = '';
                    };

                    scope.submitEvent = function(){
                        if(!scope.event.title){
                            scope.valid.title = false;
                            return;
                        }
                        scope.event.batch = $route.current.params.batchId;
                        scope.event.startDate = moment(scope.event.startDate).hour(12);
                        scope.event.endDate = moment(scope.event.endDate).hour(12);
                        $http.post('/api/addevent',{eventData:scope.event}).then(function(res){
                            $templateCache.remove('view/batch/training');
                            $route.reload();
                        });
                    };
                },
            };
        }]);
})(window.angular);
