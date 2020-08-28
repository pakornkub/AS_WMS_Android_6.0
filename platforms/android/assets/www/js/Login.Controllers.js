/**
 * Login.Controllers Module
 *
 * Description
 */
angular.module('Login.Controllers', ['ionic'])

	.controller('LoginCtrl', function ($scope, $rootScope, $ionicPopup, $state, $ionicLoading, App, AppService, LoginService, $filter, $ionicPlatform, $cordovaKeyboard, $ionicHistory, md5) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$ionicHistory.clearHistory();
		$ionicHistory.clearCache();
		LoginService.clearValueLoginData();

		var setFocus = function (id) {
			AppService.focus(id);
		}

		$scope.$on('$ionicView.enter', function () {
			setFocus('password');
		});

		$scope.$on("$destroy", function () {
			if ($rootScope.promise) {
				$rootScope.stopCount();
			}
		});

		/*--------------------------------------
		Call API LoadBranch
		------------------------------------- */
		var LoadBranch_API = function() {

			AppService.startLoading();

			App.API('LoadBranch').then(function (res) {
				$scope.loadBranchList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
				$scope.login.database = $scope.loadBranchList[0].Branch_Id;
			}).catch(function (res) {
				AppService.err('LoadBranch', res);
			}).finally(function (res) {
				AppService.stopLoading();
			});

		}

		LoadBranch_API();

		/*--------------------------------------
		Event Function login 
		------------------------------------- */
		$scope.login = function (login) {

			AppService.startLoading();

			if (!login.database) {
				AppService.err('แจ้งเตือน', 'กรุณาเลือกฐานข้อมูล', 'password');
				return;
			}

			var arr = login.password.split("_");
			var usr = arr[0];
			var pwd = md5.createHash(arr[1] || '');

			var res_checkUser 	= CheckUser(usr,pwd);
			var res_SelectDB 	= SelectDB(login.database);

			Promise.all([res_checkUser,res_SelectDB]).then(function(res){
			
				var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1[0];

				var resDataSet2 = (!res[1]) ? '' : res[1];

				if (Object.keys(resDataSet).length <= 0) {
					//login.username = null;
					login.password = null;
					AppService.err('แจ้งเตือน', 'ผู้ใช้หรือรหัสไม่ถูกต้อง', 'password');
					return;
				}
				
				if(!resDataSet2)
				{
					AppService.err('แจ้งเตือน', 'ฐานข้อมูลไม่ถูกต้อง', 'password');
					return;
				}

				/* Set Global Dataset*/
				LoginService.setLoginData('Version', '3.5.208.26');
				LoginService.setLoginData('Branch_ID', login.database);
				LoginService.setLoginData('ConnectionStr', resDataSet2);/*"Data Source=192.168.23.60;Initial Catalog=WMS_Site_AS;User ID=sa; PWD=kascodb;"*/
				LoginService.setLoginData('Userindex', resDataSet.user_index);
				LoginService.setLoginData('Username', resDataSet.userName);
				LoginService.setLoginData('UserFullName', resDataSet.userFullName);
				LoginService.setLoginData('Group_index', (!resDataSet.group_index) ? '00000' : resDataSet.group_index);
				LoginService.setLoginData('Status_id', resDataSet.status_id);
				LoginService.setLoginData('Department_Index', resDataSet.Department_Index);
				// LoginService.setLoginData('Host_Name', null);
				// LoginService.setLoginData('Host_IP', null);

				$state.go('app', {
					'menuPage': 'app',
					'namePage': 'Main Menu'
				}); //Main Menu

				AppService.stopLoading();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		};

		var CheckUser = function (UserName, Password) {
			return new Promise(function (resolve, reject) {

				App.API('CheckUser', {
					UserName: UserName,
					Password: Password
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('CheckUser', res));
				});

			})
		}

		var SelectDB = function (Branch_Id) {
			return new Promise(function (resolve, reject) {

				App.API('SelectDB', {
					Branch_Id: Branch_Id
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SelectDB', res));
				});

			})
		}

		/*--------------------------------------
		Event Function exit 
		------------------------------------- */
		$scope.exit = function () {
			ionic.Platform.exitApp();
		};

	});
