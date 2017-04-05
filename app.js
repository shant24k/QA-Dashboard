var app = angular.module('myApp', ['controllers', 'ngRoute','ngResource', 'factories']);
        app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/summarydefects', {
                controller: 'summaryDefectsCtrl',
                templateUrl: 'views/summarydefects.html'
            }).when('/recentdefects', {
                controller: 'defectsDetailsCtrl',
                templateUrl: 'views/recentdefects.html'
            }).when('/createnew', {
                controller: 'defectsDetailsCtrl',
                templateUrl: 'views/createnew.html'
            }).when('/recentdefects/:id', {
                controller: 'defectsDetailsCtrl',
                templateUrl: 'views/defectcommentdetails.html'
            }).otherwise({
                redirectTo: '/summarydefects'
            });
        }]);
        var factories = angular.module('factories', []);
        factories.factory('dataFactory',function($http,$resource){
            var dataFactory={};
            dataFactory.getData = function(){
                return $http.get('http://localhost:3000/db');
            }
            dataFactory.postData = function(data){
                var baseURL = 'http://localhost:3000/';
                //return $http.put(url,data);
                return $resource(baseURL+"defectCommentDetails/:id",null,  {'update':{method:'PUT' }});
            }
            dataFactory.defectData = function(data){
                var baseURL = 'http://localhost:3000/';
                return $http.post(baseURL+"defectCommentDetails",data);
               // return $resource(baseURL+"recentPurchases/",{},  {'update':{method:'PUT', isArray: true }});
            }
            return dataFactory;
        });
        var controllers = angular.module('controllers', ['factories']);
        controllers.controller('summaryDefectsCtrl', ['$scope', '$routeParams','dataFactory', function ($scope, $routeParams, dataFactory) {
             $scope.summary={};
            dataFactory.getData().then(function(response){
                                           $scope.summary.defects = response.data.defectDetails;

                                           }, function(e){
                                           console.log(e);
                                           });


        }]);

        controllers.controller('defectsDetailsCtrl', ['$scope', '$routeParams','dataFactory', function ($scope, $routeParams, dataFactory) {
            console.log($routeParams.id);
                        $scope.defect = {};
            $scope.newComment = {commentOn:null,commentBy:null,comment:null};
            $scope.newDefect = {defectId:null,summary:null,status:null,severity:null,assignedTo:null,detectedBy:null,description:null,detectedOn:"",comments:[]};
            $scope.whichDetails = parseInt($routeParams.id)-1;
                        dataFactory.getData().then(function(response){

                                           $scope.defect.alldefects = response.data.defectCommentDetails;

                                           }, function(e){
                                            console.log(e);
                                           });

            $scope.submit = function(){
                $scope.currentDefect = parseInt($routeParams.id);
                var defectDetails = $scope.defect.alldefects;
                var todaysDate = new Date();
                $scope.newComment.commentOn = todaysDate.toLocaleDateString();
                defectDetails[$scope.currentDefect -1].comments.push($scope.newComment);

                //$scope.updateId = $scope.currentDefect-1;
                var newdata = defectDetails[$scope.currentDefect-1];
                dataFactory.postData().update({id:$scope.currentDefect},newdata);
                $scope.newComment = {commentOn:null,commentBy:null,comment:null};


            }
            $scope.addNewDefect = function(){
                //var allDefectDetails = $scope.defect.alldefects;
                var currdate = new Date();
                $scope.newDefect.detectedOn = currdate.toLocaleDateString();
                //allDefectDetails.push($scope.newProduct);
                $scope.defect.alldefects.push($scope.newDefect);
                dataFactory.defectData($scope.newDefect).then(function(response){
                    console.log(response);
                    $scope.newDefect = {defectId:null,summary:null,status:null,severity:null,assignedTo:null,detectedBy:null,description:null,detectedOn:"",comments:[]};                }, function(error){
                    console.log(error);
                });
                //dataFactory.productData().update({},newProductDetails);

            }

        }]);
