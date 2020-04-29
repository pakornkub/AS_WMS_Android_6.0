/**
 * Menu_MainMenu.Controllers Module
 *
 * Description
 */
angular.module('Main.Controllers', ['ionic'])


	.controller('Main_RackCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};

		let Tag_No = {};
		let Palletstatus_Index = {};
		let Qty = {};

		let rd = null;
		let fl = null;
		let fw = null;

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

			/*if (!dataSearch) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}*/

			/*if (searchType == 'read location no' || searchType == 'read pallet no') {
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
	
			keyCnt = 0;*/

			if (id != 'Location') {
				if (!$scope.data.PalletNo) {
					AppService.err('แจ้งเตื่อน', 'กรุณาป้อน Pallet 1 !', 'PalletNo');
					return;
				}

				if (id == 'PalletNo2' && !dataSearch) {
					setFocus('Location');
					return;
				}

				if (id == 'PalletNo2' && dataSearch && dataSearch == $scope.data.PalletNo) {
					$ionicPopup.confirm({
						title: 'Confirm',
						template: 'ต้องการจัดเก็บพาเลทเดียวหรือไม่ ?'
					}).then(function (res) {

						if (!res) {
							$scope.data.PalletNo2 = null;
							setFocus('PalletNo2');
							return;
						}
						else {

							$ionicLoading.show();

							searchPallet(dataSearch, id);

							$ionicLoading.hide(); //ติดปัญหา loading ไม่ hide เลยต้องใส่ hide เพิ่ม
						}

					}); //End Confirm Popup
				}
				else {
					searchPallet(dataSearch, id);
				}

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

				if (id == 'PalletNo2') {

					const res_getPalletTagTORD = await getPalletTagTORD(objsession, dataSearch);

					let resDataSet = (!res_getPalletTagTORD['diffgr:diffgram']) ? {} : res_getPalletTagTORD['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length <= 0) {
						$scope.data.PalletNo2 = null;
						AppService.err('แจ้งเตือน', 'ไม่พบ ' + ((id == 'PalletNo') ? 'Pallet 1' : 'Pallet 2') + ' นี้!', id);
						return;
					}

					for (let x in resDataSet) {

						if (resDataSet[x].TAG_No != Tag_No['PalletNo']) {
							if ($scope.data.SKU == resDataSet[x].Sku_Id && $scope.data.Lot == resDataSet[x].PLot) {
								Tag_No[id] = resDataSet[0].TAG_No;
								Palletstatus_Index[id] = resDataSet[0].PalletStatus_Index;
								Qty[id] = resDataSet[0].Qty_per_TAG;
							}
							else {
								$scope.data.PalletNo2 = null;
								AppService.err('แจ้งเตื่อน', 'Pallet 2 SKU และ Lot ไม่ตรงกับ Pallet 1 !', 'PalletNo2');
								return;
							}
						}

					}

					setFocus('Location');
					$ionicLoading.hide();
					return;

				}

				const res_getPalletTagTORD = await getPalletTagTORD(objsession, dataSearch);

				let resDataSet = (!res_getPalletTagTORD['diffgr:diffgram']) ? {} : res_getPalletTagTORD['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ ' + ((id == 'PalletNo') ? 'Pallet 1' : 'Pallet 2') + ' นี้!', id);
					return;
				}

				$scope.data.SKU = resDataSet[0].Sku_Id;
				$scope.data.Lot = resDataSet[0].PLot;
				$scope.data.TotalQty = resDataSet[0].Qty_per_TAG
				$scope.data.PackageQty = parseFloat(resDataSet[0].Qty_per_TAG) / parseFloat(25);
				$scope.data.OrderDate = $filter('date')(resDataSet[0].Order_Date, 'dd/MM/yyyy');
				$scope.data.OrderNo = resDataSet[0].Order_No;
				$scope.data.PalletStatusFrom = resDataSet[0].PalletStatus_Id;
				$scope.data.Remark = resDataSet[0].Ref_No1;
				$scope.data.SysWH = resDataSet[0].Warehouse;
				$scope.data.SysLocation = resDataSet[0].Location;
				$scope.data.LocationReally = resDataSet[0].Location_Alias_Really;
				$scope.data.WorkRec = resDataSet[0].rd + '/' + resDataSet[0].FL + '/' + resDataSet[0].fullwork;

				Tag_No[id] = resDataSet[0].TAG_No;
				Palletstatus_Index[id] = resDataSet[0].PalletStatus_Index;
				Qty[id] = resDataSet[0].Qty_per_TAG;

				rd = resDataSet[0].rd;
				fl = resDataSet[0].FL;
				fw = resDataSet[0].fullwork;

				setFocus('PalletNo2');

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

		let getPalletTagTORD = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

				App.API('getPalletTagTORD', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getPalletTagTORD', res));
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

				if (!$scope.data.PalletNo) {
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet 1 !', 'PalletNo');
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

				if ($scope.data.SysLocation != $scope.data.Location) {
					$ionicPopup.confirm({
						title: 'Confirm',
						template: 'ตำแหน่งไม่ตรงกับตำแหน่งแนะนำ ต้องการจัดเก็บหรือไม่ ?'
					}).then(res => {

						if (!res) {
							$scope.data.Location = null;
							setFocus('Location');
							return false;
						}
						else {

							$ionicLoading.show();
							
							return saveSubmit();
						}

					}).then(res2 => {

						$ionicLoading.hide();
						
						if (res2) {
							clearData();
							AppService.succ('ย้ายเรียบร้อย', 'PalletNo');
						}

					}); //End Confirm Popup

				}
				else {
					const res_saveSubmit = await saveSubmit();

					if (res_saveSubmit) {
						clearData();
						AppService.succ('ย้ายเรียบร้อย', 'PalletNo');
					}

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

				let Itemstatus = "";
				let pcs = 1;

				if (Palletstatus_Index['PalletNo'] != '0010000000012') {
					Palletstatus_Index['PalletNo'] = '0010000000004';
					Itemstatus = '0010000000001';
				}
				else {
					Itemstatus = '0010000000005';
				}

				const res_saveRelocate = await saveRelocate(objsession, Tag_No['PalletNo'], '', Qty['PalletNo'], $scope.data.Location, Itemstatus, Palletstatus_Index['PalletNo']);

				if (res_saveRelocate != 'True') {
					return false;
				}

				if (Tag_No['PalletNo2'] && Tag_No['PalletNo'] != Tag_No['PalletNo2']) {
					if (Palletstatus_Index['PalletNo2'] != '0010000000012') {
						Palletstatus_Index['PalletNo2'] = '0010000000004';
						Itemstatus = '0010000000001';
					}
					else {
						Itemstatus = '0010000000005';
					}

					const res_saveRelocate2 = await saveRelocate(objsession, Tag_No['PalletNo2'], '', Qty['PalletNo2'], $scope.data.Location, Itemstatus, Palletstatus_Index['PalletNo2']);

					if (res_saveRelocate2 != 'True') {
						return false;
					}

					pcs++;
				}

				$scope.data.WorkRec = String(parseFloat(rd) + parseFloat(pcs)) + '/' + fl + '/' + fw

				return true;

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

		let saveRelocate = (objsession, OldTag_No, NewPallet_No, dblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index) => {
			return new Promise((resolve, reject) => {

				App.API('saveRelocate', {
					objsession: objsession,
					OldTag_No: OldTag_No,
					NewPallet_No: NewPallet_No,
					dblQtyMove: dblQtyMove,
					pstrNewLocation_Ailas: pstrNewLocation_Ailas,
					pstrNewItemStatus_Index: pstrNewItemStatus_Index,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('saveRelocate', res));
				});

			})
		}


	})

	.controller('Main_PickingRackCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQTYWithdraw = 0;

		$scope.selectedWithdraw_Index = null;
		$scope.selectedWithdraw_No = null;

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.datatablesList = {};
			$scope.datatablesListLength = 0;
			$scope.lbQTYWithdraw = 0;
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		let findByValue = (key, value, isOptions) => {
			return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
		};

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('TMno');
		});

		/*--------------------------------------
		Event Function setSelected
		------------------------------------- */
		$scope.setSelected = (Index, No) => {
			$scope.selectedWithdraw_Index = Index;
			$scope.selectedWithdraw_No = No;
		};

		/*--------------------------------------
		Event Function selected
		------------------------------------- */
		$scope.selected = function (selectedWithdraw_Index, selectedWithdraw_No) {

			$ionicLoading.show();

			if (!selectedWithdraw_Index) {
				AppService.err('แจ้งเตือน', 'ยังไม่ได้เลือกรายการ', '');
				return;
			}
			else {

				//function not async ต้องเรียก function แบบ Promise
				const res_selectedWitdraw = selectedWitdraw(selectedWithdraw_Index);

				res_selectedWitdraw.then(res => {

					if (!res) {
						return;
					}

					$state.go('main_PickingRack_Selected', { Withdraw_Index: selectedWithdraw_Index, Withdraw_No: selectedWithdraw_No });

					$ionicLoading.hide();

				}).catch(error => {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}

			$ionicLoading.hide();
		};

		async function selectedWitdraw(selectedWithdraw_Index) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getOrderStatus_inWitdraw = await getOrderStatus_inWitdraw(objsession, selectedWithdraw_Index);

				let resDataSet = (!res_getOrderStatus_inWitdraw['diffgr:diffgram']) ? {} : res_getOrderStatus_inWitdraw['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					AppService.err('แจ้งเตือน', 'ใบรับ' + resDataSet[0].Order_No_T + 'นี้ที่อ้างอิงกับ Item ในใบเบิกนี้ยังไม่เสร็จสิ้นตักลงจาก Rack ไม่ได้', '');

					return false;
				}
				else {
					return true;
				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let getOrderStatus_inWitdraw = (objsession, pstrWithDraw_index) => {
			return new Promise((resolve, reject) => {

				App.API('getOrderStatus_inWitdraw', {
					objsession: objsession,
					pstrWithDraw_index: pstrWithDraw_index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getOrderStatus_inWitdraw', res));
				});

			})
		}

		/*--------------------------------------
		Call API GetWithdraw_No
		------------------------------------- */
		let GetWithdraw_No = () => {

			$ionicLoading.show();

			let strWhere = " and w.DocumentType_Index in ('0010000000006') ";

			if ($scope.data.TMno && $scope.data.WithdrawNo) {
				strWhere += "  and W.WithDraw_No = '" + $scope.data.WithdrawNo + "'and (tm.TransportManifest_No = '" + $scope.data.TMno + "') ";
			}

			if ($scope.data.TMno && !$scope.data.WithdrawNo) {
				strWhere += "  and (tm.TransportManifest_No = '" + $scope.data.TMno + "') ";
			}

			if (!$scope.data.TMno && $scope.data.WithdrawNo) {
				strWhere += "  and (W.WithDraw_No = '" + $scope.data.WithdrawNo + "') ";
			}

			strWhere += " and w.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1) "

			App.API('GetWithdraw_No', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: strWhere
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.datatablesList = resDataSet;
					$scope.datatablesListLength = Object.keys(resDataSet).length;
					$scope.lbQTYWithdraw = $scope.datatablesListLength;

				}

			}).catch(function (res) {
				AppService.err('GetWithdraw_No', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetWithdraw_No();

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

			/*if (!dataSearch) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}*/

			/*if (searchType == 'read location no' || searchType == 'read pallet no') {
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
	
			keyCnt = 0;*/

			GetWithdraw_No();

		};

	})

	.controller('Main_PickingRack_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $ionicModal, $ionicHistory) {

		/*--------------------------------------
		Modal Function
		--------------------------------------*/
		$ionicModal.fromTemplateUrl('my-modal.html', {
			scope: $scope,
			animation: 'slide-in-right'
		}).then(function (modal) {
			$scope.modal = modal;
		});

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.modal_data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQty = 0;
		$scope.lbTotal = 0;

		$scope.isDisable = false;

		let Withdraw_Index = $stateParams.Withdraw_Index;
		let Withdraw_No = $stateParams.Withdraw_No;

		let Tag_No = null;
		let isSales = false;
		let booAssing = false;
		let _CONST_HEADERTYPE = 'MOBILE RD TO MT';

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.modal_data = {};
			$scope.datatablesList = {};
			$scope.datatablesListLength = 0;
			$scope.lbQty = 0;
			$scope.lbTotal = 0;
		};

		let clearData_Modal = () => {
			$scope.modal_data = {};
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

		$scope.data.WithdrawNo = Withdraw_No;

		/*--------------------------------------
		Call API GetWithdrawItem
		------------------------------------- */
		let GetWithdrawItem = () => {

			$ionicLoading.show();

			App.API('GetWithdrawItem', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWithdraw_Index: Withdraw_Index
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.datatablesList = resDataSet;
					$scope.datatablesListLength = Object.keys(resDataSet).length;

					let countStatus = 0;

					for (let x in $scope.datatablesList) {
						if ($scope.datatablesList[x]['WITHDRAWITEM-STATUS'] == -9 || $scope.datatablesList[x]['WITHDRAWITEM-STATUS'] == -10) {
							countStatus++;
						}
					}

					$scope.lbQty = countStatus;
					$scope.lbTotal = $scope.datatablesListLength;

				}

			}).catch(function (res) {
				AppService.err('GetWithdrawItem', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		if (!$scope.data.WithdrawNo) {
			AppService.err('แจ้งเตือน', 'ไม่พบข้อมูลการเบิก', '');
			return;
		}
		else {
			GetWithdrawItem();
		}

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
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}

			if (searchType == 'read pallet no') {
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

			searchPallet(dataSearch, id);

		};

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				let datatables = {};
				let i = 0;

				for (let x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['PALLET_x0020_NO'] == dataSearch) {

						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {
					//กรณียังไม่มีเลขพาเลท
					const res_AssingPallet_No_To_Tag = await AssingPallet_No_To_Tag(dataSearch);

					if (res_AssingPallet_No_To_Tag) {
						$scope.data.PalletNo = null;
						setFocus('PalletNo');
						$ionicLoading.hide();
						return;
					}

					//กรณีเลขพาเลทไม่ใช่พาเลทที่อยู่ในใบเบิก
					const res_SwapPallet = await SwapPallet(dataSearch);

					if (res_SwapPallet) {
						$scope.data.PalletNo = null;
						setFocus('PalletNo');
						$ionicLoading.hide();
						return;
					}

					$scope.data.PalletNo = null;
					setFocus('PalletNo');
					$ionicLoading.hide();
					return;
				}

				for (let x in datatables) {
					//check Local realtime befor
					if (datatables[x]['WITHDRAWITEM-STATUS'] == -9 || datatables[x]['WITHDRAWITEM-STATUS'] == -10) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'Pallet ' + dataSearch + ' ถูกเบิกแล้ว!', id);
						return;
					}

					if (datatables[x]['Qty_Bal'] != datatables[x]['QTY']) {
						AppService.err('แจ้งเตือน', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !', id);
						return;
					}
					else {
						//check Online real befor
						const res_CHEKPICK_WITHDRAWITEM_STATUS = await CHEKPICK_WITHDRAWITEM_STATUS(objsession, datatables[x]['WithdrawItem_Index']);//return boolean

						if (res_CHEKPICK_WITHDRAWITEM_STATUS) {
							$scope.data.PalletNo = null;
							AppService.err('แจ้งเตือน', 'Pallet ' + dataSearch + ' ถูกเบิกแล้ว!', id);
							return;
						}
						else {
							let Location = datatables[x]['Location_Alias'];
							if (Location.substring(0, 1) != 'Y') {
								Location = Location.substring(0, 1) + '-FLOOR';
							}

							//Update Status and Swap WithdrawItem . (Not Insert Transfer and Transaction)
							const res_SavePickItem_Withdraw = await SavePickItem_Withdraw(objsession, datatables[x]['TAG_x0020_NO'], datatables[x]['QTY'], Location, '0010000000001', '0010000000007', Withdraw_No, Withdraw_Index, datatables[x]['WithdrawItem_Index'], _CONST_HEADERTYPE, true);//return string

							if (res_SavePickItem_Withdraw != 'PASS') {
								AppService.err('แจ้งเตือน', 'ผิดพลาด : ในการย้าย Pallet', id);
								return;
							}

							//update real ui and Sort new
							for (let y in $scope.datatablesList) {
								if ($scope.datatablesList[y]['WithdrawItem_Index'] == datatables[x]['WithdrawItem_Index']) {
									$scope.datatablesList[y]['STATE'] = 'เบิกแล้ว';
									$scope.datatablesList[y]['WITHDRAWITEM-STATUS'] = -9;
									$scope.datatablesList[y]['PICKINGQTY'] = datatables[x]['QTY'];
									$scope.datatablesList[y]['Location_Alias'] = Location;
									$scope.datatablesList[y]['LOCATION'] = Location;
								}
							}

							let countSTATE = 0;

							for (let y in $scope.datatablesList) {
								if ($scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -9 || $scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -10) {
									countSTATE++;
								}
							}

							$scope.lbQty = countSTATE;
							$scope.lbTotal = $scope.datatablesListLength;


							$scope.data.PalletNo = null;
							setFocus('PalletNo');

						}
					}


				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function AssingPallet_No_To_Tag(dataSearch) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, dataSearch);

				let resDataSet = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					if (resDataSet[0].PalletStatus_Index == '0010000000000') {
						let datatables = {};
						let i = 0;

						for (let x in $scope.datatablesList) {

							if ($scope.datatablesList[x]['PALLET_x0020_NO'] == '') {

								datatables[i] = $scope.datatablesList[x];

								i++;
							}
						}

						if (Object.keys(datatables).length > 0) {
							SwapPallet_ModalLoad();

							return true;
						}
					}
				}

				return false;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function SwapPallet(dataSearch) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_chk_Pallet_IN_Withdraw_IS_Picked = await chk_Pallet_IN_Withdraw_IS_Picked(objsession, dataSearch);//return boolean

				if (res_chk_Pallet_IN_Withdraw_IS_Picked) {
					AppService.err('แจ้งเตือน', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!', 'PalletNo');
					return false;
				}

				const res_getVIEW_TAG_TPIPL = await getVIEW_TAG_TPIPL(objsession, dataSearch);

				let resDataSet2 = (!res_getVIEW_TAG_TPIPL['diffgr:diffgram']) ? {} : res_getVIEW_TAG_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet2).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่พบพาเลทนี้ในระบบ !', 'PalletNo');
					return false;
				}

				if (resDataSet2[0].Customer_Index != datatablesList[0].Customer_Index) {
					AppService.err('ลูกค้าไม่ตรง !', 'พาเลท ' + $scope.data.PalletNo + 'ไม่ใช่ลูกค้าคนนี้', 'PalletNo');
					return false;
				}

				let datatables = {};
				let i = 0;

				for (let x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['LOT_x002F_BATCH'] == resDataSet2[0].PLot && $scope.datatablesList[x]['SKU_x0020_ID'] == resDataSet2[0].Sku_Id && $scope.datatablesList[x]['WITHDRAWITEM-STATUS'] == 1 && $scope.datatablesList[x]['Location_Alias'] == resDataSet2[0].Location_Alias) {

						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถเบิกพาเลทนี้แทนได้เนื่องจาก Grade ,Lot,ตำแหน่ง  ไม่ตรงกับใบเบิก !', 'PalletNo');
					return false;
				}


				const res_SwapPalletInWithDraw = await SwapPalletInWithDraw(objsession, datatables[0].WithdrawItem_Index, dataSearch, Withdraw_Index);//return boolean

				if (!res_SwapPalletInWithDraw) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถ Swap ได้ เนื่องจาก <br/> - จำนวนหรือ Status Item ไม่ตรงกัน <br/> - พาเลทที่จะ Swap มีอยู่ใน DO หลายใบ', 'PalletNo');
					return false;
				}

				AppService.succ('เปลี่ยน Pallet ' + dataSearch + '  เรียบร้อย!', 'PalletNo');

				GetWithdrawItem();

				searchPallet($scope.data.PalletNo);

				return true;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let CHEKPICK_WITHDRAWITEM_STATUS = (objsession, WithdrawItem_Index, Status) => {
			return new Promise((resolve, reject) => {

				App.API('CHEKPICK_WITHDRAWITEM_STATUS', {
					objsession: objsession,
					WithdrawItem_Index: WithdrawItem_Index,
					Status: Status
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('CHEKPICK_WITHDRAWITEM_STATUS', res));
				});

			})
		}

		let SavePickItem_Withdraw = (objsession, pstrTag_No, pdblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index, Document_No, Document_Index, Documentitem_Index, Description, isPicking) => {
			return new Promise((resolve, reject) => {

				App.API('SavePickItem_Withdraw', {
					objsession: objsession,
					pstrTag_No: pstrTag_No,
					pdblQtyMove: pdblQtyMove,
					pstrNewLocation_Ailas: pstrNewLocation_Ailas,
					pstrNewItemStatus_Index: pstrNewItemStatus_Index,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index,
					Document_No: Document_No,
					Document_Index: Document_Index,
					Documentitem_Index: Documentitem_Index,
					Description: Description,
					isPicking: isPicking
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SavePickItem_Withdraw', res));
				});

			})
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

		let chk_Pallet_IN_Withdraw_IS_Picked = (objsession, pstrPalletNo) => {
			return new Promise((resolve, reject) => {

				App.API('chk_Pallet_IN_Withdraw_IS_Picked', {
					objsession: objsession,
					pstrPalletNo: pstrPalletNo
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('chk_Pallet_IN_Withdraw_IS_Picked', res));
				});

			})
		}

		let getVIEW_TAG_TPIPL = (objsession, Pallet_No) => {
			return new Promise((resolve, reject) => {

				let strWhere = " and PALLET_No='" + Pallet_No + "' and Qty_Bal>0 ";

				App.API('getVIEW_TAG_TPIPL', {
					objsession: objsession,
					pstrWhere: strWhere
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getVIEW_TAG_TPIPL', res));
				});

			})
		}

		let SwapPalletInWithDraw = (objsession, pstrWithdrawItem_Index, pstrPalletNo, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('SwapPalletInWithDraw', {
					objsession: objsession,
					pstrWithdrawItem_Index: pstrWithdrawItem_Index,
					pstrPalletNo: pstrPalletNo,
					pstrWithdraw_Index: pstrWithdraw_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SwapPalletInWithDraw', res));
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

				//AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				//การยืนยันไม่ควรตรวจสอบจากหน้าจอควร Query ใหม่แบบ RealTime หรือ Load Detail ใหม่
				GetWithdrawItem();//Reload

				//Check picking
				let countSTATE = 0;

				if ($scope.datatablesListLength > 0) {
					for (let x in $scope.datatablesList) {
						if ($scope.datatablesList[x]['WITHDRAWITEM-STATUS'] != -9 && $scope.datatablesList[x]['WITHDRAWITEM-STATUS'] != -10) {
							countSTATE++;
						}
					}

					if (countSTATE > 0) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'หยิบไม่ครบรายการ', 'PalletNo');
						return;
					}
				}


				await waitConfirmWithdrawStatus_Confirm_TranferStatus(objsession, Withdraw_Index, 6, _CONST_HEADERTYPE);

				AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)', '');

				$ionicLoading.hide();

				$ionicHistory.goBack();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let waitConfirmWithdrawStatus_Confirm_TranferStatus = (objsession, Withdraw_Index, Status, phRemark) => {
			return new Promise((resolve, reject) => {

				App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', {
					objsession: objsession,
					Withdraw_Index: Withdraw_Index,
					Status: Status,
					phRemark: phRemark
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res));
				});

			})
		}



		/*--------------------------------------
		Modal Function SwapPallet_ModalLoad
		------------------------------------- */
		async function SwapPallet_ModalLoad() {

			$scope.modal.show();

			$scope.modal_data.PalletNo = $scope.data.PalletNo;

			if (!$scope.modal_data.PalletNo) {
				setFocus('Modal_PalletNo');
			}
			else {
				$scope.isDisable = true;
				isSales = true;
				setFocus('Modal_Location');
			}

		}

		/*--------------------------------------
		Scan Barcode Modal Function
		------------------------------------- */
		$scope.scanPalletNo_Modal = (id) => {
			$cordovaBarcodeScanner.scan().then(function (imageData) {
				if (!imageData.cancelled) {
					$scope['modal_data'][id] = imageData.text.toUpperCase();
					$scope.search_modal(angular.copy($scope['modal_data'][id]), '');
				}
			}, function (error) {
				AppService.err('scanPalletNo_Modal', error);
			});
		};

		/*--------------------------------------
		Event Function search_modal
		------------------------------------- */
		$scope.search_modal = (dataSearch, id, searchType) => {

			let str = (id == 'Modal_PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location';

			if (!dataSearch) {
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

			if (id == 'Modal_Location') {
				searchLocation_Modal(dataSearch, id);
			}
			else {
				searchPallet_Modal(dataSearch, id);
			}

		};

		async function searchPallet_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, dataSearch);

				let resDataSet = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope['modal_data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No ในระบบ', id);
					return;
				}

				if (resDataSet[0].PalletStatus_Index != '0010000000000') {
					$scope['modal_data'][id] = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่อยู่ในสถานะ EM', id);
					return;
				}

				$scope.isDisable = true;
				setFocus('Modal_Location');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function searchLocation_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if (isSales) {
					let datatables = {};
					let i = 0;

					for (let x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['Location_Alias'] == dataSearch) {

							datatables[i] = $scope.datatablesList[x];

							i++;
						}
					}

					if (Object.keys(datatables).length <= 0) {
						$scope['modal_data'][id] = null;
						AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้ในใบเบิก', id);
						return;
					}

					$scope.modal_data.SKU = datatables[0].SKU_x0020_ID;
					$scope.modal_data.Lot = datatables[0].LOT_x002F_BATCH;
					Tag_No = datatables[0].TAG_x0020_NO;
				}
				else {
					const res_Find_GradeLot_IN_location = await Find_GradeLot_IN_location(objsession, dataSearch);

					let resDataSet = (!res_Find_GradeLot_IN_location['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length > 0) {
						$scope.modal_data.SKU = resDataSet[0].sku_id;
						$scope.modal_data.Lot = resDataSet[0].plot;
						Tag_No = resDataSet[0].tag_no;
					}

				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let Find_GradeLot_IN_location = (objsession, pstrLocationAlias) => {
			return new Promise((resolve, reject) => {

				App.API('Find_GradeLot_IN_location', {
					objsession: objsession,
					pstrLocationAlias: pstrLocationAlias
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Find_GradeLot_IN_location', res));
				});

			})
		}

		/*--------------------------------------
		Event Function save_modal
		------------------------------------- */
		$scope.save_modal = () => {

			if (!$scope.modal_data.PalletNo) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'Modal_PalletNo');
				return;
			}
			else {
				searchPallet_Modal($scope.modal_data.PalletNo, 'Modal_PalletNo');
			}


			if (!$scope.modal_data.Location) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location', 'Modal_Location');
				return;
			}
			else {
				searchLocation_Modal($scope.modal_data.Location, 'Modal_Location');
			}

			savePallet_Modal();

		};

		async function savePallet_Modal() {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				let Palletstatus = '0010000000004';

				if (IsSales) {
					Palletstatus = '0010000000005';
				}

				await updatePalletToTag(objsession, Tag_No, $scope.modal_data.PalletNo, $scope.modal_data.Lot, Palletstatus);

				clearData_Modal();
				booAssing = true;
				$scope.isDisable = false;

				if (IsSales) {
					$scope.modal.hide();

					//$ionicHistory.goBack();

					AppService.succ('สแกน Pallet' + $scope.data.PalletNo + 'อีกครั้งเพื่อเบิกสินค้า!', '');

					if (booAssing) {
						GetWithdrawItem();

						await searchPallet($scope.data.PalletNo);
					}

					$scope.data.PalletNo = null;
					setFocus('PalletNo');

				}
				else {
					setFocus('Modal_PalletNo');

				}

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
					PLot: PLot,
					pstrPalletstatus_index: pstrPalletstatus_index,
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('updatePalletToTag', res));
				});

			})
		}


	})

	.controller('Main_WHTransferToSHCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;

		$scope.lbPalletCount = 0;
		$scope.lbTotal = 0;
		$scope.lbQty = 0;

		let Tag_No = [];
		let Qty = [];
		let WithdrawItem_Index = [];
		let Itemstatus = [];

		let Customer_Index = null;
		let ProductType_Index = null;
		let ItemStatus_Index = null;
		let DocumentType_Index = null;
		let Location_Alias_Really = null;
		let TransportManifest_Index = null;
		let NewLocation_index = null;

		let Withdraw_No = null;
		let Withdraw_Index = null;
		let SearchPallet_No = { 'PalletNo': false, 'PalletNo2': false };

		let _CONST_HEADERTYPE = "MOBILE TO ZONE Y";

		let keyCnt = 0;

		let clearData = () => {

			$scope.data = {};
			$scope.datatablesList = {};
			$scope.datatablesListLength = 0;

			$scope.lbPalletCount = 0;
			$scope.lbTotal = 0;
			$scope.lbQty = 0;

			Tag_No = [];
			Qty = [];
			WithdrawItem_Index = [];
			Itemstatus = [];

			Customer_Index = null;
			ProductType_Index = null;
			ItemStatus_Index = null;
			DocumentType_Index = null;
			Location_Alias_Really = null;
			TransportManifest_Index = null;
			NewLocation_index = null;

			SearchPallet_No = { 'PalletNo': false, 'PalletNo2': false };

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

		$scope.DisplayFlag = 0

		$scope.changeDisplay = (value) => {

			$scope.DisplayFlag = value;

		};

		/*--------------------------------------
		Call API GetWithdraw_No_WithoutTM
		------------------------------------- */
		let GetWithdraw_No_WithoutTM = () => {

			$ionicLoading.show();

			let strWhere = " and status in (3,6) ";

			strWhere += " and tb_Withdraw.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and  IsUse = 1) ";

			App.API('GetWithdraw_No_WithoutTM', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: strWhere
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getDOList = resDataSet;

					$scope.changeDO(resDataSet[0].Withdraw_Index + ',' + resDataSet[0].Withdraw_No);

					setFocus('PalletNo');
				}

			}).catch(function (res) {
				AppService.err('GetWithdraw_No_WithoutTM', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetWithdraw_No_WithoutTM();

		/*--------------------------------------
		Event Function changeDO 
		------------------------------------- */
		$scope.changeDO = (strWithdraw) => {

			//ปรับเป็นตัด string เนื่องจาก เปลี่ยนเป็น $scope.data.DO = pWithdraw_Index ในการ select ค่าแล้วทำให้ document.querySelector('#DO option:checked').dataset.no ค่าไม่ได้เพราะไม่มี selected ใน attribute 
			$scope.data.DO = strWithdraw;

			let Withdraw = strWithdraw.split(',');

			Withdraw_Index = Withdraw[0];
			Withdraw_No = Withdraw[1];

			if (!Withdraw_Index) {
				clearData();
				return;
			}

			//$scope.data.DO 	= pWithdraw_Index;

			//Withdraw_No 		= document.querySelector('#DO option:checked').dataset.no;
			//Withdraw_Index 	= pWithdraw_Index;

			loadDO(Withdraw_Index, Withdraw_No);

		};

		async function loadDO(Withdraw_Index, Withdraw_No) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetWithdrawItem = await GetWithdrawItem(objsession, Withdraw_Index);

				let resDataSet = (!res_GetWithdrawItem['diffgr:diffgram']) ? {} : res_GetWithdrawItem['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.datatablesList = resDataSet;
					$scope.datatablesListLength = Object.keys(resDataSet).length;

					let datatables = {};
					let i = 0;

					for (let x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['Pallet_seq'] >= 8) {
							datatables[i] = $scope.datatablesList[x];

							i++;
						}
					}

					$scope.lbTotal = $scope.datatablesListLength;
					$scope.lbQty = Object.keys(datatables).length;

				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let GetWithdrawItem = (objsession, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('GetWithdrawItem', {
					objsession: objsession,
					pstrWithdraw_Index: pstrWithdraw_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdrawItem', res));
				});

			})
		}


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

			/*if (searchType == 'read pallet no') {
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
	
			keyCnt = 0;*/

			if (id == 'Location') {
				if (!$scope.data.Location) {
					AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location', 'Location');
					return;
				}

				searchLocation(dataSearch, id);
			}
			else {
				if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
					AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
					return;
				}

				searchPallet(dataSearch, id);
			}

		};

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if ((!dataSearch && id == 'PalletNo2' && $scope.data.PalletNo) || $scope.data.PalletNo == $scope.data.PalletNo2) {
					setFocus('Location');
					$ionicLoading.hide();
					return;
				}

				let datatables = {};
				let i = 0;

				for (let x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['PALLET_x0020_NO'] == dataSearch) {
						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ในใบ DO นี้!', id);
					return;
				}

				const res_getPalletTM = await getPalletTM(objsession, dataSearch);

				let resDataSet = (!res_getPalletTM['diffgr:diffgram']) ? {} : res_getPalletTM['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					const res_getPallet_Request = await getPallet_Request(objsession, dataSearch);

					resDataSet = (!res_getPallet_Request['diffgr:diffgram']) ? {} : res_getPallet_Request['diffgr:diffgram'].NewDataSet.Table1;
				}

				if (Object.keys(resDataSet).length <= 0) {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้!', id);
					return;
				}

				if (resDataSet[0].PalletStatus_Index != '0010000000007') {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'Pallet ไม่อยู่ในสถานะ Move for Transfer', id);
					return;
				}

				$scope.data.SKU = resDataSet[0].Sku_Id;
				$scope.data.Lot = resDataSet[0].PLot;
				$scope.data.TotalQty = resDataSet[0].QtyIn_Loc;
				$scope.data.PackageQty = parseFloat(resDataSet[0].QtyIn_Loc) / 25;
				$scope.data.CustomerShipping = resDataSet[0].Company_Name;

				Tag_No[id] = resDataSet[0].TAG_No;
				Qty[id] = resDataSet[0].QtyIn_Loc;
				WithdrawItem_Index[id] = datatables[0].WithdrawItem_Index;
				Itemstatus[id] = resDataSet[0].ItemStatus_Index;

				Customer_Index = resDataSet[0].Customer_Index;
				ProductType_Index = resDataSet[0].ProductType_Index;
				ItemStatus_Index = resDataSet[0].ItemStatus_Index;
				DocumentType_Index = resDataSet[0].DocumentType_Index;
				Location_Alias_Really = resDataSet[0].Location_Alias_Really;
				TransportManifest_Index = resDataSet[0].TransportManifest_Index;

				if (id == 'PalletNo') {
					setFocus('PalletNo2');
					SearchPallet_No[id] = true;
				}
				else {
					setFocus('Location');
					SearchPallet_No[id] = true;
				}

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

				const res_Location_By_Alias = await Location_By_Alias(objsession, dataSearch);

				let resDataSet = (!res_Location_By_Alias['diffgr:diffgram']) ? {} : res_Location_By_Alias['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้!', id);
					return;
				}

				NewLocation_index = resDataSet[0].Location_Index;

				if (SearchPallet_No['PalletNo'] || SearchPallet_No['PalletNo2']) {

					if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
						AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
						SearchPallet_No['PalletNo'] = false;
						SearchPallet_No['PalletNo2'] = false;
						return;
					}

					if (!SearchPallet_No['PalletNo'] && !SearchPallet_No['PalletNo2']) {
						AppService.err('แจ้งเตื่อน', 'กรุณา Scan ตรวจสอบข้อมูล Pallet No.', 'PalletNo');
						SearchPallet_No['PalletNo'] = false;
						SearchPallet_No['PalletNo2'] = false;
						return;
					}

					if (SearchPallet_No['PalletNo']) {
						//save one pallet
						const resDataSet2 = await saveRelocate(Tag_No['PalletNo'], $scope.data.PalletNo, Qty['PalletNo'], WithdrawItem_Index['PalletNo'], Itemstatus['PalletNo']);

						if (resDataSet2) {
							Tag_No['PalletNo'] = null;

							//update ui real time
							for (let x in $scope.datatablesList) {

								if ($scope.datatablesList[x]['PALLET_x0020_NO'] == $scope.data.PalletNo && $scope.datatablesList[x]['WithdrawItem_Index'] == WithdrawItem_Index['PalletNo']) {
									$scope.datatablesList[x]['Pallet_seq'] = 8;
									$scope.datatablesList[x]['Location_Alias'] = $scope.data.Location;
								}
							}

						}
						else {
							$ionicLoading.hide();
							return;
						}


					}

					if (SearchPallet_No['PalletNo2'] && $scope.data.PalletNo2 && $scope.data.PalletNo2 != $scope.data.PalletNo) {
						//save one pallet
						const resDataSet3 = await saveRelocate(Tag_No['PalletNo2'], $scope.data.PalletNo2, Qty['PalletNo2'], WithdrawItem_Index['PalletNo2'], Itemstatus['PalletNo2']);

						if (resDataSet3) {
							Tag_No['PalletNo2'] = null;

							//update ui real time
							for (let x in $scope.datatablesList) {

								if ($scope.datatablesList[x]['PALLET_x0020_NO'] == $scope.data.PalletNo2 && $scope.datatablesList[x]['WithdrawItem_Index'] == WithdrawItem_Index['PalletNo2']) {
									$scope.datatablesList[x]['Pallet_seq'] = 8;
									$scope.datatablesList[x]['Location_Alias'] = $scope.data.Location;
								}
							}

						}
						else {
							$ionicLoading.hide();
							return;
						}


					}

					//update after save
					let datatables = {};
					let i = 0;

					for (let x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['Pallet_seq'] >= 8) {
							datatables[i] = $scope.datatablesList[x];

							i++;
						}
					}

					$scope.lbQty = Object.keys(datatables).length;

					if ($scope.lbQty == $scope.lbTotal) {
						await waitConfirmWithdrawStatus_Confirm_TranferStatus(objsession, Withdraw_Index, 5, _CONST_HEADERTYPE);
						GetWithdraw_No_WithoutTM();
						AppService.succ('ย้ายของครบแล้วในใบขนนี้', '');
					}

				}

				clearData();
				setFocus('PalletNo');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function saveRelocate(Tag_No, Pallet_No, Qty, WithdrawItem_Index, Itemstatus) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_SavePickItem_Withdraw = await SavePickItem_Withdraw(objsession, Tag_No, Qty, $scope.data.Location, Itemstatus, '0010000000008', Withdraw_No, Withdraw_Index, WithdrawItem_Index, _CONST_HEADERTYPE, false);

				if (res_SavePickItem_Withdraw != 'PASS') {
					AppService.err('ผิดพลาด', 'ในการย้าย Pallet ลองอีกครั้ง!', '');
					return false;
				}

				$scope.lbPalletCount = parseFloat($scope.lbPalletCount) + 1;
				return true;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let getPalletTM = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

				App.API('getPalletTM', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getPalletTM', res));
				});

			})
		}

		let getPallet_Request = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

				App.API('getPallet_Request', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getPallet_Request', res));
				});

			})
		}

		let Location_By_Alias = (objsession, pstrLocation_Alias) => {
			return new Promise((resolve, reject) => {

				App.API('Location_By_Alias', {
					objsession: objsession,
					pstrLocation_Alias: pstrLocation_Alias
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Location_By_Alias', res));
				});

			})
		}

		let SavePickItem_Withdraw = (objsession, pstrTag_No, pdblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index, Document_No, Document_Index, Documentitem_Index, Description, isPicking) => {
			return new Promise((resolve, reject) => {

				App.API('SavePickItem_Withdraw', {
					objsession: objsession,
					pstrTag_No: pstrTag_No,
					pdblQtyMove: pdblQtyMove,
					pstrNewLocation_Ailas: pstrNewLocation_Ailas,
					pstrNewItemStatus_Index: pstrNewItemStatus_Index,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index,
					Document_No: Document_No,
					Document_Index: Document_Index,
					Documentitem_Index: Documentitem_Index,
					Description: Description,
					isPicking: isPicking
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SavePickItem_Withdraw', res));
				});

			})
		}

		let waitConfirmWithdrawStatus_Confirm_TranferStatus = (objsession, Withdraw_Index, Status, phRemark) => {
			return new Promise((resolve, reject) => {

				App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', {
					objsession: objsession,
					Withdraw_Index: Withdraw_Index,
					Status: Status,
					phRemark: phRemark
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res));
				});

			})
		}

		/*--------------------------------------
		Event Function save
		------------------------------------- */
		$scope.save = () => {

			if (!$scope.data.Location) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location', 'Location');
				return;
			}

			$scope.changeDO(Withdraw_Index+','+Withdraw_No);

			if ($scope.lbQty != $scope.lbTotal) {
				AppService.err('แจ้งเตือน', 'กรุณาย้ายของให้ครบ ! ', '');
			}

			searchLocation($scope.data.Location, 'Location');

		};

	})

	.controller('Main_WHIssueDamageCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.modal_data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQty = 0;
		$scope.lbTotal = 0;

		$scope.isDisable = false;

		let Withdraw_No = null;
		let Withdraw_Index = null;

		let Tag_No = null;
		let isSales = false;
		let booAssing = false;
		let _CONST_HEADERTYPE = "MOBILE DAMAGE RD TO MT";

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.modal_data = {};
			$scope.datatablesList = {};
			$scope.datatablesListLength = 0;
			$scope.lbQty = 0;
			$scope.lbTotal = 0;
		};

		let clearData_Modal = () => {
			$scope.modal_data = {};
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
		Call API GetWithdraw_Request
		------------------------------------- */
		let GetWithdraw_Request = () => {

			$ionicLoading.show();

			let strWhere = " and Status IN (1,3) ";

			strWhere += " and Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and  IsUse = 1) ";

			App.API('GetWithdraw_Request', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: strWhere,
				pbooDamage: true
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.getDOList = resDataSet;

					$scope.changeDO(resDataSet[0].Withdraw_Index + ',' + resDataSet[0].Withdraw_No);

					setFocus('PalletNo');
				}

			}).catch(function (res) {
				AppService.err('GetWithdraw_Request', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetWithdraw_Request();

		/*--------------------------------------
		Event Function changeDO 
		------------------------------------- */
		$scope.changeDO = (strWithdraw) => {

			//ปรับเป็นตัด string เนื่องจาก เปลี่ยนเป็น $scope.data.DO = pWithdraw_Index ในการ select ค่าแล้วทำให้ document.querySelector('#DO option:checked').dataset.no ค่าไม่ได้เพราะไม่มี selected ใน attribute 
			$scope.data.DO = strWithdraw;

			let Withdraw = strWithdraw.split(',');

			Withdraw_Index = Withdraw[0];
			Withdraw_No = Withdraw[1];

			if (!Withdraw_Index) {
				clearData();
				return;
			}

			//$scope.data.DO 	= pWithdraw_Index;

			//Withdraw_No 		= document.querySelector('#DO option:checked').dataset.no;
			//Withdraw_Index 	= pWithdraw_Index;

			loadDO(Withdraw_Index, Withdraw_No);

		};

		async function loadDO(Withdraw_Index, Withdraw_No) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetWithdrawItem = await GetWithdrawItem(objsession, Withdraw_Index);

				let resDataSet = (!res_GetWithdrawItem['diffgr:diffgram']) ? {} : res_GetWithdrawItem['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.datatablesList = resDataSet;
					$scope.datatablesListLength = Object.keys(resDataSet).length;

					let countSTATE = 0;

					for (let x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['STATE'] != '') {
							countSTATE++;
						}
					}

					$scope.lbTotal = $scope.datatablesListLength;
					$scope.lbQty = countSTATE;

				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let GetWithdrawItem = (objsession, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('GetWithdrawItem', {
					objsession: objsession,
					pstrWithdraw_Index: pstrWithdraw_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdrawItem', res));
				});

			})
		}

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
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', id);
				return;
			}

			if (searchType == 'read pallet no') {
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

			searchPallet(dataSearch, id);


		};

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				//find in Withdraw Item (on load withdraw no)
				let datatables = {};
				let i = 0;

				for (let x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['PALLET_x0020_NO'] == dataSearch) {
						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {

					//กรณียังไม่มีเลขพาเลท
					const res_AssingPallet_No_To_Tag = await AssingPallet_No_To_Tag(dataSearch);

					if (res_AssingPallet_No_To_Tag) {
						$scope.data.PalletNo = null;
						setFocus('PalletNo');
						$ionicLoading.hide();
						return;
					}

					//กรณีเลขพาเลทไม่ใช่พาเลทที่อยู่ในใบเบิก
					const res_SwapPallet = await SwapPallet(dataSearch);

					if (res_SwapPallet) {
						$scope.data.PalletNo = null;
						setFocus('PalletNo');
						$ionicLoading.hide();
						return;
					}

					$scope.data.PalletNo = null;
					setFocus('PalletNo');
					$ionicLoading.hide();
					return;
				}

				for (let x in datatables) {
					//check Local realtime befor
					if (datatables[x]['WITHDRAWITEM-STATUS'] == -9 || datatables[x]['WITHDRAWITEM-STATUS'] == -10) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'Pallet ' + dataSearch + ' ถูกเบิกแล้ว!', id);
						return;
					}

					if (datatables[x]['Qty_Bal'] != datatables[x]['QTY']) {
						AppService.err('แจ้งเตือน', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !', id);
						return;
					}
					else {
						//check Online real befor
						const res_CHEKPICK_WITHDRAWITEM_STATUS = await CHEKPICK_WITHDRAWITEM_STATUS(objsession, datatables[x]['WithdrawItem_Index']);//return boolean

						if (res_CHEKPICK_WITHDRAWITEM_STATUS) {
							$scope.data.PalletNo = null;
							AppService.err('แจ้งเตือน', 'Pallet ' + dataSearch + ' ถูกเบิกแล้ว!', id);
							return;
						}
						else {
							let Location = datatables[x]['Location_Alias'];
							if (Location.substring(0, 1) != 'Y') {
								Location = Location.substring(0, 1) + '-FLOOR';
							}

							//Update Status and Swap WithdrawItem . (Not Insert Transfer and Transaction)
							const res_SavePickItem_Withdraw = await SavePickItem_Withdraw(objsession, datatables[x]['TAG_x0020_NO'], datatables[x]['QTY'], Location, '0010000000001', '0010000000007', Withdraw_No, Withdraw_Index, datatables[x]['WithdrawItem_Index'], _CONST_HEADERTYPE, true);//return string

							if (res_SavePickItem_Withdraw != 'PASS') {
								AppService.err('แจ้งเตือน', 'ผิดพลาด : ในการย้าย Pallet ' + dataSearch + ' ลองอีกครั้ง!', id);
								return;
							}

							//update real ui and Sort new
							for (let y in $scope.datatablesList) {
								if ($scope.datatablesList[y]['WithdrawItem_Index'] == datatables[x]['WithdrawItem_Index']) {
									$scope.datatablesList[y]['STATE'] = 'เบิกแล้ว';
									$scope.datatablesList[y]['WITHDRAWITEM-STATUS'] = -9;
									$scope.datatablesList[y]['PICKINGQTY'] = datatables[x]['QTY'];
									$scope.datatablesList[y]['Location_Alias'] = Location;
									$scope.datatablesList[y]['LOCATION'] = Location;
								}
							}

							let countSTATE = 0;

							for (let y in $scope.datatablesList) {
								if ($scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -9 || $scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -10) {
									countSTATE++;
								}
							}

							$scope.lbQty = countSTATE;
							$scope.lbTotal = $scope.datatablesListLength;


							$scope.data.PalletNo = null;
							setFocus('PalletNo');

						}
					}


				}



				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function AssingPallet_No_To_Tag(dataSearch) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, dataSearch);

				let resDataSet = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					if (resDataSet[0].PalletStatus_Index == '0010000000000') {
						let datatables = {};
						let i = 0;

						for (let x in $scope.datatablesList) {

							if ($scope.datatablesList[x]['PALLET_x0020_NO'] == '') {

								datatables[i] = $scope.datatablesList[x];

								i++;
							}
						}

						if (Object.keys(datatables).length > 0) {
							SwapPallet_ModalLoad();

							return true;
						}
					}
				}

				return false;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function SwapPallet(dataSearch) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_chk_Pallet_IN_Withdraw_IS_Picked = await chk_Pallet_IN_Withdraw_IS_Picked(objsession, dataSearch);//return boolean

				if (res_chk_Pallet_IN_Withdraw_IS_Picked) {
					AppService.err('แจ้งเตือน', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!', 'PalletNo');
					return false;
				}

				const res_getVIEW_TAG_TPIPL = await getVIEW_TAG_TPIPL(objsession, dataSearch);

				let resDataSet2 = (!res_getVIEW_TAG_TPIPL['diffgr:diffgram']) ? {} : res_getVIEW_TAG_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet2).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่พบพาเลทนี้ในรายการ !', 'PalletNo');
					return false;
				}

				if (resDataSet2[0].Customer_Index != datatablesList[0].Customer_Index) {
					AppService.err('ลูกค้าไม่ตรง !', 'พาเลท ' + $scope.data.PalletNo + 'ไม่ใช่ลูกค้าคนนี้', 'PalletNo');
					return false;
				}

				let datatables = {};
				let i = 0;

				for (let x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['LOT_x002F_BATCH'] == resDataSet2[0].PLot && $scope.datatablesList[x]['SKU_x0020_ID'] == resDataSet2[0].Sku_Id && $scope.datatablesList[x]['WITHDRAWITEM-STATUS'] == 1) {

						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถเบิกพาเลทนี้แทนได้เนื่องจาก Grade ,Lot,ตำแหน่ง  ไม่ตรงกับใบเบิก !', 'PalletNo');
					return false;
				}


				const res_SwapPalletInWithDraw = await SwapPalletInWithDraw(objsession, datatables[0].WithdrawItem_Index, dataSearch, Withdraw_Index);//return boolean

				if (!res_SwapPalletInWithDraw) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถ Swap ได้ เนื่องจาก <br/> - จำนวนหรือ Status Item ไม่ตรงกัน <br/> - พาเลทที่จะ Swap มีอยู่ใน DO หลายใบ', 'PalletNo');
					return false;
				}

				AppService.succ('เปลี่ยน Pallet ' + dataSearch + '  เรียบร้อย!', 'PalletNo');

				loadDO(Withdraw_Index, Withdraw_No);

				await searchPallet($scope.data.PalletNo);

				return true;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let CHEKPICK_WITHDRAWITEM_STATUS = (objsession, WithdrawItem_Index, Status) => {
			return new Promise((resolve, reject) => {

				App.API('CHEKPICK_WITHDRAWITEM_STATUS', {
					objsession: objsession,
					WithdrawItem_Index: WithdrawItem_Index,
					Status: Status
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('CHEKPICK_WITHDRAWITEM_STATUS', res));
				});

			})
		}

		let SavePickItem_Withdraw = (objsession, pstrTag_No, pdblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index, Document_No, Document_Index, Documentitem_Index, Description, isPicking) => {
			return new Promise((resolve, reject) => {

				App.API('SavePickItem_Withdraw', {
					objsession: objsession,
					pstrTag_No: pstrTag_No,
					pdblQtyMove: pdblQtyMove,
					pstrNewLocation_Ailas: pstrNewLocation_Ailas,
					pstrNewItemStatus_Index: pstrNewItemStatus_Index,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index,
					Document_No: Document_No,
					Document_Index: Document_Index,
					Documentitem_Index: Documentitem_Index,
					Description: Description,
					isPicking: isPicking
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SavePickItem_Withdraw', res));
				});

			})
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

		let chk_Pallet_IN_Withdraw_IS_Picked = (objsession, pstrPalletNo) => {
			return new Promise((resolve, reject) => {

				App.API('chk_Pallet_IN_Withdraw_IS_Picked', {
					objsession: objsession,
					pstrPalletNo: pstrPalletNo
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('chk_Pallet_IN_Withdraw_IS_Picked', res));
				});

			})
		}

		let getVIEW_TAG_TPIPL = (objsession, Pallet_No) => {
			return new Promise((resolve, reject) => {

				let strWhere = " and PALLET_No='" + Pallet_No + "' and Qty_Bal>0 ";

				App.API('getVIEW_TAG_TPIPL', {
					objsession: objsession,
					pstrWhere: strWhere
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getVIEW_TAG_TPIPL', res));
				});

			})
		}

		let SwapPalletInWithDraw = (objsession, pstrWithdrawItem_Index, pstrPalletNo, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('SwapPalletInWithDraw', {
					objsession: objsession,
					pstrWithdrawItem_Index: pstrWithdrawItem_Index,
					pstrPalletNo: pstrPalletNo,
					pstrWithdraw_Index: pstrWithdraw_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SwapPalletInWithDraw', res));
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

				//AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				//การยืนยันไม่ควรตรวจสอบจากหน้าจอควร Query ใหม่แบบ RealTime หรือ Load Detail ใหม่
				loadDO(Withdraw_Index, Withdraw_No);//Reload

				//Check picking
				let countSTATE = 0;

				if ($scope.datatablesListLength > 0) {
					for (let x in $scope.datatablesList) {
						if ($scope.datatablesList[x]['WITHDRAWITEM-STATUS'] != -9) {
							countSTATE++;
						}
					}

					if (countSTATE > 0) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'หยิบไม่ครบรายการ', 'PalletNo');
						return;
					}
				}


				await waitConfirmWithdrawStatus_Confirm_TranferStatus(objsession, Withdraw_Index, 2, _CONST_HEADERTYPE);

				AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)', '');

				$ionicLoading.hide();

				$ionicHistory.goBack();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let waitConfirmWithdrawStatus_Confirm_TranferStatus = (objsession, Withdraw_Index, Status, phRemark) => {
			return new Promise((resolve, reject) => {

				App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', {
					objsession: objsession,
					Withdraw_Index: Withdraw_Index,
					Status: Status,
					phRemark: phRemark
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res));
				});

			})
		}


		/*--------------------------------------
		Modal Function SwapPallet_ModalLoad
		------------------------------------- */
		async function SwapPallet_ModalLoad() {

			$scope.modal.show();

			$scope.modal_data.PalletNo = $scope.data.PalletNo;

			if (!$scope.modal_data.PalletNo) {
				setFocus('Modal_PalletNo');
			}
			else {
				$scope.isDisable = true;
				isSales = true;
				setFocus('Modal_Location');
			}

		}

		/*--------------------------------------
		Scan Barcode Modal Function
		------------------------------------- */
		$scope.scanPalletNo_Modal = (id) => {
			$cordovaBarcodeScanner.scan().then(function (imageData) {
				if (!imageData.cancelled) {
					$scope['modal_data'][id] = imageData.text.toUpperCase();
					$scope.search_modal(angular.copy($scope['modal_data'][id]), '');
				}
			}, function (error) {
				AppService.err('scanPalletNo_Modal', error);
			});
		};

		/*--------------------------------------
		Event Function search_modal
		------------------------------------- */
		$scope.search_modal = (dataSearch, id, searchType) => {

			let str = (id == 'Modal_PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location';

			if (!dataSearch) {
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

			if (id == 'Modal_Location') {
				searchLocation_Modal(dataSearch, id);
			}
			else {
				searchPallet_Modal(dataSearch, id);
			}

		};

		async function searchPallet_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, dataSearch);

				let resDataSet = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope['modal_data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No ในระบบ', id);
					return;
				}

				if (resDataSet[0].PalletStatus_Index != '0010000000000') {
					$scope['modal_data'][id] = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่อยู่ในสถานะ EM', id);
					return;
				}

				$scope.isDisable = true;
				setFocus('Modal_Location');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function searchLocation_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if (isSales) {
					let datatables = {};
					let i = 0;

					for (let x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['Location_Alias'] == dataSearch) {

							datatables[i] = $scope.datatablesList[x];

							i++;
						}
					}

					if (Object.keys(datatables).length <= 0) {
						$scope['modal_data'][id] = null;
						AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้ในใบเบิก', id);
						return;
					}

					$scope.modal_data.SKU = datatables[0].SKU_x0020_ID;
					$scope.modal_data.Lot = datatables[0].LOT_x002F_BATCH;
					Tag_No = datatables[0].TAG_x0020_NO;
				}
				else {
					const res_Find_GradeLot_IN_location = await Find_GradeLot_IN_location(objsession, dataSearch);

					let resDataSet = (!res_Find_GradeLot_IN_location['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length > 0) {
						$scope.modal_data.SKU = resDataSet[0].sku_id;
						$scope.modal_data.Lot = resDataSet[0].plot;
						Tag_No = resDataSet[0].tag_no;
					}

				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let Find_GradeLot_IN_location = (objsession, pstrLocationAlias) => {
			return new Promise((resolve, reject) => {

				App.API('Find_GradeLot_IN_location', {
					objsession: objsession,
					pstrLocationAlias: pstrLocationAlias
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Find_GradeLot_IN_location', res));
				});

			})
		}

		/*--------------------------------------
		Event Function save_modal
		------------------------------------- */
		$scope.save_modal = () => {

			if (!$scope.modal_data.PalletNo) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'Modal_PalletNo');
				return;
			}
			else {
				searchPallet_Modal($scope.modal_data.PalletNo, 'Modal_PalletNo');
			}


			if (!$scope.modal_data.Location) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location', 'Modal_Location');
				return;
			}
			else {
				searchLocation_Modal($scope.modal_data.Location, 'Modal_Location');
			}

			savePallet_Modal();

		};

		async function savePallet_Modal() {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				let Palletstatus = '0010000000004';

				if (IsSales) {
					Palletstatus = '0010000000005';
				}

				await updatePalletToTag(objsession, Tag_No, $scope.modal_data.PalletNo, $scope.modal_data.Lot, Palletstatus);

				clearData_Modal();
				booAssing = true;
				$scope.isDisable = false;

				if (IsSales) {
					$scope.modal.hide();

					//$ionicHistory.goBack();

					//AppService.succ('สแกน Pallet' + $scope.data.PalletNo + 'อีกครั้งเพื่อเบิกสินค้า!', '');

					if (booAssing) {
						loadDO(Withdraw_Index, Withdraw_No);

						await searchPallet($scope.data.PalletNo);
					}

					$scope.data.PalletNo = null;
					setFocus('PalletNo');

				}
				else {
					setFocus('Modal_PalletNo');

				}

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
					PLot: PLot,
					pstrPalletstatus_index: pstrPalletstatus_index,
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('updatePalletToTag', res));
				});

			})
		}


	});

