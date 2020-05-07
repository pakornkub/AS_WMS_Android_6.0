/**
 * Receive.Controllers Module
 *
 * Description
 */
angular.module('RS.Controllers', ['ionic'])


    .controller('RS_TransferOwnerMainCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate) {

        /*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQTYWithdraw = 0;

		$scope.selectedTransferOwner_Index = null;
        $scope.selectedTransferOwner_No = null;
        $scope.selectedCus_Id = null;
        $scope.selectedCus_Id_New = null;
        
        let TypeTOW     = $stateParams.TypeTOW;
        let isAssing    = $stateParams.isAssing;
        let isDammage   = $stateParams.isDammage;

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
			setFocus('Withdraw_No');
		});

		/*--------------------------------------
		Event Function setSelected
		------------------------------------- */
		$scope.setSelected = (TransferOwner_Index, TransferOwner_No, Cus_Id, Cus_Id_New) => {
			$scope.selectedTransferOwner_Index  = TransferOwner_Index;
            $scope.selectedTransferOwner_No     = TransferOwner_No;
            $scope.selectedCus_Id               = Cus_Id;
			$scope.selectedCus_Id_New           = Cus_Id_New;
		};

		/*--------------------------------------
		Event Function selected
		------------------------------------- */
		$scope.selected = function (selectedTransferOwner_Index, selectedTransferOwner_No,selectedCus_Id,selectedCus_Id_New) {

			$ionicLoading.show();

			if (!selectedTransferOwner_Index) {
				AppService.err('แจ้งเตือน', 'ยังไม่ได้เลือกรายการ', '');
				return;
			}
			else {

                if(isAssing)
                {
                    $state.go('rs_AssingRS_Selected', { TransferOwner_Index: selectedTransferOwner_Index, TransferOwner_No: selectedTransferOwner_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                    
                    GetDataTOW();

                    return;
                }

                if(TypeTOW == 'Pick')
                {
                    $state.go('rs_TransferOwnerOut_Selected', { TransferOwner_Index: selectedTransferOwner_Index, TransferOwner_No: selectedTransferOwner_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                }
                else
                {
                    if(isDammage)
                    {
                        $state.go('rs_TransferOwnerIn_DM_Selected', { TransferOwner_Index: selectedTransferOwner_Index, TransferOwner_No: selectedTransferOwner_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                    }
                    else
                    {
                        $state.go('rs_TransferOwnerIn_Selected', { TransferOwner_Index: selectedTransferOwner_Index, TransferOwner_No: selectedTransferOwner_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                    }
                    
                }

                GetDataTOW();

			}

			$ionicLoading.hide();
		};

		/*--------------------------------------
		Call API GetDataTOW
		------------------------------------- */
		let GetDataTOW = () => {

            $ionicLoading.show();

            let strWhere = "";
            
            if(TypeTOW == 'Pick')
            {
                strWhere += " AND Status in (1,5) ";
            }
            else
            {
                strWhere += " AND Status = 3 ";
            }		

			if ($scope.data.Withdraw_No) {
				strWhere += "  AND TransferOwner_No = '" + $scope.data.Withdraw_No + "' ";
            }
            
            strWhere += " AND New_Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1) ";

            //โอนสินค้า
			if (isDammage) {
				strWhere += " AND DocumentType_Index = '0010000000066' ";
			}

            //เพิ่มเลขพาเลท
			if (isAssing) {
				strWhere += " AND DocumentType_Index = '0010000000068' ";
			}

			App.API('GetTransferOwner_View', {
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
				AppService.err('GetTransferOwner_View', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetDataTOW();

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

			GetDataTOW();

		};


    })

    .controller('RS_ReceiveDMCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate) {

        /*--------------------------------------
		Data Function
		--------------------------------------*/
		$scope.data = {};
		$scope.datatablesList = {};
		$scope.datatablesListLength = 0;
		$scope.lbQTYWithdraw = 0;

		$scope.selectedOrder_Index = null;
        $scope.selectedOrder_No = null;
        $scope.selectedCus_Id = null;
        $scope.selectedCus_Id_New = null;
        
        let TypeTOW     = $stateParams.TypeTOW;
        let isAssing    = $stateParams.isAssing;
        let isDammage   = $stateParams.isDammage;

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
			setFocus('Withdraw_No');
		});

		/*--------------------------------------
		Event Function setSelected
		------------------------------------- */
		$scope.setSelected = (Order_Index, Order_No, Cus_Id, Cus_Id_New) => {
			$scope.selectedOrder_Index          = Order_Index;
            $scope.selectedOrder_No             = Order_No;
            $scope.selectedCus_Id               = Cus_Id;
			$scope.selectedCus_Id_New           = Cus_Id_New;
		};

		/*--------------------------------------
		Event Function selected
		------------------------------------- */
		$scope.selected = function (selectedOrder_Index, selectedOrder_No,selectedCus_Id,selectedCus_Id_New) {

			$ionicLoading.show();

			if (!selectedOrder_Index) {
				AppService.err('แจ้งเตือน', 'ยังไม่ได้เลือกรายการ', '');
				return;
			}
			else {

                if(isAssing)
                {
                    $state.go('rs_AssingRS_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                    
                    GetDataTOW();

                    return;
                }

                if(TypeTOW == 'Pick')
                {
                    $state.go('rs_TransferOwnerOut_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                }
                else
                {
                    if(isDammage)
                    {
                        $state.go('rs_TransferOwnerIn_DM_New_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No, Cus_Id: '', Cus_Id_New: '' });
                    }
                    else
                    {
                        $state.go('rs_TransferOwnerIn_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No, Cus_Id: selectedCus_Id, Cus_Id_New: selectedCus_Id_New });
                    }
                    
                }

                GetDataTOW();

			}

			$ionicLoading.hide();
		};

		/*--------------------------------------
		Call API GetDataTOW
		------------------------------------- */
		let GetDataTOW = () => {

            $ionicLoading.show();

            let strWhere = "";
            
            /*if(TypeTOW == 'Pick')
            {
                strWhere += " AND Status in (1,5) ";
            }
            else
            {
                strWhere += " AND Status = 3 ";
            }*/

			if ($scope.data.Withdraw_No) {
				strWhere += "  AND tb_Order.Order_No = '" + $scope.data.Withdraw_No + "' ";
            }
            
            strWhere += " AND tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1) ";

            //โอนสินค้า
			if (isDammage) {
				strWhere += " AND ms_DocumentType.DocumentType_Index = '0010000000075' ";
			}

            //เพิ่มเลขพาเลท
			if (isAssing) {
				strWhere += " AND ms_DocumentType.DocumentType_Index = '0010000000068' ";
			}

			App.API('GetOrderTopic_Defalut', {
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
				AppService.err('GetOrderTopic_Defalut', res);
			}).finally(function (res) {
				$ionicLoading.hide();
			});
		};

		GetDataTOW();

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

			GetDataTOW();

		};

	})
	
	.controller('RS_AssingRS_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate, $ionicHistory) {

        /*--------------------------------------
        Data Function
        --------------------------------------*/
        $scope.data = {};
        $scope.TOWItemList = {};
		$scope.TOWItemListLength = 0;
		$scope.getSKUList = {};
		$scope.getLotList = {};
		$scope.getTotalQtyList = {};
		$scope.getLocationList = {};

        $scope.data.Count = 0;
		$scope.data.TotalCount = 0;

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.TOWItemList = {};
			$scope.TOWItemListLength = 0;
			$scope.getSKUList = {};
			$scope.getLotList = {};
			$scope.getTotalQtyList = {};
			$scope.getLocationList = {};

            $scope.data.Count = 0;
            $scope.data.TotalCount = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (object, key, value, isOptions) => {
            return AppService.findObjValue(object, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

		};

		$scope.data.TransferOwner_Index     = $stateParams.TransferOwner_Index;
		$scope.data.Document_No     		= $stateParams.TransferOwner_No;
        $scope.data.Cus    					= $stateParams.Cus_Id;
        $scope.data.Cus_New   				= $stateParams.Cus_Id_New;

        /*--------------------------------------
        Load Function LoadTOWItemList
        ------------------------------------- */
        const LoadTOWItemList = async() => {
			
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetTransferOwner_Item = await GetTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, '');

				let resDataSet = (!res_GetTransferOwner_Item['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item['diffgr:diffgram'].NewDataSet.Table1;
				
				if(Object.keys(resDataSet).length > 0)
				{
					$scope.TOWItemList = resDataSet;
					$scope.TOWItemListLength = Object.keys(resDataSet).length
				}

				let PickCount = 0;

				for (let x in $scope.TOWItemList) {
					if($scope.TOWItemList[x]['Status'] != 1)
					{
						PickCount++;
					}
				}

				if($scope.TOWItemListLength == PickCount)
				{
					//update ใบ Assign Pallet
					for (let x in $scope.TOWItemList) {
						
						await updatePalletToTag(objsession, $scope.TOWItemList[x]['Tag_No'], $scope.TOWItemList[x]['Pallet_No_New'], $scope.TOWItemList[x]['new_Plot'], '0010000000004');

					}

					await Update_TransferOwner(objsession, $scope.data.TransferOwner_Index, 2);

					AppService.succ('รายการโอนได้ทำการหยิบครบแล้ว', '');

					$ionicHistory.goBack();

				}

				$scope.data.Count = PickCount;
				$scope.data.TotalCount = $scope.TOWItemListLength;

				//addcboSKU
				let arrSkuItem = {};
				let arrFindSkuItem = {};

				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Status'] == 1)
					{
						arrFindSkuItem = findByValue(arrSkuItem,'new_SKU_Index',$scope.TOWItemList[x]['new_SKU_Index'],true);

						if(Object.keys(arrFindSkuItem).length <= 0)
						{
							arrSkuItem[x]['new_SKU_ID'] 	= $scope.TOWItemList[x]['new_SKU_ID'];
							arrSkuItem[x]['new_SKU_Index'] 	= $scope.TOWItemList[x]['new_SKU_Index'];
						}

					}	

				}

				$scope.getSKUList = arrSkuItem;

				$ionicLoading.hide();

				$scope.changeSku(arrSkuItem[0].new_SKU_Index);
			
			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
			
		};
		
		let GetTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrWhere) => {
            return new Promise((resolve, reject) => {

                App.API('GetTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrWhere: pstrWhere
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetTransferOwner_Item', res));
                });

            })
		}
		
		let updatePalletToTag = (objsession, pstrTag_No, pstrPallet_No, PLot, pstrPalletstatus_index) => {
            return new Promise((resolve, reject) => {

                App.API('updatePalletToTag', {
                    objsession: objsession,
					pstrTag_No: pstrTag_No,
					pstrPallet_No: pstrPallet_No,
					PLot: PLot,
					pstrPalletstatus_index: pstrPalletstatus_index
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('updatePalletToTag', res));
                });

            })
		}
		
		let Update_TransferOwner = (objsession, TransferOwner_Index, Status) => {
            return new Promise((resolve, reject) => {

                App.API('Update_TransferOwner', {
                    objsession: objsession,
					TransferOwner_Index: TransferOwner_Index,
					Status: Status
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('Update_TransferOwner', res));
                });

            })
        }

		LoadTOWItemList();

		/*--------------------------------------
         Event Function changeSKU 
		------------------------------------- */
		$scope.changeSku = (new_SKU_Index) => {

			//addcboLot
			let arrLotItem = {};
			let arrFindLotItem = {};

			for (let x in $scope.TOWItemList) {

				if($scope.TOWItemList[x]['Status'] == 1 && $scope.TOWItemList[x]['new_SKU_Index'] == new_SKU_Index)
				{
					arrFindLotItem = findByValue(arrLotItem,'new_Plot',$scope.TOWItemList[x]['new_Plot'],true);

					if(Object.keys(arrFindLotItem).length <= 0)
					{
						arrLotItem[x]['new_Plot'] 	= $scope.TOWItemList[x]['new_Plot'];
					}

				}	

			}

			$scope.getLotList = arrLotItem;

			$scope.changeLot(arrLotItem[0].new_Plot);

		}

		/*--------------------------------------
         Event Function changeLot 
		------------------------------------- */
		$scope.changeLot = (new_Plot) => {

			//addcboTotalQty
			let arrTotalQtyItem = {};
			let arrFindTotalQtyItem = {};

			for (let x in $scope.TOWItemList) {

				if($scope.TOWItemList[x]['Status'] == 1 && $scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['Plot'] == new_Plot)
				{
					arrTotalQtyItem[x]['Qty'] 	= $scope.TOWItemList[x]['Qty'];
				}	

			}

			$scope.getTotalQtyList = arrTotalQtyItem;
			$scope.changeTotalQty(arrTotalQtyItem[0].Qty);

		}

		/*--------------------------------------
         Event Function changeTotalQty 
		------------------------------------- */
		$scope.changeTotalQty = (Qty) => {

			//addcboLocation
			let arrLocationItem = {};
			let arrFindLocationItem = {};

			for (let x in $scope.TOWItemList) {

				if($scope.TOWItemList[x]['Status'] == 1 && $scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Qty'] == Qty)
				{
					arrLocationItem[x]['To_Location_Index'] 	= $scope.TOWItemList[x]['To_Location_Index'];
					arrLocationItem[x]['To_Location'] 			= $scope.TOWItemList[x]['To_Location'];

				}	

			}

			$scope.getLocationList = arrLocationItem;
			$scope.changeLocation(arrLocationItem[0].To_Location_Index);

		}

		/*--------------------------------------
         Event Function changeLocation 
		------------------------------------- */
		$scope.changeLocation = (To_Location_Index) => {

			setFocus('PalletNo');

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

            searchPallet(dataSearch);

        };

        const searchPallet = async(dataSearch) => {
            try {

                $ionicLoading.show();

                AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());
				
				if (!$scope.data.TotalQty || $scope.data.TotalQty == 0) {
                    AppService.err('แจ้งเตือน', 'กรุณาระบุจำนวน!', 'TotalQty');
                    return;
				}
				
				//check Location
				const res_Location_By_Alias = await Location_By_Alias(objsession, $scope.data.Location);

				let resDataSet = (!res_Location_By_Alias['diffgr:diffgram']) ? {} : res_Location_By_Alias['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้!', 'Location');
                    return;
				}

				//check PalletNo
				const res_getPalletInBGPallet = await getPalletInBGPallet(objsession, " and PALLET_No = '" + $scope.data.PalletNo + "' ");

				let resDataSet2 = (!res_getPalletInBGPallet['diffgr:diffgram']) ? {} : res_getPalletInBGPallet['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet2).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No. นี้ในระบบ!', 'PalletNo');
                    return;
				}

				if(resDataSet2[0].PalletStatus_Index != '0010000000000')
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'Pallet นี้ไม่อยู่ในสถานะ EM!', 'PalletNo');
                    return;
				}

				//check PalletNo duplicate
				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Pallet_No_New'] == $scope.data.PalletNo)
					{
						$scope.date.PalletNo = null;
						AppService.err('แจ้งเตือน', 'Pallet No. ซ้ำ!', 'PalletNo');
						return;
					}	

				}

				//1
				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['new_Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Qty'] == $scope.data.TotalQty && $scope.TOWItemList[x]['Status'] == 1)
					{
						await PickTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, $scope.TOWItemList[x]['TransferOwnerLocation_Index'], $scope.data.Location, $scope.data.PalletNo);
						LoadTOWItemList();
						$scope.data.TotalQty = "";
						$scope.data.Location = "";
						$scope.data.PalletNo = null;

						$ionicLoading.hide();

						return;
					}	

				}

				//2
				let sumQty = 0;
				let currentQty = $scope.data.TotalQty;
				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['new_Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Status'] == 1)
					{
						sumQty += $scope.TOWItemList[x]['Qty'];
					}	

				}

				if(currentQty > sumQty)
				{
					$scope.date.TotalQty = "";
					AppService.err('แจ้งเตือน', 'จำนวนที่ระบุเกินจากของที่สั่งเพิ่มเลขพาเลท!', 'TotalQty');
					return;
				}

				//3
				while (currentQty > 0) {

					//Qty == currentQty
					for (let x in $scope.TOWItemList) {

						if($scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['new_Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Qty'] == currentQty && $scope.TOWItemList[x]['Status'] == 1)
						{
							await PickTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, $scope.TOWItemList[x]['TransferOwnerLocation_Index'], $scope.data.Location, $scope.data.PalletNo);
							currentQty -= currentQty;
							break;
						}	
	
					}

					//Qty > currentQty 
					for (let x in $scope.TOWItemList) {

						if($scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['new_Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Qty'] > currentQty && $scope.TOWItemList[x]['Status'] == 1)
						{
							await Split_PickTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, $scope.TOWItemList[x]['TransferOwnerLocation_Index'], $scope.data.Location, $scope.data.PalletNo, currentQty);
							currentQty -= currentQty;
							break;
						}	
	
					}

					//Qty < currentQty 
					for (let x in $scope.TOWItemList) {

						if($scope.TOWItemList[x]['new_SKU_Index'] == $scope.data.SKU && $scope.TOWItemList[x]['new_Plot'] == $scope.data.Lot && $scope.TOWItemList[x]['Qty'] < currentQty && $scope.TOWItemList[x]['Status'] == 1)
						{
							await PickTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, $scope.TOWItemList[x]['TransferOwnerLocation_Index'], $scope.data.Location, $scope.data.PalletNo);
							currentQty -= $scope.TOWItemList[x]['Qty'];
							break;
						}	
	
					}

				}

				LoadTOWItemList();
				$scope.data.TotalQty = "";
				$scope.data.Location = "";
				$scope.data.PalletNo = null;

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let getPalletInBGPallet = (objsession, pstrWhere) => {
            return new Promise((resolve, reject) => {

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

        let PickTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrTransferOwnerLocation_Index, pstrLocation, Pallet_No_New) => {
            return new Promise((resolve, reject) => {

                App.API('PickTransferOwner_Item', {
                    objsession: objsession,
                    pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					pstrLocation: pstrLocation,
					Pallet_No_New: Pallet_No_New
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('PickTransferOwner_Item', res));
                });

            })
        }

        let Split_PickTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrTransferOwnerLocation_Index, pstrLocation, Pallet_No_New, QTY) => {
            return new Promise((resolve, reject) => {

                App.API('Split_PickTransferOwner_Item', {
					objsession: objsession,
                    pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					pstrLocation: pstrLocation,
					Pallet_No_New: Pallet_No_New,
					QTY: QTY
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('Split_PickTransferOwner_Item', res));
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
		
		/*--------------------------------------
        Event Function save
        ------------------------------------- */
        $scope.save = () => {

			if (!$scope.data.PalletNo) {
                AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
                return;
			}
			
            searchPallet($scope.data.PalletNo);

        };
		

	})

	.controller('RS_TransferOwnerOut_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate, $ionicHistory) {

        /*--------------------------------------
        Data Function
        --------------------------------------*/
        $scope.data = {};
        $scope.TOWItemList = {};
		$scope.TOWItemListLength = 0;

        $scope.data.Count = 0;
		$scope.data.TotalCount = 0;

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.TOWItemList = {};
			$scope.TOWItemListLength = 0;

            $scope.data.Count = 0;
            $scope.data.TotalCount = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (object, key, value, isOptions) => {
            return AppService.findObjValue(object, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

		};

		$scope.data.TransferOwner_Index     = $stateParams.TransferOwner_Index;
		$scope.data.Document_No     		= $stateParams.TransferOwner_No;
        $scope.data.Cus    					= $stateParams.Cus_Id;
		$scope.data.Cus_New   				= $stateParams.Cus_Id_New;
		
		/*--------------------------------------
        Load Function LoadTOWItemList
        ------------------------------------- */
        const LoadTOWItemList = async() => {
			
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetTransferOwner_Item = await GetTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, '');

				let resDataSet = (!res_GetTransferOwner_Item['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item['diffgr:diffgram'].NewDataSet.Table1;
				
				if(Object.keys(resDataSet).length > 0)
				{
					$scope.TOWItemList = resDataSet;
					$scope.TOWItemListLength = Object.keys(resDataSet).length
				}

				let PickCount = 0;

				for (let x in $scope.TOWItemList) {
					if($scope.TOWItemList[x]['Status'] != 1)
					{
						PickCount++;
					}
				}

				if($scope.TOWItemListLength == PickCount)
				{
			
					AppService.succ('รายการโอนได้ทำการหยิบครบแล้ว', '');

					$ionicHistory.goBack();

				}

				$scope.data.Count = PickCount;
				$scope.data.TotalCount = $scope.TOWItemListLength;

				setFocus('PalletNo');
			
			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
			
		};
		
		let GetTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrWhere) => {
            return new Promise((resolve, reject) => {

                App.API('GetTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrWhere: pstrWhere
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetTransferOwner_Item', res));
                });

            })
		}

		LoadTOWItemList();

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

			let str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location';

			if (!dataSearch) {
				AppService.err('แจ้งเตื่อน', str, id);
				return;
			}

            if (searchType == 'read pallet no' || searchType == 'read location no' ) {
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
			
			if(id == 'PalletNo')
			{
				searchPallet(dataSearch, id);
			}
			else
			{
				searchLocation(dataSearch, id);
			}

            

        };

        const searchPallet = async(dataSearch,id) => {
            try {

                $ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());
				
				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo)
					{
						datatables[i] = $scope.TOWItemList[x];
						i++;
					}
					
				}

				if(Object.keys(datatables).length > 0)
				{
					let isPick = false;
					if(datatables[0]['Status'] == 1)
					{
						if(await CHEKPICK_TRANSFEROWNERLOCATION_STATUS_EQUAL(objsession, datatables[0]['TransferOwnerLocation_Index'], 1))
						{
							isPick = true;
						}
					}
					if(isPick)
					{
						$scope.data.SKU 		= datatables[0]['Sku_Id'];
						$scope.data.Lot 		= datatables[0]['Plot'];
						$scope.data.TotalQty 	= datatables[0]['QTY'];

						if(datatables[0]['QTY_Per_Pack'] != 0)
						{
							$scope.data.PackageQty = datatables[0]['QTY']/datatables[0]['QTY_Per_Pack'];
						}
						else
						{
							$scope.data.PackageQty = 'No QTY Per Pack';
						}

						setFocus('Location');
					}
					else
					{
						$scope.data.PalletNo = null;
						$scope.data.SKU = null;
						$scope.data.Lot = null;
						$scope.data.TotalQty = null;
						$scope.data.PackageQty = null;
						$scope.data.Location = null;

						AppService.err('แจ้งเตือน', 'พาเลทนี้ได้ทำการหยิบแล้ว!', 'PalletNo');
                    	return;	
					}
				}
				else
				{
					const res_getPalletBalance_Detail = await getPalletBalance_Detail(objsession, $scope.data.PalletNo);

					let resDataSet = (!res_getPalletBalance_Detail['diffgr:diffgram']) ? {} : res_getPalletBalance_Detail['diffgr:diffgram'].NewDataSet.Table1;

					if(Object.keys(resDataSet).length != 0)
					{

						$scope.data.SKU 		= resDataSet[0].Sku_Id;
						$scope.data.Lot 		= resDataSet[0].Plot;
						$scope.data.TotalQty 	= resDataSet[0].QtyIn_Loc;
						$scope.data.PackageQty 	= resDataSet[0].QtyIn_Loc/25;
						
						setFocus('Location');
					}
					else
					{
						$scope.data.PalletNo = null;
						$scope.data.SKU = null;
						$scope.data.Lot = null;
						$scope.data.TotalQty = null;
						$scope.data.PackageQty = null;
						$scope.data.Location = null;

						AppService.err('แจ้งเตือน', 'พาเลทนี้ไม่สามารถโอนย้ายได้!', 'PalletNo');
                    	return;
					}
				}

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}
		
		const searchLocation = async(dataSearch,id) => {
            try {

                $ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());
				
				//check PalletNo
				if (!$scope.data.PalletNo) {
					AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
					return;
				}

				//check Location
				const res_Location_By_Alias = await Location_By_Alias(objsession, $scope.data.Location);

				let resDataSet = (!res_Location_By_Alias['diffgr:diffgram']) ? {} : res_Location_By_Alias['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.Location = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้!', 'Location');
                    return;
				}


				//1
				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo && $scope.TOWItemList[x]['Status'] == 1)
					{
						datatables[i] = $scope.TOWItemList[x];
						i++;
					}
					
				}

				let isPick = false;
				if(Object.keys(datatables).length > 0)
				{
					if(await CHEKPICK_TRANSFEROWNERLOCATION_STATUS_EQUAL(objsession, datatables[0]['TransferOwnerLocation_Index'], 1))
					{
						isPick = true;
					}
				}
				else
				{
					if(await SwapPallet())
					{
						isPick = true;
					}
				}

				if(isPick)
				{
					let datatables2 = {};
					let i2 = 0;

					for (let x in $scope.TOWItemList) {

						if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo && $scope.TOWItemList[x]['Status'] == 1)
						{
							datatables2[i2] = $scope.TOWItemList[x];
							i2++;
						}
						
					}

					for(let x in datatables2)
					{
						await PickTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, datatables2[x].TransferOwnerLocation_Index, $scope.data.Location, "")
					} 

					$scope.data.PalletNo = null;
					$scope.data.SKU = null;
					$scope.data.Lot = null;
					$scope.data.TotalQty = null;
					$scope.data.PackageQty = null;
					$scope.data.Location = null;

					LoadTOWItemList();

					setFocus('PalletNo');

				}
				else
				{
					AppService.err('แจ้งเตือน', 'พาเลทนี้ได้ทำการหยิบแล้วหรือไม่มีรายการหยิบ!', 'PalletNo');
                    return;
				}

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}
		
		const SwapPallet = async() => {
			try {

				let objsession = angular.copy(LoginService.getLoginData());

				const res_chk_Pallet_IN_TransferOwner_IS_Picked = await chk_Pallet_IN_TransferOwner_IS_Picked(objsession, $scope.data.Pallet_No);//return boolean

				if (res_chk_Pallet_IN_TransferOwner_IS_Picked) {
					AppService.err('แจ้งเตือน', 'พาเลทนี้ถูกหยิบในเอกสารอื่นแล้ว!', 'PalletNo');
					return false;
				}

				const res_getVIEW_TAG_TPIPL = await getVIEW_TAG_TPIPL(objsession, $scope.data.Pallet_No);

				let resDataSet2 = (!res_getVIEW_TAG_TPIPL['diffgr:diffgram']) ? {} : res_getVIEW_TAG_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

				if (Object.keys(resDataSet2).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่พบพาเลทนี้ในระบบ!', 'PalletNo');
					return false;
				}

				if (resDataSet2[0].Customer_Index != TOWItemList[0].Customer_Index) {
					AppService.err('ลูกค้าไม่ตรง !', 'พาเลท ' + $scope.data.PalletNo + 'ไม่ใช่ลูกค้าคนนี้', 'PalletNo');
					return false;
				}

				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {

					if ($scope.TOWItemList[x]['Plot'] == resDataSet2[0].plot && $scope.TOWItemList[x]['Sku_Id'] == resDataSet2[0].Sku_Id && $scope.TOWItemList[x]['Status'] == 1 && $scope.TOWItemList[x]['From_Location'] == resDataSet2[0].Location_Alias) {

						datatables[i] = $scope.TOWItemList[x];

						i++;
					}
				}

				if (Object.keys(datatables).length <= 0) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถย้ายพาเลทนี้แทนได้เนื่องจาก Grade ,Lot,ตำแหน่ง  ไม่ตรงกับใบย้าย!', 'PalletNo');
					return false;
				}

				const res_SwapPalletIn_TransferOwner = await SwapPalletIn_TransferOwner(objsession, datatables[0].TransferOwnerLocation_Index, $scope.data.Pallet_No, $scope.data.TransferOwner_Index);//return boolean

				if (!res_SwapPalletIn_TransferOwner) {
					AppService.err('แจ้งเตือน', 'ไม่สามารถ Swap ได้ เนื่องจาก <br/> - จำนวนหรือ Status Item ไม่ตรงกัน <br/> - พาเลทที่จะ Swap มีอยู่ใน DO หลายใบ', 'PalletNo');
					return false;
				}

				AppService.succ('เปลี่ยน Pallet ' + $scope.data.Pallet_No + '  เรียบร้อย!', 'PalletNo');

				LoadTOWItemList();

				return true;

			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
		}

        let CHEKPICK_TRANSFEROWNERLOCATION_STATUS_EQUAL = (objsession, pstrTransferOwnerLocation_Index, inStatus) => {
            return new Promise((resolve, reject) => {

                App.API('CHEKPICK_TRANSFEROWNERLOCATION_STATUS_EQUAL', {
                    objsession: objsession,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					inStatus: inStatus
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('CHEKPICK_TRANSFEROWNERLOCATION_STATUS_EQUAL', res));
                });

            })
        }

        let getPalletBalance_Detail = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

                App.API('getPalletBalance_Detail', {
                    objsession: objsession,
                    pPallet_No: pPallet_No
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('getPalletBalance_Detail', res));
                });

            })
		}
		
		let PickTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrTransferOwnerLocation_Index, pstrLocation, Pallet_No_New) => {
            return new Promise((resolve, reject) => {

                App.API('PickTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					pstrLocation: pstrLocation,
					Pallet_No_New: Pallet_No_New
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('PickTransferOwner_Item', res));
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

		let chk_Pallet_IN_TransferOwner_IS_Picked = (objsession, pstrPalletNo) => {
			return new Promise((resolve, reject) => {

				App.API('chk_Pallet_IN_TransferOwner_IS_Picked', {
					objsession: objsession,
					pstrPalletNo: pstrPalletNo
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('chk_Pallet_IN_TransferOwner_IS_Picked', res));
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

		let SwapPalletIn_TransferOwner = (objsession, pstrTransferOwnerLocation_Index, pstrPalletNo, pstrTransferOwner_Index) => {
			return new Promise((resolve, reject) => {

				App.API('SwapPalletIn_TransferOwner', {
					objsession: objsession,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					pstrPalletNo: pstrPalletNo,
					pstrTransferOwner_Index: pstrTransferOwner_Index
				}).then(function (res) {
					resolve(res);
				}).catch(function (res) {
					reject(AppService.err('SwapPalletIn_TransferOwner', res));
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
			
            searchLocation($scope.data.Location,'Location');

        };
		

	})

	.controller('RS_TransferOwnerIn_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate, $ionicHistory) {

        /*--------------------------------------
        Data Function
        --------------------------------------*/
        $scope.data = {};
        $scope.TOWItemList = {};
		$scope.TOWItemListLength = 0;

        $scope.data.Count = 0;
		$scope.data.TotalCount = 0;

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.TOWItemList = {};
			$scope.TOWItemListLength = 0;

            $scope.data.Count = 0;
            $scope.data.TotalCount = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (object, key, value, isOptions) => {
            return AppService.findObjValue(object, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

		};

		$scope.data.TransferOwner_Index     = $stateParams.TransferOwner_Index;
		$scope.data.Document_No     		= $stateParams.TransferOwner_No;
        $scope.data.Cus    					= $stateParams.Cus_Id;
		$scope.data.Cus_New   				= $stateParams.Cus_Id_New;
		
		/*--------------------------------------
        Load Function LoadTOWItemList
        ------------------------------------- */
        const LoadTOWItemList = async() => {
			
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetTransferOwner_Item = await GetTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, '');

				let resDataSet = (!res_GetTransferOwner_Item['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item['diffgr:diffgram'].NewDataSet.Table1;
				
				if(Object.keys(resDataSet).length > 0)
				{
					$scope.TOWItemList = resDataSet;
					$scope.TOWItemListLength = Object.keys(resDataSet).length
				}

				let PickCount = 0;

				for (let x in $scope.TOWItemList) {
					if($scope.TOWItemList[x]['Status'] == -10)
					{
						PickCount++;
					}
				}

				if($scope.TOWItemListLength == PickCount)
				{
			
					AppService.succ('รายการโอนได้ทำการหยิบครบแล้ว', '');

					$ionicHistory.goBack();

				}

				$scope.data.Count = PickCount;
				$scope.data.TotalCount = $scope.TOWItemListLength;

				setFocus('PalletNo');
			
			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
			
		};
		
		let GetTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrWhere) => {
            return new Promise((resolve, reject) => {

                App.API('GetTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrWhere: pstrWhere
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetTransferOwner_Item', res));
                });

            })
		}

		LoadTOWItemList();

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

			let str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Location';

			if (!dataSearch) {
				AppService.err('แจ้งเตื่อน', str, id);
				return;
			}

            if (searchType == 'read pallet no' || searchType == 'read location no' ) {
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
			
			if(id == 'PalletNo')
			{
				searchPallet(dataSearch, id);
			}
			else
			{
				searchLocation(dataSearch, id);
			}

            

        };

        const searchPallet = async(dataSearch,id) => {
            try {

                $ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());
				
				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo)
					{
						datatables[i] = $scope.TOWItemList[x];
						i++;
					}
					
				}

				if(Object.keys(datatables).length > 0)
				{
					if(datatables[0]['Status'] == -9)
					{
						
						$scope.data.SKU 		= datatables[0]['Sku_Id'];
						$scope.data.Lot 		= datatables[0]['Plot'];
						$scope.data.TotalQty 	= datatables[0]['QTY'];

						if(datatables[0]['QTY_Per_Pack'] != 0)
						{
							$scope.data.PackageQty = datatables[0]['QTY']/datatables[0]['QTY_Per_Pack'];
						}
						else
						{
							$scope.data.PackageQty = 'No QTY Per Pack';
						}

						setFocus('Location');
					}
					else
					{
						$scope.data.PalletNo = null;
						$scope.data.SKU = null;
						$scope.data.Lot = null;
						$scope.data.TotalQty = null;
						$scope.data.PackageQty = null;
						$scope.data.Location = null;

						AppService.err('แจ้งเตือน', 'พาเลทนี้ได้ทำการหยิบแล้ว!', 'PalletNo');
                    	return;	
					}
				}
				else
				{
					
					$scope.data.PalletNo = null;
					$scope.data.SKU = null;
					$scope.data.Lot = null;
					$scope.data.TotalQty = null;
					$scope.data.PackageQty = null;
					$scope.data.Location = null;

					AppService.err('แจ้งเตือน', 'ไม่พบพาเลทนี้ในการโอนย้าย!', 'PalletNo');
					return;
					
				}

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}
		
		const searchLocation = async(dataSearch,id) => {
            try {

                $ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());
				
				//check PalletNo
				if (!$scope.data.PalletNo) {
					AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
					return;
				}

				//check Location
				const res_Location_By_Alias = await Location_By_Alias(objsession, $scope.data.Location);

				let resDataSet = (!res_Location_By_Alias['diffgr:diffgram']) ? {} : res_Location_By_Alias['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.Location = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Location นี้!', 'Location');
                    return;
				}


				//1
				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {

					if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo && $scope.TOWItemList[x]['Status'] == -9)
					{
						datatables[i] = $scope.TOWItemList[x];
						i++;
					}
					
				}

				if(Object.keys(datatables).length > 0)
				{

					for(let x in datatables)
					{
						await PutTransferOwner_Item(objsession, $scope.data.TransferOwner_Index, datatables[x].TransferOwnerLocation_Index, $scope.data.Location)
					} 

					$scope.data.PalletNo = null;
					$scope.data.SKU = null;
					$scope.data.Lot = null;
					$scope.data.TotalQty = null;
					$scope.data.PackageQty = null;
					$scope.data.Location = null;

					LoadTOWItemList();

					setFocus('PalletNo');

				}
				else
				{
					AppService.err('แจ้งเตือน', 'พาเลทนี้ได้ทำการหยิบแล้วหรือไม่มีรายการหยิบ!', 'PalletNo');
                    return;
				}

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}
	
		let PutTransferOwner_Item = (objsession, pstrTransferOwner_Index, pstrTransferOwnerLocation_Index, pstrLocation) => {
            return new Promise((resolve, reject) => {

                App.API('PickTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrTransferOwnerLocation_Index: pstrTransferOwnerLocation_Index,
					pstrLocation: pstrLocation
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('PickTransferOwner_Item', res));
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
		
		/*--------------------------------------
        Event Function save
        ------------------------------------- */
        $scope.save = () => {

			if (!$scope.data.Location) {
                AppService.err('แจ้งเตื่อน', 'กรุณา Scan Location', 'Location');
                return;
			}
			
            searchLocation($scope.data.Location,'Location');

        };	

	})

	.controller('RS_TransferOwnerIn_DM_New_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $filter, $ionicScrollDelegate, $ionicHistory){
		
		/*--------------------------------------
        Data Function
        --------------------------------------*/
        $scope.data = {};
        $scope.TOWItemList = {};
		$scope.TOWItemListLength = 0;
		$scope.getGrade_WList = {};

        $scope.data.Count = 0;
		$scope.data.TotalCount = 0;

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.TOWItemList = {};
			$scope.TOWItemListLength = 0;
			$scope.getGrade_WList = {};

            $scope.data.Count = 0;
            $scope.data.TotalCount = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (object, key, value, isOptions) => {
            return AppService.findObjValue(object, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

		};

		$scope.data.TransferOwner_Index     = $stateParams.TransferOwner_Index;
		$scope.data.Document_No     		= $stateParams.TransferOwner_No;
        $scope.data.Cus    					= $stateParams.Cus_Id;
		$scope.data.Cus_New   				= $stateParams.Cus_Id_New;

		/*--------------------------------------
        Load Function LoadTOWItemList
        ------------------------------------- */
        const LoadTOWItemList = async() => {
			
			try {

				$ionicLoading.show();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetTransferOwner_Item = await GetTableDM_Item_ByPakorn(objsession, $scope.data.TransferOwner_Index, '');

				let resDataSet = (!res_GetTransferOwner_Item['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item['diffgr:diffgram'].NewDataSet.Table1;
				
				if(Object.keys(resDataSet).length > 0)
				{
					$scope.TOWItemList = resDataSet;
					$scope.TOWItemListLength = Object.keys(resDataSet).length
				}

				let PickCount = 0;

				for (let x in $scope.TOWItemList) {
					if($scope.TOWItemList[x]['Status'] != '')
					{
						PickCount++;
					}
				}

				if($scope.TOWItemListLength == PickCount)
				{
			
					AppService.succ('จัดเก็บเรียบร้อย', '');

					$ionicHistory.goBack();

				}

				$scope.data.Count = PickCount;
				$scope.data.TotalCount = $scope.TOWItemListLength;

				setFocus('PalletNo');
			
			} catch (error) {
				console.log("Error occurred");
				AppService.err('Error', 'Error occurred', '');
				return;
			}
			
		};
		
		let GetTableDM_Item_ByPakorn = (objsession, pstrTransferOwner_Index, pstrWhere) => {
            return new Promise((resolve, reject) => {

                App.API('GetTransferOwner_Item', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrWhere: pstrWhere
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetTransferOwner_Item', res));
                });

            })
		}

		LoadTOWItemList();

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

            searchPallet(dataSearch);

		};
		
		const searchPallet = async(dataSearch) => {
            try {

                $ionicLoading.show();

                AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				let datatables = {};
				let i = 0;

				for (let x in $scope.TOWItemList) {
					if($scope.TOWItemList[x]['Pallet_No'] == $scope.data.PalletNo && $scope.TOWItemList[x]['Status'] != '')
					{
						datatables[i] = $scope.TOWItemList[x];
						i++;
					}
				}

				if(Object.keys(datatables).length > 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ป้อน Pallet No. จัดเก็บแล้ว!', 'PalletNo');
                    return;
				}

				const res_GetTransferOwner_Item_ByPakorn = await GetTransferOwner_Item_ByPakorn(objsession, $scope.data.TransferOwner_Index, $scope.data.PalletNo);

				let resDataSet = (!res_GetTransferOwner_Item_ByPakorn['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item_ByPakorn['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					$scope.data.PalletNo = null;
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้!', 'PalletNo');
                    return;
				}

				$scope.data._TotalQty 			= resDataSet[0].QTY;
				$scope.data.SKU 				= resDataSet[0].Sku_Id;
				$scope.data.Lot 				= resDataSet[0].PLot;
				$scope.data._Package 			= resDataSet[0].Package_Index;
				$scope.data._OrderItem_Index 	= resDataSet[0].OrderItem_Index;
				$scope.data._Customer_Index 	= resDataSet[0].Customer_Index;
				$scope.data._Location_Index 	= resDataSet[0].Location_Index;
				$scope.data._Witdraw_No 		= resDataSet[0].Ref_No1;
				$scope.data._Plot 				= resDataSet[0].PLot;
				$scope.data._Qty_Per_pck 		= resDataSet[0].Flo1;
				$scope.data._Sku_Index 			= resDataSet[0].Sku_Index;

				const res_GetCode_Q = await GetCode_Q(objsession, $scope.data._Sku_Index, $scope.data._Plot);

				let resDataSet2 = (!res_GetCode_Q['diffgr:diffgram']) ? {} : res_GetCode_Q['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet2).length > 0)
				{
					$scope.data.SKU_Q 		= resDataSet2[0].SKU_Id;
					$scope.data.SKU_Q_Tag 	= resDataSet2[0].Sku_Index_Mapping;
					$scope.data._Package_Q 	= resDataSet2[0].Package_Index;
				}
				else
				{
					$scope.data.SKU_Q 		= null;
					$scope.data.SKU_Q_Tag 	= null;
				}

				const res_GetCode_W = await GetCode_W(objsession, $scope.data._Sku_Index, $scope.data._Plot);

				let resDataSet3 = (!res_GetCode_W['diffgr:diffgram']) ? {} : res_GetCode_W['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet3).length > 0)
				{
					$scope.getGrade_WList 	= resDataSet3;
					$scope.data.Grade_W 	= resDataSet3[0].Sku_Index;
					$scope.data._Package_W 	= resDataSet3[0].Package_Index;
				}

				setFocus('TotalQty');

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
		}
		
		let GetTransferOwner_Item_ByPakorn = (objsession, pstrTransferOwner_Index, pstrWhere) => {
            return new Promise((resolve, reject) => {

                App.API('GetTransferOwner_Item_ByPakorn', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					pstrWhere: pstrWhere
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetTransferOwner_Item_ByPakorn', res));
                });

            })
		}

		let GetCode_Q = (objsession, pstrSKU_Index, pstrPlot) => {
            return new Promise((resolve, reject) => {

                App.API('GetCode_Q', {
                    objsession: objsession,
					pstrSKU_Index: pstrSKU_Index,
					pstrPlot: pstrPlot
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetCode_Q', res));
                });

            })
		}

		let GetCode_W = (objsession, pstrSKU_Index, pstrPlot) => {
            return new Promise((resolve, reject) => {

                App.API('GetCode_W', {
                    objsession: objsession,
					pstrSKU_Index: pstrSKU_Index,
					pstrPlot: pstrPlot
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('GetCode_W', res));
                });

            })
		}

		/*--------------------------------------
        Event Function searchTotalQty
        ------------------------------------- */
        $scope.searchTotalQty = (TotalQty) => {

		   	if($scope.data._Qty_Per_pck != 0)
		   	{
				$scope.data.PackageQty = TotalQty/$scope.data._Qty_Per_pck;
		   	}
		   	else
		   	{
				$scope.data.PackageQty = 'No QTY Per Pack';
			}

			setFocus('QTY_Q');

		};

		/*--------------------------------------
        Event Function searchQTY_Q
        ------------------------------------- */
        $scope.searchQTY_Q = (QTY_Q) => {

			if(QTY_Q == '')
			{
				$scope.data.QTY_Q = 0;
			}

			if($scope.data.QTY_W == '')
			{
				$scope.data.QTY_W = 0;
			}

			if((QTY_Q+$scope.data.QTY_W) > $scope.data.TotalQty)
			{
				$scope.data.QTY_Q = null;
				AppService.err('แจ้งเตือน', 'จำนวนที่กรอกมากกว่าจำนวนที่มี!', 'QTY_Q');
				return;
			}
			
			setFocus('LocationQ');

		};

		/*--------------------------------------
        Event Function searchLocationQ
        ------------------------------------- */
        $scope.searchLocationQ = (LocationQ) => {

			if(LocationQ != '')
			{
				searchLocationQ(LocationQ);
			}	

		};

		const searchLocationQ = async(LocationQ) => {
            try {

				$ionicLoading.show();

                AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());


				const res_GetLocation_Index = await GetLocation_Index(objsession, LocationQ);

				if(res_GetLocation_Index == '')
				{
					$scope.data.LocationQ = 'RS';
					AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'LocationQ');
                    return;
				}

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

		/*--------------------------------------
        Event Function changeGrade_W
        ------------------------------------- */
		$scope.changeGrade_W = (Grade_W) => {

			setFocus('QTY_W');

		};

		/*--------------------------------------
        Event Function searchQTY_W
        ------------------------------------- */
        $scope.searchQTY_W = (QTY_W) => {

			if(QTY_W == '')
			{
				$scope.data.QTY_W = 0;
			}

			if($scope.data.QTY_Q == '')
			{
				$scope.data.QTY_Q = 0;
			}

			if((QTY_W+$scope.data.QTY_Q) > $scope.data.TotalQty)
			{
				$scope.data.QTY_W = null;
				AppService.err('แจ้งเตือน', 'จำนวนที่กรอกมากกว่าจำนวนที่มี!', 'QTY_W');
				return;
			}
			
			setFocus('LocationW');

		};

		/*--------------------------------------
        Event Function searchLocationW
        ------------------------------------- */
        $scope.searchLocationW = (LocationW) => {

			if(LocationW != '')
			{
				searchLocationW(LocationW);
			}	

		};

		const searchLocationW = async(LocationW) => {
            try {

				$ionicLoading.show();

                AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				const res_GetLocation_Index = await GetLocation_Index(objsession, LocationW);

				if(res_GetLocation_Index == '')
				{
					$scope.data.LocationQ = 'RS';
					AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'LocationW');
                    return;
				}

				$ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
			}
		}

		/*--------------------------------------
        Event Function save
		------------------------------------- */
		$scope.save = () =>{

			saveData();
			
		}

		const saveData = async() => {
            try {

				$ionicLoading.show();

				AppService.blur();

				let objsession = angular.copy(LoginService.getLoginData());

				if (!$scope.data.PalletNo) {
					AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
					return;
				}
				
				if($scope.data.LocationQ != '')
				{
					const res_GetLocation_IndexQ = await GetLocation_Index(objsession, $scope.data.LocationQ);

					if(res_GetLocation_IndexQ == '')
					{
						$scope.data.LocationQ = 'RS';
						AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'LocationQ');
						return;
					}
				}

				if($scope.data.LocationW != '')
				{
					const res_GetLocation_IndexW = await GetLocation_Index(objsession, $scope.data.LocationW);

					if(res_GetLocation_IndexW == '')
					{
						$scope.data.LocationW = 'RS';
						AppService.err('แจ้งเตือน', 'ไม่พบ ตำแหน่งจัดเก็บนี้ในระบบ!', 'LocationW');
						return;
					}
				}

				if($scope.data.QTY_W == '')
				{
					$scope.data.QTY_W = 0;
				}

				if($scope.data.QTY_Q == '')
				{
					$scope.data.QTY_Q = 0;
				}

				if(($scope.data.TotalQty+$scope.data.QTY_W+$scope.data.QTY_Q) > $scope.data._TotalQty)
				{
					$scope.data.QTY_W = null;
					AppService.err('แจ้งเตือน', 'จำนวนที่กรอกมากกว่าจำนวนที่มี!', 'QTY_W');
					return;
				}

				const res_GetTransferOwner_Item_ByPakorn = await GetTransferOwner_Item_ByPakorn(objsession, $scope.data.TransferOwner_Index, $scope.data.PalletNo);

				let resDataSet = (!res_GetTransferOwner_Item_ByPakorn['diffgr:diffgram']) ? {} : res_GetTransferOwner_Item_ByPakorn['diffgr:diffgram'].NewDataSet.Table1;
					
				if(Object.keys(resDataSet).length <= 0)
				{
					AppService.err('แจ้งเตือน', 'ไม่มีรายการหยิบ', '');
					return;
				}

				await PutTransferOwner_Item_DM_ByPakorn(objsession, $scope.data.TransferOwner_Index, $scope.data._Sku_Index, $scope.data.SKU_Q_Tag, $scope.data.Grade_W, $scope.data.QTY_Q, $scope.data.QTY_W, $scope.data.TotalQty, 0, $scope.data._Location_Index, res_GetLocation_IndexQ, res_GetLocation_IndexW, $scope.data._Plot, $scope.data._Package, $scope.data._Package_Q, $scope.data._Package_W, $scope.data.PalletNo, $scope.data._OrderItem_Index, $scope.data._Customer_Index, $scope.data._Witdraw_No)
					
				clearData();

				$scope.data.TransferOwner_Index     = $stateParams.TransferOwner_Index;
				$scope.data.Document_No     		= $stateParams.TransferOwner_No;
				$scope.data.Cus    					= $stateParams.Cus_Id;
				$scope.data.Cus_New   				= $stateParams.Cus_Id_New;

				LoadTOWItemList();

				setFocus('PalletNo');

				$ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
			}
		}

		let PutTransferOwner_Item_DM_ByPakorn = (objsession, pstrTransferOwner_Index, Sku_Index, Sku_Index_Q, Sku_Index_W, Total_Qty_Q, Total_Qty_W, Total_Qty_G, Total_Qty_Loss, Location_Index, Location_Index_Q, Location_Index_W, PLot, Package_Index, Package_Index_Q, Package_Index_W, Pallet_No, OldOrderItem_Index, Customer_Index, Witdraw_No) => {
            return new Promise((resolve, reject) => {

                App.API('PutTransferOwner_Item_DM_ByPakorn', {
                    objsession: objsession,
					pstrTransferOwner_Index: pstrTransferOwner_Index,
					Sku_Index: Sku_Index,
					Sku_Index_Q: Sku_Index_Q,
					Sku_Index_W: Sku_Index_W,
					Total_Qty_Q: Total_Qty_Q,
					Total_Qty_W: Total_Qty_W,
					Total_Qty_G: Total_Qty_G,
					Total_Qty_Loss: Total_Qty_Loss,
					Location_Index: Location_Index,
					Location_Index_Q: Location_Index_Q,
					Location_Index_W: Location_Index_W,
					PLot: PLot,
					Package_Index: Package_Index,
					Package_Index_Q: Package_Index_Q,
					Package_Index_W: Package_Index_W,
					Pallet_No: Pallet_No,
					OldOrderItem_Index: OldOrderItem_Index,
					Customer_Index: Customer_Index,
					Witdraw_No: Witdraw_No
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('PutTransferOwner_Item_DM_ByPakorn', res));
                });

            })
		}
		

	})
	


