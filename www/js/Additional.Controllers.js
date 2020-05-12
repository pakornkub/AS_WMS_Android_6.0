/**
* Additional.Controllers Module
*
* Description
*/
angular.module('Additional.Controllers', ['ionic'])

.controller('Additional_CheckLocationCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

	$scope.data = {};
	$scope.dataTableItem = {};
	$scope.dataTableItemLength = 0;

	var keyCnt = 0;

	/*--------------------------------------
	Data Function
	------------------------------------- */
	var clearData = function () {
		$scope.data = {};
		$scope.dataTableItem = {};
		$scope.dataTableItemLength = 0;
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('Location');
	});

	$scope.clear = function () {
		clearData();
	};


	/*--------------------------------------
	Search Function
	------------------------------------- */
	$scope.search = function (dataSearch, searchType) {

		if (!dataSearch) {
			clearData();
			AppService.err('', 'กรุณา Scan Location', 'Location');
			return;
		}

		if (searchType == 'read location') {
			keyCnt += 1;
			var curTextCount = dataSearch == null ? 0 : dataSearch.length;
			//console.log('current inut text length: ' + curTextCount);
			//console.log('current inut keyCnt: ' + keyCnt);
			if (keyCnt == 1 && curTextCount > 1) {
				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			} else {
				$scope.data.PalletSearchFlag = "no"; // set flag to stop search
			}
			//console.log('flag is ' + $scope.data.PalletSearchFlag);
			if ($scope.data.PalletSearchFlag == 'no') {
				$scope.data.PalletSearchFlag = "yes"; // set search flag back to allow do searching
				//console.log('exit seach');
				return;
			}
		}

		keyCnt = 0;

		Check_Location(dataSearch);

	};

	/*--------------------------------------
	Scan Barcode Function
	------------------------------------- */
	$scope.scanLocation = function () {
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (!imageData.cancelled) {
				$scope.data.Location = imageData.text.toUpperCase();
				$scope.search(angular.copy($scope.data.Location), '');
			}
		}, function (error) {
			AppService.err('scanLocation', error);
		});
	};



	/*--------------------------------------
	Check_Location Function
	------------------------------------- */
	function Check_Location(data) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			$scope.data.Location2 = data;

			var res_GetLocation_Index = GetLocation_Index(objsession, data);

			res_GetLocation_Index.then(function(res){

				if (!res) {
					clearData();
					AppService.err('', 'ไม่มี Location นี้ในระบบ', 'Location');
					return;
				}

				var res_getGridView_Location = getGridView_Location(objsession, res);

				res_getGridView_Location.then(function(res2){

					var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

					$scope.dataTableItem = resDataSet;
					$scope.dataTableItemLength = Object.keys(resDataSet).length;

					if (Object.keys(resDataSet).length <= 0) {
						clearData();
						AppService.err('', 'ไม่พบสิ้นค้าใน Location นี้', 'Location');
						return;
					}

					$scope.data.LocationSearchFlag = 'yes'; // set flag to false as defaut
					$scope.data.Location = null;
					setFocus('Location');

					$ionicLoading.hide();

				}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var GetLocation_Index = function (objsession, data) {
		return new Promise(function (resolve, reject) {

			App.API('GetLocation_Index', {
				objsession: objsession,
				pstrLocation: data
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('GetLocation_Index', res));
			});

		})
	}

	var getGridView_Location = function (objsession, data) {
		return new Promise(function (resolve, reject) {

			App.API('getGridView_Location', {
				objsession: objsession,
				location_index: data
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getGridView_Location', res));
			});

		})
	}

})

.controller('Additional_MoveLocationCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

	/*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
	$scope.init_data = {};

	var Tag_No = {};
	var Palletstatus_Index = {};
	var Qty = {};

	var keyCnt = 0;

	var clearData = function () {
		$scope.data = {};
		Tag_No = {};
		Palletstatus_Index = {};
		Qty = {};
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (key, value, isOptions) {
		return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('PalletNo');
	});

	$scope.data.PalletStatusTo = '0010000000004';

	/*--------------------------------------
	Call API GetStatusItem
	------------------------------------- */
	var GetStatusItem = function () {

		$ionicLoading.show();

		App.API('GetStatusItem', {
			objsession: angular.copy(LoginService.getLoginData()),
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {
				$scope.getSKUStatusList = resDataSet;
			}

		}).catch(function (res) {
			AppService.err('GetStatusItem', res);
		}).finally(function (res) {
			$ionicLoading.hide();
		});
	};

	GetStatusItem();


	/*--------------------------------------
	Scan Barcode Function
	------------------------------------- */
	$scope.scanPalletNo = function (id) {
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (!imageData.cancelled) {
				$scope['data'][id] = imageData.text.toUpperCase();
				$scope.search(angular.copy($scope['data'][id]), '');
			}
		}, function (error) {
			AppService.err('scanPalletNo', error);
		});
	};

	/*--------------------------------------
	Event Function search
	------------------------------------- */
	$scope.search = function (dataSearch, id, searchType) {

		if (!dataSearch) {
			var str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location No.';
			AppService.err('แจ้งเตื่อน', str, id);
			return;
		}

		if (searchType == 'read location no' || searchType == 'read pallet no') {
			keyCnt += 1;
			var curTextCount = dataSearch == null ? 0 : dataSearch.length;
			//console.log('current inut text length: ' + curTextCount);
			//console.log('current inut keyCnt: ' + keyCnt);
			if (keyCnt == 1 && curTextCount > 1) {
				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			} else {
				$scope.data.PalletSearchFlag = "no"; // set flag to stop search
			}
			//console.log('flag is ' + $scope.data.PalletSearchFlag);
			if ($scope.data.PalletSearchFlag == 'no') {
				$scope.data.PalletSearchFlag = "yes"; // set search flag back to allow do searching
				//console.log('exit seach');
				return;
			}
		}

		keyCnt = 0;

		if (id != 'Location') {
			searchPallet(dataSearch, id);
		}
		else {
			searchLocation();
		}


	};

	function searchPallet(dataSearch, id) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			var res_getPalletTagBalance = getPalletTagBalance(objsession, dataSearch);

			res_getPalletTagBalance.then(function (res) {

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้!', id);
					return false;
				}
				else
				{
					$scope.data.SKU = resDataSet[0].Sku_Id;
					$scope.data.Lot = resDataSet[0].PLot;
					//$scope.data.TotalQty = resDataSet[0].Qty_per_TAG;
					//$scope.data.PackageQty = resDataSet[0].Qty_per_TAG;
					$scope.data.OrderDate = $filter('date')(resDataSet[0].Order_Date, 'dd/MM/yyyy');
					$scope.data.OrderNo = resDataSet[0].Order_No;
					$scope.data.PalletStatusFrom = resDataSet[0].PalletStatus_Id;
					$scope.init_data.SKUStatus = resDataSet[0].ItemStatus_Index;
					$scope.data.Remark = resDataSet[0].Ref_No1;
					$scope.data.SysWH = resDataSet[0].Warehouse;
					$scope.data.SysLocation = resDataSet[0].Location_Alias_Really;

					Tag_No[id] = resDataSet[0].TAG_No;
					Palletstatus_Index[id] = resDataSet[0].PalletStatus_Index;
					Qty[id] = resDataSet[0].Qty_per_TAG;

					$scope.data.PalletStatusTo = (resDataSet[0].PalletStatus_Index == '0010000000003') ? '0010000000004' : resDataSet[0].PalletStatus_Index;

					return getTag_Sum(objsession, resDataSet[0].Order_Index, dataSearch);
				}

			}).then(function(res2){

				if(res2 === false)
				{
					return;
				}

				var resDataSet2 = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1[0];

				if(Object.keys(resDataSet2).length > 0)
				{
					$scope.data.TotalRoll 	= resDataSet2.Count_Tag
					$scope.data.TotalQty	= resDataSet2.Weight_Tag
					$scope.data.PackageQty 	= resDataSet2.Qty_Tag
				}

				setFocus('Location');

				$ionicLoading.hide();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var searchLocation = function () {

		savePallet();
	}

	var getPalletTagBalance = function (objsession, pPallet_No) {
		return new Promise(function (resolve, reject) {

			App.API('getPalletTagBalance', {
				objsession: objsession,
				pPallet_No: pPallet_No
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getPalletTagBalance', res));
			});

		})
	}

	var getTag_Sum = function (objsession, pOrder_Index, Pallet_No) {
		return new Promise(function (resolve, reject) {

			App.API('getTag_Sum', {
				objsession: objsession,
				pOrder_Index: pOrder_Index,
				Pallet_No: Pallet_No
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getTag_Sum', res));
			});

		})
	}

	/*--------------------------------------
	Event Function save
	------------------------------------- */
	$scope.save = function () {

		savePallet();

	};

	function savePallet() {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
				AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No!', 'PalletNo');
				return;
			}

			if (!$scope.data.Location) {
				AppService.err('แจ้งเตือน', 'กรุณาป้อน ตำแหน่งจัดเก็บ!', 'Location');
				return;
			}

			var res_GetLocation_Index = GetLocation_Index(objsession, $scope.data.Location);

			res_GetLocation_Index.then(function (res) {

				if (!res) {
					$scope.data.Location = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'Location');
					return;
				}

				var res_saveSubmit = saveSubmit();

				res_saveSubmit.then(function (res2) {

					if (res2 == 'true') {
						clearData();
						$scope.init_data.SKUStatus = '';
						AppService.succ('ย้ายเรียบร้อย', 'PalletNo');
					}
					else {
						clearData();
						$scope.init_data.SKUStatus = '';
						AppService.err('แจ้งเตือน', res2, 'PalletNo');
						return;
					}

					$ionicLoading.hide();

				}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function saveSubmit() {
		try {

			var objsession = angular.copy(LoginService.getLoginData());

			var res_saveRelocateONLY_Pallet = saveRelocateONLY_Pallet(objsession, $scope.data.PalletNo, $scope.data.TotalQty, $scope.data.Location, $scope.init_data.SKUStatus, $scope.data.PalletStatusTo);

			return res_saveRelocateONLY_Pallet.then(function (res) {

				if (res != 'True') {
					return res;
				}

				return 'true';

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var GetLocation_Index = function (objsession, pstrLocation) {
		return new Promise(function (resolve, reject) {

			App.API('GetLocation_Index', {
				objsession: objsession,
				pstrLocation: pstrLocation
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('GetLocation_Index', res));
			});

		})
	}

	var saveRelocateONLY_Pallet = function (objsession, NewPallet_No, dblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index) {
		return new Promise(function (resolve, reject) {

			App.API('saveRelocateONLY_Pallet', {
				objsession: objsession,
				NewPallet_No: NewPallet_No,
				dblQtyMove: dblQtyMove,
				pstrNewLocation_Ailas: pstrNewLocation_Ailas,
				pstrNewItemStatus_Index: pstrNewItemStatus_Index,
				pstrNewPalletStatus_Index: pstrNewPalletStatus_Index
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('saveRelocateONLY_Pallet', res));
			});

		})
	}


})

.controller('Additional_MovePalletCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $timeout) {
  
	/*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
	$scope.getChangePalletList = {};
	$scope.getChangePalletListLength = 0;
	$scope.getChangePalletList2 = {};
	$scope.getChangePalletListLength2 = 0

	$scope.data.Count1 = 0;
	$scope.data.Count2 = 0;

	var keyCnt = 0;

	var sku_index = '';
	var lot = '';
	var baggingorderitem_index = '';
	var bool = '';

	var clearData = function () {
		$scope.data = {};
		$scope.getChangePalletList = {};
		$scope.getChangePalletListLength = 0;
		$scope.getChangePalletList2 = {};
		$scope.getChangePalletListLength2 = 0

		$scope.data.Count1 = 0;
		$scope.data.Count2 = 0;

		sku_index = '';
		lot = '';
		baggingorderitem_index = '';
		bool = '';
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('PalletNo');
	});

	$scope.DisplayFlag = 0

	$scope.changeDisplay = function (value) {

		$scope.DisplayFlag = value;

	};

	/*--------------------------------------
	Call API getGridView_ChangePallet
	------------------------------------- */
	var getGridView_ChangePallet_API = function (PalletNo, id) {

		$ionicLoading.show();

		App.API('getGridView_ChangePallet', {
			objsession: angular.copy(LoginService.getLoginData()),
			whereSql: PalletNo
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

				if(id == 'PalletNo')
				{
					$scope.getChangePalletList = resDataSet;
					$scope.getChangePalletListLength = Object.keys(resDataSet).length;
					$scope.data.Count1 = $scope.getChangePalletListLength;
				}
				else
				{
					$scope.getChangePalletList2 = resDataSet;
					$scope.getChangePalletListLength2 = Object.keys(resDataSet).length;
					$scope.data.Count2 = $scope.getChangePalletListLength2;
				}

			}

		}).catch(function (res) {
			AppService.err('getGridView_ChangePallet', res);
		}).finally(function (res) {
			$ionicLoading.hide();
		});
	};

	/*--------------------------------------
	Scan Barcode Function
	------------------------------------- */
	$scope.scanPalletNo = function (id) {
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (!imageData.cancelled) {
				$scope['data'][id] = imageData.text.toUpperCase();
				$scope.search(angular.copy($scope['data'][id]), '');
			}
		}, function (error) {
			AppService.err('scanPalletNo', error);
		});
	};

	/*--------------------------------------
	Event Function search
	------------------------------------- */
	$scope.search = function (dataSearch, id, searchType) {

		if (!dataSearch) {
			var str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No. ต้นทาง' : 'กรุณา Scan Pallet No. ปลายทาง';
			AppService.err('แจ้งเตื่อน', str, id);
			return;
		}

		if (searchType == 'read location no' || searchType == 'read pallet no') {
			keyCnt += 1;
			var curTextCount = dataSearch == null ? 0 : dataSearch.length;
			//console.log('current inut text length: ' + curTextCount);
			//console.log('current inut keyCnt: ' + keyCnt);
			if (keyCnt == 1 && curTextCount > 1) {
				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			} else {
				$scope.data.PalletSearchFlag = "no"; // set flag to stop search
			}
			//console.log('flag is ' + $scope.data.PalletSearchFlag);
			if ($scope.data.PalletSearchFlag == 'no') {
				$scope.data.PalletSearchFlag = "yes"; // set search flag back to allow do searching
				//console.log('exit seach');
				return;
			}
		}

		keyCnt = 0;

		if (id == 'PalletNo') {
			searchPallet(dataSearch, id);
		}
		else {
			searchPallet2(dataSearch, id);
		}


	};

	function searchPallet(dataSearch, id) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_get_Current_Pallet = get_Current_Pallet(objsession, dataSearch);

			Promise.all([res_chk_Balance_Pallet,res_get_Current_Pallet]).then(function(res){

				if(res[0])
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo');
					return false;
				}

				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ หรือ ไม่พบเอกสารอ้างอิง Pallet นี้!', 'PalletNo');
					return false;
				}

				if(resDataSet[0].PalletStatus_id != 'RD' &&  resDataSet[0].PalletStatus_id != 'PD')
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet นี้ ไม่ใช่ RD,PD!', 'PalletNo');
					return false;
				}

				return getTagByPallet(objsession, dataSearch);


			}).then(function(res2){
				
				if(res2 === false)
				{
					return;
				}

				var resDataSet2 = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet2).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่มีใน Stock!', 'PalletNo');
					return;
				}

				getGridView_ChangePallet_API(dataSearch,id);

				setFocus('PalletNo2');

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

			

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function searchPallet2(dataSearch, id) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			if(!$scope.data.PalletNo)
			{
				$scope.data.PalletNo = null;
				AppService.err('แจ้งเตือน', 'กรุณาเลือก Pallet ต้นทาง!', 'PalletNo');
				return;
			}

			if($scope.data.getChangePalletListLenght <= 0)
			{
				$scope.data.PalletNo = null;
				AppService.err('แจ้งเตือน', 'กรุณา Scan Pallet ต้นทาง!', 'PalletNo');
				return;
			}
			
			if(!dataSearch)
			{
				$scope.data.PalletNo2 = null;
				AppService.err('แจ้งเตือน', 'กรุณาเลือก Pallet ปลายทาง!', 'PalletNo2');
				return;
			}

			if($scope.data.PalletNo == dataSearch)
			{
				$scope.data.PalletNo2 = null;
				AppService.err('แจ้งเตือน', 'Pallet ต้นทางซ้ำ กับ Pallet ปลายทาง!', 'PalletNo2');
				return;
			}

			var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_get_Current_Pallet = get_Current_Pallet(objsession, dataSearch);

			Promise.all([res_chk_Balance_Pallet,res_get_Current_Pallet]).then(function(res){

				if(res[0])
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo2');
					return;
				}

				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ หรือ ไม่พบเอกสารอ้างอิง Pallet นี้!', 'PalletNo2');
					return;
				}

				if(resDataSet[0].PalletStatus_id != 'RD' &&  resDataSet[0].PalletStatus_id != 'PD' &&  resDataSet[0].PalletStatus_id != 'EM')
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet นี้ ไม่ใช่ RD,PD หรือ EM!', 'PalletNo2');
					return;
				}

				$ionicLoading.hide();

				$ionicPopup.confirm({
					title: 'Confirm',
					template: 'ยืนยันการย้ายหรือไม่ ?'
				}).then(function (res) {

					if (!res) {
						$scope.data.PalletNo2 = null;
						setFocus('PalletNo2');
						return;
					}
					else {

						ChangePallet();
					}
					
				}); //End Confirm Popup

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

			

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function ChangePallet()
	{
		try {

			$ionicLoading.show();
			
			var objsession = angular.copy(LoginService.getLoginData());

			var res_getTagByPallet = getTagByPallet(objsession, $scope.data.PalletNo);

			res_getTagByPallet.then(function(res){

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				for (var x in resDataSet) {

					sku = resDataSet[x].Sku_Index_T;
					lot = resDataSet[x].PLot;

					bool = loopUpdatePalletToItem(resDataSet[x].OrderItem_Index);

				}

				return bool;

			}).then(function(res2){
				
				var res_getTagByPallet_SumTag = getTagByPallet_SumTag(objsession,$scope.data.PalletNo2);

				return res_getTagByPallet_SumTag.then(function(res){

					var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

					return updatePalletCountWeight(objsession, $scope.data.PalletNo2, resDataSet[0].Qty_Tag, resDataSet[0].Weight_Tag, 'Target_EM', sku_index, lot);

				}).then(function(res2){

					return updatePalletCountWeight(objsession, $scope.data.PalletNo, 0, 0, 'Start_EM', ' ', ' ');

				}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}).then(function(res3){

				getGridView_ChangePallet_API($scope.data.PalletNo2,'PalletNo2');
				$scope.data.PalletNo 	= null;
				$scope.data.PalletNo2 	= null;
				$scope.data.Count1 		= 0;
				$scope.getChangePalletList = {};
				$scope.getChangePalletListLength = 0;

				AppService.succ('ย้าย Pallet เรียบร้อย', 'PalletNo');
				return;

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});	

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function loopUpdatePalletToItem(OrderItem_Index)
	{
		try {
			
			var objsession = angular.copy(LoginService.getLoginData());

			var pstrWhere = " and BaggingOrderItem_Index = (select DocumentPlanItem_Index from tb_OrderItem where OrderItem_Index = '" + OrderItem_Index + "') ";
			
			var res_getBaggingOrderItem = getBaggingOrderItem(objsession,pstrWhere);

			return res_getBaggingOrderItem.then(function(res3){

				var resDataSet2 = (!res3['diffgr:diffgram']) ? {} : res3['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet2).length > 0)
				{
					baggingorderitem_index = resDataSet2[0].BaggingOrderItem_Index;
				}
				else
				{
					baggingorderitem_index = '';
				}

				return updatePalletToItem(objsession, OrderItem_Index, baggingorderitem_index, $scope.data.PalletNo2)

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});	

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var chk_Balance_Pallet = function (objsession, pPalletNo) {
		return new Promise(function (resolve, reject) {

			App.API('chk_Balance_Pallet', {
				objsession: objsession,
				pPalletNo: pPalletNo
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('chk_Balance_Pallet', res));
			});

		})
	}

	var get_Current_Pallet = function (objsession, pPalletNo) {
		return new Promise(function (resolve, reject) {

			App.API('get_Current_Pallet', {
				objsession: objsession,
				pPalletNo: pPalletNo
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('get_Current_Pallet', res));
			});

		})
	}

	var getTagByPallet = function (objsession, pPallet_No) {
		return new Promise(function (resolve, reject) {

			App.API('getTagByPallet', {
				objsession: objsession,
				pPallet_No: pPallet_No
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getTagByPallet', res));
			});

		})
	}

	var getBaggingOrderItem = function (objsession, pstrWhere) {
		return new Promise(function (resolve, reject) {

			App.API('getBaggingOrderItem', {
				objsession: objsession,
				pstrWhere: pstrWhere
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getBaggingOrderItem', res));
			});

		})
	}

	var updatePalletToItem = function (objsession, orderitem_index, baggingorderitem_index, pallet_no) {
		return new Promise(function (resolve, reject) {

			App.API('updatePalletToItem', {
				objsession: objsession,
				orderitem_index: orderitem_index,
				baggingorderitem_index: baggingorderitem_index,
				pallet_no: pallet_no
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('updatePalletToItem', res));
			});

		})
	}

	var getTagByPallet_SumTag = function (objsession, pPallet_No) {
		return new Promise(function (resolve, reject) {

			App.API('getTagByPallet_SumTag', {
				objsession: objsession,
				pPallet_No: pPallet_No
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getTagByPallet_SumTag', res));
			});

		})
	}

	var updatePalletCountWeight = function (objsession, pallet_no, count, weight, fag, sku, lot) {
		return new Promise(function (resolve, reject) {

			App.API('updatePalletCountWeight', {
				objsession: objsession,
				pallet_no: pallet_no,
				count: count,
				weight: weight,
				fag: fag,
				sku: sku,
				lot: lot
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('updatePalletCountWeight', res));
			});

		})
	}

	/*--------------------------------------
	Event Function save
	------------------------------------- */
	$scope.save = function () {

		searchPallet2($scope.data.PalletNo2, 'PalletNo2');

	};

})

.controller('Additional_CheckRollPalletCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {
  
	/*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
	$scope.getPalletRollList = {};
	$scope.getPalletRollListLength = 0;

	$scope.data.Count = 0;

	var keyCnt = 0;

	var lot = '';
	var roll = '';
	var pos = null;

	var clearData = function () {
		$scope.data = {};
		$scope.getPalletRollList = {};
		$scope.getPalletRollListLength = 0;

		$scope.data.Count = 0;

		lot = '';
		roll = '';
		pos= null;
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('PalletNo');
	});

	$scope.DisplayFlag = 0

	$scope.changeDisplay = function (value) {

		$scope.DisplayFlag = value;

	};

	/*--------------------------------------
	Scan Barcode Function
	------------------------------------- */
	$scope.scanPalletNo = function (id) {
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (!imageData.cancelled) {
				$scope['data'][id] = imageData.text.toUpperCase();
				$scope.search(angular.copy($scope['data'][id]), '');
			}
		}, function (error) {
			AppService.err('scanPalletNo', error);
		});
	};

	/*--------------------------------------
	Event Function search
	------------------------------------- */
	$scope.search = function (dataSearch, id, searchType) {

		if (!dataSearch) {
			var str = 'กรุณา Scan Pallet No. หรือ Roll No.';
			AppService.err('แจ้งเตื่อน', str, id);
			return;
		}

		if (searchType == 'read location no' || searchType == 'read pallet no') {
			keyCnt += 1;
			var curTextCount = dataSearch == null ? 0 : dataSearch.length;
			//console.log('current inut text length: ' + curTextCount);
			//console.log('current inut keyCnt: ' + keyCnt);
			if (keyCnt == 1 && curTextCount > 1) {
				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			} else {
				$scope.data.PalletSearchFlag = "no"; // set flag to stop search
			}
			//console.log('flag is ' + $scope.data.PalletSearchFlag);
			if ($scope.data.PalletSearchFlag == 'no') {
				$scope.data.PalletSearchFlag = "yes"; // set search flag back to allow do searching
				//console.log('exit seach');
				return;
			}
		}

		keyCnt = 0;

		pos = dataSearch.indexOf("R");

		if(pos != -1)
		{
			searchRoll(dataSearch);	
		}
		else
		{
			searchPallet(dataSearch);
		}

	};

	function searchPallet(dataSearch) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_getPallet_No = getPallet_No(objsession, dataSearch);

			Promise.all([res_chk_Balance_Pallet,res_getPallet_No]).then(function(res){

				if(res[0])
				{
					$scope.data.PalletNo = null
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo');
					return false;
				}
				
				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo = null
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No. นี้ในระบบ!', 'PalletNo');
					return false;
				}

				return getData_PalletRoll(objsession, dataSearch, 'WH', 'pallet', lot, roll)


			}).then(function(res2){

				if(res2 === false)
				{
					return false;
				}

				var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);
					loadGrid(dataSearch,'WH');

					return false;
				}
				else
				{
					return getData_PalletRoll(objsession, dataSearch, 'PD', 'pallet', lot, roll)
				}

			}).then(function(res3){

				if(res3 === false)
				{
					return false;
				}

				var resDataSet = (!res3['diffgr:diffgram']) ? {} : res3['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);
					loadGrid(dataSearch,'PD');

					return false;
				}
				else
				{
					return getData_PalletRoll(objsession, dataSearch, 'EM', 'pallet', lot, roll)
				}

			}).then(function(res4){

				if(res4 === false)
				{
					$ionicLoading.hide();
					return;
				}

				var resDataSet = (!res4['diffgr:diffgram']) ? {} : res4['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);
					loadGrid(dataSearch,'TW');

				}

				$ionicLoading.hide();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function searchRoll(dataSearch) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			lot = dataSearch.substring(0, pos);
			roll = dataSearch.substring(pos+1);

			var res_getData_PalletRoll = getData_PalletRoll(objsession, dataSearch, 'WH', 'roll', lot, roll);

			res_getData_PalletRoll.then(function(res){

				if(res === false)
				{
					return false;
				}

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);

					return false;
				}
				else
				{
					return getData_PalletRoll(objsession, dataSearch, 'PD', 'roll', lot, roll)
				}

			}).then(function(res2){

				if(res2 === false)
				{
					return false;
				}

				var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);

					return false;
				}
				else
				{
					return getData_PalletRoll(objsession, dataSearch, 'EM', 'roll', lot, roll)
				}

			}).then(function(res3){


				if(res3 === false)
				{
					$ionicLoading.hide();
					return;
				}

				var resDataSet = (!res3['diffgr:diffgram']) ? {} : res3['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					setData(resDataSet);
				}
				else
				{
					scope.data.PalletNo = null
					AppService.err('แจ้งเตือน', 'ไม่มีเอกสารอ้างอิง Roll No. นี้!', 'PalletNo');
				}

				$ionicLoading.hide();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function setData(resDataSet)
	{
		try{

			$scope.data.Roll_No = resDataSet[0].Roll_No;
			$scope.data.Lot = resDataSet[0].Lot;
			$scope.data.Grade = resDataSet[0].Grade;
			$scope.data.PD_No = resDataSet[0].PD_No;
			$scope.data.Order_No = resDataSet[0].Order_No;
			$scope.data.Qty = resDataSet[0].Qty;
			$scope.data.Weight = resDataSet[0].Weight;
			$scope.data.Pallet_No = resDataSet[0].Pallet_No;
			$scope.data.Status = resDataSet[0].Status;
			$scope.data.Location = resDataSet[0].Location;
			$scope.data.Owner = resDataSet[0].Owner;
			$scope.data.WD_No = resDataSet[0].WD_No;

			$scope.getPalletRollList = {};
			$scope.getPalletRollListLength = 0;
			$scope.data.Count = 0;

			$scope.data.PalletNo = null;
			setFocus('PalletNo');

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
		
	}

	function loadGrid(dataSearch,fag)
	{
		try{

			var objsession = angular.copy(LoginService.getLoginData());

			var res_getData_PalletRoll = getData_PalletRoll(objsession, dataSearch, fag, 'view', lot, roll);

			res_getData_PalletRoll.then(function(res){

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length > 0)
				{
					$scope.getPalletRollList = resDataSet;
					$scope.getPalletRollListLength = Object.keys(resDataSet).length;
					$scope.data.Count = $scope.getPalletRollListLength;
				}

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var chk_Balance_Pallet = function (objsession, pPalletNo) {
		return new Promise(function (resolve, reject) {

			App.API('chk_Balance_Pallet', {
				objsession: objsession,
				pPalletNo: pPalletNo
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('chk_Balance_Pallet', res));
			});

		})
	}

	var getPallet_No = function (objsession, pPallet_No) {
		return new Promise(function (resolve, reject) {

			App.API('getPallet_No', {
				objsession: objsession,
				pPallet_No: pPallet_No
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getPallet_No', res));
			});

		})
	}

	var getData_PalletRoll = function (objsession, barcode, fag, type, lot, roll) {
		return new Promise(function (resolve, reject) {

			App.API('getData_PalletRoll', {
				objsession: objsession,
				barcode: barcode,
				fag: fag,
				type: type,
				lot: lot,
				roll: roll
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getData_PalletRoll', res));
			});

		})
	}
  
})

.controller('Additional_MoveRollCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

	/*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
	$scope.datatablesList = {};
    $scope.datatablesListLength = 0;

	$scope.Count = 0;

	var keyCnt = 0;

	var _baggingorderitem_index = null;
	var _orderitem_index 		= null;
	var _lot 					= null;
	var _roll 					= null;
	var _pos 					= null;
	var _sku_index 				= null;

	var clearData = function () {
		$scope.data = {};
		$scope.datatablesList = {};
    	$scope.datatablesListLength = 0;

		$scope.Count = 0;

		_baggingorderitem_index = null;
		_orderitem_index 		= null;
		_lot 					= null;
		_roll 					= null;
		_pos 					= null;
		_sku_index 				= null;
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('PalletNo');
	});

	$scope.DisplayFlag = 0

	$scope.changeDisplay = function (value) {

		$scope.DisplayFlag = value;

	};

	/*--------------------------------------
	Call API getGridView_RollToPallet
	------------------------------------- */
	var getGridView_RollToPallet_API = function()
	{
		$ionicLoading.show();

		App.API('getGridView_RollToPallet', {
			objsession: angular.copy(LoginService.getLoginData()),
			whereSql: $scope.data.PalletNo2
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {
				$scope.datatablesList = resDataSet;
				$scope.datatablesListLength = Object.keys(resDataSet).length;
				$scope.Count = $scope.datatablesListLength;
			}

		}).catch(function (res) {
			AppService.err('getGridView_RollToPallet', res);
		}).finally(function (res) {
			$ionicLoading.hide();
		});
	}

	/*--------------------------------------
	Scan Barcode Function
	------------------------------------- */
	$scope.scanPalletNo = function (id) {
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			if (!imageData.cancelled) {
				$scope['data'][id] = imageData.text.toUpperCase();
				$scope.search(angular.copy($scope['data'][id]), '');
			}
		}, function (error) {
			AppService.err('scanPalletNo', error);
		});
	};

	/*--------------------------------------
	Event Function search
	------------------------------------- */
	$scope.search = function (dataSearch, id, searchType) {

		if (!dataSearch) {
			
			if(id == 'PalletNo')
			{
				str = 'กรุณา Scan Pallet No. ต้นทาง';
			}
			else if(id == 'PalletNo2')
			{
				str = 'กรุณา Scan Pallet No. ปลายทาง';
			}
			else
			{
				str = 'กรุณา Scan Roll No.';
			}

			AppService.err('แจ้งเตื่อน', str, id);
			return;
		}

		if (searchType == 'read location no' || searchType == 'read pallet no' || searchType == 'read roll no') {
			keyCnt += 1;
			var curTextCount = dataSearch == null ? 0 : dataSearch.length;
			//console.log('current inut text length: ' + curTextCount);
			//console.log('current inut keyCnt: ' + keyCnt);
			if (keyCnt == 1 && curTextCount > 1) {
				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			} else {
				$scope.data.PalletSearchFlag = "no"; // set flag to stop search
			}
			//console.log('flag is ' + $scope.data.PalletSearchFlag);
			if ($scope.data.PalletSearchFlag == 'no') {
				$scope.data.PalletSearchFlag = "yes"; // set search flag back to allow do searching
				//console.log('exit seach');
				return;
			}
		}

		keyCnt = 0;

		if(id == 'PalletNo')
		{
			searchPallet(dataSearch);
		}
		else if(id == 'PalletNo2')
		{
			searchPallet2(dataSearch);
		}
		else if(id == 'RollNo')
		{
			searchRoll(dataSearch);	
		}

	};

	function searchPallet(dataSearch) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_get_Current_Pallet = get_Current_Pallet(objsession, dataSearch);

			Promise.all([res_chk_Balance_Pallet,res_get_Current_Pallet]).then(function(res){

				if(res[0])
				{
					$scope.data.PalletNo = null
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo');
					return;
				}
				
				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ หรือ ไม่พบเอกสารอ้างอิง Pallet นี้!', 'PalletNo');
					return;
				}

				if(resDataSet[0].PalletStatus_id != 'RD')
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet นี้ ไม่ใช่ RD!', 'PalletNo');
					return;
				}

				setFocus('RollNo');

				$ionicLoading.hide();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function searchRoll(dataSearch) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			_pos 	= dataSearch.indexOf("R");
			_lot 	= dataSearch.substring(0, _pos);
			_roll 	= dataSearch.substring(_pos+1);

			var strWhere = " and tb_tag.Pallet_No = '" + $scope.data.PalletNo + "' and tb_tag.plot = '" + _lot + "' and tb_BaggingOrderItem.Roll_No = '" + _roll + "' ";

			var res_chk_RollINPallet = chk_RollINPallet(objsession, strWhere);

			res_chk_RollINPallet.then(function(res){

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.RollNo = null
					AppService.err('แจ้งเตือน', 'Roll ที่เลือกไม่ได้อยู่ใน Pallet นี้!', 'RollNo');
					return;
				}

				$scope.data.Grade = resDataSet[0].SKU_Id;
				$scope.data.Lot = resDataSet[0].PLot;
				$scope.data.Roll = resDataSet[0].Roll_No;
				$scope.data.Weight = resDataSet[0].Weight_Act;
				$scope.data.Length = resDataSet[0].Total_Qty;
				
				_orderitem_index = resDataSet[0].OrderItem_Index;
				_baggingorderitem_index = resDataSet[0].DocumentPlanItem_Index;
				_sku_index = resDataSet[0].SKU_Index;
				
				setFocus('PalletNo2');

				$ionicLoading.hide();

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	function searchPallet2(dataSearch) {
		try {

			$ionicLoading.show();

			AppService.blur();

			var objsession = angular.copy(LoginService.getLoginData());

			if(!$scope.data.PalletNo)
			{
				$scope.data.PalletNo = null
				AppService.err('แจ้งเตือน', 'กรุณา Scan Pallet No. ต้นทาง', 'PalletNo');
				return;
			}

			if(!$scope.data.RollNo)
			{
				$scope.data.PalletNo = null
				AppService.err('แจ้งเตือน', 'กรุณา Scan Roll No.', 'RollNo');
				return;
			}

			var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_getPalletInBGPallet = getPalletInBGPallet(objsession, " AND Pallet_No = '" + dataSearch + "' ");

			Promise.all([res_chk_Balance_Pallet,res_getPalletInBGPallet]).then(function(res){

				if(res[0])
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo2');
					return;
				}
				
				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ หรือ ไม่พบเอกสารอ้างอิง Pallet นี้!', 'PalletNo2');
					return;
				}

				if(resDataSet[0].PalletStatus_Index != '0010000000004' && resDataSet[0].PalletStatus_Index != '0010000000000')
				{
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'สถานะ Pallet นี้ ไม่ใช่ RD, EM!', 'PalletNo2');
					return;
				}

				if(resDataSet[0].PalletStatus_Index == '0010000000004')
				{
					var res_chk_RollINPallet = chk_RollINPallet(objsession, " and tb_tag.Pallet_No = '" + dataSearch + "' ");

					return res_chk_RollINPallet.then(function(res){

						var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

						if(Object.keys(resDataSet).length > 0)
						{
							//อัพเดท pallet ของ roll ที่จะย้าย
							return updatePalletToItem(objsession, _orderitem_index, _baggingorderitem_index, dataSearch);
						}
						else{

							$scope.data.PalletNo2 = null;
							AppService.err('แจ้งเตือน', 'Pallet ผิดพลาด!', 'PalletNo2');
							return false;
						}

					}).then(function(res2){

						if(res2 === false)
						{
							return false;
						}

						//อัพเดท น้ำหนัก เเละ ความยาว และ สถานะ ของ pallet ที่จะย้าย
						var res_getPalletCountWeight = getPalletCountWeight(objsession, $scope.data.PalletNo);

						return res_getPalletCountWeight.then(function(res){

							var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

							if(Object.keys(resDataSet).length > 0 && resDataSet[0].Count_Pallet > 0)
							{
								return updatePalletCountWeight(objsession, $scope.data.PalletNo, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, "Start", " ", " ");
							}
							else if(Object.keys(resDataSet).length > 0 && resDataSet[0].Count_Pallet == 0)
							{
								return updatePalletCountWeight(objsession, $scope.data.PalletNo, 0, 0, "Start_EM", " ", " ");
							}
							else{

								$scope.data.PalletNo2 = null;
								AppService.err('แจ้งเตือน', 'การ Update Pallet ที่จะย้ายผิดพลาด!', 'PalletNo2');
								return false;
							}
							
						}).catch(function (error) {
							console.log("Error occurred");
							AppService.err('Error', 'Error occurred', '');
							return;
						});

					}).then(function(res3){

						if(res3 === false)
						{
							return false;
						}

						//อัพเดท น้ำหนัก เเละ ความยาว และ สถานะ ของ pallet ที่จะย้ายไป
						var res_getPalletCountWeight = getPalletCountWeight(objsession, $scope.data.PalletNo2);

						return res_getPalletCountWeight.then(function(res){

							var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

							if(Object.keys(resDataSet).length > 0)
							{
								return updatePalletCountWeight(objsession, $scope.data.PalletNo2, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, "Target", " ", " ");
							}
							else{

								$scope.data.PalletNo2 = null;
								AppService.err('แจ้งเตือน', 'การ Update Pallet ที่จะย้ายผิดพลาด!', 'PalletNo2');
								return false;
							}
							
						}).catch(function (error) {
							console.log("Error occurred");
							AppService.err('Error', 'Error occurred', '');
							return;
						});

					}).then(function(res4){

						if(res4 === false)
						{
							$ionicLoading.hide();
							return;
						}

						getGridView_RollToPallet_API();
						$scope.data = {};
						AppService.succ('ทำการย้ายเรียบร้อย', 'PalletNo');
						return;

					}).catch(function (error) {
						console.log("Error occurred");
						AppService.err('Error', 'Error occurred', '');
						return;
					});
				}
				else
				{

					//อัพเดท pallet ของ roll ที่จะย้าย
					var res_updatePalletToItem = updatePalletToItem(objsession, _orderitem_index, _baggingorderitem_index, dataSearch);

					return res_updatePalletToItem.then(function(res){

						//อัพเดท น้ำหนัก เเละ ความยาว และ สถานะ ของ pallet ที่จะย้าย
						var res_getPalletCountWeight = getPalletCountWeight(objsession, $scope.data.PalletNo);

						return res_getPalletCountWeight.then(function(res){

							var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

							if(Object.keys(resDataSet).length > 0 && resDataSet[0].Count_Pallet > 0)
							{
								return updatePalletCountWeight(objsession, $scope.data.PalletNo, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, "Start", " ", " ");
							}
							else if(Object.keys(resDataSet).length > 0 && resDataSet[0].Count_Pallet == 0)
							{
								return updatePalletCountWeight(objsession, $scope.data.PalletNo, 0, 0, "Start_EM", " ", " ");
							}
							else{

								$scope.data.PalletNo2 = null;
								AppService.err('แจ้งเตือน', 'การ Update Pallet ที่จะย้ายผิดพลาด!', 'PalletNo2');
								return false;
							}

						}).then(function(res2){

							if(res2 === false)
							{
								return false;
							}

							//อัพเดท น้ำหนัก เเละ ความยาว และ สถานะ ของ pallet ที่จะย้ายไป
							var res_getPalletCountWeight = getPalletCountWeight(objsession, $scope.data.PalletNo2);

							return res_getPalletCountWeight.then(function(res){

								var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

								if(Object.keys(resDataSet).length > 0)
								{
									return updatePalletCountWeight(objsession, $scope.data.PalletNo2, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, "Target_EM", _sku_index, _lot);
								}
								else{

									$scope.data.PalletNo2 = null;
									AppService.err('แจ้งเตือน', 'การ Update Pallet ที่จะย้ายผิดพลาด!', 'PalletNo2');
									return false;
								}
								
							}).catch(function (error) {
								console.log("Error occurred");
								AppService.err('Error', 'Error occurred', '');
								return;
							});

						}).then(function(res3){

							if(res3 === false)
							{
								$ionicLoading.hide();
								return;
							}
	
							getGridView_RollToPallet_API();
							$scope.data = {};
							AppService.succ('ทำการย้ายเรียบร้อย', 'PalletNo');
							return;
							
						}).catch(function (error) {
							console.log("Error occurred");
							AppService.err('Error', 'Error occurred', '');
							return;
						});

					}).catch(function (error) {
						console.log("Error occurred");
						AppService.err('Error', 'Error occurred', '');
						return;
					});

				}

			}).catch(function (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		} catch (error) {
			console.log("Error occurred");
			AppService.err('Error', 'Error occurred', '');
			return;
		}
	}

	var chk_Balance_Pallet = function (objsession, pPalletNo) {
		return new Promise(function (resolve, reject) {

			App.API('chk_Balance_Pallet', {
				objsession: objsession,
				pPalletNo: pPalletNo
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('chk_Balance_Pallet', res));
			});

		})
	}

	var get_Current_Pallet = function (objsession, pPalletNo) {
		return new Promise(function (resolve, reject) {

			App.API('get_Current_Pallet', {
				objsession: objsession,
				pPalletNo: pPalletNo
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('get_Current_Pallet', res));
			});

		})
	}

	var chk_RollINPallet = function (objsession, whereSql) {
		return new Promise(function (resolve, reject) {

			App.API('chk_RollINPallet', {
				objsession: objsession,
				whereSql: whereSql
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('chk_RollINPallet', res));
			});

		})
	}

	var getPalletInBGPallet = function (objsession, pstrWhere) {
		return new Promise(function (resolve, reject) {

			App.API('getPalletInBGPallet', {
				objsession: objsession,
				pstrWhere: pstrWhere
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getPalletInBGPallet', res));
			});

		})
	}

	var updatePalletToItem = function (objsession, orderitem_index, baggingorderitem_index, pallet_no) {
		return new Promise(function (resolve, reject) {

			App.API('updatePalletToItem', {
				objsession: objsession,
				orderitem_index: orderitem_index,
				baggingorderitem_index: baggingorderitem_index,
				pallet_no: pallet_no
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('updatePalletToItem', res));
			});

		})
	}

	var getPalletCountWeight = function (objsession, whereStr) {
		return new Promise(function (resolve, reject) {

			App.API('getPalletCountWeight', {
				objsession: objsession,
				whereStr: whereStr
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('getPalletCountWeight', res));
			});

		})
	}

	var updatePalletCountWeight = function (objsession, pallet_no, count, weight, fag, sku, lot) {
		return new Promise(function (resolve, reject) {

			App.API('updatePalletCountWeight', {
				objsession: objsession,
				pallet_no: pallet_no,
				count: count,
				weight: weight,
				fag: fag,
				sku: sku,
				lot: lot
			}).then(function (res) {
				resolve(res);
			}).catch(function (res) {
				reject(AppService.err('updatePalletCountWeight', res));
			});

		})
	}

	/*--------------------------------------
	Event Function save
	------------------------------------- */
	$scope.save = function () {

		if(!$scope.data.PalletNo2)
		{
			$scope.data.PalletNo2 = null
			AppService.err('แจ้งเตือน', 'กรุณา Scan Pallet No. ปลายทาง', 'PalletNo2');
			return;
		}

		searchPallet2($scope.data.PalletNo2);

	};
	
});

