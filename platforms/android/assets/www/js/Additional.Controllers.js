/**
 * Additional.Controllers Module
 *
 * Description
 */
angular.module('Additional.Controllers', ['ionic'])

	.controller('Additional_CheckPalletCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

		let keyCnt = 0;
		let resCnt = 0;
		let qtyItem = 0;

		/*--------------------------------------
		Data Function
		------------------------------------- */
		let clearData = () => {
			$scope.data = {};
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('PalletNo');
		});

		$scope.clear = function () {
			clearData();
		};

		/*--------------------------------------
		setValues Function
		------------------------------------- */
		let setValues = (getData) => {
			$scope.data.Pallet_No = $scope.data.PalletNo;
			$scope.data.Grade = getData.SKU_Id;
			$scope.data.Lot = getData.Plot;
			$scope.data.Location = getData.Location;
			$scope.data.Document = getData.Doc_No;
			$scope.data.Qty = getData.QTY + qtyItem;
			$scope.data.Bag = (getData.QTY / getData.Unit_Weight) + (qtyItem / getData.Unit_Weight);
			$scope.data.Status = getData.PalletStatus_id;
			$scope.data.FTLT = getData.FT;
			$scope.data.Customer = getData.Customer;
			$scope.data.CustomerShip = getData.CustomerSH;
		};

		/*--------------------------------------
		Search Function
		------------------------------------- */
		$scope.search = (dataSearch, searchType) => {

			if (!dataSearch) {
				clearData();
				AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}

			if (searchType == 'read pallet no') {
				keyCnt += 1;
				let curTextCount = dataSearch == null ? 0 : dataSearch.length;
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

			Check_Pallet(dataSearch);

		};

		/*--------------------------------------
		Scan Barcode Function
		------------------------------------- */
		$scope.scanPalletNo = () => {
			$cordovaBarcodeScanner.scan().then(function (imageData) {
				if (!imageData.cancelled) {
					$scope.data.PalletNo = imageData.text.toUpperCase();
					$scope.search(angular.copy($scope.data.PalletNo), '');
				}
			}, function (error) {
				AppService.err('scanPalletNo', error);
			});
		};

		/*--------------------------------------
		Check_Pallet Function
		------------------------------------- */
		async function Check_Pallet(data) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_chk_Balance_Pallet = await chk_Balance_Pallet(objsession, data);

				if (res_chk_Balance_Pallet) {
					$scope.data.PalletNo = null;
					AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'PalletNo');
					return;
				}

				const res_get_Current_Pallet = await get_Current_Pallet(objsession, data);

				let resData = (!res_get_Current_Pallet['diffgr:diffgram']) ? {} : res_get_Current_Pallet['diffgr:diffgram'].NewDataSet.Table1;
				
				if(Object.keys(resData).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('', 'ไม่พบเอกสารอ้างอิง Pallet นี้', 'PalletNo');
					return;
				}

				if (!resData[0].PalletStatus_id) {

					$scope.data.PalletNo = null;
					AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');
					return;

				} 

				resCnt = Object.keys(resData).length;
				qtyItem = (resCnt == 2) ? resData[0].QTY : qtyItem;

				setValues(resData[0]);

				$scope.data.PalletSearchFlag = 'yes'; // set flag to false as defaut
				$scope.data.PalletNo = null;
				setFocus('PalletNo');

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let chk_Balance_Pallet = (objsession, data) => {
			return new Promise((resolve, reject) => {

				App.API('chk_Balance_Pallet', {
					objsession: objsession,
					pPalletNo: data
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('chk_Balance_Pallet', res));
				});

			})
		}

		let get_Current_Pallet = (objsession, data) => {
			return new Promise((resolve, reject) => {

				App.API('get_Current_Pallet', {
					objsession: objsession,
					pPalletNo: data
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('get_Current_Pallet', res));
				});

			})
		}

	})

	.controller('Additional_CheckLocationCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

		$scope.data = {};
		$scope.dataTableItem = {};
		$scope.dataTableItemLength = 0;

		let keyCnt = 0;

		/*--------------------------------------
		Data Function
		------------------------------------- */
		let clearData = () => {
			$scope.data = {};
			$scope.dataTableItem = {};
			$scope.dataTableItemLength = 0;
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('Location');
		});

		$scope.clear = () => {
			clearData();
		};


		/*--------------------------------------
		Search Function
		------------------------------------- */
		$scope.search = (dataSearch, searchType) => {

			if (!dataSearch) {
				clearData();
				AppService.err('', 'กรุณา Scan Location', 'Location');
				return;
			}

			if (searchType == 'read location') {
				keyCnt += 1;
				let curTextCount = dataSearch == null ? 0 : dataSearch.length;
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
		$scope.scanLocation = () => {
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
		async function Check_Location(data) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				$scope.data.Location2 = data;

				const res_GetLocation_Index = await GetLocation_Index(objsession, data);

				if (!res_GetLocation_Index) {
					clearData();
					AppService.err('', 'ไม่มี Location นี้ในระบบ', 'Location');
					return;
				}

				const res_getGridView_Location = await getGridView_Location(objsession, res_GetLocation_Index);

				let resDataSet = (!res_getGridView_Location['diffgr:diffgram']) ? {} : res_getGridView_Location['diffgr:diffgram'].NewDataSet.Table1;

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

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let GetLocation_Index = (objsession, data) => {
			return new Promise((resolve, reject) => {

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

		let getGridView_Location = (objsession, data) => {
			return new Promise((resolve, reject) => {

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

	.controller('Additional_AddPalletToTagCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.init_data = {};
		$scope.getStatusPalletList = {};
		$scope.getPDList = {};
		$scope.getTagList = {};

		$scope.isDisable = false;

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.getPDList = {};
			$scope.getTagList = {};
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		let findByValue = (key, value, isOptions) => {
			return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
		};

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('PalletNo');
		});

		/*--------------------------------------
		Call API GetStatusPallet
		------------------------------------- */
		let GetStatusPallet = () => {

			$ionicLoading.show();

			App.API('GetStatusPallet', {
				objsession: angular.copy(LoginService.getLoginData()),
			}).then(function (res) {

				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getStatusPalletList = resDataSet;

					$scope.init_data.StatusPallet = resDataSet[4].PalletStatus_Index;

					setFocus('PalletNo');
				}

			}).catch(function (res) {
				AppService.err('GetStatusPallet', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetStatusPallet();


		/*--------------------------------------
		Scan Barcode Function
		------------------------------------- */
		$scope.scanPalletNo = (id) => {
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
		$scope.search = (dataSearch, id, searchType) => {

			if (!dataSearch) {
				let str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location No.';
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
				searchLocation(dataSearch, id);
			}

		};

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, dataSearch);

				let resDataSet = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No ในระบบ', id);
					return;
				}

				if (resDataSet[0].PalletStatus_Index != '0010000000000') {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่อยู่ในสถานะ EM', id);
					return;
				}

				$scope.isDisable = true;
				setFocus('Location');

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		async function searchLocation(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_Find_GradeLot_IN_location_BySku = await Find_GradeLot_IN_location_BySku(objsession, dataSearch);

				let resDataSet = (!res_Find_GradeLot_IN_location_BySku['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location_BySku['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getPDList = resDataSet;
					$scope.changePD(resDataSet[0].sku_index);
				}

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let getPalletInBGPallet = (objsession, Pallet_No) => {
			return new Promise((resolve, reject) => {

				let strWhere = " and PALLET_No='" + Pallet_No + "' ";

				App.API('getPalletInBGPallet', {
					objsession: objsession,
					pstrWhere: strWhere
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getPalletInBGPallet', res));
				});

			})
		}

		let Find_GradeLot_IN_location_BySku = (objsession, pstrLocationAlias) => {
			return new Promise((resolve, reject) => {

				App.API('Find_GradeLot_IN_location_BySku', {
					objsession: objsession,
					pstrLocationAlias: pstrLocationAlias
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Find_GradeLot_IN_location_BySku', res));
				});

			})
		}

		/*--------------------------------------
		Event Function changePD
		------------------------------------- */
		$scope.changePD = (Sku_Index) => {

			$scope.data.PD = Sku_Index;

			loadTagList(Sku_Index);

		};

		async function loadTagList(Sku_Index) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_Find_GradeLot_IN_location_ByTag = await Find_GradeLot_IN_location_ByTag(objsession, $scope.data.Location, Sku_Index);

				let resDataSet = (!res_Find_GradeLot_IN_location_ByTag['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location_ByTag['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getTagList = resDataSet;
					$scope.changeTag(resDataSet[0].tag_no);
				}

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let Find_GradeLot_IN_location_ByTag = (objsession, pstrLocationAlias, pstrSku_Index) => {
			return new Promise((resolve, reject) => {

				App.API('Find_GradeLot_IN_location_ByTag', {
					objsession: objsession,
					pstrLocationAlias: pstrLocationAlias,
					pstrSku_Index: pstrSku_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Find_GradeLot_IN_location_ByTag', res));
				});

			})
		}

		/*--------------------------------------
		Event Function changeTag
		------------------------------------- */
		$scope.changeTag = (Tag_No) => {

			$scope.data.Tag = Tag_No

			loadTag(Tag_No);

		};

		async function loadTag(Tag_No) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_Find_GradeLot_IN_location_ByTag_Detail = await Find_GradeLot_IN_location_ByTag_Detail(objsession, $scope.data.Location, Tag_No);

				let resDataSet = (!res_Find_GradeLot_IN_location_ByTag_Detail['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location_ByTag_Detail['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.data.SKU_Str1 = resDataSet[0].str1;
					$scope.data.SKU = resDataSet[0].sku_id;
					$scope.data.Lot = resDataSet[0].Plot;
					$scope.data.Status = resDataSet[0].Description;
					$scope.data.Qty = resDataSet[0].qty_bal;
				}

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let Find_GradeLot_IN_location_ByTag_Detail = (objsession, pstrLocationAlias, pstrTag_No) => {
			return new Promise((resolve, reject) => {

				App.API('Find_GradeLot_IN_location_ByTag_Detail', {
					objsession: objsession,
					pstrLocationAlias: pstrLocationAlias,
					pstrTag_No: pstrTag_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Find_GradeLot_IN_location_ByTag_Detail', res));
				});

			})
		}

		/*--------------------------------------
		Event Function save
		------------------------------------- */
		$scope.save = () => {

			if (!$scope.data.PalletNo) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}

			if (!$scope.data.Location) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location No.', 'Location');
				return;
			}

			savePallet();

		};

		async function savePallet() {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				await updatePalletToTag(objsession, $scope.data.Tag, $scope.data.PalletNo, $scope.data.Lot, $scope.init_data.StatusPallet);

				clearData();

				$scope.init_data.StatusPallet = '0010000000004';

				$scope.isDisable = false;

				AppService.succ('บันทึกข้อมูลเรียบร้อย', 'PalletNo');

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let updatePalletToTag = (objsession, pstrTag_No, pstrPallet_No, PLot, pstrPalletstatus_index) => {
			return new Promise((resolve, reject) => {

				App.API('updatePalletToTag', {
					objsession: objsession,
					pstrTag_No: pstrTag_No,
					pstrPallet_No: pstrPallet_No,
					PLot: (PLot) ? PLot : '',
					pstrPalletstatus_index: pstrPalletstatus_index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('updatePalletToTag', res));
				});

			})
		}


	})

	.controller('Additional_MovePalletToLocationCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.init_data = {};

		let Tag_No = {};
		let Palletstatus_Index = {};
		let Qty = {};

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			Tag_No = {};
			Palletstatus_Index = {};
			Qty = {};
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		let findByValue = (key, value, isOptions) => {
			return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
		};

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('PalletNo');
		});

		$scope.data.PalletStatusTo = 'RD';

		/*--------------------------------------
		Call API GetStatusItem
		------------------------------------- */
		let GetStatusItem = () => {

			$ionicLoading.show();

			App.API('GetStatusItem', {
				objsession: angular.copy(LoginService.getLoginData()),
			}).then(function (res) {

				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getSKUStatusList = resDataSet;

					setFocus('PalletNo');
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
		$scope.scanPalletNo = (id) => {
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
		$scope.search = (dataSearch, id, searchType) => {

			if (!dataSearch) {
				let str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location No.';
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

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletTagBalance = await getPalletTagBalance(objsession, dataSearch);

				let resDataSet = (!res_getPalletTagBalance['diffgr:diffgram']) ? {} : res_getPalletTagBalance['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้!', id);
					return;
				}

				$scope.data.SKU = resDataSet[0].Sku_Id;
				$scope.data.Lot = resDataSet[0].PLot;
				$scope.data.TotalQty = resDataSet[0].Qty_per_TAG;
				$scope.data.PackageQty = resDataSet[0].Qty_per_TAG;
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

				setFocus('Location');

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let searchLocation = () => {

			savePallet();
		}

		let getPalletTagBalance = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

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

		/*--------------------------------------
		Event Function save
		------------------------------------- */
		$scope.save = () => {

			savePallet();

		};

		async function savePallet() {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No!', 'PalletNo');
					return;
				}

				if (!$scope.data.Location) {
					AppService.err('แจ้งเตือน', 'กรุณาป้อน ตำแหน่งจัดเก็บ!', 'Location');
					return;
				}

				const res_GetLocation_Index = await GetLocation_Index(objsession, $scope.data.Location);

				if (!res_GetLocation_Index) {
					$scope.data.Location = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'Location');
					return;
				}


				const res_saveSubmit = await saveSubmit();

				if (res_saveSubmit == 'true') {
					clearData();
					$scope.init_data.SKUStatus = '';
					AppService.succ('ย้ายเรียบร้อย', 'PalletNo');
				}
				else {
					clearData();
					$scope.init_data.SKUStatus = '';
					AppService.err('แจ้งเตือน', res_saveSubmit, 'PalletNo');
					return;
				}

				$ionicLoading.hide();

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		async function saveSubmit() {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_saveRelocateONLY_Pallet = await saveRelocateONLY_Pallet(objsession, $scope.data.PalletNo, Qty['PalletNo'], $scope.data.Location, $scope.init_data.SKUStatus, Palletstatus_Index['PalletNo']);

				if (res_saveRelocateONLY_Pallet != 'True') {
					return res_saveRelocateONLY_Pallet;
				}

				return 'true';

			} catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}

		let GetLocation_Index = (objsession, pstrLocation) => {
			return new Promise((resolve, reject) => {

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

		let saveRelocateONLY_Pallet = (objsession, NewPallet_No, dblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index) => {
			return new Promise((resolve, reject) => {

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


	});
