/**
 * Transport.Controllers Module
 *
 * Description
 */
angular.module('Transport.Controllers', ['ionic'])

	.controller('Transport_PayProductGenaralCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter) {

		/*--------------------------------------
		Data Function
		------------------------------------- */
		$scope.data = {};
		$scope.modal_data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQty = 0;
		$scope.lbTotal = 0;

		$scope.isDisable = false;

		var Withdraw_No = null;
		var Withdraw_Index = null;

		var Tag_No = null;
		var isSales = false;
		var booAssing = false;
		var _CONST_HEADERTYPE = "MOBILE DAMAGE RD TO MT";

		var keyCnt = 0;

		var clearData = function () {
			$scope.data = {};
			$scope.modal_data = {};
			$scope.datatablesList = {};
			$scope.datatablesListLength = 0;
			$scope.lbQty = 0;
			$scope.lbTotal = 0;
		};

		var clearData_Modal = function () {
			$scope.modal_data = {};
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

		/*--------------------------------------
		Call API GetWithdraw_Request
		------------------------------------- */
		$scope.GetWithdraw_Request = function () {

			$ionicLoading.show();

			var pstrWhere = " and DocumentType_Index <> '0010000000006' and Status IN (1,3) and Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1) ";

			App.API('GetWithdraw_Request', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: pstrWhere,
				pbooDamage: false
			}).then(function (res) {

				var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

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

		$scope.GetWithdraw_Request();

		/*--------------------------------------
		Event Function changeDO 
		------------------------------------- */
		$scope.changeDO = function (strWithdraw) {

			$scope.data.DO = strWithdraw;

			var Withdraw = strWithdraw.split(',');

			Withdraw_Index = Withdraw[0];
			Withdraw_No = Withdraw[1];

			if (!Withdraw_Index) {
				clearData();
				return;
			}

			loadDO(Withdraw_Index, Withdraw_No);

		};

		function loadDO(Withdraw_Index, Withdraw_No) {
			try {

				$ionicLoading.show();

				var objsession = angular.copy(LoginService.getLoginData());

				if (!Withdraw_Index) {

					$ionicLoading.hide();
					return;

				} else {

					var res_GetWithdraw_Request = GetWithdraw_Request2(objsession, " and Withdraw_Index = '" + Withdraw_Index + "' ", false);

					var res_GetWithdrawItem = GetWithdrawItem(objsession, Withdraw_Index);

					Promise.all([res_GetWithdraw_Request, res_GetWithdrawItem]).then(function (res) {

						var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

						var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

						if (Object.keys(resDataSet).length > 0) {

							$scope.data.Department_Id = (resDataSet[0].Department_Id) ? resDataSet[0].Department_Id : 'ไม่ระบุ';
							$scope.data.Withdraw_Date = (resDataSet[0].Withdraw_Date) ? $filter('date')(resDataSet[0].Withdraw_Date, 'dd/MM/yyyy') : 'ไม่ระบุ';

							if (resDataSet[0].DocumentType_Id) {

								$scope.data.DocumentType_Id = resDataSet[0].DocumentType_Id;
								$scope.data.DocumentType = resDataSet[0].DocumentType;

							}

							$scope.datatablesList = resDataSet2;
							$scope.datatablesListLength = Object.keys(resDataSet2).length;

							var countSTATE = 0;

							if ($scope.datatablesListLength > 0) {
								for (var x in $scope.datatablesList) {
									if ($scope.datatablesList[x]['STATE'] != null) {
										countSTATE++;
									}
								}

								$scope.lbTotal = $scope.datatablesListLength;
								$scope.lbQty = countSTATE;

							}

							setFocus('PalletNo');

							$ionicLoading.hide();

						} else {

							clearData();
							AppService.err('แจ้งเตือน', 'ไม่มีรายละเอียดของใบเบิกนี้', 'PalletNo');
							return;
						}

					}).catch(function (error) {
						console.log("Error occurred");
						AppService.err('Error', 'Error occurred', '');
						return;
					});

				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		var GetWithdraw_Request2 = function (objsession, pstrWhere, pbooDamage) {
			return new Promise(function (resolve, reject) {

				App.API('GetWithdraw_Request', {
					objsession: objsession,
					pstrWhere: pstrWhere,
					pbooDamage: pbooDamage
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdraw_Request', res));
				});

			})
		}

		var GetWithdrawItem = function (objsession, pstrWithdraw_Index) {
			return new Promise(function (resolve, reject) {

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

		function searchPallet(dataSearch, id) {

			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				var datatables = {};
				var i = 0;

				for (var x in $scope.datatablesList) {

					if ($scope.datatablesList[x]['PALLET_x0020_NO'] == dataSearch) {

						datatables[i] = $scope.datatablesList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {

					//กรณียังไม่มีเลขพาเลท
					var res_AssingPallet_No_To_Tag = AssingPallet_No_To_Tag(dataSearch);

					res_AssingPallet_No_To_Tag.then(function (res) {

						if (res) {

							return res;
						}
						else {
							//กรณีเลขพาเลทไม่ใช่พาเลทที่อยู่ในใบเบิก
							return SwapPallet(dataSearch);
						}

					}).then(function (res2) {

						$scope.data.PalletNo = null;
						setFocus('PalletNo');
						$ionicLoading.hide();
						return;

					}).catch(function (error) {
						console.log("Error occurred");
						AppService.err('Error', 'Error occurred', '');
						return;
					});

				}
				else {

					for (var x in datatables) {
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
							var res_CHEKPICK_WITHDRAWITEM_STATUS = CHEKPICK_WITHDRAWITEM_STATUS(objsession, datatables[x]['WithdrawItem_Index']);//return boolean

							var Location = datatables[x]['Location_Alias'];
							if (Location.substring(0, 1) != 'Y') {
								Location = Location.substring(0, 1) + '-FLOOR';
							}

							res_CHEKPICK_WITHDRAWITEM_STATUS.then(function (res) {

								if (res) {

									return 'True1';
								}
								else {

									//Update Status and Swap WithdrawItem . (Not Insert Transfer and Transaction)
									return SavePickItem_Withdraw(objsession, datatables[x]['TAG_x0020_NO'], datatables[x]['QTY'], Location, '0010000000001', '0010000000007', Withdraw_No, Withdraw_Index, datatables[x]['WithdrawItem_Index'], _CONST_HEADERTYPE, true);//return string

								}


							}).then(function (res2) {


								if (res2 == 'True1') {
									$scope.data.PalletNo = null;
									AppService.err('แจ้งเตือน', 'Pallet ' + dataSearch + ' ถูกเบิกแล้ว!', id);
									return;
								}
								else {

									if (res2 != 'PASS') {
										AppService.err('แจ้งเตือน', 'ผิดพลาด : ในการย้าย Pallet ' + dataSearch + ' ลองอีกครั้ง!', id);
										return;
									}

									//update real ui and Sort new
									for (var y in $scope.datatablesList) {
										if ($scope.datatablesList[y]['WithdrawItem_Index'] == datatables[x]['WithdrawItem_Index']) {
											$scope.datatablesList[y]['STATE'] = 'เบิกแล้ว';
											$scope.datatablesList[y]['WITHDRAWITEM-STATUS'] = -9;
											$scope.datatablesList[y]['PICKINGQTY'] = datatables[x]['QTY'];
											$scope.datatablesList[y]['Location_Alias'] = Location;
											$scope.datatablesList[y]['LOCATION'] = Location;
										}
									}

									var countSTATE = 0;

									for (var y in $scope.datatablesList) {
										if ($scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -9 || $scope.datatablesList[y]['WITHDRAWITEM-STATUS'] == -10) {
											countSTATE++;
										}
									}

									$scope.lbQty = countSTATE;
									$scope.lbTotal = $scope.datatablesListLength;


									$scope.data.PalletNo = null;
									setFocus(id);

									$ionicLoading.hide();

								}

							}).catch(function (error) {
								console.log("Error occurred");
								AppService.err('Error', 'Error occurred', '');
								return;
							});

						}

					}

				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		function AssingPallet_No_To_Tag(dataSearch) {
			try {

				var objsession = angular.copy(LoginService.getLoginData());

				var res_getPalletInBGPallet = getPalletInBGPallet(objsession, dataSearch);

				return res_getPalletInBGPallet.then(function (res) {

					var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length > 0) {

						if (resDataSet[0].PalletStatus_Index == '0010000000000') {

							var datatables = {};
							var i = 0;

							for (var x in $scope.datatablesList) {

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

				}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}
			catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		function SwapPallet(dataSearch) {
			try {

				var objsession = angular.copy(LoginService.getLoginData());

				var res_chk_Pallet_IN_Withdraw_IS_Picked = chk_Pallet_IN_Withdraw_IS_Picked(objsession, dataSearch);//return boolean

				var res_getVIEW_TAG_TPIPL = getVIEW_TAG_TPIPL(objsession, dataSearch);

				return Promise.all([res_chk_Pallet_IN_Withdraw_IS_Picked, res_getVIEW_TAG_TPIPL]).then(function (res) {

					if (res[0]) {
						AppService.err('แจ้งเตือน', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!', 'PalletNo');
						return 'True1';
					}

					var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet2).length <= 0) {
						AppService.err('แจ้งเตือน', 'ไม่พบพาเลทนี้ในรายการ !', 'PalletNo');
						return 'True1';
					}

					if (resDataSet2[0].Customer_Index != datatablesList[0].Customer_Index) {
						AppService.err('ลูกค้าไม่ตรง !', 'พาเลท ' + $scope.data.PalletNo + 'ไม่ใช่ลูกค้าคนนี้', 'PalletNo');
						return 'True1';
					}

					var datatables = {};
					var i = 0;

					for (var x in $scope.datatablesList) {

						if ($scope.datatablesList[x]['LOT_x002F_BATCH'] == resDataSet2[0].PLot && $scope.datatablesList[x]['SKU_x0020_ID'] == resDataSet2[0].Sku_Id && $scope.datatablesList[x]['WITHDRAWITEM-STATUS'] == 1 && $scope.datatablesList[x]['Location_Alias'] == resDataSet2[0].Location_Alias && $scope.datatablesList[x]['STATUS'] == resDataSet2[0].Description) {

							datatables[i] = $scope.datatablesList[x];

							i++;
						}
					}

					if (Object.keys(datatables).length <= 0) {
						AppService.err('แจ้งเตือน', 'ไม่สามารถเบิกพาเลทนี้แทนได้เนื่องจาก Grade ,Lot,ตำแหน่ง  ไม่ตรงกับใบเบิก !', 'PalletNo');
						return 'True1';
					}

					return SwapPalletInWithDraw(objsession, datatables[0].WithdrawItem_Index, dataSearch, Withdraw_Index);//return boolean

				}).then(function (res2) {

					if (res2 == 'True1') {
						return false;
					}

					if (!res2) {

						AppService.err('แจ้งเตือน', 'ไม่สามารถ Swap ได้ เนื่องจาก <br/> - จำนวนหรือ Status Item ไม่ตรงกัน <br/> - พาเลทที่จะ Swap มีอยู่ใน DO หลายใบ', 'PalletNo');
						return false;

					}

					AppService.succ('เปลี่ยน Pallet ' + dataSearch + '  เรียบร้อย!', 'PalletNo');

					loadDO(Withdraw_Index, Withdraw_No);

					searchPallet($scope.data.PalletNo);

					return true;


				}).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});

			}
			catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		var CHEKPICK_WITHDRAWITEM_STATUS = function (objsession, WithdrawItem_Index, Status) {
			return new Promise(function (resolve, reject) {

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

		var SavePickItem_Withdraw = function (objsession, pstrTag_No, pdblQtyMove, pstrNewLocation_Ailas, pstrNewItemStatus_Index, pstrNewPalletStatus_Index, Document_No, Document_Index, Documentitem_Index, Description, isPicking) {
			return new Promise(function (resolve, reject) {

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

		var getPalletInBGPallet = function (objsession, Pallet_No) {
			return new Promise(function (resolve, reject) {

				var strWhere = " and PALLET_No='" + Pallet_No + "' ";

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

		var chk_Pallet_IN_Withdraw_IS_Picked = function (objsession, pstrPalletNo) {
			return new Promise(function (resolve, reject) {

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

		var getVIEW_TAG_TPIPL = function (objsession, Pallet_No) {
			return new Promise(function (resolve, reject) {

				var strWhere = " and PALLET_No='" + Pallet_No + "' and Qty_Bal>0 ";

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

		var SwapPalletInWithDraw = function (objsession, pstrWithdrawItem_Index, pstrPalletNo, pstrWithdraw_Index) {
			return new Promise(function (resolve, reject) {

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
		$scope.save = function () {

			savePallet();

		};

		function savePallet() {
			try {

				$ionicLoading.show();

				//AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				//การยืนยันไม่ควรตรวจสอบจากหน้าจอควร Query ใหม่แบบ RealTime หรือ Load Detail ใหม่
				loadDO(Withdraw_Index, Withdraw_No)

				//Check picking
				var countSTATE = 0;

				if ($scope.datatablesListLength > 0) {
					for (var x in $scope.datatablesList) {
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

				var res_waitConfirmWithdrawStatus_Confirm_TranferStatus = waitConfirmWithdrawStatus_Confirm_TranferStatus(objsession, Withdraw_Index, 2, _CONST_HEADERTYPE);

				res_waitConfirmWithdrawStatus_Confirm_TranferStatus.then(function (res) {

					AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)', '');

					$ionicLoading.hide();

					$ionicHistory.goBack();

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

		var waitConfirmWithdrawStatus_Confirm_TranferStatus = function (objsession, Withdraw_Index, Status, phRemark) {
			return new Promise(function (resolve, reject) {

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
		function SwapPallet_ModalLoad() {

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
		$scope.scanPalletNo_Modal = function (id) {
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
		$scope.search_modal = function (dataSearch, id, searchType) {

			var str = (id == 'Modal_PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location';

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

		function searchPallet_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				var res_getPalletInBGPallet = getPalletInBGPallet(objsession, dataSearch);

				res_getPalletInBGPallet.then(function (res) {

					var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

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

		function searchLocation_Modal(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				if (isSales) {
					var datatables = {};
					var i = 0;

					for (var x in $scope.datatablesList) {

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

					$ionicLoading.hide();

				}
				else {

					var res_Find_GradeLot_IN_location = Find_GradeLot_IN_location(objsession, dataSearch);

					res_Find_GradeLot_IN_location.then(function (res) {

						var resDataSet = (!res_Find_GradeLot_IN_location['diffgr:diffgram']) ? {} : res_Find_GradeLot_IN_location['diffgr:diffgram'].NewDataSet.Table1;

						if (Object.keys(resDataSet).length > 0) {
							$scope.modal_data.SKU = resDataSet[0].sku_id;
							$scope.modal_data.Lot = resDataSet[0].plot;
							Tag_No = resDataSet[0].tag_no;
						}

						$ionicLoading.hide();

					}).catch(function (error) {
						console.log("Error occurred");
						AppService.err('Error', 'Error occurred', '');
						return;
					});

				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		var Find_GradeLot_IN_location = function (objsession, pstrLocationAlias) {
			return new Promise(function (resolve, reject) {

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
		$scope.save_modal = function () {

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

		function savePallet_Modal() {
			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				var Palletstatus = '0010000000004';

				if (IsSales) {
					Palletstatus = '0010000000005';
				}

				var res_updatePalletToTag = updatePalletToTag(objsession, Tag_No, $scope.modal_data.PalletNo, $scope.modal_data.Lot, Palletstatus);

				res_updatePalletToTag.then(function (res) {

					clearData_Modal();
					booAssing = true;
					$scope.isDisable = false;

					if (IsSales) {

						$scope.modal.hide();

						//$ionicHistory.goBack();

						//AppService.succ('สแกน Pallet' + $scope.data.PalletNo + 'อีกครั้งเพื่อเบิกสินค้า!', '');

						if (booAssing) {

							loadDO(Withdraw_Index, Withdraw_No);

							searchPallet($scope.data.PalletNo);
						}

						$scope.data.PalletNo = null;
						setFocus('PalletNo');

					}
					else {
						setFocus('Modal_PalletNo');

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

		var updatePalletToTag = function (objsession, pstrTag_No, pstrPallet_No, PLot, pstrPalletstatus_index) {
			return new Promise(function (resolve, reject) {

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

	.controller('Transport_SHTransferToDockoutCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.getDOList = {};
		$scope.lbQty = 0;
		$scope.lbTotal = 0;
		$scope.lbError = "";
		$scope.lbPallet = 0;

		$scope.data = {};
		$scope.datatablesList_Asset = {};
		$scope.datatablesList_AssetLength = 0;

		let Withdraw_No = null;
		let Withdraw_Index = null;

		$scope['data']['SearchPallet_No_PalletNo'] = false;
		$scope['data']['SearchPallet_No_PalletNo2'] = false;

		$scope._CONST_HEADERTYPE = "MOBILE TO DOCK";

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.datatablesList_Asset = {};
			$scope.datatablesList_AssetLength = 0;

			$scope['data']['SearchPallet_No_PalletNo'] = false;
			$scope['data']['SearchPallet_No_PalletNo2'] = false;
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

			let strWhere = " and status in (10) ";

			strWhere += " and tb_Withdraw.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and  IsUse = 1) ";

			App.API('GetWithdraw_No_WithoutTM', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: strWhere
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {

					$scope.getDOList = resDataSet;

					$scope.changeDO(resDataSet[0].Withdraw_Index + ',' + resDataSet[0].Withdraw_No);
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

			$scope.data.DO = strWithdraw;

			let Withdraw = strWithdraw.split(',');

			Withdraw_Index = Withdraw[0];
			Withdraw_No = Withdraw[1];

			if (!Withdraw_Index) {
				clearData();
				return;
			}

			loadDO(Withdraw_Index, Withdraw_No);

		};

		async function loadDO(Withdraw_Index, Withdraw_No) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetWithdraw_Request = await GetWithdraw_Request(objsession, Withdraw_Index);

				let resDataSet = (!res_GetWithdraw_Request['diffgr:diffgram']) ? {} : res_GetWithdraw_Request['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.data.Vehicle_License_No = resDataSet[0].Dock;
					$scope.data.GoDown = resDataSet[0].Shipping_Location_Name;

					if (resDataSet[0].Dock != "") {
						$scope.data.Vehicle_ID = resDataSet[0].Dock;
					}
					else {
						$scope.data.Vehicle_ID = "";
						AppService.err('แจ้งเตือน', 'ยังไม่มีการเรียกรถเข้าท่าจอด', '');
					}

				}

				await loadDatatablesAsset(Withdraw_Index);

				setFocus('PalletNo');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function loadDatatablesAsset(Withdraw_Index, TransportManifest_Index) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetWithdrawItem = await GetWithdrawItem(objsession, Withdraw_Index);

				let resDataSet = (!res_GetWithdrawItem['diffgr:diffgram']) ? {} : res_GetWithdrawItem['diffgr:diffgram'].NewDataSet.Table1;

				$scope.datatablesList_Asset = resDataSet;
				$scope.datatablesList_AssetLength = Object.keys(resDataSet).length;

				let countSeq = 0; //$.grep(resDataSet3, function (value,index) { return value['WITHDRAWITEM-STATUS'] == "-10"; });

				for (let x in $scope.datatablesList_Asset) {
					if ($scope.datatablesList_Asset[x]['Pallet_seq'] > 8) {
						countSeq++;
					}
				}

				$scope.lbQty = countSeq;//countStatus.length;
				$scope.lbTotal = $scope.datatablesList_AssetLength;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let GetWithdraw_Request = (objsession, Withdraw_Index) => {
			return new Promise((resolve, reject) => {

				let pstrWhere = " and Withdraw_Index ='" + Withdraw_Index + "' ";

				App.API('GetWithdraw_Request', {
					objsession: objsession,
					pstrWhere: pstrWhere,
					pbooDamage: false
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdraw_Request', res));
				});

			})
		}

		let GetWithdrawItem = (objsession, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('GetWithdrawItem', {
					objsession: objsession,
					pstrWithdraw_Index: pstrWithdraw_Index,
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdrawItem', res));
				});

			})
		}

		/*--------------------------------------
		Event Function keyupVehicle_License_No 
		------------------------------------- */
		$scope.keyupVehicle_License_No = () => {

			AppService.blur();

			if ($scope.data.inputVehicle_License_No == "" || $scope.data.inputVehicle_License_No != $scope.data.Vehicle_ID) {
				$scope.data.inputVehicle_License_No = null;
				AppService.err('แจ้งเตือน', 'ระบุท่ารถไม่ถูกต้อง', 'inputVehicle_License_No');
				return;
			}

			$scope.save();

		}

		/*--------------------------------------
		Scan Barcode Function
		------------------------------------- */
		$scope.scanPalletNo = (id) => {
			$cordovaBarcodeScanner.scan().then(function (imageData) {
				if (!imageData.cancelled) {

					if (id == 'PalletNo') {
						$scope.data.PalletNo = imageData.text.toUpperCase();
						$scope.search(angular.copy($scope.data.PalletNo), '');
					}
					else {
						$scope.data.PalletNo2 = imageData.text.toUpperCase();
						$scope.search(angular.copy($scope.data.PalletNo2), '');
					}

				}
			}, function (error) {
				AppService.err('scanPalletNo', error);
			});
		};

		/*--------------------------------------
		Event Function search
		------------------------------------- */
		$scope.search = (dataSearch, id, searchType) => {

			if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
				AppService.err('แจ้งเตือน', 'กรุณา Scan Pallet No.', 'PalletNo');
				return;
			}

			/*if (!dataSearch) {
			  AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
			  return;
			}*/

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
			}*/

			keyCnt = 0;

			searchPallet(dataSearch, id);

		};

		async function searchPallet(dataSearch, id) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if (id == 'PalletNo2' && !dataSearch) {
					setFocus('inputVehicle_License_No');
					$ionicLoading.hide();
					return;
				}

				if (id == 'PalletNo2' && $scope.data.PalletNo == $scope.data.PalletNo2) {
					$scope['data']['SearchPallet_No_' + id] = true;
					setFocus('inputVehicle_License_No');
					$ionicLoading.hide();
					return;
				}

				let datatables_Asset = {};
				let i = 0;

				//find in Withdraw Item (on load withdraw no)
				for (let x in $scope.datatablesList_Asset) {

					if ($scope.datatablesList_Asset[x]['PALLET_x0020_NO'] == dataSearch && $scope.datatablesList_Asset[x]['Withdraw_Index'] == Withdraw_Index) {

						datatables_Asset[i] = $scope.datatablesList_Asset[x];

						i++;
					}

				}

				if (Object.keys(datatables_Asset).length <= 0) {

					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ' + dataSearch + ' ในใบ DO!', id);
					return;

				}

				const res_getPalletTM = await getPalletTM(objsession, dataSearch);

				let resDataSet = (!res_getPalletTM['diffgr:diffgram']) ? {} : res_getPalletTM['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope['data'][id] = null;
					AppService.err('ผิดพลาด', ' ไม่พบ Pallet ' + dataSearch + ' ในระบบ!', id);
					return;
				}

				if (resDataSet[0].PalletStatus_Index != '0010000000008') {
					$scope['data'][id] = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่อยู่ในสถานะ Delivery', id);
					return;
				}

				$scope.data.SKU = resDataSet[0].Sku_Id;
				$scope.data.Lot = resDataSet[0].PLot;
				$scope.data.TotalQty = resDataSet[0].QtyIn_Loc;
				$scope.data.PackageQty = resDataSet[0].QtyIn_Loc / 25;

				$scope['data']['TagNo_' + id] = resDataSet[0].TAG_No;
				$scope['data']['Qty_' + id] = resDataSet[0].QtyIn_Loc;
				$scope['data']['WithDrawItem_Index_' + id] = resDataSet[0].WithdrawItem_Index;
				$scope['data']['SearchPallet_No_' + id] = true;

				if (id == 'PalletNo') {
					$scope.data.Suggest_Location_Index = resDataSet[0].Suggest_Location_Index;

					setFocus('PalletNo2');
				}
				else {
					setFocus('inputVehicle_License_No');
				}

				$ionicLoading.hide();

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

		/*--------------------------------------
	   Event Function save 
	   ------------------------------------- */
		$scope.save = () => {

			savePallet();

		};

		$scope.saveSubmit = () => {

			const res_saveConfirm = saveConfirm();

			res_saveConfirm.then(res => {

				if (!res) {
					AppService.err('แจ้งเตือน', 'กรุณาย้ายของให้ครบ !', 'PalletNo');
					return;
				}

			}).catch(() => {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			});

		};

		async function savePallet() {
			try {

				$ionicLoading.show();

				AppService.blur();

				if (!$scope.data.PalletNo && !$scope.data.PalletNo2) {
					AppService.err('แจ้งเตือน', 'กรุณา Scan Pallet No.', 'PalletNo');
					return;
				}

				if (!$scope.data.PalletNo && $scope['data']['SearchPallet_No_PalletNo']) {
					AppService.err('แจ้งเตือน', 'กรุณาระบุ Pallet No!', 'PalletNo');
					return;
				}

				if ($scope.data.PalletNo && !$scope['data']['SearchPallet_No_PalletNo']) {
					AppService.err('แจ้งเตือน', 'กรุณาค้นหา Pallet No!', 'PalletNo');
					return;
				}

				if (!$scope.data.PalletNo2 && $scope['data']['SearchPallet_No_PalletNo2']) {
					AppService.err('แจ้งเตือน', 'กรุณาระบุ Pallet No2!', 'PalletNo2');
					return;
				}

				if ($scope.data.PalletNo2 && !$scope['data']['SearchPallet_No_PalletNo2']) {
					AppService.err('แจ้งเตือน', 'กรุณาค้นหา Pallet No2!', 'PalletNo2');
					return;
				}

				const res_saveRelocate1 = await saveRelocate($scope['data']['TagNo_PalletNo'], $scope['data']['PalletNo'], $scope['data']['Qty_PalletNo'], $scope['data']['WithDrawItem_Index_PalletNo']);

				if (res_saveRelocate1) {
					for (let x in $scope.datatablesList_Asset) {
						if ($scope.datatablesList_Asset[x]['PALLET_x0020_NO'] == $scope['data']['PalletNo']) {
							$scope.datatablesList_Asset[x]['Pallet_seq'] = 9;
							$scope.datatablesList_Asset[x]['Location_Alias'] = $scope.data.inputVehicle_License_No;
							$scope.datatablesList_Asset[x]['LOCATION'] = $scope.data.inputVehicle_License_No;
							$scope.datatablesList_Asset[x]['PalletStatus_Index'] = '0010000000009';
							$scope.datatablesList_Asset[x]['PalletStatus_Id'] = 'SH';
						}
					}
				}
				else
				{
					AppService.err('ผิดพลาด', 'ในการย้าย Pallet No ลองอีกครั้ง!', 'PalletNo');
					return;
				}

				if ($scope['data']['PalletNo'] != $scope['data']['PalletNo2'] && $scope['data']['PalletNo2']) {

					const res_saveRelocate2 = await saveRelocate($scope['data']['TagNo_PalletNo2'], $scope['data']['PalletNo2'], $scope['data']['Qty_PalletNo2'], $scope['data']['WithDrawItem_Index_PalletNo2']);

					if (res_saveRelocate2) {
						for (let y in $scope.datatablesList_Asset) {
							if ($scope.datatablesList_Asset[y]['PALLET_x0020_NO'] == $scope['data']['PalletNo2']) {
								$scope.datatablesList_Asset[y]['Pallet_seq'] = 9;
								$scope.datatablesList_Asset[y]['Location_Alias'] = $scope.data.inputVehicle_License_No;
								$scope.datatablesList_Asset[y]['LOCATION'] = $scope.data.inputVehicle_License_No;
								$scope.datatablesList_Asset[y]['PalletStatus_Index'] = '0010000000009';
								$scope.datatablesList_Asset[y]['PalletStatus_Id'] = 'SH';
							}
						}
					}
					else
					{
						AppService.err('ผิดพลาด', 'ในการย้าย Pallet No2 ลองอีกครั้ง!', 'PalletNo2');
						return;
					}

				}

				await saveConfirm();

				$scope.data.PalletNo = null;
				$scope.data.PalletNo2 = null;
				$scope.data.inputVehicle_License_No = null;
				setFocus('PalletNo');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}

		}

		async function saveRelocate(pstrTag_No, pstrPallet_No, pdblQty, pstrWithDrawItem_Index) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_SavePickItem_Withdraw = await SavePickItem_Withdraw(objsession, pstrTag_No, pdblQty, $scope.data.inputVehicle_License_No, '0010000000001', '0010000000009', Withdraw_No, Withdraw_Index, pstrWithDrawItem_Index, $scope._CONST_HEADERTYPE, false);

				if (res_SavePickItem_Withdraw == 'PASS') {

					const res_clear_Suggest_Location = await clear_Suggest_Location(objsession, pstrTag_No, $scope.data.Suggest_Location_Index);

					if (res_clear_Suggest_Location) {

						$scope.lbPallet = $scope.lbPallet + 1;

						return true;

					}
					else {

						return false;
						
					}

				}
				else {
					
					return false;
				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function saveConfirm() {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				//Confirm
				$scope['data']['SearchPallet_No_PalletNo'] = false;
				$scope['data']['SearchPallet_No_PalletNo2'] = false;

				//ตรวจสอบ Local.
				let countSeq = 0;

				for (let x in $scope.datatablesList_Asset) {
					if ($scope.datatablesList_Asset[x]['Pallet_seq'] > 8) {
						countSeq++;
					}
				}

				$scope.lbQty = countSeq;

				if (countSeq == $scope.lbTotal) {
					
					await waitConfirmWithdrawStatus_Confirm_TranferStatus(objsession, Withdraw_Index, 11, $scope._CONST_HEADERTYPE);

					AppService.err('แจ้งเตือน', 'ย้ายของครบแล้วในใบขนนี้', '');

					GetWithdraw_No_WithoutTM();

					return true;

				}
				else {

					return false;

				}

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
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

		let clear_Suggest_Location = (objsession, pstrTag_No, Suggest_Location_Index) => {
			return new Promise((resolve, reject) => {

				App.API('clear_Suggest_Location', {
					objsession: objsession,
					pstrTag_No: pstrTag_No,
					Suggest_Location_Index: Suggest_Location_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('clear_Suggest_Location', res));
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


	})

	.controller('Transport_SHLoadingCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicModal, $ionicHistory) {

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
		$scope.getDOList = {};
		$scope.lbQty = 0;
		$scope.lbTotal = 0;
		$scope.lbError = "";

		$scope.data = {};
		$scope.modal_data = {};
		$scope.datatablesList_Pallet = [];
		$scope.datatablesList_PalletLength = 0;
		$scope.datatablesList_Asset = {};
		$scope.datatablesList_AssetLength = 0;

		$scope.selectedPallet_No = null;
		$scope.selectedSTATE = null;

		$scope.totalQty = 0;
		$scope.statusPallet = 0;

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.modal_data = {};
			$scope.datatablesList_Pallet = [];
			$scope.datatablesList_PalletLength = 0;
			$scope.datatablesList_Asset = {};
			$scope.datatablesList_AssetLength = 0;
		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		let findByValue = (key, value, isOptions) => {
			return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
		};

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('inputVehicle_License_No');
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

			let strWhere = " and status in (10,11) and DocumentType_Index in('0010000000006','0010000000061') ";

			strWhere += " and tb_Withdraw.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1) ";

			App.API('GetWithdraw_No_WithoutTM', {
				objsession: angular.copy(LoginService.getLoginData()),
				pstrWhere: strWhere
			}).then(function (res) {
				let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {

					$scope.getDOList = resDataSet;

					$scope.changeDO(resDataSet[0].Withdraw_Index);

				}
				else {
					AppService.err('', 'ไม่มีรายการพร้อมที่จะโหลดตอนนี้', 'DO');
					return;
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
		$scope.changeDO = (Withdraw_Index) => {

			$scope.data.DO = Withdraw_Index;

			if (!Withdraw_Index) {
				clearData();
				return;
			}

			loadDO(Withdraw_Index)

		};

		async function loadDO(Withdraw_Index) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getTM_No = await getTM_No(objsession, Withdraw_Index);

				let resDataSet = (!res_getTM_No['diffgr:diffgram']) ? {} : res_getTM_No['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					$scope.data.TM = resDataSet[0].TransportManifest_No;
					$scope.data.TM_Index = resDataSet[0].TransportManifest_Index;
				}
				else {
					$scope.data.TM = null;
					$scope.data.TM_Index = null;
				}

				const res_getdetailTM = await getdetailTM(objsession, resDataSet[0].TransportManifest_Index);

				let resDataSet2 = (!res_getdetailTM['diffgr:diffgram']) ? {} : res_getdetailTM['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet2).length > 0) {
					$scope.data.Vehicle_License_No = resDataSet2[0].Vehicle_No;
					$scope.data.Vehicle_ID = resDataSet2[0].Vehicle_Id;
					$scope.data.DriverName = resDataSet2[0].Driver_name;
					$scope.data.GoDown = resDataSet2[0].godown;
					$scope.data.Driver_ID = resDataSet2[0].Driver_Id;
					$scope.data.inputDriverName = resDataSet2[0].Driver_Id;
					$scope.data.HandlingType_Index = resDataSet2[0].HandlingType_Index;
				}
				else {
					$scope.data.Vehicle_License_No = null;
					$scope.data.Vehicle_ID = null;
					$scope.data.DriverName = null;
					$scope.data.GoDown = null;
					$scope.data.Driver_ID = null;
					$scope.data.inputDriverName = null;
					$scope.data.HandlingType_Index = null;
					AppService.err('แจ้งเตือน', 'กรุณาเพิ่มทะเบียนรถและคนขับ', 'DO');
					return;
				}

				await loadDatatablesAsset(Withdraw_Index, resDataSet[0].TransportManifest_Index);

				setFocus('inputVehicle_License_No');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function loadDatatablesAsset(Withdraw_Index, TransportManifest_Index) {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetWithdrawItem_Loading = await GetWithdrawItem_Loading(objsession, Withdraw_Index, TransportManifest_Index);

				let resDataSet3 = (!res_GetWithdrawItem_Loading['diffgr:diffgram']) ? {} : res_GetWithdrawItem_Loading['diffgr:diffgram'].NewDataSet.Table1;

				$scope.datatablesList_Asset = resDataSet3;
				$scope.datatablesList_AssetLength = Object.keys(resDataSet3).length;

				let countStatus = 0; //$.grep(resDataSet3, function (value,index) { return value['WITHDRAWITEM-STATUS'] == "-10"; });

				for (let x in $scope.datatablesList_Asset) {
					if ($scope.datatablesList_Asset[x]['WITHDRAWITEM-STATUS'] == -10) {
						countStatus++;
					}
				}

				$scope.lbQty = countStatus;//countStatus.length;
				$scope.lbTotal = $scope.datatablesList_AssetLength;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		let getTM_No = (objsession, pstrWithdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('getTM_No', {
					objsession: objsession,
					pstrWithdraw_Index: pstrWithdraw_Index,
					statusTM: " 1,6,7,8,9,10 "
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getTM_No', res));
				});

			})
		}

		let getdetailTM = (objsession, pstrTM_Index) => {
			return new Promise((resolve, reject) => {

				App.API('getdetailTM', {
					objsession: objsession,
					pstrTM_Index: pstrTM_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getdetailTM', res));
				});

			})
		}

		let GetWithdrawItem_Loading = (objsession, pstrWithdraw_Index, TransportManifest_Index) => {
			return new Promise((resolve, reject) => {

				let pstrWhere = (TransportManifest_Index != "") ? " and (TransportManifest_Index = '" + TransportManifest_Index + "') " : "";

				App.API('GetWithdrawItem_Loading', {
					objsession: objsession,
					pstrWithdraw_Index: pstrWithdraw_Index,
					Withdraw_Status: "5,10,11",
					pstrWhere: pstrWhere
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getdetailTM', res));
				});

			})
		}

		/*--------------------------------------
		Event Function keyupVehicle_License_No 
		------------------------------------- */
		$scope.keyupVehicle_License_No = () => {

			AppService.blur();

			let PalletNo = document.querySelector("#PalletNo");
			let TM = document.querySelector("#TM")
			let inputVehicle_License_No = document.querySelector("#inputVehicle_License_No")

			if ($scope.data.inputVehicle_License_No == "") {
				AppService.err('แจ้งเตือน', 'กรุณากรอกทะเบียบรถ', 'inputVehicle_License_No');
				return;
			}

			if ($scope.data.inputVehicle_License_No != $scope.data.Vehicle_ID) {
				$scope.data.inputVehicle_License_No = null;
				AppService.err('แจ้งเตือน', 'ทะเบียบรถที่ระบุไม่ถูกต้อง', 'inputVehicle_License_No');
				return;
			}

			PalletNo.readOnly = false;
			inputVehicle_License_No.readOnly = true;

			setFocus("PalletNo");



		}

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
		Event Function search
		------------------------------------- */
		$scope.search = (dataSearch, searchType) => {

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

			searchPallet(dataSearch);

		};

		async function searchPallet(dataSearch) {
			try {

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_getPalletTM = await getPalletTM(objsession, dataSearch);

				let resDataSet = (!res_getPalletTM['diffgr:diffgram']) ? {} : res_getPalletTM['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('ผิดพลาด', ' ไม่พบ Pallet ' + dataSearch + ' ในระบบ!', 'PalletNo');
					return;
				}

				totalQty = resDataSet[0].Qty_per_TAG
				statusPallet = resDataSet[0].PalletStatus_Id

				let datatables_Asset = {};
				let i = 0;

				//find in Withdraw Item (on load withdraw no)
				for (let x in $scope.datatablesList_Asset) {

					if ($scope.datatablesList_Asset[x]['PALLET_x0020_NO'] == dataSearch && $scope.datatablesList_Asset[x]['Withdraw_Index'] == $scope.data.DO) {

						datatables_Asset[i] = $scope.datatablesList_Asset[x];

						i++;
					}

				}

				if (Object.keys(datatables_Asset).length <= 0) {

					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ' + dataSearch + ' ในใบ DO!', 'PalletNo');
					return;

				}

				for (let x in datatables_Asset) {
					//check Local realtime befor
					if (datatables_Asset[x]['WITHDRAWITEM-STATUS'] == -10) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', dataSearch + ' โหลดขึ้นรถแล้ว!', 'PalletNo');
						return;
					}

					//check Online real befor
					const res_CHEKPICK_WITHDRAWITEM_STATUS_EQUAL = await CHEKPICK_WITHDRAWITEM_STATUS_EQUAL(objsession, datatables_Asset[x]['WithdrawItem_Index'], -10);
					if (res_CHEKPICK_WITHDRAWITEM_STATUS_EQUAL) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', dataSearch + ' โหลดขึ้นรถแล้ว!', 'PalletNo');
						return;
					}

					if (resDataSet[0].PalletStatus_Index != '0010000000009') {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'Pallet ไม่อยู่ในสถานะ Shipping', 'PalletNo');
						return;
					}

					let strOnPallet_Checked = '';
					let strOnPallet_Alert = '';

					if ($scope.data.On_Pallet) {
						strOnPallet_Checked = 'On Pallet';
						strOnPallet_Alert = 'ยืนยัน Pallet : ' + dataSearch + ' ขึ้น On Pallet หรือไม่ ?';

					}
					else {
						strOnPallet_Alert = 'ยืนยัน Pallet : ' + dataSearch + ' ไม่ขึ้น  On Pallet หรือไม่ ? ';
					}

					$ionicPopup.confirm({
						title: 'Confirm',
						template: strOnPallet_Alert
					}).then(function (res) {

						if (res) {

							$ionicLoading.show();

							//update Pallet
							if (SaveLoadWithdrawItem_New(objsession, $scope.data.TM_Index, datatables_Asset[x]['WithdrawItem_Index'], '0010000000010', dataSearch, strOnPallet_Checked)) {
								let countStatus = 0;

								//update real ui and Sort new
								for (let y in $scope.datatablesList_Asset) {

									if ($scope.datatablesList_Asset[y]['WithdrawItem_Index'] == datatables_Asset[x]['WithdrawItem_Index']) {
										$scope.datatablesList_Asset[y]['STATE'] = "ขึ้นรถแล้ว";
										$scope.datatablesList_Asset[y]['WITHDRAWITEM-STATUS'] = -10;
										$scope.datatablesList_Asset[y]['PICKINGQTY'] = datatables_Asset[x]['QTY'];
										$scope.datatablesList_Asset[y]['PalletStatus_Index'] = '0010000000010';
										$scope.datatablesList_Asset[y]['PalletStatus_Id'] = 'HT';
										$scope.datatablesList_Asset[y]['ON_x0020_PALLET'] = strOnPallet_Checked;

									}

									if ($scope.datatablesList_Asset[y]['WITHDRAWITEM-STATUS'] == -10) {
										countStatus++;
									}

								}

								$scope.lbQty = countStatus;

								addDatatable_Pallet(dataSearch);

								$scope.data.PalletNo = null;
								setFocus('PalletNo');
								$ionicLoading.hide();
							}
							else {
								$scope.data.PalletNo = null;
								AppService.err('แจ้งเตือน', 'ไม่สามารถโหลด Pallet ' + dataSearch + ' นี้ได้ กรุณาติดต่อ IT!', 'PalletNo');
								return;
							}

						}
						else {

							$scope.data.PalletNo = null;
							setFocus('PalletNo');
							return;

						}

					});

				}

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

		let CHEKPICK_WITHDRAWITEM_STATUS_EQUAL = (objsession, WithdrawItem_Index, Status) => {
			return new Promise((resolve, reject) => {

				App.API('CHEKPICK_WITHDRAWITEM_STATUS_EQUAL', {
					objsession: objsession,
					WithdrawItem_Index: WithdrawItem_Index,
					Status: Status,
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('CHEKPICK_WITHDRAWITEM_STATUS_EQUAL', res));
				});

			})
		}

		let SaveLoadWithdrawItem_New = (objsession, pstrTransportManifest_Index, WithdrawItem_Index, PalletStatus_Index, pPallet_No, pStrChecked) => {
			return new Promise((resolve, reject) => {

				App.API('SaveLoadWithdrawItem_New', {
					objsession: objsession,
					pstrTransportManifest_Index: pstrTransportManifest_Index,
					WithdrawItem_Index: WithdrawItem_Index,
					PalletStatus_Index: PalletStatus_Index,
					pPallet_No: pPallet_No,
					pStrChecked: pStrChecked,
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SaveLoadWithdrawItem_New', res));
				});

			})
		}

		let addDatatable_Pallet = (pstrPallet_No) => {

			$scope.datatablesList_Pallet.push({
				PALLET_NO: pstrPallet_No,
				STATE: 'ขึ้นรถแล้ว',
				QTY: totalQty
			});

			$scope.datatablesList_PalletLength++;

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

				if ($scope.data.DO == null) {
					AppService.err('แจ้งเตือน', 'กรุณาเลือก DO', '');
					return;
				}

				if ($scope.data.inputVehicle_License_No != $scope.data.Vehicle_ID) {
					AppService.err('แจ้งเตือน', 'รหัสทะเบียนรถไม่ถูกต้องกรุณาตรวจสอบ', 'inputVehicle_License_No');
					return;
				}

				if ($scope.datatablesList_AssetLength > 0) {
					for (let x in $scope.data.datatablesList_Asset) {

						if ($scope.data.datatablesList_Asset[x]['WITHDRAWITEM-STATUS'] != -10) {
							AppService.err('แจ้งเตือน', 'หยิบไม่ครบรายการ', 'PalletNo');
							return;
						}
					}
				}

				const res_Chk_Lock = await Chk_Lock(objsession, $scope.data.TM_Index);

				if (res_Chk_Lock) {
					AppService.err('แจ้งเตือน', 'มีรายการที่ยังไม่ได้ปลดล็อคการเบิก', 'PalletNo');
					return;
				}

				const res_GetWithdraw_No = await GetWithdraw_No(objsession, $scope.data.TM);

				let resDataSet = (!res_GetWithdraw_No['diffgr:diffgram']) ? {} : res_GetWithdraw_No['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length > 0) {
					AppService.err('แจ้งเตือน', 'ยังมีรายการค้างที่ยังไม่ได้เบิกกรุณาตรวจสอบ', 'PalletNo');
					return;
				}

				$scope.modal.show();

				setFocus('inputDriverName');

				$scope.modal_data.TM = $scope.data.TM;
				$scope.modal_data.Vehicle_License_No = $scope.data.Vehicle_License_No;
				$scope.modal_data.DriverName = $scope.data.DriverName;
				$scope.modal_data.Driver_ID = $scope.data.Driver_ID;
				$scope.modal_data.GoDown = $scope.data.GoDown;

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}

		}

		let Chk_Lock = (objsession, pstrTM_Index) => {
			return new Promise((resolve, reject) => {

				App.API('Chk_Lock', {
					objsession: objsession,
					pstrTM_Index: pstrTM_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Chk_Lock', res));
				});

			})
		}

		let GetWithdraw_No = (objsession, TransportManifest_No) => {
			return new Promise((resolve, reject) => {

				let pstrWhere = " and (tm.TransportManifest_No = '" + TransportManifest_No + "') ";

				App.API('GetWithdraw_No', {
					objsession: objsession,
					pstrWhere: pstrWhere
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('GetWithdraw_No', res));
				});

			})
		}

		/*--------------------------------------
		Event Function keyupDriverName 
		------------------------------------- */
		$scope.keyupDriverName = (inputDriverName) => {

			saveModal(inputDriverName);

		}

		async function saveModal(inputDriverName) {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				$scope.modal_data.boCHK_Driver = false;

				if (inputDriverName == $scope.modal_data.Driver_ID) {
					$scope.modal_data.boCHK_Driver = true;
				}
				else {
					$scope.modal_data.inputDriverName = null;
					AppService.err('แจ้งเตือน', 'รหัสคนขับไม่ถูกต้อง', 'inputDriverName');
					return;
				}

				$scope.modal.hide();

				if ($scope.modal_data.boCHK_Driver) {
					
					await setTMReadyStatus_New(objsession, $scope.data.TM_Index, $scope.data.DO, $scope.data.HandlingType_Index);

					await Update_AuditLogProcess(objsession, $scope.data.DO, $scope.data.TM_Index, '', 'SH_load_success');

					AppService.succ('ของขึ้นรถครบทุกรายการแล้ว (รอการยืนยันการชั่งหนัก)', '');

				}

				$ionicLoading.hide();

				$ionicHistory.goBack();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}

		}

		let setTMReadyStatus_New = (objsession, pstrTM_Index, SalesOrder_Index, HandlingType_Index) => {
			return new Promise((resolve, reject) => {

				App.API('setTMReadyStatus_New', {
					objsession: objsession,
					pstrTM_Index: pstrTM_Index,
					SalesOrder_Index: SalesOrder_Index,
					HandlingType_Index: HandlingType_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('setTMReadyStatus_New', res));
				});

			})
		}

		let Update_AuditLogProcess = (objsession, SalesOrder_Index, TransportManifest_Index, TransportManifest_No, pstrCollumn_Name) => {
			return new Promise((resolve, reject) => {

				App.API('Update_AuditLogProcess', {
					objsession: objsession,
					SalesOrder_Index: SalesOrder_Index,
					TransportManifest_Index: TransportManifest_Index,
					TransportManifest_No: TransportManifest_No,
					pstrCollumn_Name: pstrCollumn_Name
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('Update_AuditLogProcess', res));
				});

			})
		}

		/*--------------------------------------
		Event Function clear 
		------------------------------------- */
		$scope.clear = function () {

			clearPallet();

		};

		async function clearPallet() {
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				if ($scope.datatablesList_AssetLength == 0) {
					AppService.err('แจ้งเตือน', 'ไม่พบรายการที่จะยกเลิก', 'PalletNo');
					return;
				}

				if ($scope.selectedSTATE == 'เบิกแล้ว') {
					AppService.err('แจ้งเตือน', 'สถานะเป็น เบิกเเล้ว ไม่สามารถยกเลิกได้', 'PalletNo');
					return;
				}

				const res_ClearLoadWithdrawItem_New = await ClearLoadWithdrawItem_New(objsession, $scope.selectedPallet_No, $scope.data.DO);

				if (res_ClearLoadWithdrawItem_New) {
					if ($scope.datatablesList_PalletLength > 0) {
						for (let x in $scope.datatablesList_Pallet) {
							if ($scope.datatablesList_Pallet[x]['PALLET_NO'] == $scope.selectedPallet_No) {
								$scope.datatablesList_Pallet.splice(x, 1);
							}
						}
					}

					await loadDatatablesAsset($scope.data.DO, $scope.data.TM_Index);

				}
				else {
					AppService.err('ผิดพลาด', 'Clear Load Pallet ' + $scope.selectedPallet_No + ' ผิดพลาด!', '');
					return;
				}

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}

		}

		let ClearLoadWithdrawItem_New = (objsession, Pallet_No, Withdraw_Index) => {
			return new Promise((resolve, reject) => {

				App.API('ClearLoadWithdrawItem_New', {
					objsession: objsession,
					Pallet_No: Pallet_No,
					Withdraw_Index: Withdraw_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('ClearLoadWithdrawItem_New', res));
				});

			})
		}

		/*--------------------------------------
		Event Function setSelected
		------------------------------------- */
		$scope.setSelected = (Pallet_No, STATE) => {
			$scope.selectedPallet_No = Pallet_No;
			$scope.selectedSTATE = STATE;
		};

	})

	.controller('Transport_SHReceiveCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicModal, $ionicHistory) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.lbQty = 0;

		$scope.data = {};

		$scope.datatablesList = [];
		$scope.datatablesListLength = 0;

		$scope.selectedPallet_No = null;
		$scope.selectedWithdraw_Index = null;

		let keyCnt = 0;

		let clearData = () => {
			$scope.data = {};
			$scope.datatablesList = [];
			$scope.datatablesListLength = 0;

		};

		let setFocus = (id) => {
			AppService.focus(id);
		}

		let findByValue = (key, value, isOptions) => {
			return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
		};

		clearData();

		$scope.$on('$ionicView.enter', function () {
			setFocus('Location');
		});

		/*--------------------------------------
		Scan Barcode Function
		------------------------------------- */
		$scope.scan = (id) => {
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

			let txtType = (id == 'Location') ? 'Location' : 'Pallet No.';

			if (!dataSearch) {
				AppService.err('แจ้งเตื่อน', 'กรุณา Scan ' + txtType, id);
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

			if (id == 'Location') {
				searchLocation(dataSearch);
			}
			else {
				searchPallet(dataSearch);
			}

		};

		async function searchLocation(dataSearch) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetLocation_Index = await GetLocation_Index(objsession, dataSearch);

				if (!res_GetLocation_Index) {
					$scope.data.Location = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'Location');
					return;
				}

				setFocus('PalletNo');

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

		async function searchPallet(dataSearch) {
			try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				for (let x in $scope.datatablesList) {
					if ($scope.datatablesList[x]['Pallet_No'] == dataSearch) {
						$scope.data.PalletNo = null;
						AppService.err('แจ้งเตือน', 'เลือก Pallet No. นี้ไปแล้ว', 'PalletNo');
						return;
					}
				}

				const res_getPallet_No = await getPallet_No(objsession, dataSearch);

				let resDataSet = (!res_getPallet_No['diffgr:diffgram']) ? {} : res_getPallet_No['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet).length <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');
					return;
				}

				const res_getTagByPallet = await getTagByPallet(objsession, dataSearch);

				let resDataSet2 = (!res_getTagByPallet['diffgr:diffgram']) ? {} : res_getTagByPallet['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet2).length > 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน ไม่สามารถรับได้', 'PalletNo');
					return;
				}

				const res_getPalletWithdrawToCustomerDO = await getPalletWithdrawToCustomerDO(objsession, dataSearch);

				let resDataSet3 = (!res_getPalletWithdrawToCustomerDO['diffgr:diffgram']) ? {} : res_getPalletWithdrawToCustomerDO['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet3).length > 0) {
					$scope.datatablesList.push({
						Seq: $scope.datatablesListLength + 1,
						Pallet_No: dataSearch,
						PalletStatus_Id: resDataSet3[0].PalletStatus_Id,
						DO: resDataSet3[0].DO,
						Godown: resDataSet3[0].Godown,
						Withdraw_Index: resDataSet3[0].Withdraw_Index,
						CS_Index: resDataSet3[0].CS_Index,
						CSL_Index: resDataSet3[0].CSL_Index,
						PalletStatus_Index: resDataSet3[0].PalletStatus_Index
					});

				}

				$scope.lbQty = $scope.datatablesListLength;

				$scope.data.PalletNo = null;
				setFocus('PalletNo');

				$ionicLoading.hide();

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

		let getPallet_No = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

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

		let getTagByPallet = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

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

		let getPalletWithdrawToCustomerDO = (objsession, pPallet_No) => {
			return new Promise((resolve, reject) => {

				App.API('getPalletWithdrawToCustomerDO', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getPalletWithdrawToCustomerDO', res));
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

				if ($scope.datatablesListLength <= 0) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่มีรายการ Pallet No.', 'PalletNo');
					return;
				}


				let items = [];
				angular.forEach($scope.datatablesList, function (value, key) {
					let item = {
						"Pallet_No": value.Pallet_No,
						"DO": value.DO,
						"Customer": value.Godown,
						"Withdraw_Index": value.Withdraw_Index,
						"CS_Index": value.CS_Index,
						"CSL_Index": value.CSL_Index,
						"PalletStatus_Index": value.PalletStatus_Index
					}
					this.push(item);
				}, items);

				let ads = {
					"Table1": items
				};


				await ReceiveBulkPallet(objsession, ads, $scope.data.Location);

				$scope.data.PalletNo = null;
				AppService.succ('ยืนยันเรียบร้อยแล้ว', 'PalletNo');

				$scope.datatablesList = [];
				$scope.datatablesListLength = 0;

				$scope.lbQty = 0;

				$ionicLoading.hide();

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}

		}

		let ReceiveBulkPallet = (objsession, ads, location) => {
			return new Promise((resolve, reject) => {

				App.API('ReceiveBulkPallet', {
					objsession: objsession,
					ads: JSON.stringify(ads),
					location: location
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('ReceiveBulkPallet', res));
				});

			})
		}

		/*--------------------------------------
		Event Function delete 
		------------------------------------- */
		$scope.deleted = function () {

			if ($scope.datatablesListLength > 0) {
				for (let x in $scope.datatablesList) {
					if ($scope.datatablesList[x]['Pallet_No'] == $scope.selectedPallet_No && $scope.datatablesList[x]['Withdraw_Index'] == $scope.selectedWithdraw_Index) {
						$scope.datatablesList.splice(x, 1);
					}
				}
			}

			$scope.lbQty = $scope.datatablesListLength;

			$scope.data.PalletNo = null;
			setFocus('PalletNo');

		};

		/*--------------------------------------
		Event Function setSelected
		------------------------------------- */
		$scope.setSelected = (Pallet_No, Withdraw_Index) => {
			$scope.selectedPallet_No = Pallet_No;
			$scope.selectedWithdraw_Index = Withdraw_Index;
		};

	});



