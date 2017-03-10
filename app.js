var app = angular.module('myApp', ['controllers', 'ngRoute','ngResource', 'factories']);
        app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/pms/:box', {
                controller: 'pmBox',
                templateUrl: 'pmBox.html'
            }).when('/summaryproducts', {
                controller: 'summary',
                templateUrl: 'views/summaryproducts.html'
            }).when('/summarycategory', {
                controller: 'summary',
                templateUrl: 'views/summarycategory.html'
            }).when('/summarybrands', {
                controller: 'summary',
                templateUrl: 'views/summarybrands.html'
            }).when('/recentpurchases', {
                controller: 'purchaseDetails',
                templateUrl: 'views/recentpurchases.html'
            }).when('/purchasenew', {
                controller: 'purchaseDetails',
                templateUrl: 'views/purchaseForm.html'
            }).when('/recentpurchases/:detailsID', {
                controller: 'purchaseDetails',
                templateUrl: 'views/purchasedetails.html'
            }).otherwise({
                redirectTo: '/summaryproducts'
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
                return $resource(baseURL+"purchaseDetails/:id",null,  {'update':{method:'PUT' }});
            }
            dataFactory.productData = function(data){
                var baseURL = 'http://localhost:3000/';
                return $http.post(baseURL+"recentPurchases",data);
               // return $resource(baseURL+"recentPurchases/",{},  {'update':{method:'PUT', isArray: true }});
            }
            return dataFactory;
        });
        var controllers = angular.module('controllers', ['factories']);
        controllers.controller('summary', ['$scope', '$routeParams','dataFactory', function ($scope, $routeParams, dataFactory) {
             $scope.summary={};
            dataFactory.getData().then(function(response){
                                           $scope.summary.products = response.data.productDetails;

                                            $scope.summary.category = response.data.categoryDetails;
                                            $scope.summary.brands = response.data.brandsDetails;
                                           }, function(e){
                                           console.log(e);
                                           });


        }]);
        controllers.controller('purchases', ['$scope', '$routeParams','dataFactory', function ($scope, $routeParams,dataFactory) {

            $scope.purchase={};
            dataFactory.getData().then(function(response){
                                           $scope.purchase.allpurchases = response.data.recentPurchases;

                                           }, function(e){
                                            console.log(e);
                                           });


        }]);
        controllers.controller('purchaseDetails', ['$scope', '$routeParams','dataFactory', function ($scope, $routeParams, dataFactory) {
            console.log($routeParams.detailsID);
            $scope.newPurchase = {purchaseId:null,productName:null,quantity:null,buyerName:null};
            $scope.purchase={};
            $scope.newProduct = {};
            $scope.whichDetails = $routeParams.detailsID;
            dataFactory.getData().then(function(response){
                                           $scope.purchase.recentpurchases = response.data.purchaseDetails;
                                           $scope.purchase.allpurchases = response.data.recentPurchases;
                                           }, function(e){
                                            console.log(e);
                                           });

            // To create price for total quantity of devices t be ordered
            $scope.purchasePriceDetails = function(){
                var purchaseDetails = $scope.purchase.recentpurchases;
                for(var i=0;i<=purchaseDetails.length-1;i++){
                    if(purchaseDetails[i].productName == $scope.newPurchase.productName){
                        console.log(purchaseDetails[i].productId);
                        if($scope.newPurchase.quantity){
                            $scope.newPurchase.price = $scope.newPurchase.quantity * purchaseDetails[i].price;
                            console.log($scope.newPurchase.price);
                        }
                    }
                }
            }
            // To create purchase Id dynamically during filling form
            $scope.purchaseIdDetails = function(){
                var purchaseDetails = $scope.purchase.recentpurchases;
                for(var i=0;i<=purchaseDetails.length-1;i++){
                    if(purchaseDetails[i].productName == $scope.newPurchase.productName){
                        var detailsLength = purchaseDetails[i].details.length;
                        var lastPurchaseId = purchaseDetails[i].details[detailsLength-1].purchaseId;
                        var newItem = parseInt(lastPurchaseId.substring(4))+1;
                        var newPurchaseId = lastPurchaseId.substring(0,4)+newItem;
                        $scope.newPurchase.purchaseId = newPurchaseId;
                        console.log($scope.newPurchase.purchaseId);
                    }
                }
            }
            $scope.submit = function(){
                var purchaseDetails = $scope.purchase.recentpurchases;
                for(var i=0;i<=purchaseDetails.length-1;i++){
                    if(purchaseDetails[i].productName == $scope.newPurchase.productName){
                        purchaseDetails[i].details.push($scope.newPurchase)
                        console.log(purchaseDetails[i].details);
                        $scope.updateId = purchaseDetails[i].id;
                    }
                }

                var updateId = $scope.updateId;
                var newdata = purchaseDetails[updateId-1];
                dataFactory.postData().update({id:$scope.updateId},newdata);
                $scope.newPurchase = {purchaseId:null,productName:null,quantity:null,buyerName:null};
            }
            $scope.addNewProduct = function(){
                var productDetails = $scope.purchase.allpurchases;
                var url = "#/recentpurchases/"+productDetails.length;
                $scope.newProduct.details = url;
                productDetails.push($scope.newProduct);
                var newProductDetails = productDetails;
                dataFactory.productData($scope.newProduct).then(function(response){
                    console.log(response);
                    $scope.newProduct = {productId:null,price:null,details:null};
                }, function(error){
                    console.log(error);
                });
                //dataFactory.productData().update({},newProductDetails);

            }

        }]);
