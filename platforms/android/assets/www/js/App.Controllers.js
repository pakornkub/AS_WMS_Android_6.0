/**
 * App.Controllers Module
 *
 * function for all page
 *
 * Description
 */
angular
	.module("App.Controllers", [])

	.run(function ($rootScope,$interval) {
		$rootScope.typeOf = function (value) {
			return typeof value;
		};

		$rootScope.countDown = 0;
		$rootScope.closeLoading = 0;
		$rootScope.promise;

		$rootScope.startCount = function(){

			$rootScope.stopCount();

			$rootScope.promise = $interval(function() {

				$rootScope.countDown++

				if($rootScope.countDown == 15)
				{
					$rootScope.closeLoading = 1;
				}

			}, 1000);   

		}

		$rootScope.stopCount = function() {
			
			$interval.cancel($rootScope.promise);
			$rootScope.countDown = 0;
			$rootScope.closeLoading = 0;
			
		};
		
		
	})

	.provider("AppManager", function () {
		this.$get = [
			"$rootScope",
			function ($rootScope) {
				return {
					ConfirmBack: function ($ionicPopup,$ionicLoading) {
						$rootScope.GoBack = function () {
							$ionicPopup
								.confirm({
									title: "Confirm",
									template: "ต้องการออกจากหน้านี้?"
								})
								.then(function (res) {
									if (res) {
										$rootScope.$ionicGoBack();
									}
								});
						};
					},
					StopLoad: function ($ionicLoading) {
						$rootScope.stopLoading = function () {
							$ionicLoading.hide();
							$rootScope.stopCount();
						};
					}
				};
			}
		];
	})

	.service("AppService", function ($ionicLoading, $ionicPopup, $rootScope) {
		return {
			err: function (str, err, isFocus) {
				if (str) console.log(!str ? "alert " : "catch " + str + " == ", err);

				$ionicLoading.hide();
				$rootScope.stopCount();
				

				if (isFocus && err) {
					document.querySelector("input,select").blur();
					$("input,select").blur();
				}

				$ionicPopup
					.alert({
						title: "Error",
						template: !str ? err : str + " :: " + err
					})
					.then(function (err) {
						if (isFocus && err) {
							$(document).ready(function () {
								document.getElementById(isFocus).focus();
								$("#" + isFocus).focus();
							});
						}
					});
			},
			succ: function (succ, isFocus) {

				$ionicLoading.hide();
				$rootScope.stopCount();

				if (isFocus && succ) {
					document.querySelector("input,select").blur();
					$("input,select").blur();
				}

				$ionicPopup
					.alert({
						title: "Success",
						template: succ
					})
					.then(function (suc) {
						if (isFocus && suc) {
							$(document).ready(function () {
								document.getElementById(isFocus).focus();
								$("#" + isFocus).focus();
							});
						}
					});
			},
			err_disconnect: function (str, err, isFocus) {
				if (str) console.log(!str ? "alert " : "catch " + str + " == ", err);

				$ionicLoading.hide();
				$rootScope.stopCount();

				if (isFocus && err) {
					document.querySelector("input,select").blur();
					$("input,select").blur();
				}

				$ionicPopup
					.alert({
						title: "Error Network Disconnect",
						template: !str ? err : str + " :: " + err
					})
					.then(function (err) {
						//$ionicLoading.show();
						if (isFocus && err) {
							$(document).ready(function () {
								document.getElementById(isFocus).focus();
								$("#" + isFocus).focus();
							});
						}
					});
			},
			focus: function (id) {
				$(document).ready(function () {
					document.getElementById(id).focus();
					$("#" + id).focus();
				});
			},
			blur: function (id) {
				$(document).ready(function () {
					document.querySelector("input,select").blur();
					$("input,select").blur();
				});
			},
			selected: function (id, value) {
				$(document).ready(function () {
					document.getElementById(id).value = value;
					$("#" + id).val(value);
				});
			},
			findObjValue: function (Obj, Key, Value, isOptions) {
				return $.grep(Obj, function (n, i) {
					if (isOptions === false) {
						return n[Key] != Value;
					} else {
						return n[Key] == Value;
					}
				});
			},
			stopLoading : function () {

				$ionicLoading.hide();
				$rootScope.stopCount();

			},
			startLoading : function () {

				$ionicLoading.show({
					templateUrl: 'loading.html',
					scope: $rootScope,
				}).then(function(){
	
					$rootScope.startCount();                                  
					
				});
				
			}
		};
	})

	.factory("App", function ($soap, API, ConnectivityMonitor, AppService, $ionicLoading, $state) {
		return {
			API: function (action, params) {

				/*if (ConnectivityMonitor.isOffline()) {
					AppService.err_disconnect('Network', 'Network Disconnect!');
					//console.log('Network', 'Network Disconnect!');

					var capture = setInterval(function () {

						if (!ConnectivityMonitor.isOffline()) {
							clearInterval(capture);

							setTimeout(function () {

								$ionicLoading.hide();

							}, 7000);

						}

					}, 5000);

				}*/

				/*if (ConnectivityMonitor.isOffline()) {
					AppService.err_disconnect('แจ้งเตือน', 'การเชื่อมต่อ Network มีปัญหา', '');

					$state.go('login');

					return $soap.post('', '', null);
				}*/

				console.log("action -> ", action);
				console.log("params -> ", params);
				return $soap.post(API.url, action, params ? params : null);

			}
		};
	})

	.factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork) {

		return {
			isOnline: function () {
				if (ionic.Platform.isWebView()) {
					return $cordovaNetwork.isOnline();
				} else {
					return navigator.onLine;
				}
			},
			isOffline: function () {
				if (ionic.Platform.isWebView()) {
					return !$cordovaNetwork.isOnline();
				} else {
					return !navigator.onLine;
				}
			},
			startWatching: function () {
				if (ionic.Platform.isWebView()) {

					$rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
						console.log("went online");
					});

					$rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
						console.log("went offline");
					});

				}
				else {

					window.addEventListener("online", function (e) {
						console.log("went online");
					}, false);

					window.addEventListener("offline", function (e) {
						console.log("went offline");
					}, false);
				}
			}
		}
	})

	/**
	 * @ngdoc directive
	 * @name isFocused
	 * @module flynnBookScannerApp
	 * @description gives focus the the element, can be used as attribute
	 */
	.directive("focusMe", [
		"$timeout",
		"$parse",
		function ($timeout, $parse) {
			return {
				//scope: true,   // optionally create a child scope
				link: function (scope, element, attrs) {
					var model = $parse(attrs.focusMe);
					scope.$watch(model, function (value) {
						// console.log('value=', value);
						if (value === true) {
							$timeout(function () {
								element[0].focus();
							});
						}
					});
				}
			};
		}
	])

	.directive("uppercased", function () {
		return {
			require: "ngModel",
			link: function (scope, element, attrs, modelCtrl) {
				modelCtrl.$parsers.push(function (input) {
					return input ? input.toUpperCase() : "";
				});
				element.css("text-transform", "uppercase");
			}
		};
	})

	.directive("stringToNumber", function () {
		return {
			require: "ngModel",
			link: function (scope, element, attrs, ngModel) {
				ngModel.$parsers.push(function (value) {
					return "" + value;
				});
				ngModel.$formatters.push(function (value) {
					return parseFloat(value);
				});
			}
		};
	})

	.filter("orderObjectBy", function () {
		return function (items, field, reverse) {
			var filtered = [];
			angular.forEach(items, function (item) {
				filtered.push(item);
			});
			filtered.sort(function (a, b) {
				return a[field] > b[field] ? 1 : -1;
			});
			if (reverse) filtered.reverse();
			return filtered;
		};
	});
