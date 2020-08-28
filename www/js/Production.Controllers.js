/**
 * Production.Controllers Module
 *
 * Description
 */
angular.module('Production.Controllers', ['ionic'])

.controller('Production_ReceiveRawMatCtrl', function ($scope, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    /*--------------------------------------
    Data Function
    --------------------------------------*/
    $scope.orderTopicList = {};
    $scope.orderTopicListLength = 0;

    $scope.selectedOrder_Index = null;
    $scope.selectedOrder_No = null;

    /*--------------------------------------
    Event Function setSelected
    ------------------------------------- */
    $scope.setSelected = function (Order_Index, Order_No) {
        $scope.selectedOrder_Index = Order_Index;
        $scope.selectedOrder_No = Order_No;
    };

    /*--------------------------------------
    Event Function selected
    ------------------------------------- */
    $scope.selected = function (selectedOrder_Index, selectedOrder_No) {
        if (!selectedOrder_Index) {
            AppService.err('แจ้งเตือน', 'ยังไม่ได้เลือกรายการ', '');
        } else {
            $state.go('production_ReceiveRawMat_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No });
        }
    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    var GetOrderTopic = function () {

        AppService.startLoading();

        var strWhere = " And (ms_DocumentType.DocumentType_Index IN ('0010000000005')) "
        strWhere += " and tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer ";
        strWhere += " where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1) ";

        App.API('GetOrderTopic', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: strWhere
        }).then(function (res) {

            var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

            if (Object.keys(resDataSet).length > 0) {
                $scope.orderTopicList = resDataSet;
                $scope.orderTopicListLength = Object.keys(resDataSet).length;
            }
            else {
                AppService.err('แจ้งเตือน', 'ไม่มีรายการรับสินค้า', '');
                return;
            }

        }).catch(function (res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function (res) {
            AppService.stopLoading();
        });
    };

    GetOrderTopic();

})

.controller('Production_ReceiveRawMat_SelectedCtrl', function ($scope, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $ionicHistory) {

    /*--------------------------------------
    Data Function
    --------------------------------------*/
    $scope.data = {};
    $scope.datatablesList = {};
    $scope.datatablesListLength = 0;
    $scope.datatablesList2 = {};
    $scope.datatablesListLength2 = 0;

    var Order_Index = $stateParams.Order_Index;
    var Order_No = $stateParams.Order_No;

    var keyCnt = 0;

    var clearData = function () {
        $scope.data = {};
        $scope.datatablesList = {};
        $scope.datatablesListLength = 0;
        $scope.datatablesList2 = {};
        $scope.datatablesListLength2 = 0;
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

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    $scope.DisplayFlag = 0

    $scope.changeDisplay = function (value) {

        $scope.DisplayFlag = value;

    };

    $scope.data.Order_No = $stateParams.Order_No;
    $scope.data.PalletCount = '0/0';
    $scope.data.SysLocation = 'FLOOR';

    /*--------------------------------------
    Function LoadDatatables
    --------------------------------------*/

    function LoadDatatables(){

        try {

            AppService.startLoading();

            var objsession = angular.copy(LoginService.getLoginData());

            var res_getTag_Receive = getTag_Receive(objsession,Order_Index);

            var res_getTag_Receive_ShowStatus2 = getTag_Receive_ShowStatus2(objsession,Order_Index);

            var res_getTag_Receive_ShowStatus1 = getTag_Receive_ShowStatus1(objsession,Order_Index);

            Promise.all([res_getTag_Receive,res_getTag_Receive_ShowStatus2,res_getTag_Receive_ShowStatus1]).then(function(res){

                var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;
                var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;
                var resDataSet3 = (!res[2]['diffgr:diffgram']) ? {} : res[2]['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length <= 0)
                {
                    AppService.err('แจ้งเตือน', 'กรุณาจัดการ TAG ก่อนรับเข้า', '');
                    Tag_No = null;
                    clearData();
                    $ionicHistory.goBack();
                    return;
                }

                if(Object.keys(resDataSet2).length > 0)
                {
                    $scope.datatablesList2 = resDataSet2;
                    $scope.datatablesListLength2 = Object.keys(resDataSet2).length;
                }

                if(Object.keys(resDataSet3).length > 0)
                {
                    $scope.datatablesList = resDataSet3;
                    $scope.datatablesListLength = Object.keys(resDataSet3).length;
                }
                else
                {
                    Tag_No = null;
                    AppService.err('แจ้งเตือน', 'จัดเก็บรายการเรียบร้อยแล้ว', '');
                    $ionicHistory.goBack();
                    return;
                }
    
                $scope.data.PalletCount = $scope.datatablesListLength2 + '/' + Object.keys(resDataSet).length;
    
                $scope.data.PalletNo = null;
                setFocus('PalletNo');

                AppService.stopLoading();

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

    var getTag_Receive = function (objsession, pstrorder_index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Receive', {
                objsession: objsession,
                pstrorder_index: pstrorder_index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Receive', res));
            });

        })
    }

    var getTag_Receive_ShowStatus2 = function (objsession, pstrorder_index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Receive_ShowStatus2', {
                objsession: objsession,
                pstrorder_index: pstrorder_index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Receive_ShowStatus2', res));
            });

        })
    }

    var getTag_Receive_ShowStatus1 = function (objsession, pstrorder_index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Receive_ShowStatus1', {
                objsession: objsession,
                pstrorder_index: pstrorder_index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Receive_ShowStatus1', res));
            });

        })
    }

    if (Order_Index && Order_No) {
        LoadDatatables();
    }

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
    Event Function search
    ------------------------------------- */
    $scope.search = function (dataSearch, searchType) {

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

    function searchPallet(dataSearch) {
        try {

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            var res_getTagByPallet = getTagByPallet(objsession, dataSearch);

            var res_getQtyPerPallet_TPIPL = getQtyPerPallet_TPIPL(objsession, dataSearch);

            Promise.all([res_getTagByPallet, res_getQtyPerPallet_TPIPL]).then(function (res) {

                var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน!', 'PalletNo');
                    return;
                }

                if (Object.keys(resDataSet2).length <= 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'ไม่มี Pallet นี้ในระบบ!', 'PalletNo');
                    return;
                }

                var _check  = false;
                var _result = null;

                for (var x in $scope.datatablesList) {
                  
                    if($scope.datatablesListLength > 0)
                    {
                        if($scope.datatablesList[x].Str5 == dataSearch)
                        {

                            var res_FindLocationAndInsert_Receive_V2 = FindLocationAndInsert_Receive_V2(objsession, dataSearch, $scope.datatablesList[x].Qty_per_TAG, '0010000000015', $scope.datatablesList[x].Tag_No, $scope.datatablesList[x].PLot, $scope.data.SysLocation);
                            _result =  res_FindLocationAndInsert_Receive_V2.then(function (res) {

                                _check = true;

                                return res;
            
                            }).catch(function (error) {
                                console.log("Error occurred");
                                AppService.err('Error', 'Error occurred', '');
                                return;
                            });


                        }

                    }

                }

                if(!_check)
                {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'ไม่มี Pallet นี้ในรายการ!', 'PalletNo');
                    return;
                }

                if (_result != 'True') {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', res, 'PalletNo');
                    return;
                }

                LoadDatatables();

                $scope.data.PalletNo = null;
                AppService.succ('เก็บเรียบร้อย', 'PalletNo');

                AppService.stopLoading();

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

    var getQtyPerPallet_TPIPL = function (objsession, pPallet_No) {
        return new Promise(function (resolve, reject) {

            App.API('getQtyPerPallet_TPIPL', {
                objsession: objsession,
                pPallet_No: pPallet_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getQtyPerPallet_TPIPL', res));
            });

        })
    }

    var FindLocationAndInsert_Receive_V2 = function (objsession, pPallet_No, pQtyPerPallet, pstrNewPalletStatus_Index, pstrTag_no, plot, plocation_Alias) {
        return new Promise(function (resolve, reject) {

            App.API('FindLocationAndInsert_Receive_V2', {
                objsession: objsession,
                pPallet_No: pPallet_No,
                pQtyPerPallet: pQtyPerPallet,
                pstrNewPalletStatus_Index: pstrNewPalletStatus_Index,
                pstrTag_no: pstrTag_no,
                plot: (plot ? plot : ''),
                plocation_Alias: plocation_Alias
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('FindLocationAndInsert_Receive_V2', res));
            });

        })
    }


})

.controller('Production_PackingRollCtrl', function($scope, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {
    
    /*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
	$scope.datatablesList = {};
    $scope.datatablesListLength = 0;
    $scope.getBaggingOrderHeaderList = {};

    $scope.Count = 0;
    $scope.Total = 0;

    var keyCnt = 0;
    
    var _baggingorder_no        = null;
	var _lot 					= null;
	var _roll 					= null;
	var _pos 					= null;
    var _sku_index 				= null;
    var _seq 				    = null;
    var _weight 				= null;
    var _length                 = null;
  
	var clearData = function () {
		$scope.data = {};
		$scope.datatablesList = {};
        $scope.datatablesListLength = 0;
        $scope.getBaggingOrderHeaderList = {};

		$scope.Count = 0;
        $scope.Total = 0;

        _baggingorder_no        = null;
        _lot 					= null;
        _roll 					= null;
        _pos 					= null;
        _sku_index 				= null;
        _seq 				    = null;
        _weight 				= null;
        _length                 = null;  
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('RollNo');
    });
    
    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

	$scope.DisplayFlag = 0

	$scope.changeDisplay = function (value) {

		$scope.DisplayFlag = value;

    };
    
    /*--------------------------------------
	Call API getBaggingOrderHeader
	------------------------------------- */
    var getBaggingOrderHeader_API = function()
    {
		AppService.startLoading();

		App.API('getBaggingOrderHeader', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: ""
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.getBaggingOrderHeaderList = resDataSet;
    
                $scope.changePD(resDataSet[0].BaggingOrder_Index);
                
			}

		}).catch(function (res) {
			AppService.err('getBaggingOrderHeader', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    getBaggingOrderHeader_API();

    /*--------------------------------------
	Call API getGridView_Roll
	------------------------------------- */
    var getGridView_Roll_API = function()
    {
		AppService.startLoading();

		App.API('getGridView_Roll', {
			objsession: angular.copy(LoginService.getLoginData()),
			whereSql: " WHERE tb_BaggingOrderItem.BaggingOrder_Index = '" + $scope.data.PD + "' "
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

				$scope.datatablesList = resDataSet;
                $scope.datatablesListLength = Object.keys(resDataSet).length;
                
            }
            else
            {
                $scope.datatablesList = {};
                $scope.datatablesListLength = 0;

            }

		}).catch(function (res) {
			AppService.err('getGridView_Roll', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    /*--------------------------------------
	Call API getBaggingOrderItem
	------------------------------------- */
    var getBaggingOrderItem_API = function()
    {
		AppService.startLoading();

		App.API('getBaggingOrderItem', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: " And BaggingOrder_Index = '" + $scope.data.PD + "' "
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.Count = Object.keys(resDataSet).length;
                
            }
           
		}).catch(function (res) {
			AppService.err('getBaggingOrderItem_API', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    /*--------------------------------------
    Event Function changePD 
    ------------------------------------- */
    $scope.changePD = function(BaggingOrder_Index) {

        $scope.data.PD = BaggingOrder_Index;

        loadPD(BaggingOrder_Index);

    };

    function loadPD(BaggingOrder_Index) {
        try {

            AppService.startLoading();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!BaggingOrder_Index) {

                $scope.data = {};

                AppService.stopLoading();

                return;

            } else {


                var res_getBaggingOrderHeader = getBaggingOrderHeader(objsession, " And BaggingOrder_Index = '" + BaggingOrder_Index + "' ");

                res_getBaggingOrderHeader.then(function(res){

                    var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        $scope.data.Lot     = resDataSet[0].PLot;
                        _sku_index          = resDataSet[0].Sku_Index;
                        _baggingorder_no    = resDataSet[0].BaggingOrder_No;
                        $scope.Total        = resDataSet[0].Total_Qty;
                    }

                    return  GetSKU_By_SKU_Index(objsession, _sku_index);

                }).then(function(res2){

                    var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        $scope.data.Grade = resDataSet[0].Sku_Id;
                    }

                    getGridView_Roll_API();

                    getBaggingOrderItem_API();

                    setFocus('RollNo');

                    AppService.stopLoading();

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

    var getBaggingOrderHeader = function (objsession, pstrWhere) {
        return new Promise(function (resolve, reject) {

            App.API('getBaggingOrderHeader', {
                objsession: objsession,
                pstrWhere: pstrWhere
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getBaggingOrderHeader', res));
            });

        })
    }

    var GetSKU_By_SKU_Index = function (objsession, pstrSKU_Index) {
        return new Promise(function (resolve, reject) {

            App.API('GetSKU_By_SKU_Index', {
                objsession: objsession,
                pstrSKU_Index: pstrSKU_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('GetSKU_By_SKU_Index', res));
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
		
			str = 'กรุณา Scan Roll No.';

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

		searchRoll(dataSearch);		

    };
    
    function searchRoll(dataSearch) {
        try {

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            _pos 	= dataSearch.indexOf("R");
			_lot 	= dataSearch.substring(0, _pos);
            _roll 	= dataSearch.substring(_pos+1);
            
            AppService.stopLoading();

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'ยืนยันการบันทึกหรือไม่ ?'
            }).then(function (res) {

                if (!res) {
                    $scope.data.RollNo = null;
                    setFocus('RollNo');
                    return;
                }
                else {

                    insertRoll(dataSearch);
                }
                
            }); 

        } catch (error) {
            console.log("Error occurred");
            AppService.err('Error', 'Error occurred', '');
            return;
        }
    }

    function insertRoll(dataSearch) {
        try {

            AppService.startLoading();

            var objsession = angular.copy(LoginService.getLoginData());

            if($scope.data.Lot != _lot)
            {
                $scope.data.RollNo = null;
				AppService.err('แจ้งเตือน', 'Lot ไม่ตรงกัน!', 'RollNo');
				return;
            }

            var res_chkRollToLot = chkRollToLot(objsession, $scope.data.Lot, _roll, _baggingorder_no);

            res_chkRollToLot.then(function(res){

                var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length <= 0)
                {
                    $scope.data.RollNo = null;
                    AppService.err('แจ้งเตือน', 'Roll นี้ไม่มีใน Lot!', 'RollNo');
                    return false;
                }

                if(resDataSet[0].Weight == 0)
                {
                    $scope.data.RollNo = null;
                    AppService.err('แจ้งเตือน', 'Roll นี้น้ำหนักเป็น 0!', 'RollNo');
                    return false;
                }

                _weight = resDataSet[0].Weight;
                _length = resDataSet[0].NetLength;

                return getBaggingOrderItem(objsession, " And BaggingOrder_Index = '" + $scope.data.PD + "' AND Roll_No = '" + _roll + "' AND (Status in (1,2)) ");

            }).then(function(res2){
                
                if(res2 === false)
                {
                    return false;
                }

                var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length > 0)
                {
                    $scope.data.RollNo = null;
                    AppService.err('แจ้งเตือน', 'มี Roll นี้ในระบบเเล้ว!', 'RollNo');
                    return false;
                }

                return getBaggingOrderItem(objsession, " And BaggingOrder_Index = '" + $scope.data.PD + "' ");

            }).then(function(res3){

                if(res3 === false)
                {
                    return false;
                }

                var resDataSet = (!res3['diffgr:diffgram']) ? {} : res3['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length > 0)
                {
                    _seq = Object.keys(resDataSet).length +1;
                }
                else
                {
                    _seq = 1;
                }

                return insertBaggingOrderItem(objsession, $scope.data.PD, _roll, _seq, _length, _weight);

            }).then(function(res4){

                if(res4 === false)
                {
                    AppService.stopLoading();
                    return;
                }

                $scope.data.Weight = _weight;
                $scope.data.Length = _length;
                $scope.data.Roll   = _roll;

                getGridView_Roll_API();

                getBaggingOrderItem_API();

                $scope.data.RollNo = null;
                AppService.succ('บันทึกเรียบร้อย', 'RollNo');
                return ;

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

    var chkRollToLot = function (objsession, lot, roll, BaggingOrder_No) {
        return new Promise(function (resolve, reject) {

            App.API('chkRollToLot', {
                objsession: objsession,
                lot: lot,
                roll: roll,
                BaggingOrder_No: BaggingOrder_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('chkRollToLot', res));
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

    var insertBaggingOrderItem = function (objsession, baggingorder_index, roll, seq, length, weight) {
        return new Promise(function (resolve, reject) {

            App.API('insertBaggingOrderItem', {
                objsession: objsession,
                baggingorder_index: baggingorder_index,
                roll: roll,
                seq: seq,
                len: parseFloat(length),
                weight: parseFloat(weight)
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('insertBaggingOrderItem', res));
            });

        })
    }

})

.controller('Production_IssueRawMatCtrl', function($scope, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $stateParams) {

    /*--------------------------------------
	Data Function
	--------------------------------------*/
	$scope.data = {};
    $scope.getBaggingOrderHeaderList = {};
    $scope.getShiftList = {};
    $scope.getTypeIssueList = ['Issue', 'Return', 'Damage', 'RecheckBalance'];
    $scope.isDisable_IssueQty = false;

    var keyCnt = 0;

    var WorkShifts_Index    = null;
    var WorkShiftsTime      = null;

    var BaggingOrder_Index  = null;
    var BaggingOrder_No     = null;
    
    var _tag_no                 = null;
	var _line_no 	            = null;
	var _qty_bal 	            = null;
	var _qty_issue 	            = null;
    var _pos 			        = null;
    var _lot 		            = null;
    var _roll 			        = null;
  
  
	var clearData = function () {
		$scope.data = {};
        $scope.getBaggingOrderHeaderList = {};
        $scope.getShiftList = {};
        $scope.getTypeIssueList = ['Issue', 'Return', 'Damage', 'RecheckBalance'];
        $scope.isDisable_IssueQty = false;

        WorkShifts_Index    = null;
        WorkShiftsTime      = null;

        BaggingOrder_Index  = null;
        BaggingOrder_No     = null;

        _tag_no                 = null;
	    _line_no 	            = null;
	    _qty_bal 	            = null;
	    _qty_issue 	            = null;
        _pos 			        = null;
        _lot 		            = null;
        _roll 			        = null;  
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('Line_No');
    });

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    $scope.data.Date    = new Date();
    $scope.data.DateMax = $filter('date')('', 'dd/MM/yyyy');
    $scope.data.TypeIssue = 'Issue';

    /*--------------------------------------
	Call API getBaggingOrderHeader
	------------------------------------- */
    var getBaggingOrderHeader_API = function(Line_No)
    {
		AppService.startLoading();

		App.API('getBaggingOrderHeader', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: " and BaggingOrder_No not like 'QC%' and BaggingLine_No = '" + Line_No + "' order by BaggingOrder_No "
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.getBaggingOrderHeaderList = resDataSet;
    
                $scope.changePD(resDataSet[0].BaggingOrder_Index+','+resDataSet[0].BaggingOrder_No);
                
			}

		}).catch(function (res) {
			AppService.err('getBaggingOrderHeader', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }
    
    /*--------------------------------------
	Call API getShift
	------------------------------------- */
    var getShift_API = function()
    {
		AppService.startLoading();

		App.API('getShift', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: ""
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.getShiftList = resDataSet;

                var res_getDate_ShiftCurrent = getDate_ShiftCurrent(angular.copy(LoginService.getLoginData()));

                res_getDate_ShiftCurrent.then(function(res2){

                    var resDataSet2 = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                    $scope.data.Shift = resDataSet[resDataSet2[0].Shift_Number].WorkShifts_Index+','+resDataSet[resDataSet2[0].Shift_Number].WorkShiftsTime;

                    WorkShifts_Index    = resDataSet[resDataSet2[0].Shift_Number].WorkShifts_Index;
                    WorkShiftsTime      = resDataSet[resDataSet2[0].Shift_Number].WorkShiftsTime;
                    
                    $scope.data.Shift_Time = WorkShiftsTime;

                }).catch(function (error) {
					console.log("Error occurred");
					AppService.err('Error', 'Error occurred', '');
					return;
				});
                
			}

		}).catch(function (res) {
			AppService.err('getShift', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    var getDate_ShiftCurrent = function (objsession) {
        return new Promise(function (resolve, reject) {

            App.API('getDate_ShiftCurrent', {
                objsession: objsession
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getDate_ShiftCurrent', res));
            });

        })
    }

    getShift_API();

    /*--------------------------------------
	Call API getDate_Current
	------------------------------------- */
    var getDate_Current_API = function()
    {
		AppService.startLoading();

		App.API('getDate_Current', {
			objsession: angular.copy(LoginService.getLoginData()),
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.data.MaxDate = $filter('date')(resDataSet[0].Date_Max, 'dd/MM/yyyy');
                
			}

		}).catch(function (res) {
			AppService.err('getDate_Current', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    getDate_Current_API();

    /*--------------------------------------
    Event Function searchLine 
    ------------------------------------- */
    $scope.searchLine = function(Line_No) {

        _line_no = Line_No.substring(4);

        getBaggingOrderHeader_API(_line_no);

    };

    /*--------------------------------------
    Event Function changePD 
    ------------------------------------- */
    $scope.changePD = function(strBaggingOrder) {

        $scope.data.PD = strBaggingOrder;

        var BaggingOrder = strBaggingOrder.split(',');

        BaggingOrder_Index  = BaggingOrder[0];
        BaggingOrder_No     = BaggingOrder[1];

        setFocus('Shift');

    };

    /*--------------------------------------
    Event Function changeShift 
    ------------------------------------- */
    $scope.changeShift = function(strWorkShifts) {

        $scope.data.Shift = strWorkShifts;

        var WorkShifts = strWorkShifts.split(',');

        WorkShifts_Index    = WorkShifts[0];
        WorkShiftsTime      = WorkShifts[1];
        
        $scope.data.Shift_Time = WorkShiftsTime;

        setFocus('Date');

    };

    /*--------------------------------------
    Event Function searchDate 
    ------------------------------------- */
    $scope.searchDate = function(Date) {

        setFocus('TypeIssue');

    };

    /*--------------------------------------
    Event Function changeTypeIssue 
    ------------------------------------- */
    $scope.changeTypeIssue = function(TypeIssue) {

        clearOD();

        if(WorkShifts_Index == '0010000000004')
        {
            setFocus('Location');
        }
        else
        {
            setFocus('PalletNo');
        }
        

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
		
			str = 'กรุณา Scan Pallet No.';

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

		searchPallet(dataSearch);		

    };

    function searchPallet(dataSearch) {
        try {

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            _pos 	= dataSearch.indexOf("R");
			_lot 	= dataSearch.substring(0, _pos);
            _roll 	= dataSearch.substring(_pos+1);

            if(_pos > 0)
            {
                getDataRoll(dataSearch);
            }
            else
            {
                getDataPallet(dataSearch);
            }
            
            AppService.stopLoading();

        } catch (error) {
            console.log("Error occurred");
            AppService.err('Error', 'Error occurred', '');
            return;
        }
    }

    function getDataRoll(dataSearch)
    {
        try {

            var objsession = angular.copy(LoginService.getLoginData());

            var res_getTagByRoll = getTagByRoll(objsession,_lot,_roll);

            res_getTagByRoll.then(function(res){

                var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length <= 0) {

                    clearOD()
                    AppService.err('แจ้งเตือน', 'ไม่มีการรับเข้า Roll No. นี้!', 'PalletNo');
					return false;
                }

                _tag_no = resDataSet[0].Tag_No;
                _qty_bal = resDataSet[0].Qty_Bal;

                $scope.data.Status = resDataSet[0].PalletStatus_Id;
                $scope.data.Lot_No = resDataSet[0].PLot;
                $scope.data.Detail = resDataSet[0].Str1;

                if(resDataSet[0].Ref_No1_T != '')
                {
                    var res_getBaggingOrderAll = getBaggingOrderAll(objsession, " and Status in (1,2) and BaggingOrder_No = '" + resDataSet[0].Ref_No1_T + "' ");
                    var res_getPDIssueRawMat_Sum = getPDIssueRawMat_Sum(objsession, " and Tag_No = '" + _tag_no + "' and Status = 1 ");

                    return Promise.all([res_getBaggingOrderAll,res_getPDIssueRawMat_Sum]);
                }

            }).then(function(res2){

                if(res2 === false)
                {
                    AppService.stopLoading();
                    return;
                }

                var resDataSet = (!res2[0]['diffgr:diffgram']) ? {} : res2[0]['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {

                    if(resDataSet[0].BaggingLine_No != _line_no)
                    {
                        clearOD()
                        AppService.err('แจ้งเตือน', 'Roll No. นี้ อยู่ใน Line ' + resDataSet[0].BaggingLine_No + ' !', 'PalletNo');
                        return;
                    }

                }

                var resDataSet2 = (!res2[1]['diffgr:diffgram']) ? {} : res2[1]['diffgr:diffgram'].NewDataSet.Table1;

                if(!resDataSet2[0].Qty_Issue)
                {
                    _qty_issue = 0;
                }
                else
                {
                    _qty_issue = parseFloat(resDataSet2[0].Qty_Issue);
                }

                if(parseFloat(_qty_bal) <= 0)
                {
                    clearOD()
                    AppService.err('แจ้งเตือน', 'Roll No. นี้ ไม่มีของแล้ว!', 'PalletNo');
                    return;
                }

                $scope.data.Qty = parseFloat(_qty_bal) - parseFloat(_qty_issue);
                $scope.data.IssueQty = $scope.data.Qty;
                $scope.data.BalanceQty = parseFloat($scope.data.Qty) - parseFloat($scope.data.IssueQty);

                if($scope.data.TypeIssue == 'RecheckBalance')
                {
                    $scope.data.IssueQty = 0;
                    $scope.isDisable_IssueQty = true;
                    $scope.data.BalanceQty = $scope.data.Qty;
                }
                else
                {
                    $scope.isDisable_IssueQty = false;
                }

                setFocus('IssueQty');

                AppService.stopLoading();

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

    function getDataPallet(dataSearch)
    {
        try {

            var objsession = angular.copy(LoginService.getLoginData());

            var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession, dataSearch);

			var res_getPallet_No = getPallet_No(objsession, dataSearch);

			Promise.all([res_chk_Balance_Pallet,res_getPallet_No]).then(function(res){

				if(res[0])
				{
					clearOD();
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo');
					return false;
				}
				
				var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
					clearOD();
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet No. นี้ในระบบ!', 'PalletNo');
					return false;
                }
                
                if(resDataSet[0].PalletStatus_Index != '0010000000015')
                {
                    clearOD();
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. นี้ ไม่ใช่ PD!', 'PalletNo');
					return false;
                }

				return getTagByPallet(objsession, dataSearch)


			}).then(function(res2){

				if(res2 === false)
				{
					return false;
				}

				var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

				if(Object.keys(resDataSet).length <= 0)
				{
                    clearOD();
					AppService.err('แจ้งเตือน', 'ไม่มีการรับเข้า Pallet No. นี้!', 'PalletNo');
					return false;
                }
                
                _tag_no = resDataSet[0].Tag_No;
                _qty_bal = resDataSet[0].Qty_Bal;

                $scope.data.Status = resDataSet[0].PalletStatus_Id;
                $scope.data.Lot_No = resDataSet[0].PLot;
                $scope.data.Detail = resDataSet[0].Str1;

                if(resDataSet[0].Ref_No1_T != '')
                {
                    var res_getBaggingOrderAll = getBaggingOrderAll(objsession, " and Status in (1,2) and BaggingOrder_No = '" + resDataSet[0].Ref_No1_T + "' ");
                    var res_getPDIssueRawMat_Sum = getPDIssueRawMat_Sum(objsession, " and Tag_No = '" + _tag_no + "' and Status = 1 ");

                    return Promise.all([res_getBaggingOrderAll,res_getPDIssueRawMat_Sum]);
                }

            }).then(function(res3){

                if(res3 === false)
                {
                    AppService.stopLoading();
                    return;
                }

                var resDataSet = (!res3[0]['diffgr:diffgram']) ? {} : res3[0]['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {

                    if(resDataSet[0].BaggingLine_No != _line_no)
                    {
                        clearOD()
                        AppService.err('แจ้งเตือน', 'Pallet No. นี้ อยู่ใน Line ' + resDataSet[0].BaggingLine_No + ' !', 'PalletNo');
                        return;
                    }

                }

                var resDataSet2 = (!res2[1]['diffgr:diffgram']) ? {} : res2[1]['diffgr:diffgram'].NewDataSet.Table1;

                if(!resDataSet2[0].Qty_Issue)
                {
                    _qty_issue = 0;
                }
                else
                {
                    _qty_issue = parseFloat(resDataSet2[0].Qty_Issue);
                }

                if(parseFloat(_qty_bal) <= 0)
                {
                    clearOD()
                    AppService.err('แจ้งเตือน', 'Pallet No. นี้ ไม่มีของแล้ว!', 'PalletNo');
                    return;
                }

                $scope.data.Qty = parseFloat(_qty_bal) - parseFloat(_qty_issue);
                $scope.data.IssueQty = $scope.data.Qty;
                $scope.data.BalanceQty = parseFloat($scope.data.Qty) - parseFloat($scope.data.IssueQty);

                if($scope.data.TypeIssue == 'RecheckBalance')
                {
                    $scope.data.IssueQty = 0;
                    $scope.isDisable_IssueQty = true;
                    $scope.data.BalanceQty = $scope.data.Qty;
                }
                else
                {
                    $scope.isDisable_IssueQty = false;
                }

                setFocus('IssueQty');

                AppService.stopLoading();

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

    var getTagByRoll = function (objsession, lot, roll) {
        return new Promise(function (resolve, reject) {

            App.API('getTagByRoll', {
                objsession: objsession,
                lot: lot,
                roll: roll
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTagByRoll', res));
            });

        })
    }

    var getBaggingOrderAll = function (objsession, pstrWhere) {
        return new Promise(function (resolve, reject) {

            App.API('getBaggingOrderAll', {
                objsession: objsession,
                pstrWhere: pstrWhere
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getBaggingOrderAll', res));
            });

        })
    }

    var getPDIssueRawMat_Sum = function (objsession, str) {
        return new Promise(function (resolve, reject) {

            App.API('getPDIssueRawMat_Sum', {
                objsession: objsession,
                str: str
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getPDIssueRawMat_Sum', res));
            });

        })
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

    /*--------------------------------------
    Event Function save 
    ------------------------------------- */
    $scope.save = function(){

        savePallet();

    }

    function savePallet() {
        try {

            AppService.startLoading();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!$scope.data.Pallet) {
                $scope.data.PalletNo = null;
                AppService.err('แจ้งเตือน', 'กรุณาเลือก Pallet No.', 'PalletNo');
                return;
            }

            if (!$scope.data.IssueQty) {
                $scope.data.IssueQty = null;
                AppService.err('แจ้งเตือน', 'กรุณากรอกจำนวนเบิก', 'IssueQty');
                return;
            }

            if (!$scope.data.Line_No) {
                $scope.data.Line_No = null;
                AppService.err('แจ้งเตือน', 'กรุณาเลือก Line No.', 'Line_No');
                return;
            }

            AppService.stopLoading();

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'คุณต้องการยืนยัน ' + BaggingOrder_No + ' กะ ' + WorkShiftsTime + '<br />' + 'วันที่ ' + $scope.data.Date + '<br />' + $scope.data.TypeIssue + ' จำนวน ' + $scope.data.IssueQty + ' ?'
            }).then(function (res) {

                if (!res) {
                    $scope.data.PalletNo = null;
                    setFocus('PalletNo');
                    return;
                }
                else {

                    AppService.startLoading();

                    var res_insertPDIssueRawMat =  insertPDIssueRawMat(objsession,_line_no,BaggingOrder_Index,BaggingOrder_No,WorkShifts_Index,$scope.data.Date,$scope.data.Qty,$scope.data.IssueQty,_tag_no,$scope.data.TypeIssue)

                    res_insertPDIssueRawMat.then(function(res){

                        clearOD();
                        AppService.succ('ทำการเบิกเรียบร้อยแล้ว', 'PalletNo');
                        return;

                    }).catch(function (error) {
                        console.log("Error occurred");
                        AppService.err('Error', 'Error occurred', '');
                        return;
                    });
                    
                }
                
            }); 

        } catch (error) {
            console.log("Error occurred");
            AppService.err('Error', 'Error occurred', '');
            return;
        }

    }

    var insertPDIssueRawMat = function (objsession, Line_No, BaggingOrder_Index, BaggingOrder_No, WorkShifts_Index, _Date, Qty_Begin, Qty_Issue, Tag_No, Type) {
        return new Promise(function (resolve, reject) {

            App.API('insertPDIssueRawMat', {
                objsession: objsession,
                Line_No: Line_No,
                BaggingOrder_Index: BaggingOrder_Index,
                BaggingOrder_No: BaggingOrder_No,
                WorkShifts_Index: WorkShifts_Index,
                _Date: _Date,
                Qty_Begin: Qty_Begin,
                Qty_Issue: Qty_Issue,
                Tag_No: Tag_No,
                Type: Type
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('insertPDIssueRawMat', res));
            });

        })
    }

    /*--------------------------------------
    Event Function clear 
    ------------------------------------- */
    $scope.clear = function(){

        clearAll();

    }

    function clearOD()
    {
        $scope.data.PalletNo    = null;
        $scope.data.Status      = null;
        $scope.data.Lot_No      = null;
        $scope.data.Detail      = null;
        $scope.data.Qty         = null;
        $scope.data.IssueQty    = null;
        $scope.data.BalanceQty  = null;

    }

    function clearAll()
    {
        $scope.data.Line_No     = null;
        $scope.getBaggingOrderHeaderList = {};
        $scope.data.PalletNo    = null;
        $scope.data.Status      = null;
        $scope.data.Lot_No      = null;
        $scope.data.Detail      = null;
        $scope.data.Qty         = null;
        $scope.data.IssueQty    = null;
        $scope.data.BalanceQty  = null;

        setFocus('Line_No');

    }

    /*--------------------------------------
    Event Function cal
    ------------------------------------- */
    $scope.cal = function(keyEnter, IssueQty){

        if($scope.data.IssueQty && $scope.data.IssueQty != '-')
        {
            var _balance = parseFloat($scope.data.Qty) - parseFloat(IssueQty);

            if(_balance < 0)
            {
                $scope.data.IssueQty = null;
                $scope.data.BalanceQty = $scope.data.Qty;
                AppService.err('แจ้งเตือน', 'จำนวนเบิกมากกว่าของที่มีอยู่!', 'IssueQty');
                return;
            }
            else
            {
                $scope.data.BalanceQty = parseFloat($scope.data.Qty) - parseFloat(IssueQty);

                if($scope.data.BalanceQty > _qty_bal)
                {
                    $scope.data.IssueQty = null;
                    $scope.data.BalanceQty = $scope.data.Qty;
                    AppService.err('แจ้งเตือน', 'จำนวนคงเหลือมากกว่าของที่มีอยู่!', 'IssueQty');
                    return;
                }
               
            }
        }
        else
        {
            $scope.data.BalanceQty = $scope.data.Qty;
        }

        if (keyEnter === 13) {
            $scope.save();
        }

    }

})

.controller('Production_PackToPalletCtrl', function($scope, $rootScope, $ionicPopup,  $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {
	
    /*--------------------------------------
	Data Function
	--------------------------------------*/
    $scope.data = {};
    $scope.datatablesList = {};
    $scope.datatablesListLength = 0;
    $scope.getBaggingOrderHeaderList = {};
    $scope.isDisable_PD = false;

    var keyCnt = 0;

    var BaggingOrder_Index  = null;
    var BaggingOrder_No     = null;
    
	var _sku_index 	        = null;
	var _plot 	            = null;
	var _lot 	            = null;
    var _roll 			    = null;
    var _pos 		        = null;
    var _i 			        = null;
    var _leng_roll 			= null;
  
	var clearData = function () {
        $scope.data = {};
        $scope.datatablesList = {};
        $scope.datatablesListLength = 0;
        $scope.getBaggingOrderHeaderList = {};
        $scope.isDisable_PD = false;

        BaggingOrder_Index  = null;
        BaggingOrder_No     = null;

        _sku_index 	        = null;
        _plot 	            = null;
        _lot 	            = null;
        _roll 			    = null;
        _pos 		        = null;
        _i 			        = null;
        _leng_roll 			= null; 
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

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    /*--------------------------------------
	Call API getBaggingOrderHeader
	------------------------------------- */
    var getBaggingOrderHeader_API = function()
    {
		AppService.startLoading();

		App.API('getBaggingOrderHeader', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: ""
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.getBaggingOrderHeaderList = resDataSet;
    
                $scope.changePD(resDataSet[0].BaggingOrder_Index+','+resDataSet[0].BaggingOrder_No);
                
			}

		}).catch(function (res) {
			AppService.err('getBaggingOrderHeader', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    getBaggingOrderHeader_API();

    /*--------------------------------------
	Call API getGridView_Roll
	------------------------------------- */
    var getGridView_Roll_API = function(whereSql)
    {
		AppService.startLoading();

		App.API('getGridView_Roll', {
			objsession: angular.copy(LoginService.getLoginData()),
			whereSql: whereSql
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.datatablesList = resDataSet;
                $scope.datatablesListLength = Object.keys(resDataSet).length;
                $scope.Count = $scope.datatablesListLength;
                
			}

		}).catch(function (res) {
			AppService.err('getGridView_Roll', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    /*--------------------------------------
    Event Function changePD 
    ------------------------------------- */
    $scope.changePD = function(strBaggingOrder) {

        $scope.data.PD = strBaggingOrder;

        var BaggingOrder = strBaggingOrder.split(',');

        BaggingOrder_Index  = BaggingOrder[0];
        BaggingOrder_No     = BaggingOrder[1];

        loadPD(BaggingOrder_Index);

    };

    function loadPD(BaggingOrder_Index) {
        try {

            AppService.startLoading();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!BaggingOrder_Index) {

                $scope.data = {};

                AppService.stopLoading();

                return;

            } else {


                var res_getBaggingOrderHeader = getBaggingOrderHeader(objsession, " And BaggingOrder_Index = '" + BaggingOrder_Index + "' ");

                res_getBaggingOrderHeader.then(function(res){

                    var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        _plot           = resDataSet[0].PLot;
                        _sku_index      = resDataSet[0].Sku_Index;
                    }

                    return  GetSKU_By_SKU_Index(objsession, _sku_index);

                }).then(function(res2){

                    var resDataSet = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        $scope.data.Grade = resDataSet[0].Sku_Id;
                    }

                    clearOD();

                    setFocus('PalletNo');

                    AppService.stopLoading();

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

    var getBaggingOrderHeader = function (objsession, pstrWhere) {
        return new Promise(function (resolve, reject) {

            App.API('getBaggingOrderHeader', {
                objsession: objsession,
                pstrWhere: pstrWhere
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getBaggingOrderHeader', res));
            });

        })
    }

    var GetSKU_By_SKU_Index = function (objsession, pstrSKU_Index) {
        return new Promise(function (resolve, reject) {

            App.API('GetSKU_By_SKU_Index', {
                objsession: objsession,
                pstrSKU_Index: pstrSKU_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('GetSKU_By_SKU_Index', res));
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
		
			str = (id == 'PalletNo') ? 'กรุณา Scan Pallet No.' : 'กรุณา Scan Roll No.';

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
        else
        {
            searchRoll(dataSearch);
        }

    };

    function searchPallet(dataSearch) {
        try {

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());
            
            var res_chk_Balance_Pallet = chk_Balance_Pallet(objsession,dataSearch);
            
            var res_get_Current_Pallet = get_Current_Pallet(objsession,dataSearch);

            var res_getTagByPallet = getTagByPallet(objsession,dataSearch);

            var res_getBaggingOrderItem = getBaggingOrderItem(objsession," And Pallet_No = '" + dataSearch + "' AND (Status in (1)) ");

            var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession,dataSearch,BaggingOrder_Index);

            Promise.all([res_chk_Balance_Pallet,res_get_Current_Pallet,res_getTagByPallet,res_getBaggingOrderItem,res_getSumWeightBaggingOrderItem]).then(function(res){

                var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;
                
                var resDataSet2 = (!res[2]['diffgr:diffgram']) ? {} : res[2]['diffgr:diffgram'].NewDataSet.Table1;

                var resDataSet3 = (!res[3]['diffgr:diffgram']) ? {} : res[3]['diffgr:diffgram'].NewDataSet.Table1;

                var resDataSet4 = (!res[4]['diffgr:diffgram']) ? {} : res[4]['diffgr:diffgram'].NewDataSet.Table1;

                if(res[0])
				{
                    clearOD();
					AppService.err('แจ้งเตือน', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin!', 'PalletNo');
					return;
				}

                if(Object.keys(resDataSet).length <= 0)
				{
                    clearOD();
					AppService.err('แจ้งเตือน', 'ไม่พบ Pallet นี้ในระบบ หรือ ไม่พบเอกสารอ้างอิง Pallet นี้!', 'PalletNo');
					return;
                }
                
                if(resDataSet[0].PalletStatus_id != 'EM' && resDataSet[0].PalletStatus_id != 'BG')
				{
                    clearOD();
					AppService.err('แจ้งเตือน', 'สถานะ Pallet นี้ ไม่ใช่ EM หรือ BG!', 'PalletNo');
					return;
                }
                
                if(Object.keys(resDataSet2).length > 0)
				{
                    clearOD();
					AppService.err('แจ้งเตือน', 'Palletนี้กำลังใช้งาน!', 'PalletNo');
					return;
                }

                if(Object.keys(resDataSet3).length <= 0)
				{
                    $scope.isDisable_PD = false;
                    $scope.datatablesList = {};
                    $scope.datatablesListLength = 0;
                    $scope.Count = 0;
                    $scope.data.RollNo = null;
                    _i = 0;
                    setFocus('RollNo');
                    AppService.stopLoading();
					return;
                }

                var by_product = (resDataSet3[0].Roll_No).indexOf("W");

                if(by_product != -1)
                {
                    $scope.isDisable_PD = true;
                    $scope.data.RollNo = null;
                    _i = 0;
                    getGridView_Roll_API(" WHERE Pallet_No = '" + dataSearch + "' and tb_BaggingOrderItem.Status = 1 ");
                    setFocus('RollNo');
                    AppService.stopLoading();
                    return;
                }

                if(resDataSet3[0].BaggingOrder_Index != BaggingOrder_Index)
                {
                    clearOD();
					AppService.err('แจ้งเตือน', 'Roll ที่อยู่ใน Pallet นี้ไม่อยู่ใน BagOrder ที่เลือก!', 'PalletNo');
					return;
                }

                $scope.isDisable_PD = false;
                $scope.data.RollNo = null;
                getGridView_Roll_API(" WHERE Pallet_No = '" + dataSearch + "' AND tb_BaggingOrder.BaggingOrder_No = '" + BaggingOrder_No + "' ");
                $scope.Count = resDataSet4[0].Count_Pallet;
                _i = 0;
                setFocus('RollNo');
                AppService.stopLoading();
                return

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

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            _pos 	= dataSearch.indexOf("R");
			_lot 	= dataSearch.substring(0, _pos);
            _roll 	= dataSearch.substring(_pos+1);

            var by_product = _roll.indexOf("W");

            if(by_product != -1)
            {
                //check ว่า Pallet นี้เก็บ W หรือป่าว
                var countW = 0;
                if($scope.datatablesListLength > 0)
                {
                    for (var x in $scope.datatablesList) {
                    
                        if(($scope.datatablesList[x].Roll_No).indexOf("W") != -1)
                        {
                            countW++;
                        }
    
                    }

                    if(countW <= 0)
                    {
                        $scope.data.RollNo = null;
                        AppService.err('แจ้งเตือน', 'Pallet นี้เก็บเฉพาะม้วนที่ไม่ใช่ By Product!', 'RollNo');
                        return;
                    }
                }

                var strWhere = " And BaggingOrder_Index in ( select tb_BaggingOrder.BaggingOrder_Index from tb_BaggingOrder inner join tb_BaggingOrderItem on  tb_BaggingOrder.BaggingOrder_Index = tb_BaggingOrderItem.BaggingOrder_Index ";
                strWhere += " where Plot = '" + _lot + "' and Roll_No = '" + _roll + "' ) AND Roll_No = '" + _roll + "' AND (Status in (1)) AND Pallet_No <> '' ";

                var strWhere2 = " And BaggingOrder_Index in ( select tb_BaggingOrder.BaggingOrder_Index from tb_BaggingOrder inner join tb_BaggingOrderItem on  tb_BaggingOrder.BaggingOrder_Index = tb_BaggingOrderItem.BaggingOrder_Index ";
                strWhere2 += " where Plot = '" + _lot + "' and Roll_No = '" + _roll + "' ) AND Roll_No = '" + _roll + "' AND (Status in (1)) AND Pallet_No = '' ";

                var res_getBaggingOrderItem = getBaggingOrderItem(objsession, strWhere);

                var res_getBaggingOrderItem2 = getBaggingOrderItem(objsession, strWhere2);

                Promise.all([res_getBaggingOrderItem,res_getBaggingOrderItem2]).then(function(res){

                    var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                    var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    //เช็คว่าในมี Roll ซ้ำกันไหม
                    if(Object.keys(resDataSet).length > 0)
                    {
                        $scope.data.RollNo = null;
                        AppService.err('แจ้งเตือน', 'มี Roll นี้ใน Pallet ' + resDataSet[0].Pallet_No + ' แล้ว!', 'RollNo');
                        return false;
                    }

                    if(Object.keys(resDataSet2).length <= 0)
                    {
                        $scope.data.RollNo = null;
                        AppService.err('แจ้งเตือน', 'ไม่มี Roll นี้ใน ' + _lot + ' !', 'RollNo');
                        return false;
                    }

                    var res_updatePalletToBaggingOrderItem = updatePalletToBaggingOrderItem(objsession, $scope.data.PalletNo, resDataSet2[0].BaggingOrder_Index, _roll);

                    var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession, $scope.data.PalletNo, 'w');

                    return Promise.all([res_updatePalletToBaggingOrderItem,res_getSumWeightBaggingOrderItem]);


                }).then(function(res2){

                    if(res2 === false)
                    {
                        return false;
                    }

                    var resDataSet = (!res2[1]['diffgr:diffgram']) ? {} : res2[1]['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        var res_updatePalletSumWeight =  updatePalletSumWeight(objsession, $scope.data.PalletNo, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, '1', '', '');

                        return res_updatePalletSumWeight.then(function(res){

                            getGridView_Roll_API(" WHERE Pallet_No = '" + $scope.data.PalletNo + "' and tb_BaggingOrderItem.Status = 1 ");

                            return true;

                        })
                    }

                    return true;

                }).then(function(res3){

                    if(res3 === false)
                    {
                        AppService.stopLoading();
                        return;
                    }

                    $scope.isDisable_PD = true;
                    $scope.data.RollNo = null;
                    setFocus('RollNo');
                    AppService.stopLoading();
                    return;         

                }).catch(function (error) {
                    console.log("Error occurred");
                    AppService.err('Error', 'Error occurred', '');
                    return;
                });

            }
            else
            {

                if($scope.isDisable_PD)
                {
                    $scope.data.RollNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้รับเฉพาะ By Product!', 'RollNo');
                    return;
                }

                //เช็คว่า lot ที่ยิงกับ bagoutorder ตรงกันไหม
                if(_lot != _plot)
                {
                    $scope.data.RollNo = null;
                    AppService.err('แจ้งเตือน', 'Lot ไม่ตรงกัน!', 'RollNo');
                    return;
                }

                var res_getBaggingOrderItem = getBaggingOrderItem(objsession, " And BaggingOrder_Index = '" + BaggingOrder_Index + "' AND Roll_No = '" + _roll + "' AND (Status in (1)) ");

                var res_getBaggingOrderItem2 = getBaggingOrderItem(objsession, " And BaggingOrder_Index = '" + BaggingOrder_Index + "' AND Roll_No = '" + _roll + "' AND (Status in (1)) AND Pallet_No <> '' ");

                var res_getBaggingOrderItem3 = getBaggingOrderItem(objsession, " And BaggingOrder_Index = '" + BaggingOrder_Index + "' AND Roll_No = '" + _roll + "' AND (Status in (1)) ");

                Promise.all([res_getBaggingOrderItem,res_getBaggingOrderItem2,res_getBaggingOrderItem3]).then(function(res){

                    var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                    var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    var resDataSet3 = (!res[2]['diffgr:diffgram']) ? {} : res[2]['diffgr:diffgram'].NewDataSet.Table1;

                    //เช็คว่าใน bagoutorder มี roll นี้อยู่จริงหรือป่าว
                    if(Object.keys(resDataSet).length <= 0)
                    {
                        $scope.data.RollNo = null;
                        AppService.err('แจ้งเตือน', 'Roll นี้ไม่ได้อยู่ใน BagOrder!', 'RollNo');
                        return;
                    }

                    //เช็คว่าในมี Roll ซ้ำกันไหม
                    if(Object.keys(resDataSet2).length > 0)
                    {
                        $scope.data.RollNo = null;
                        AppService.err('แจ้งเตือน', 'มี Roll นี้ใน Pallet ' + resDataSet2[0].Pallet_No + ' เเล้ว !', 'RollNo');
                        return;
                    }

                    if(_i == 1)
                    {
                        //รอบ 2
                        return updateRoll2(resDataSet3);

                    }
                    else
                    {
                        //รอบ 1
                        return updateRoll1(resDataSet3);

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

    function updateRoll1(resDataSet3)
    {
        try {

            var objsession = angular.copy(LoginService.getLoginData());

            var fag = null;

            //check grade in pallet
            if($scope.datatablesListLength > 0)
            {
                var res_getGridView_Roll = getGridView_Roll(objsession, " WHERE Pallet_No = '" + $scope.data.PalletNo + "' AND tb_BaggingOrder.BaggingOrder_No = '" + BaggingOrder_No + "' ");

                fag = res_getGridView_Roll.then(function(res){

                    var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet).length > 0)
                    {
                        if(resDataSet[0].Roll_No.length == 4 && _roll.length != 4)
                        {
                            $scope.data.RollNo = null;
                            AppService.err('แจ้งเตือน', 'เฉพาะ Premium!', 'RollNo');
                            return false;
                        }
                        else if(resDataSet[0].Roll_No.length != 4 && _roll.length == 4)
                        {
                            $scope.data.RollNo = null;
                            AppService.err('แจ้งเตือน', 'เฉพาะที่ไม่ใช่ Premium!', 'RollNo');
                            return false;
                        }
                    }

                    return true;

                })

            }

            if(!fag)
            {
                return;
            }

            var res_updatePalletToBaggingOrderItem = updatePalletToBaggingOrderItem(objsession, $scope.data.PalletNo, BaggingOrder_Index, _roll);

            var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession, $scope.data.PalletNo, BaggingOrder_Index);

            return Promise.all([res_updatePalletToBaggingOrderItem,res_getSumWeightBaggingOrderItem]).then(function(res){

                var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length > 0)
                {

                    var res_updatePalletSumWeight =  updatePalletSumWeight(objsession, $scope.data.PalletNo, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, '1', _lot, _sku_index);

                    return res_updatePalletSumWeight.then(function(res){

                        getGridView_Roll_API(" WHERE Pallet_No = '" + $scope.data.PalletNo + "' AND tb_BaggingOrder.BaggingOrder_No = '" + BaggingOrder_No + "' ");
                        $scope.Count = resDataSet[0].Count_Pallet;
                        return true;

                    })
                }

                return true;

            }).then(function(res2){

                $scope.data.RollNo = null;
                _i = 1;
                _leng_roll = resDataSet3[0].Roll_No;
                setFocus('RollNo');
                AppService.stopLoading();
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

    function updateRoll2(resDataSet3)
    {
        try {

            var objsession = angular.copy(LoginService.getLoginData());

            var strRoll = resDataSet3[0].Roll_No;

            if(_leng_roll.length == 4 && strRoll.length != 4)
            {
                $scope.data.RollNo = null;
                AppService.err('แจ้งเตือน', 'เฉพาะ Premium!', 'RollNo');
                return;
            }

            if(_leng_roll.length != 4 && strRoll.length == 4)
            {
                $scope.data.RollNo = null;
                AppService.err('แจ้งเตือน', 'เฉพาะที่ไม่ใช่ Premium!', 'RollNo');
                return;
            }

            var res_updatePalletToBaggingOrderItem = updatePalletToBaggingOrderItem(objsession, $scope.data.PalletNo, BaggingOrder_Index, _roll);

            var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession, $scope.data.PalletNo, BaggingOrder_Index);

            return Promise.all([res_updatePalletToBaggingOrderItem,res_getSumWeightBaggingOrderItem]).then(function(res){

                var resDataSet = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length > 0)
                {

                    var res_updatePalletSumWeight =  updatePalletSumWeight(objsession, $scope.data.PalletNo, resDataSet[0].Sum_Qty, resDataSet[0].Sum_Weight, '1', _lot, _sku_index);

                    return res_updatePalletSumWeight.then(function(res){

                        getGridView_Roll_API(" WHERE Pallet_No = '" + $scope.data.PalletNo + "' AND tb_BaggingOrder.BaggingOrder_No = '" + BaggingOrder_No + "' ");
                        $scope.Count = resDataSet[0].Count_Pallet;
                        return true;

                    })
                }

                return true;

            }).then(function(res2){

                $scope.data.RollNo = null;
                setFocus('RollNo');
                AppService.stopLoading();
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

    var getSumWeightBaggingOrderItem = function (objsession, pallet_no, baggingorder_index) {
        return new Promise(function (resolve, reject) {

            App.API('getSumWeightBaggingOrderItem', {
                objsession: objsession,
                pallet_no: pallet_no,
                baggingorder_index: baggingorder_index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getSumWeightBaggingOrderItem', res));
            });

        })
    }

    var updatePalletToBaggingOrderItem = function (objsession, pallet_no, baggingorder_index, roll) {
        return new Promise(function (resolve, reject) {

            App.API('updatePalletToBaggingOrderItem', {
                objsession: objsession,
                pallet_no: pallet_no,
                baggingorder_index: baggingorder_index,
                roll: roll
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('updatePalletToBaggingOrderItem', res));
            });

        })
    }

    var updatePalletSumWeight = function (objsession, pallet_no, count, weight, fag, lot, sku) {
        return new Promise(function (resolve, reject) {

            App.API('updatePalletSumWeight', {
                objsession: objsession,
                pallet_no: pallet_no,
                count: count,
                weight: weight,
                fag: fag,
                lot: lot,
                sku: sku
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('updatePalletSumWeight', res));
            });

        })
    }
    
    var getGridView_Roll = function (objsession, whereSql) {
        return new Promise(function (resolve, reject) {

            App.API('getGridView_Roll', {
                objsession: objsession,
                whereSql: whereSql
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getGridView_Roll', res));
            });

        })
    }

    /*--------------------------------------
    Event Function save 
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.PalletNo)
        {
			AppService.err('แจ้งเตื่อน', 'กรุณา Scan Pallet No.', 'PalletNo');
			return;
        }

        savePallet();

    }

    function savePallet() {
        try {

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'ยืนยันการบันทึกหรือไม่ ?'
            }).then(function (res) {

                if (!res) {
                    return;
                }
                else {

                    AppService.startLoading();

                    var objsession = angular.copy(LoginService.getLoginData());

                    var res_getBaggingOrderItem =  getBaggingOrderItem(objsession," And Pallet_No = '" + $scope.data.PalletNo + "' AND (Status in (1)) AND Roll_No like '%W%' ")

                    res_getBaggingOrderItem.then(function(res){

                        var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                        if(Object.keys(resDataSet).length > 0)
                        {
                            var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession, $scope.data.Pallet, 'w');

                            return res_getSumWeightBaggingOrderItem.then(function(res2){

                                var resDataSet2 = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                                if(Object.keys(resDataSet2).length <= 0)
                                {
                                    clearOD();
                                    AppService.err('แจ้งเตือน', 'Pallet หรือ BagOut ผิดพลาด!', 'PD');
                                    return false;
                                }

                                return updatePalletSumWeight(objsession, $scope.data.Pallet, resDataSet2[0].Sum_Qty, resDataSet2[0].Sum_Weight, '1', '', '');

                            }).then(function(res3){

                                if(res3 === false)
                                {
                                    AppService.stopLoading();
                                    return;
                                }

                                clearOD();
                                $scope.isDisable_PD = false;
                                AppService.succ('บันทึกจำนวน Roll เรียบร้อย', 'PD');
                                return;


                            }).catch(function (error) {
                                console.log("Error occurred");
                                AppService.err('Error', 'Error occurred', '');
                                return;
                            });
                        }
                        else
                        {
                            var res_getSumWeightBaggingOrderItem = getSumWeightBaggingOrderItem(objsession, $scope.data.Pallet, BaggingOrder_Index);

                            return res_getSumWeightBaggingOrderItem.then(function(res2){

                                var resDataSet2 = (!res2['diffgr:diffgram']) ? {} : res2['diffgr:diffgram'].NewDataSet.Table1;

                                if(Object.keys(resDataSet2).length <= 0)
                                {
                                    clearOD();
                                    AppService.err('แจ้งเตือน', 'Pallet หรือ BagOut ผิดพลาด!', 'PD');
                                    return false;
                                }

                                return updatePalletSumWeight(objsession, $scope.data.Pallet, resDataSet2[0].Sum_Qty, resDataSet2[0].Sum_Weight, '1', _plot, _sku_index);

                            }).then(function(res3){

                                if(res3 === false)
                                {
                                    AppService.stopLoading();
                                    return;
                                }

                                clearOD();
                                AppService.succ('บันทึกจำนวน Roll เรียบร้อย', 'PD');
                                return;


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
                    
                }
                
            }); 

        } catch (error) {
            console.log("Error occurred");
            AppService.err('Error', 'Error occurred', '');
            return;
        }

    }

    /*--------------------------------------
    Function clear 
    ------------------------------------- */
    function clearOD()
    {
        $scope.datatablesList = {};
        $scope.datatablesListLength = 0;
        $scope.Count = 0;
        $scope.data.PalletNo = null;
        $scope.data.RollNo = null;

    }



})

.controller('Production_DeleteRollCtrl', function($scope, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    /*--------------------------------------
	Data Function
	--------------------------------------*/
    $scope.data = {};
    $scope.getBaggingOrderHeaderList = {};

    var keyCnt = 0;

    var BaggingOrder_Index  = null;
    var BaggingOrder_No     = null;
    
	var _lot 	            = null;
    var _roll 			    = null;
    var _pos 		        = null;
    var _baggingorderitem_index = null;
  
	var clearData = function () {
        $scope.data = {};
        $scope.getBaggingOrderHeaderList = {};

        BaggingOrder_Index  = null;
        BaggingOrder_No     = null;

        _lot 	            = null;
        _roll 			    = null;
        _pos 		        = null;
        _baggingorderitem_index = null;
	};

	var setFocus = function (id) {
		AppService.focus(id);
	}

	var findByValue = function (object, key, value, isOptions) {
		return AppService.findObjValue(object, key, value, isOptions);
	};

	clearData();

	$scope.$on('$ionicView.enter', function () {
		setFocus('RollNo');
    });

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    /*--------------------------------------
	Call API getBaggingOrderHeader
	------------------------------------- */
    var getBaggingOrderHeader_API = function()
    {
		AppService.startLoading();

		App.API('getBaggingOrderHeader', {
			objsession: angular.copy(LoginService.getLoginData()),
			pstrWhere: ""
		}).then(function (res) {

			var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

			if (Object.keys(resDataSet).length > 0) {

                $scope.getBaggingOrderHeaderList = resDataSet;
    
                $scope.changePD(resDataSet[0].BaggingOrder_Index+','+resDataSet[0].BaggingOrder_No);
                
			}

		}).catch(function (res) {
			AppService.err('getBaggingOrderHeader', res);
		}).finally(function (res) {
			AppService.stopLoading();
		});
    }

    getBaggingOrderHeader_API();

    /*--------------------------------------
    Event Function changePD 
    ------------------------------------- */
    $scope.changePD = function(strBaggingOrder) {

        $scope.data.PD = strBaggingOrder;

        var BaggingOrder = strBaggingOrder.split(',');

        BaggingOrder_Index  = BaggingOrder[0];
        BaggingOrder_No     = BaggingOrder[1];

        clearOD();
        setFocus('RollNo');

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
		
			str = 'กรุณา Scan Roll No.';

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
        
        searchRoll(dataSearch);

    };

    function searchRoll(dataSearch) {
        try {

            AppService.startLoading();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            _pos 	= dataSearch.indexOf("R");
			_lot 	= dataSearch.substring(0, _pos);
            _roll 	= dataSearch.substring(_pos+1);

            var res_getDeleteBaggingOrderItem = getDeleteBaggingOrderItem(objsession, BaggingOrder_Index, _lot, _roll);

            res_getDeleteBaggingOrderItem.then(function(res){

                var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if(Object.keys(resDataSet).length <= 0)
                {
                    clearOD();
                    AppService.err('แจ้งเตือน', 'ไม่มี Roll นี้ในระบบ หรือ Tranfer ไปแล้ว หรือ ถูกบันทึกใน DPR เเล้ว!', 'RollNo');
                    return;
                }

                $scope.data.SKU = resDataSet[0].Sku_Id_T;
                $scope.data.PLot = resDataSet[0].PLot_T;
                $scope.data.Pallet = resDataSet[0].Pallet_No_T;
                $scope.data.Status_Pallet = resDataSet[0].PalletStatus_Id_T;
                $scope.data.Weight = resDataSet[0].Weight_Act_T;
                $scope.data.Length = resDataSet[0].Qty_T;
                $scope.data.Status_Tranfer = resDataSet[0].Status_Tranfer_T;
                _baggingorderitem_index = resDataSet[0].BaggingOrderItem_Index;

                AppService.stopLoading();

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

    var getDeleteBaggingOrderItem = function (objsession, index, lot, roll) {
        return new Promise(function (resolve, reject) {

            App.API('getDeleteBaggingOrderItem', {
                objsession: objsession,
                index: index,
                lot: lot,
                roll: roll
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getDeleteBaggingOrderItem', res));
            });

        })
    }

    /*--------------------------------------
    Event Function save 
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.RollNo)
        {
			AppService.err('แจ้งเตื่อน', 'กรุณา Scan Roll No.', 'RollNo');
			return;
        }

        savePallet();

    }

    function savePallet() {
        try {

            $ionicPopup.confirm({
                title: 'Confirm',
                template: 'ยืนยันการลบหรือไม่ ?'
            }).then(function (res) {

                if (!res) {
                    return;
                }
                else {

                    AppService.startLoading();

                    var objsession = angular.copy(LoginService.getLoginData());

                    var res_deleteBaggingOrderItem =  deleteBaggingOrderItem(objsession, _baggingorderitem_index);

                    res_deleteBaggingOrderItem.then(function(res){

                        clearOD();
                        AppService.succ('ลบเรียบร้อย', 'RollNo');
			            return;  

                    }).catch(function (error) {
                        console.log("Error occurred");
                        AppService.err('Error', 'Error occurred', '');
                        return;
                    });
                    
                }
                
            }); 

        } catch (error) {
            console.log("Error occurred");
            AppService.err('Error', 'Error occurred', '');
            return;
        }

    }

    var deleteBaggingOrderItem = function (objsession, baggingorderitem_index) {
        return new Promise(function (resolve, reject) {

            App.API('deleteBaggingOrderItem', {
                objsession: objsession,
                baggingorderitem_index: baggingorderitem_index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('deleteBaggingOrderItem', res));
            });

        })
    }

    /*--------------------------------------
    Function clear 
    ------------------------------------- */
    function clearOD(){

        $scope.data.SKU = null;
        $scope.data.PLot = null;
        $scope.data.Pallet = null;
        $scope.data.Status_Pallet = null;
        $scope.data.Weight = null;
        $scope.data.Length = null;
        $scope.data.Status_Tranfer = null;
        $scope.data.RollNo = null;

    }
    

});