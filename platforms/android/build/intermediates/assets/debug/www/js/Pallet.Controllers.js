/**
 * Pallet.Controllers Module
 *
 * Description
 */
angular.module('Pallet.Controllers', [])

	.controller('Pallet_ClearPalletCtrl', function ($scope, $state, $ionicPopup, $cordovaBarcodeScanner, AppService, LoginService, App, $ionicLoading) {

		$scope.data = {};
		$scope.dataTableItem = [];
		$scope.dataTableItemLength = 0;

		var keyCnt = 0;

		$scope.$on('$ionicView.enter', function () {
			setFocus('PalletNo');
		});

		/*--------------------------------------
		Set Focus Function
		------------------------------------- */
		var setFocus = function () {
			$scope.data.PalletNo = null;
			AppService.focus('PalletNo');
		};

		/*--------------------------------------
		Set Selected Function
		------------------------------------- */
		$scope.setSelected = function (index) {
			if ($scope.dataTableItem[index].isSelect)
				$scope.dataTableItem[index].isSelect = false;
			else
				$scope.dataTableItem[index].isSelect = true;
			for (var i in $scope.dataTableItem) {
				if (i != index)
					$scope.dataTableItem[i].isSelect = false;
			}
		};

		/*--------------------------------------
		Deleted Function
		------------------------------------- */
		$scope.deleted = function () {
			if (AppService.findObjValue($scope.dataTableItem, 'isSelect', true, true).length <= 0) {
				AppService.err('', 'ไม่มีรายการ Pallet No. ที่เลือก', 'PalletNo');
			} else {
				for (var i in $scope.dataTableItem) {
					if ($scope.dataTableItem[i].isSelect)
						$scope.dataTableItem.splice(i, 1);
				}

				$scope.dataTableItemLength = $scope.dataTableItemLength - 1

				$scope.data.PalletNo = null;
				setFocus();
			}
		};

		/*--------------------------------------
		Scan Barcode Function
		------------------------------------- */
		$scope.scanPalletNo = function () {
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
		Search Function
		------------------------------------- */
		$scope.search = function (dataSearch, searchType) {


			if (!dataSearch) {
				AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');
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

			Check_Pallet(dataSearch);

		};

		/*--------------------------------------
		Check_Pallet Function
		------------------------------------- */
		var Check_Pallet = function (dataS) {

			$ionicLoading.show();

			AppService.blur();

			if (dataS && $scope.dataTableItemLength > 0 && AppService.findObjValue($scope.dataTableItem, 'Pallet_No', dataS, true).length > 0) {
				$scope.data.PalletNo = null;
				AppService.err('', 'Scan Pallet No. นี้ไปแล้ว', 'PalletNo');
			} else {

				App.API('getPallet_No', {
					objsession: angular.copy(LoginService.getLoginData()),
					pPallet_No: dataS
				}).then(function (res) {

					var getPallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
					//console.log('res = ', getPallet_No);
					if (Object.keys(getPallet_No).length > 0) {

						App.API('getTagByPallet', {
							objsession: angular.copy(LoginService.getLoginData()),
							pPallet_No: dataS
						}).then(function (res) {

							var getTagByPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
							//console.log('res = ', getTagByPallet);
							if (Object.keys(getTagByPallet).length == 0) {


								App.API('getPalletWithdrawToCustomer', {
									objsession: angular.copy(LoginService.getLoginData()),
									pPallet_No: dataS
								}).then(function (res) {

									var getPalletWithdrawToCustomer = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
									//console.log('res = ', getPalletWithdrawToCustomer);
									if (Object.keys(getPalletWithdrawToCustomer).length > 0) {

										$scope.dataTableItem.push({

											Pallet_No: dataS,
											PalletStatus_Id: getPalletWithdrawToCustomer[0].PalletStatus_Id,
											DO: getPalletWithdrawToCustomer[0].DO,
											Godown: getPalletWithdrawToCustomer[0].Godown,
											Withdraw_Index: getPalletWithdrawToCustomer[0].Withdraw_Index,
											CS_Index: getPalletWithdrawToCustomer[0].CS_Index,
											CSL_Index: getPalletWithdrawToCustomer[0].CSL_Index,
											PalletStatus_Index: getPalletWithdrawToCustomer[0].PalletStatus_Index

										});

										$scope.dataTableItemLength = Object.keys($scope.dataTableItem).length;

										$ionicLoading.hide();
										setFocus();

									}

								}).catch(function (res) {
									AppService.err('getPalletWithdrawToCustomer', res);
								}).finally(function () { }); // End Call API getBalancePallet_No


							} else {
								//AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');

								$ionicLoading.hide();

								$ionicPopup.confirm({
									title: 'Confirm',
									template: 'Pallet No. นี้มีสินค้าใน Stock ต้องการ Clear หรือไม่ ?'
								}).then(function (res) {

									if (res) {
										$ionicLoading.show();

										AppService.blur();

										App.API('getPalletWithdrawToCustomer', {
											objsession: angular.copy(LoginService.getLoginData()),
											pPallet_No: dataS
										}).then(function (res) {

											var getPalletWithdrawToCustomer = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
											//console.log('res = ', getPalletWithdrawToCustomer);
											if (Object.keys(getPalletWithdrawToCustomer).length > 0) {

												$scope.dataTableItem.push({

													Pallet_No: dataS,
													PalletStatus_Id: getPalletWithdrawToCustomer[0].PalletStatus_Id,
													DO: getPalletWithdrawToCustomer[0].DO,
													Godown: getPalletWithdrawToCustomer[0].Godown,
													Withdraw_Index: getPalletWithdrawToCustomer[0].Withdraw_Index,
													CS_Index: getPalletWithdrawToCustomer[0].CS_Index,
													CSL_Index: getPalletWithdrawToCustomer[0].CSL_Index,
													PalletStatus_Index: getPalletWithdrawToCustomer[0].PalletStatus_Index

												});

												$scope.dataTableItemLength = Object.keys($scope.dataTableItem).length;

												$ionicLoading.hide();
												setFocus();

											}

										}).catch(function (res) {
											AppService.err('getPalletWithdrawToCustomer', res);
										}).finally(function () { }); // End Call API getBalancePallet_No
									}
									else {
										setFocus();
									}


								})

							}

						}).catch(function (res) {
							AppService.err('getTagByPallet', res);
						}).finally(function () { }); // End Call API getBalancePallet_No

					} else {
						$scope.data.PalletNo = null;
						AppService.err('', 'ไม่พบ Pallet No. นี้ ในระบบ', 'PalletNo');
					}

				}).catch(function (res) {
					AppService.err('getPallet', res);
				}).finally(function () { }); //End Call API getPallet

			}

		};

		/*--------------------------------------
		Test Enter Key
		------------------------------------- */
		$scope.myFunct = function (keyEvent) {
			//console.log('keyEvent  ::', keyEvent.which);
			if (keyEvent.which === 32)
				//console.log('Key:::::', keyEvent.which);
				alert('I am an alert');

			if (keyEvent.which === 13)
				//console.log('Enter Key:::::', keyEvent.which);
				alert('I am an alert');
		};


		/*--------------------------------------
		Save Item Function
		------------------------------------- */
		$scope.save = function () {

			if ($scope.dataTableItemLength > 0) {

				$ionicPopup.confirm({
					title: 'Confirm',
					template: 'ยืนยันการบันทึกหรือไม่ ?'
				}).then(function (res) {


					if (res) {
						$ionicLoading.show();

						AppService.blur();

						var items = [];
						angular.forEach($scope.dataTableItem, function (value, key) {
							var item = {
								"Pallet_No": value.Pallet_No ? value.Pallet_No : null,
								"Pallet_Status": value.PalletStatus_Id ? value.PalletStatus_Id : null,
								"DO": value.DO ? value.DO : null,
								"Customer": value.Godown ? value.Godown : null,
								"Withdraw_Index": value.Withdraw_Index ? value.Withdraw_Index : null,
								"CS_Index": value.CS_Index ? value.CS_Index : null,
								"CSL_Index": value.CSL_Index ? value.CSL_Index : null,
								"PalletStatus_Index": value.PalletStatus_Index ? value.PalletStatus_Index : null
							}
							this.push(item);
						}, items);
						var ads = {
							"Table1": items
						};

						//console.log(ads);
						App.API('Clear_Pallet', {
							objsession: angular.copy(LoginService.getLoginData()),
							ads: JSON.stringify(ads)
						}).then(function (res) {
							//API not return
							//console.log('res = ', res);
							//if(res == 'True'){
							//$scope.data = {};
							$scope.dataTableItem = [];
							$scope.dataTableItemLength = 0;
							//$scope.data.Count = $scope.dataTableItemLength;
							//}
							//AppService.succ('Clear Pallet Success :: ', res);  
							AppService.succ('ยืนยัน Clear Pallet เรียบร้อยแล้ว', 'PalletNo');

						}).catch(function (res) {
							AppService.err('Clear_Pallet', res);
						}).finally(function () { });
					}
					else {
						setFocus();
					}


				}); //End Confirm Popup

			} else {
				$scope.data.PalletNo = null;
				AppService.err('', 'ไม่มีรายการ Pallet', 'PalletNo');

			}
		};



	})

	.controller('Pallet_SplitPalletCtrl', function ($scope, $state, $ionicLoading, $cordovaBarcodeScanner, AppService, LoginService, App, $ionicLoading) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.getTagList = {};

		var Qty_Bal = 0;
		var ItemStatus_Index_Bal = '';

		var keyCnt = 0;

		var clearData = function () {
			$scope.data = {};
			$scope.getTagList = {};
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

				var res_getPallet_No = getPallet_No(objsession, dataSearch);

				var res_getBalancePallet_No = getBalancePallet_No(objsession, dataSearch);

				Promise.all([res_getPallet_No, res_getBalancePallet_No]).then(function (res) {

					var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

					var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

					if (id == 'PalletNo') {

						if (Object.keys(resDataSet).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ที่ระบุ!', id);
							return;
						}

						if (Object.keys(resDataSet2).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'Pallet ที่ระบุไม่มีสินค้าแล้ว!', id);
							return;
						}

						if (resDataSet[0].PalletStatus_Index != '0010000000004') {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'สถานะ Pallet ไม่เป็น RD', id);
							return;
						}

						var res_searchPallet_Detail = searchPallet_Detail(dataSearch);

						res_searchPallet_Detail.then(function (res) {

							if (!res) {
								$scope['data'][id] = null;
								AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ', id);
								return;
							}

							$ionicLoading.hide();

						}).catch(function (error) {
							console.log("Error occurred");
							AppService.err('Error', 'Error occurred', '');
							return;
						});

					}
					else {

						if (Object.keys(resDataSet).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ปลายทางที่ระบุ!', id);
							return;
						}

						if (Object.keys(resDataSet2).length != 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'Pallet ปลายทางที่ระบุมีสินค้าแล้ว!', id);
							return;
						}

						if (resDataSet[0].PalletStatus_Index != '0010000000000') {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'สถานะ Pallet ไม่เป็น EM', id);
							return;
						}

						saveSplit();

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

		function searchPallet_Detail(dataSearch) {
			try {

				var objsession = angular.copy(LoginService.getLoginData());

				var res_getPalletTagBalance = getPalletTagBalance(objsession, dataSearch);

				return res_getPalletTagBalance.then(function (res) {

					var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length > 0) {

						$scope.getTagList = resDataSet;

						$scope.changeTag(resDataSet[0].Tag_No_T);

						return true;
					}
					else {
						return false;
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

		};

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

		var getBalancePallet_No = function (objsession, pPallet_No) {
			return new Promise(function (resolve, reject) {

				App.API('getBalancePallet_No', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getBalancePallet_No', res));
				});

			})
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

		/*--------------------------------------
		Event Function changeTag
		------------------------------------- */
		$scope.changeTag = function (Tag_No) {

			$scope.data.Tag = Tag_No

			changeTagDetail(Tag_No);

		}

		var changeTagDetail = function (Tag_No) {

			if (!Tag_No) {
				return
			}

			var datatables_Tag = {};
			var i = 0;

			for (var x in $scope.getTagList) {

				if ($scope.getTagList[x].TAG_No == Tag_No) {
					datatables_Tag[x] = $scope.getTagList[x];

					i++;

				}

			}

			if (Object.keys(datatables_Tag).length > 0) {
				$scope.data.SKU = datatables_Tag[0].Sku_Id;
				$scope.data.PalletStatusFrom = datatables_Tag[0].Pallet_Status;
				$scope.data.Lot = datatables_Tag[0].PLot;
				$scope.data.TotalQty = datatables_Tag[0].Qty_Bal;
				$scope.data.PackageQty = parseFloat(datatables_Tag[0].Qty_per_TAG) / parseFloat(datatables_Tag[0].Flo1);
				$scope.data.MoveQty = datatables_Tag[0].Qty_Bal;
				$scope.data.SumQtyAfterMove = 0;

				Qty_Bal = datatables_Tag[0].Qty_Bal;
				ItemStatus_Index_Bal = datatables_Tag[0].ItemStatus_Index_Bal;

			}

			setFocus('PalletNo2');

		}

		/*--------------------------------------
		Event Function save
		------------------------------------- */
		$scope.save = function () {

			saveSplit();

		}

		function saveSplit() {
			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				if (!$scope.data.PalletNo) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No!', 'PalletNo');
					return;
				}

				if (!$scope.data.PalletNo2) {
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No ปลายทาง!', 'PalletNo2');
					return;
				}

				if (!$scope.data.MoveQty || $scope.data.MoveQty == 0 || $scope.data.MoveQty < 0) {
					$scope.data.MoveQty = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน จน. ย้าย! มากกว่า 0', 'MoveQty');
					return;
				}

				var res_saveRelocate_SplitPallet_NewByPakorn = saveRelocate_SplitPallet_NewByPakorn(objsession, $scope.data.Tag, $scope.data.PalletNo2, $scope.data.PalletNo, $scope.data.MoveQty, $scope.data.SumQtyAfterMove, ItemStatus_Index_Bal);

				res_saveRelocate_SplitPallet_NewByPakorn.then(function (res) {

					if (res == 'True') {
						clearData();
						AppService.succ('ทำการแตกพาเลทสินค้าเรียบร้อย', 'PalletNo');
						$ionicLoading.hide();
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

		var saveRelocate_SplitPallet_NewByPakorn = function (objsession, OldTag_No, NewPallet_No, OldPallet_No, dblQtyMove, dblQtyAfterMove, pstrNewPalletStatus_Index) {
			return new Promise(function (resolve, reject) {

				App.API('saveRelocate_SplitPallet_NewByPakorn', {
					objsession: objsession,
					OldTag_No: OldTag_No,
					NewPallet_No: NewPallet_No,
					OldPallet_No: OldPallet_No,
					dblQtyMove: dblQtyMove,
					dblQtyAfterMove: dblQtyAfterMove,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('saveRelocate_SplitPallet_NewByPakorn', res));
				});

			})
		}

		/*--------------------------------------
		Event Function clear
		------------------------------------- */
		$scope.clear = function () {

			clearData();

		}

		/*--------------------------------------
		Event Function cal
		------------------------------------- */
		$scope.cal = function (keyEnter, Qty) {

			var Bal = parseFloat(Qty_Bal) - parseFloat(Qty);

			$scope.data.SumQtyAfterMove = Bal;

			if (keyEnter === 13) {
				setFocus('PalletNo2');
			}

		}



	})

	.controller('Pallet_CombinePalletCtrl', function ($scope, $state, $ionicLoading, $cordovaBarcodeScanner, AppService, LoginService, App, $ionicLoading) {

		/*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.getTagList = {};
		$scope.getTagList2 = {};

		var Qty_Bal = 0;
		var ItemStatus_Index_Bal = '';

		var keyCnt = 0;

		var clearData = function () {
			$scope.data = {};
			$scope.getTagList = {};
			$scope.getTagList2 = {};
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

				var res_getPallet_No = getPallet_No(objsession, dataSearch);

				var res_getBalancePallet_No = getBalancePallet_No(objsession, dataSearch);

				Promise.all([res_getPallet_No, res_getBalancePallet_No]).then(function (res) {

					var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

					var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

					if (id == 'PalletNo') {

						if (Object.keys(resDataSet).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ที่ระบุ!', id);
							return;
						}

						if (Object.keys(resDataSet2).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'Pallet ที่ระบุไม่มีสินค้าแล้ว!', id);
							return;
						}

						if (resDataSet[0].PalletStatus_Index != '0010000000004') {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'สถานะ Pallet ไม่เป็น RD', id);
							return;
						}

						var res_searchPallet_Detail = searchPallet_Detail(dataSearch, id);

						res_searchPallet_Detail.then(function (res) {

							if (!res_searchPallet_Detail) {
								$scope['data'][id] = null;
								AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ', id);
								return;
							}

							$ionicLoading.hide();

						}).catch(function (error) {
							console.log("Error occurred");
							AppService.err('Error', 'Error occurred', '');
							return;
						});

					}
					else {

						if (Object.keys(resDataSet).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'ไม่พบ Pallet ปลายทางที่ระบุ!', id);
							return;
						}

						if (Object.keys(resDataSet2).length == 0) {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'Pallet ปลายทางที่ระบุไม่มีสินค้าแล้ว!', id);
							return;
						}

						if (resDataSet[0].PalletStatus_Index != '0010000000004') {
							$scope['data'][id] = null;
							AppService.err('แจ้งเตือน', 'สถานะ Pallet ไม่เป็น RD', id);
							return;
						}

						var res_searchPallet_Detail = searchPallet_Detail(dataSearch);

						res_searchPallet_Detail.then(function (res) {

							if (!res_searchPallet_Detail) {
								$scope['data'][id] = null;
								AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ', id);
								return;
							}

							$ionicLoading.hide();

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

		function searchPallet_Detail(dataSearch, id) {
			try {

				var objsession = angular.copy(LoginService.getLoginData());

				var res_getPalletTagBalance = getPalletTagBalance(objsession, dataSearch);

				return res_getPalletTagBalance.then(function (res) {

					var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

					if (Object.keys(resDataSet).length > 0) {

						if (id == 'PalletNo') {

							$scope.getTagList = resDataSet;

							$scope.changeTag(resDataSet[0].Tag_No_T);
						}
						else {

							$scope.getTagList2 = resDataSet;

							$scope.data.Tag2 = resDataSet[0].Tag_No_T;
						}

						return true;

					}
					else {

						return false;

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

		};

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

		var getBalancePallet_No = function (objsession, pPallet_No) {
			return new Promise(function (resolve, reject) {

				App.API('getBalancePallet_No', {
					objsession: objsession,
					pPallet_No: pPallet_No
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('getBalancePallet_No', res));
				});

			})
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

		/*--------------------------------------
		Event Function changeTag
		------------------------------------- */
		$scope.changeTag = function (Tag_No) {

			$scope.data.Tag = Tag_No;

			changeTagDetail(Tag_No);

		}

		var changeTagDetail = function (Tag_No) {

			if (!Tag_No) {
				return
			}

			var datatables_Tag = {};
			var i = 0;

			for (var x in $scope.getTagList) {

				if ($scope.getTagList[x].TAG_No == Tag_No) {
					datatables_Tag[x] = $scope.getTagList[x];

					i++;

				}

			}

			if (Object.keys(datatables_Tag).length > 0) {
				$scope.data.SKU = datatables_Tag[0].Sku_Id;
				$scope.data.PalletStatusFrom = datatables_Tag[0].Pallet_Status;
				$scope.data.Lot = datatables_Tag[0].PLot;
				$scope.data.TotalQty = datatables_Tag[0].Qty_Bal;
				$scope.data.PackageQty = parseFloat(datatables_Tag[0].Qty_per_TAG) / parseFloat(datatables_Tag[0].Flo1);
				$scope.data.MoveQty = datatables_Tag[0].Qty_Bal;
				$scope.data.SumQtyAfterMove = 0;

				Qty_Bal = datatables_Tag[0].Qty_Bal;
				ItemStatus_Index_Bal = datatables_Tag[0].ItemStatus_Index_Bal;

			}

			setFocus('PalletNo2');

		}

		/*--------------------------------------
		Event Function save
		------------------------------------- */
		$scope.save = function () {

			saveSplit();

		}

		function saveSplit() {
			try {

				$ionicLoading.show();

				AppService.blur();

				var objsession = angular.copy(LoginService.getLoginData());

				if (!$scope.data.PalletNo) {
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No!', 'PalletNo');
					return;
				}

				if (!$scope.data.PalletNo2) {
					$scope.data.PalletNo2 = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน Pallet No ปลายทาง!', 'PalletNo2');
					return;
				}

				if (!$scope.data.MoveQty || $scope.data.MoveQty == 0 || $scope.data.MoveQty < 0) {
					$scope.data.MoveQty = null;
					AppService.err('แจ้งเตือน', 'กรุณาป้อน จน. ย้าย! มากกว่า 0', 'MoveQty');
					return;
				}

				if ($scope.data.Tag == $scope.data.Tag2) {
					$scope.data.PalletNo2 = null;
					$scope.data.Tag2 = null;
					$scope.getTagList2 = {};
					AppService.err('แจ้งเตือน', 'Tag Pallet ต้นทางซ้ำกับปลายทาง !', 'PalletNo2');
					return;
				}

				var res_saveRelocate_CombinePallet_NewByPakorn = saveRelocate_CombinePallet_NewByPakorn(objsession, $scope.data.Tag, $scope.data.Tag2, $scope.data.PalletNo2, $scope.data.PalletNo, $scope.data.MoveQty, $scope.data.SumQtyAfterMove, ItemStatus_Index_Bal);

				res_saveRelocate_CombinePallet_NewByPakorn.then(function (res) {

					if (res == 'True') {
						clearData();
						AppService.succ('ทำการรวมพาเลทสินค้าเรียบร้อย', 'PalletNo');
						$ionicLoading.hide();
					}
					else {
						$scope.data.PalletNo2 = null;
						$scope.data.Tag2 = null;
						$scope.getTagList2 = {};
						AppService.err('แจ้งเตือน', 'Grade หรือ Lot ไม่ตรงกัน', 'PalletNo2');
						return;
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

		var saveRelocate_CombinePallet_NewByPakorn = function (objsession, OldTag_No, OldTag_No2, NewPallet_No, OldPallet_No, dblQtyMove, dblQtyAfterMove, pstrNewPalletStatus_Index) {
			return new Promise(function (resolve, reject) {

				App.API('saveRelocate_CombinePallet_NewByPakorn', {
					objsession: objsession,
					OldTag_No: OldTag_No,
					OldTag_No2: OldTag_No2,
					NewPallet_No: NewPallet_No,
					OldPallet_No: OldPallet_No,
					dblQtyMove: dblQtyMove,
					dblQtyAfterMove: dblQtyAfterMove,
					pstrNewPalletStatus_Index: pstrNewPalletStatus_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('saveRelocate_CombinePallet_NewByPakorn', res));
				});

			})
		}

		/*--------------------------------------
		Event Function clear
		------------------------------------- */
		$scope.clear = function () {

			clearData();

		}

		/*--------------------------------------
		Event Function cal
		------------------------------------- */
		$scope.cal = function (keyEnter, Qty) {

			var Bal = parseFloat(Qty_Bal) - parseFloat(Qty);

			$scope.data.SumQtyAfterMove = Bal;

			if (keyEnter === 13) {
				setFocus('PalletNo2');
			}

		}



	});
