/**
 * Menu_MainMenu.Controllers Module
 *
 * Description
 */
angular.module('Menu_MainMenu.Controllers', ['ionic'])

.controller('Menu_NewInUnwireCtrl', function($ionicLoading, App, AppService, LoginService, Menu_MainMenuService, $filter, $scope, $state, $ionicPopup, $cordovaBarcodeScanner, $ionicScrollDelegate) {

    $scope.data = {};
    $scope.getOrderTopicList = {};
    $scope.getTagOrderIndexList = {};
    $scope.getTagOrderIndexList.length = 0;
    $scope.isDisable = false;
    var Order_No, Order_Index;
    var isExit = true;
    var keyCnt = 0;

    $scope.data.PalletCount_itemPutAway = 0;
    $scope.data.PalletCount_itemALL = 0;
   


    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){
        $ionicLoading.show();
        var pstrWhere = "And Brand_Index in  ('0010000000001')" +
                    "And (ms_DocumentType.DocumentType_Index IN ('0010000000002','0010000000003'))" +
                    "And ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0)"+
                    "And tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 )";
        App.API('GetOrderTopic', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: pstrWhere 
        }).then(function(res) {
            $scope.getOrderTopicList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',$scope.getOrderTopicList);
        }).catch(function(res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function(res) {       
            $ionicLoading.hide();
        });
    };
    $scope.GetOrderTopic_API();
    


    /*--------------------------------------
    changeTF Function
    ------------------------------------- */
    $scope.changeTF = function(value) {

        isExit = true;
        $scope.isDisable = false;

        if (!value) {
            $scope.data = {};
            $scope.getTagOrderIndexList = {};
            $scope.getTagOrderIndexList.length = 0;
            Menu_MainMenuService.dataDetailOrder = {};
        } else {

            $scope.data.TF = value;
            var order = value.split(',');
            Order_No = order[0]; //'5550RC1409001';//Fix order[0]; 
            Order_Index = order[1]; //'0010000005631';////'0010000038619';//Fix order[1];

            $ionicLoading.show();

            App.API('GetDetailOrder', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: "and tb_Order.Order_Index = '" + Order_Index + "'"
            }).then(function(res) {

                var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0]; //[2351];  //fix test [0]
                console.log('changeTF res = ',dataDetailOrder);
                Menu_MainMenuService.dataDetailOrder = dataDetailOrder;
                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
                // $scope.data.PalletCount = (!dataDetailOrder.itemPutAway) ? 0 : dataDetailOrder.itemPutAway + '/' + (!dataDetailOrder.itemALL) ? 0 : dataDetailOrder.itemALL;
                $scope.data.PalletCount_itemPutAway =  dataDetailOrder.itemPutAway;
                $scope.data.PalletCount_itemALL = dataDetailOrder.itemALL;
                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;
                
                if (Object.keys(dataDetailOrder).length > 0 && dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
                    $ionicLoading.hide();
                    $scope.isDisable = true;
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'ถูกจัดเก็บเรียบร้อยแล้ว'
                    }).then(function(err) {});
                }

            }).catch(function(res) {
                isExit = false;
                AppService.err('GetDetailOrder', res);
            }).finally(function(res) {

                if (isExit) {

                    App.API('getTag_OrderIndex_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pOrder_Index: Order_Index
                    }).then(function(res) {
                       
                        var getTagOrderIndexList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        $scope.getTagOrderIndexList = getTagOrderIndexList;
                        $scope.getTagOrderIndexList.length = Object.keys(getTagOrderIndexList).length;
                        console.log('res = ',$scope.getTagOrderIndexList)
                    }).catch(function(res) {
                        AppService.err('getTag_OrderIndex_TPIPL', res);
                    }).finally(function(res) {
                       
                        $ionicLoading.hide();
                        AppService.focus('input-PalletNoBar');
                    });
                }

            });  //End GetDetailOrder

        }

    }; //End changeTF Function


    /*--------------------------------------
    saveNewInUnwire Function
    ------------------------------------- */
    $scope.saveNewInUnwire = function(dataArr,searchType) {
       var barcodeVal = dataArr.PalletBarcode;
       if(searchType=='read barcode'){
			keyCnt += 1;
			var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
			console.log('current inut text length: ' + curTextCount);
			console.log('current inut keyCnt: ' + keyCnt);
			if(keyCnt==1 && curTextCount>1){

				//console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
				$scope.data.PalletSearchFlag = "yes";
			}else{
				$scope.data.PalletSearchFlag = "no";// set flag to stop search
			}
			console.log('flag is '+ $scope.data.PalletSearchFlag );
			if($scope.data.PalletSearchFlag == 'no'){
				$scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
				console.log('exit seach');
				return;
			}
		}
			keyCnt = 0;
        console.log('saveNewInUnwire function =',dataArr);
        isExit = true;

        if (!dataArr.TF){
            AppService.err('', 'กรุณาเลือกใบรับสินค้า');
        }else if (!dataArr.PalletBarcode){
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!','input-PalletNoBar');
        }else if (Object.keys($scope.getTagOrderIndexList).length == 0){
            $scope.data.PalletBarcode = null;
            AppService.err('', 'ไม่มีรายการในใบรับนี้','input-PalletNoBar');
        }
        if (dataArr.TF && dataArr.PalletBarcode && Object.keys($scope.getTagOrderIndexList).length > 0) {
            $ionicLoading.show();
           
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataArr.PalletBarcode //AS0002 Fix 
            }).then(function(res) {

                var getTagByPallet = res['diffgr:diffgram'];
                if (getTagByPallet && Object.keys(res['diffgr:diffgram'].NewDataSet.Table1).length > 0) {
                     $scope.data.PalletBarcode = null;
                    console.log('Main_menu_getTagByPallet::3');
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน','input-PalletNoBar');
                    isExit = false;
                }

            }).catch(function(res) {
                isExit = false;
                AppService.err('getTagByPallet', res);
            }).finally(function(res) {

                var HoldFlag = '',
                    Total_Qty = '';

                //if (isExit && dataArr.BaggingOrder_index != null ) {
                if (isExit) {
                    App.API('getQtyPerPallet_BY_BGorder_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: dataArr.PalletBarcode, //'AS0132',//dataArr.PalletBarcode,
                        pBGOrder_index: dataArr.BaggingOrder_index, //'0010000005046',// dataArr.BaggingOrder_index
                    }).then(function(res) {
                        var getQtyPerPallet_BY_BGorder_TPIPL = res['diffgr:diffgram'];
                        if (!getQtyPerPallet_BY_BGorder_TPIPL || (getQtyPerPallet_BY_BGorder_TPIPL && Object.keys(getQtyPerPallet_BY_BGorder_TPIPL.NewDataSet.Table1).length <= 0)) {
                             $scope.data.PalletBarcode = null;
                            AppService.err('', 'Pallet นี้ ไม่อยู่ในใบ Bag Out Order หรือจัดเก็บไปแล้ว','input-PalletNoBar');
                            isExit = false;
                        } else {

                            if (getQtyPerPallet_BY_BGorder_TPIPL.NewDataSet.Table1[0].HoldFlag) {
                                $scope.data.Description = getQtyPerPallet_BY_BGorder_TPIPL.NewDataSet.Table1[0].HoldFlag;
                            }

                            HoldFlag = getQtyPerPallet_BY_BGorder_TPIPL.NewDataSet.Table1[0].HoldFlag;
                            Total_Qty = getQtyPerPallet_BY_BGorder_TPIPL.NewDataSet.Table1[0].Total_Qty;
                        }

                    }).catch(function(res) {
                        isExit = false;
                        AppService.err('getQtyPerPallet_BY_BGorder_TPIPL', res);
                    }).finally(function(res) {

                        if (isExit) {
                           

                            App.API('FindLocationAndInsert_NewIn', {
                                objsession: angular.copy(LoginService.getLoginData()),
                                pstrPallet_No: dataArr.PalletBarcode,
                                pstrOrder_Index: Order_Index,
                                pdblQty_Per_Tag: (Total_Qty) ? Total_Qty : 0, //'0010000039949', //Fix
                                pstrHoldFlag: (HoldFlag) ? HoldFlag : '' //Fix
                            }).then(function(res) {
                               

                                var FindLocationAndInsert_NewIn = res;
                                console.log('res = ',res);
                                // if(FindLocationAndInsert_NewIn == 'True'){
                                if (FindLocationAndInsert_NewIn) {
                                    AppService.succ('เก็บเรียบร้อย');
                                    $scope.data.PalletNo = angular.copy(dataArr.PalletBarcode);
                                    $scope.data.PalletBarcode = null;
                                }
                            }).catch(function(res) {
                                isExit = false;
                                AppService.err('FindLocationAndInsert_NewIn', res);
                            }).finally(function(res) {
                               

                                if (isExit) {
                                    App.API('getTag_Sum', {
                                        objsession: angular.copy(LoginService.getLoginData()),
                                        pOrder_Index: Order_Index, //'5120TS1700156', //Fix
                                        Pallet_No: angular.copy($scope.data.PalletNo), //'WP0678', //Fix
                                    }).then(function(res) {                                       

                                        var getTag_Sum = res['diffgr:diffgram'];
                                        if (getTag_Sum) {
                                            getTag_Sum = res['diffgr:diffgram'].NewDataSet.Table1[0];
                                            $scope.data.CountTagRoll = getTag_Sum.Count_Tag;
                                            $scope.data.WeightTagKG = getTag_Sum.Weight_Tag;
                                            $scope.data.QtyTagM = getTag_Sum.Qty_Tag;
                                        }
                                    }).catch(function(res) {
                                        isExit = false;
                                        AppService.err('getTag_Sum', res);
                                    }).finally(function(res) {
                                       

                                        if (isExit) {
                                           
                                            App.API('updatePalletSumWeight', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pallet_no: angular.copy($scope.data.PalletNo), // '0010000853620' Fix
                                                count: angular.copy($scope.data.QtyTagM), // 999 Fix
                                                weight: angular.copy($scope.data.WeightTagKG), // 999 Fix
                                                fag: 'NewIn_V2', //Fix
                                                lot: '', //Fix
                                                sku: ''
                                            }).then(function(res) {
                                               
                                            }).catch(function(res) {
                                                isExit = false;
                                                AppService.err('updatePalletSumWeight', res);
                                            }).finally(function(res) {
                                               

                                                if (isExit) {
                                                    App.API('getTag_Detail_Putaway_TPIPL', {
                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                        pOrder_Index: Order_Index, //0010000055219 Fix
                                                    }).then(function(res) {
                                                        var getTag_Detail_Putaway_TPIPL = res['diffgr:diffgram'];
                                                        if (getTag_Detail_Putaway_TPIPL) {

                                                            getTag_Detail_Putaway_TPIPL = res['diffgr:diffgram'].NewDataSet.Table1[0];

                                                            $scope.data.SkuID = getTag_Detail_Putaway_TPIPL.sku_Id;
                                                            $scope.data.Lot = getTag_Detail_Putaway_TPIPL.plot;
                                                            $scope.data.OrderDate = $filter('date')(getTag_Detail_Putaway_TPIPL.Order_Date, 'dd/MM/yyyy');
                                                            $scope.data.CountTagRoll = getTag_Detail_Putaway_TPIPL.qty_per_tag;
                                                            $scope.data.StartStatus = 'BG';
                                                            $scope.data.EndStatus = 'WH';
                                                            $scope.data.LocationAlias = getTag_Detail_Putaway_TPIPL.location_alias;
                                                            if (!angular.copy($scope.data.Description))
                                                                $scope.data.Description = getTag_Detail_Putaway_TPIPL.Description;

                                                        }
                                                    }).catch(function(res) {
                                                        isExit = false;
                                                        AppService.err('getTag_Detail_Putaway_TPIPL', res);
                                                    }).finally(function(res) {
                                                        $scope.changeTF($scope.data.TF);
                                                        $ionicLoading.hide();
                                                    });
                                                }

                                            });
                                        }

                                    });
                                }

                            });
                        }

                    });
                }

                $ionicLoading.hide();
            });


        }

    };


    /*--------------------------------------
    scanBarcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(dataArr) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.saveNewInUnwire(dataArr,'');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };

})


.controller('Menu_NewInUnwireBPCtrl', function($ionicLoading, $scope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {

    $scope.IndexSelected = null;
    $scope.NoSelected = null;
    $scope.orderTopicList = null;
    $ionicLoading.show();
	var keyCnt = 0;

    /*--------------------------------------
    selected Function
    ------------------------------------- */
    $scope.selected = function(IndexSelected, NoSelected) {
        if (!IndexSelected) {
            AppService.err('', 'ยังไม่ได้เลือกรายการ');
        } else {
            $state.go('mainMenu_NewInUnwireBP_Selected', { Order_Index: IndexSelected, Order_No: NoSelected });
        }
    };


    /*--------------------------------------
    setSelected Function
    ------------------------------------- */
    $scope.setSelected = function(OrderIndex, OrderNo) {
        $scope.IndexSelected = OrderIndex;
        $scope.NoSelected = OrderNo;
    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    App.API('GetOrderTopic', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "And Brand_Index not in ('0010000000001') " +
            "And (ms_DocumentType.DocumentType_Index IN ('0010000000002','0010000000003')) " +
            "AND tb_Order.Customer_Index in ( " +
            "  select  Customer_Index from x_Department_Customer " +
            "  where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)"
    }).then(function(res) {
        var orderTopicList = (!res['diffgr:diffgram']) ? null : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.orderTopicList = orderTopicList;
        $scope.orderTopicList.length = (orderTopicList) ? Object.keys(orderTopicList).length : 0;
    }).catch(function(res) {
        AppService.err('GetOrderTopic', res);
    }).finally(function() {
        $ionicLoading.hide();
       
    });

})


.controller('Menu_NewInUnwireBP_SelectedCtrl', function($cordovaBarcodeScanner, $ionicLoading, $scope, $state, $stateParams, LoginService, App, AppService, $ionicPopup) {

    $scope.data = {};
    $scope.dsTAG3List = 0;
    $scope.dsTAG2List = 0;
    var Order_Index = $stateParams.Order_Index;
    var Order_No = $scope.data.OrderNo = $stateParams.Order_No;
    var sudOrderNo = null;
    var isFinish = true;
	var keyCnt = 0;

    /*--------------------------------------
    Load Form Function
    ------------------------------------- */
    var loadForm = function() {
        $ionicLoading.show();
        App.API('getTag_Receive', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {

            var dsTAG = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

            if (Object.keys(dsTAG).length > 0) {

                App.API('getTag_Receive_ShowStatus2', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pstrorder_index: Order_Index //</Order_Index>'0010000055294' Fix
                }).then(function(res) {

                    var dsTAG3 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    //
                    $scope.dsTAG3List = dsTAG3;
                    $scope.data.count = Object.keys(dsTAG3).length + '/' + Object.keys(dsTAG).length;
                    $scope.dsTAG3List.length = Object.keys(dsTAG3).length;

                }).catch(function(res) {
                    isFinish = false;
                    AppService.err('getTag_Receive_ShowStatus2', res);
                }).finally(function() {
                    
                });

            } else if (Object.keys(dsTAG).length <= 0) {
                isFinish = false;
                AppService.err('', 'กรุณาจัดการ TAG ก่อนรับเข้า');
                $scope.data = {};
                $scope.dsTAG3List = null;
                $scope.dsTAG2List = null;
            }

        }).catch(function(res) {
            isFinish = false;
            AppService.err('getTag_Receive', res);
        }).finally(function(res) {
               
            if (isFinish) {

                App.API('getTag_Receive_ShowStatus1', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pstrorder_index: Order_Index
                }).then(function(res) {

                    var dsTAG2 = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(dsTAG2).length > 0) {
                        $scope.dsTAG2List = dsTAG2;
                        $scope.dsTAG2List.length = Object.keys(dsTAG2).length;

                    } else if (Object.keys(dsTAG2).length <= 0) {
                        $scope.dsTAG2List = dsTAG2;
                        $scope.dsTAG2List.length = Object.keys(dsTAG2).length;
                        AppService.succ('จัดเก็บรายการเรียบร้อยแล้ว');
                    }

                }).catch(function(res) {
                    isFinish = false;
                    AppService.err('getTag_Receive_ShowStatus1', res);
                }).finally(function(res) {

                    if (isFinish) {
                        $ionicLoading.hide();
                        AppService.focus('input-PalletNoBar');
                    }

                });

            }

        });

    }; //end loadform FN

    
    if (Order_No && Order_Index) {
        sudOrderNo = Order_No.substring(0, 2);

        if (sudOrderNo == 'WH')
            $scope.data.LocationStorage = 'WH14';
        else
            $scope.data.LocationStorage = 'A-FLOOR';

        loadForm();

    } //end if


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(action) {
        var Result = false;
        var Check = false;
        var isError = false;
        var barcodeVal = $scope.data.PalletBarcode;

        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
            keyCnt = 0;


        /*--------------------------------------
        Save Finally Function
        ------------------------------------- */
        var saveFinally = function() {
            $ionicLoading.hide();

            if (!isError && !Check) {
                isError = true;
                AppService.err('', 'ไม่มี Pallet นี้ ในรายการ');
            }

            if (!isError && Result == 'True') {
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'เก็บเรียบร้อย'
                }).then(function(suc) {
                    if (suc){
                        loadForm();
                        $scope.data.PalletBarcode = null;
                        AppService.focus('input-PalletNoBar');
                    }else{
                        $scope.data.PalletBarcode = null;
                        AppService.focus('input-PalletNoBar');
                    }
                });

            } else if (!isError && Result != 'True') {
                AppService.err('', 'ตำแหน่งจัดเก็บไม่ถูกต้อง');
            }
        }; //end saveFinally FN

        $ionicLoading.show();

        if (!angular.copy($scope.data.PalletBarcode)) {
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!', 'input-PalletNoBar');
        } else {

            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: angular.copy($scope.data.PalletBarcode) //'AS0002'  
            }).then(function(res) {
               
                var dataTableTagByPallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',dataTableTagByPallet);

                if (Object.keys(dataTableTagByPallet).length != 0) {
                    isError = true;
                    console.log('Main_menu_getTagByPallet::4');
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน');
                    $scope.data.PalletBarcode = null;
                    $ionicLoading.hide();
                }

            }).catch(function(res) {
                isError = true;
                AppService.err('getTagByPallet', res);
            }).finally(function() {
               
                if (!isError) {
                    App.API('getQtyPerPallet_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: angular.copy($scope.data.PalletBarcode) // 'WP0018'
                    }).then(function(res) {
                       
                        var datasetQtyPerPallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res =',datasetQtyPerPallet);

                        if (Object.keys(datasetQtyPerPallet).length <= 0) {
                            isError = true;
                            AppService.err('', 'ไม่มี Pallet นี้ ในระบบ', 'input-PalletNoBar');
                            $scope.data.PalletBarcode = null;
                            $ionicLoading.hide();
                        }
                        
                    }).catch(function(res) {
                        isError = true;
                        AppService.err('getQtyPerPallet_TPIPL', res);
                    }).finally(function() {

                        if (!isError) {
                           
                            if (angular.copy($scope.data.PalletBarcode) != angular.copy($scope.dsTAG2List[0].Pallet_No)) {

                                App.API('insertForeachData_WHReceive_V2_BP', {
                                    objsession: angular.copy(LoginService.getLoginData()),
                                    pstrorder_index: Order_Index,
                                    Pallet_No: angular.copy($scope.data.PalletBarcode),
                                    Location: angular.copy($scope.data.LocationStorage)
                                }).then(function(res) {
                                    console.log('insertForeachData_WHReceive_V2_BP res = ',res);

                                    Result = res;
                                    Check = true;

                                }).catch(function(res) {
                                    isError = true;
                                    AppService.err('insertForeachData_WHReceive_V2_BP', res);
                                }).finally(function() {
                                     saveFinally();
                                });
                            
                                // App.API('FindLocationAndInsert_Receive_V2', {
                                //     objsession: angular.copy(LoginService.getLoginData()),
                                //     pPallet_No: angular.copy($scope.data.PalletBarcode), // 'WP0018'
                                //     pQtyPerPallet: angular.copy($scope.dsTAG2List[0].Qty_per_TAG),
                                //     pstrNewPalletStatus_Index: '0010000000004',
                                //     pstrTag_no: angular.copy($scope.dsTAG2List[0].Tag_No),
                                //     plot: angular.copy($scope.dsTAG2List[0].PLot),
                                //     plocation_Alias: angular.copy($scope.data.LocationStorage)
                                // }).then(function(res) {
                                   
                                //     Result = res;
                                //     Check = true;
                                //     console.log('res = ',Result);

                                // }).catch(function(res) {
                                //     isError = true;
                                //     AppService.err('FindLocationAndInsert_Receive_V2', res);
                                // }).finally(function() {

                                //    console.log('finally FindLocationAndInsert_Receive_V2');
                                //     saveFinally();

                                // });

                            } else {
                                saveFinally();
                            } // END Call API FindLocationAndInsert_Receive_V2

                        }// End if (!isError)

                    });//End Call API getQtyPerPallet_TPIPL

                }

            });

        }

    }; // end save



    /*--------------------------------------
    scanBarcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {

            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save('');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };


})


.controller('Menu_ProductGeneralCtrl', function($ionicLoading, $scope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {

    $scope.IndexSelected = null;
    $scope.NoSelected = null;
    $scope.orderTopicList = null;
    $ionicLoading.show();

    /*--------------------------------------
    selected Function
    ------------------------------------- */
    $scope.selected = function(IndexSelected, NoSelected) {
        if (!IndexSelected) {
            AppService.err('', 'ยังไม่ได้เลือกรายการ');
        } else {
            $state.go('mainMenu_ProductGeneral_Selected', { Order_Index: IndexSelected, Order_No: NoSelected });
        }
    };

    /*--------------------------------------
    setSelected Function
    ------------------------------------- */
    $scope.setSelected = function(OrderIndex, OrderNo) {
        $scope.IndexSelected = OrderIndex;
        $scope.NoSelected = OrderNo;
    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    App.API('GetOrderTopic', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "And (ms_DocumentType.DocumentType_Index not IN ('0010000000002','0010000000003')) " +
            "AND tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer " +
            "  where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)"
    }).then(function(res) {
        var orderTopicList = (!res['diffgr:diffgram']) ? null : res['diffgr:diffgram'].NewDataSet.Table1;
        console.log('res = ',orderTopicList);
        $scope.orderTopicList = orderTopicList;
        $scope.orderTopicList.length = (orderTopicList) ? Object.keys(orderTopicList).length : 0;
    }).catch(function(res) {
        AppService.err('GetOrderTopic', res);
    }).finally(function() {
        $ionicLoading.hide();
       
    });

})


.controller('Menu_ProductGeneral_SelectedCtrl', function($ionicPopup, $scope, $state, $stateParams, $ionicLoading, $cordovaBarcodeScanner, App, LoginService, AppService) {

    $scope.data = {};
    var Order_Index = $stateParams.Order_Index;
    var Order_No = $stateParams.Order_No;
    var sudOrderNo = (Order_No) ? Order_No.substring(0, 2) : null;
    var isError = false;
    var keyCnt = 0;

    /*--------------------------------------
    Load Form Function
    ------------------------------------- */
    var loadForm = function() {

        $ionicLoading.show();
        App.API('getTag_Receive', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrorder_index: Order_Index
        }).then(function(res) {

            var dsTAG = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',dsTAG);

            if (Object.keys(dsTAG).length > 0) {

                var valueArr = [];
                for (var key in dsTAG) {
                    if (dsTAG[key].itemstatus == '1') {
                        valueArr.push(dsTAG[key]);
                    }
                };

                if(valueArr != ''){
                    $scope.dsTAGList = valueArr;
                    $scope.dsTAGList.length = Object.keys(valueArr).length;
                    $scope.data.Product = valueArr[0].Str1_T;
                    $scope.data.Lot = valueArr[0].PLot;
                    $scope.data.Qty_per_TAG = valueArr[0].Qty_per_TAG;
                    $scope.data.TAG_No = valueArr[0].TAG_No;
                    $scope.data.BAG = (parseInt(valueArr[0].Qty_per_TAG) / parseInt(valueArr[0].UnitWeight_Index));
                    if (sudOrderNo == 'WH')
                        $scope.data.LocationStorage = 'WH14';
                    else
                        $scope.data.LocationStorage = 'RM_FLOOR';
                };

            } else if (Object.keys(dsTAG).length <= 0) {
                isError = true;
                AppService.err('', 'กรุณาจัดการ TAG ก่อนรับเข้า');
                $scope.data = {};
            }

        }).catch(function(res) {
            isError = true;
            AppService.err('getTag_Receive', res);
        }).finally(function(res) {
           
            $ionicLoading.hide();
            AppService.focus('input-PalletNoBar');
        });
    };//End Load Form Function


    if (Order_Index && Order_No) {
        loadForm();
    }


    /*--------------------------------------
    Save Product Function
    ------------------------------------- */
    $scope.saveProduct = function(action) {

        isError = false;
        var barcodeVal = $scope.data.PalletBarcode;
        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
            keyCnt = 0;

        if (!angular.copy($scope.data.PalletBarcode)) {
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!', 'input-PalletNoBar');
        } else {
        $ionicLoading.show();

            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: angular.copy($scope.data.PalletBarcode)
            }).then(function(res) {

                var Odt = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ',Odt);

                if (Object.keys(Odt).length != 0) {
                    console.log('Main_menu_getTagByPallet::1');
                    isError = true;
                    $scope.data.PalletBarcode = null;
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน', 'input-PalletNoBar');
                }

            }).catch(function(res) {
                isError = true;
                AppService.err('getTagByPallet', res);
            }).finally(function() {

                if (!isError) {
                    App.API('getQtyPerPallet_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: angular.copy($scope.data.PalletBarcode)
                    }).then(function(res) {
                       
                        var dataset = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',dataset);

                        if (Object.keys(dataset).length <= 0) {
                            isError = true;
                            $scope.data.PalletBarcode = null;
                            AppService.err('', 'ไม่มี Pallet นี้ ในระบบ', 'input-PalletNoBar');
                        }

                    }).catch(function(res) {
                        isError = true;
                        AppService.err('getTagByPallet', res);
                    }).finally(function() {                       

                        if (!isError) {
                            App.API('FindLocationAndInsert_Receive_V2', {
                                objsession: angular.copy(LoginService.getLoginData()),
                                pPallet_No: angular.copy($scope.data.PalletBarcode), // 'WP0018'
                                pQtyPerPallet: angular.copy($scope.data.Qty_per_TAG),
                                pstrNewPalletStatus_Index: '0010000000004',
                                pstrTag_no: angular.copy($scope.data.TAG_No),
                                plot: angular.copy($scope.data.Lot),
                                plocation_Alias: angular.copy($scope.data.LocationStorage)
                            }).then(function(res) {
                               console.log('res = ',res);

                                if (res == 'True') {
                                    $ionicLoading.hide();
                                    $ionicPopup.alert({
                                        title: 'Success',
                                        template: 'เก็บเรียบร้อย'
                                    }).then(function(suc) {
                                        $ionicLoading.hide();
                                        if (suc)
                                            loadForm();
                                    });

                                    $scope.data.PalletBarcode = null;
                                    AppService.focus('input-PalletNoBar');

                                } else {
                                    $ionicLoading.hide();
                                    AppService.err('', res);
                                }
                            }).catch(function(res) {
                                isError = true;
                                AppService.err('FindLocationAndInsert_Receive_V2', res);
                            }).finally(function() {
                               $ionicLoading.hide();
                               $scope.data.PalletSearchFlag = "yes";
                            });
                        }//End if (!isError) API getQtyPerPallet_TPIPL Finally

                    }); //End Call API getQtyPerPallet_TPIPL
                }
            }); //End Call Api getTagByPallet
            //console.log(isError);
            $ionicLoading.hide();
            $scope.data.PalletSearchFlag = "yes";

        }

    }; //End Save Product Function

    /*--------------------------------------
    scanBarcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.saveProduct('');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };

})


.controller('Menu_UserCusReturnCtrl', function($filter, $scope, $state, $ionicLoading, App, AppService, LoginService, $cordovaBarcodeScanner) {

    $scope.data = {};
    // $scope.data.PalletBarcode = 'BY170087';
    $scope.getOrderTopicList = {};
    $scope.getTagOrderIndexList = {};
    $scope.getTagOrderIndexList.length = 0;
    $scope.isDisable = false;
    var Order_No, Order_Index;
    var isError = false;
    var keyCnt = 0;
    
    $scope.data.PalletCount_itemPutAway = 0;
    $scope.data.PalletCount_itemALL = 0;


    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){
        $ionicLoading.show();
        var pstrWhere = "And (ms_DocumentType.DocumentType_Index IN ('0010000000055','0010000000088'))"+
                        "And ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0)"+
                        "AND tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1)";
        App.API('GetOrderTopic', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: pstrWhere 
        }).then(function(res) {
            $scope.getOrderTopicList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ',$scope.getOrderTopicList);
        }).catch(function(res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function(res) {
            $ionicLoading.hide();
        });
    };
    $scope.GetOrderTopic_API();
    

    
    /*--------------------------------------
    changeTF Function
    ------------------------------------- */
    $scope.changeTF = function(value) {

        isError = false;
        $scope.isDisable = false;

        if (!value) {
            $scope.data = {};
            $scope.getTagOrderIndexList = {};
            $scope.getTagOrderIndexList.length = 0;
        } else {

            $scope.data.TF = value;
            var order = value.split(',');
            Order_No = order[0];
            Order_Index = order[1];

           
            $ionicLoading.show();

            App.API('GetDetailOrder', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: "and tb_Order.Order_No= '" +Order_No + "'"
            }).then(function(res) {

                var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[Object.keys(res['diffgr:diffgram'].NewDataSet.Table1).length - 1]; //[2351];  //fix test [0]
               
                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
                //$scope.data.PalletCount = (dataDetailOrder.itemPutAway === undefined) ? 0 : dataDetailOrder.itemPutAway + '/' + (dataDetailOrder.itemALL === undefined) ? 0 : dataDetailOrder.itemALL;
                $scope.data.PalletCount_itemPutAway = dataDetailOrder.itemPutAway;
                $scope.data.PalletCount_itemALL = dataDetailOrder.itemALL;
                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;
               

                if (Object.keys(dataDetailOrder).length > 0 && dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
                    $ionicLoading.hide();
                    // $scope.isDisable = true;
                    AppService.succ('จัดเก็บเรียบร้อย');
                }

            }).catch(function(res) {
                isError = true;
                AppService.err('GetDetailOrder', res);
            }).finally(function(res) {
               

                if (!isError) {
                    App.API('getTag_OrderIndex_TPIPL', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pOrder_Index: Order_Index
                    }).then(function(res) {

                        var getTagOrderIndexList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        $scope.getTagOrderIndexList = getTagOrderIndexList;
                        $scope.getTagOrderIndexList.length = Object.keys(getTagOrderIndexList).length;
                        console.log('res = ',getTagOrderIndexList);

                    }).catch(function(res) {
                        isError = false;
                        AppService.err('getTag_OrderIndex_TPIPL', res);
                    }).finally(function(res) {
                       
                        $ionicLoading.hide();
                        AppService.focus('input-PalletNoBar');
                    });
                }

            });


        }

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(dataArr,action) {

        isError = false;
        var barcodeVal = dataArr.PalletBarcode;
        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
            keyCnt = 0;
        if (!dataArr.TF)
            AppService.err('', 'กรุณาเลือกใบรับสินค้า');
        else if (!dataArr.PalletBarcode)
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!');
        else if (!Object.keys($scope.getTagOrderIndexList).length > 0)
            AppService.err('', 'ไม่มีรายการในใบรับนี้');

        if (dataArr.TF && dataArr.PalletBarcode && Object.keys($scope.getTagOrderIndexList).length > 0) {
            $ionicLoading.show();
            
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataArr.PalletBarcode //AS0002 Fix 
            }).then(function(res) {
               console.log('res = ',res);
               var getTagByPallet = res['diffgr:diffgram'];
            //    if(res['diffgr:diffgram'] != null){
            //var getTagByPallet = res['diffgr:diffgram'].NewDataSet.Table1;
                if (getTagByPallet) {
                    console.log('Main_menu_getTagByPallet::2');
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน');
                    $scope.data.PalletBarcode = null;
                    $ionicLoading.hide();
                    isError = true;
                }
            //    }
            }).catch(function(res) {
                isError = true;
                AppService.err('getTagByPallet', res);
            }).finally(function(res) {

                var Qty_Per_Tag = '';

                if (!isError) {
                    App.API('getQtyPerPallet_BY_Order_AS_Shipping', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: dataArr.PalletBarcode, 
                        pOrder_No: Order_Index,
                    }).then(function(res) {
                        console.log('res = ',res);
                        // var Qty_BY_Order_AS_Shipping = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'];
                        if(res['diffgr:diffgram'] != null){
                            var Qty_BY_Order_AS_Shipping = res['diffgr:diffgram'].NewDataSet.Table1
                        }else{
                            Qty_BY_Order_AS_Shipping = {}
                        }

                        if (!Qty_BY_Order_AS_Shipping || (Qty_BY_Order_AS_Shipping && Object.keys(Qty_BY_Order_AS_Shipping).length <= 0)) {
                            AppService.err('', 'Pallet นี้ ไม่อยู่ใน Order นี้');
                            $scope.data.PalletBarcode = null;
                            isError = true;
                        } else {
                            Qty_Per_Tag = Qty_BY_Order_AS_Shipping[0].Qty_Per_Tag;
                        }

                    }).catch(function(res) {
                        isError = true;
                        AppService.err('getQtyPerPallet_BY_Order_AS_Shipping', res);
                    }).finally(function(res) {                       

                        if (!isError) {
                            App.API('FindLocationAndInsert_NewIn', {
                                objsession: angular.copy(LoginService.getLoginData()),
                                pstrPallet_No: dataArr.PalletBarcode,
                                pstrOrder_Index: Order_Index,
                                pdblQty_Per_Tag: (Qty_Per_Tag) ? Qty_Per_Tag : 0, //'0010000039949', //Fix
                                pstrHoldFlag: '' //Fix
                            }).then(function(res) {                               
                                console.log('res = ',res);
                                var FindLocationAndInsert_NewIn = res;

                                if (FindLocationAndInsert_NewIn) {
                                    $scope.data.PalletNo = angular.copy(dataArr.PalletBarcode);
                                    $scope.data.PalletBarcode = null;
                                }
                            }).catch(function(res) {
                                isError = true;
                                AppService.err('FindLocationAndInsert_NewIn', res);
                            }).finally(function(res) {                               

                                if (!isError) {
                                    App.API('getTag_Sum', {
                                        objsession: angular.copy(LoginService.getLoginData()),
                                        pOrder_Index: Order_Index, //'5120TS1700156', //Fix
                                        Pallet_No: angular.copy($scope.data.PalletNo), //'WP0678', //Fix
                                    }).then(function(res) {
                                        var getTag_Sum = res['diffgr:diffgram'];
                                        console.log('res = ',getTag_Sum);
                                        if (getTag_Sum) {
                                            getTag_Sum = res['diffgr:diffgram'].NewDataSet.Table1[0];
                                            $scope.data.CountTagRoll = getTag_Sum.Count_Tag;
                                            $scope.data.WeightTagKG = getTag_Sum.Weight_Tag;
                                            $scope.data.QtyTagM = getTag_Sum.Qty_Tag;
                                        }
                                    }).catch(function(res) {
                                        isError = true;
                                        AppService.err('getTag_Sum', res);
                                    }).finally(function(res) {                                       

                                        if (!isError) {
                                            App.API('updatePalletSumWeight', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pallet_no: angular.copy($scope.data.PalletNo), // '0010000853620' Fix
                                                count: angular.copy($scope.data.QtyTagM), // 999 Fix
                                                weight: angular.copy($scope.data.WeightTagKG), // 999 Fix
                                                fag: 'WHPutawayToLoc', //Fix
                                                lot: '', //Fix
                                                sku: ''
                                            }).then(function(res) {
                                               console.log('res = ',res);
                                            }).catch(function(res) {
                                                isError = true;
                                                AppService.err('updatePalletSumWeight', res);
                                            }).finally(function(res) {                                               

                                                if (!isError) {
                                                    App.API('getTag_Detail_Putaway_TPIPL', {
                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                        pOrder_Index: Order_Index, //0010000055219 Fix
                                                    }).then(function(res) {
                                                
                                                        var getTag_Detail_Putaway_TPIPL = res['diffgr:diffgram'];
                                                        console.log('res = ',res);

                                                        if (getTag_Detail_Putaway_TPIPL) {

                                                            getTag_Detail_Putaway_TPIPL = res['diffgr:diffgram'].NewDataSet.Table1[0];

                                                            $scope.data.SkuID = getTag_Detail_Putaway_TPIPL.sku_Id;
                                                            $scope.data.Lot = getTag_Detail_Putaway_TPIPL.plot;
                                                            $scope.data.OrderDate = $filter('date')(getTag_Detail_Putaway_TPIPL.Order_Date, 'dd/MM/yyyy');
                                                            $scope.data.CountTagRoll = getTag_Detail_Putaway_TPIPL.qty_per_tag;
                                                            $scope.data.StartStatus = 'BG';
                                                            $scope.data.EndStatus = 'WH';
                                                            $scope.data.LocationAlias = getTag_Detail_Putaway_TPIPL.location_alias;

                                                            if (!angular.copy($scope.data.Description))
                                                                $scope.data.Description = getTag_Detail_Putaway_TPIPL.Description;

                                                           var isError = false;

                                                        }

                                                    }).catch(function(res) {
                                                        isError = true;
                                                        AppService.err('getTag_Det ail_Putaway_TPIPL', res);
                                                    }).finally(function(res) {
                                                        // $ionicLoading.hide();
                                                        if(!isError){
                                                            App.API('GetDetailOrder', {
                                                                objsession: angular.copy(LoginService.getLoginData()),
                                                                pstrWhere: "and tb_Order.Order_No= '" + Order_No + "'"
                                                            }).then(function(res) {
                                                                console.log("res :: ",res);
                                                                var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[Object.keys(res['diffgr:diffgram'].NewDataSet.Table1).length - 1]; //[2351];  //fix test [0]
                                                                console.log("dataDetailOrder :: ",dataDetailOrder);
                                                                if(Object.keys(dataDetailOrder).length > 0){
                                                                    $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
                                                                    $scope.data.PalletCount_itemPutAway = dataDetailOrder.itemPutAway;
                                                                    $scope.data.PalletCount_itemALL = dataDetailOrder.itemALL;
                                                                    $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;
                                                                }
                                                                
                                                                if (Object.keys(dataDetailOrder).length > 0 && dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
                                                                    $ionicLoading.hide();
                                                                    // $scope.isDisable = true;
                                                                    AppService.succ('จัดเก็บเรียบร้อย');
                                                                }

                                                            }).catch(function(res) {
                                                                isError = true;
                                                                AppService.err('GetDetailOrder', res);
                                                            }).finally(function(res) {
                                                                if (!isError) {
                                                                    App.API('getTag_OrderIndex_TPIPL', {
                                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                                        pOrder_Index: Order_Index
                                                                    }).then(function(res) {

                                                                        var getTagOrderIndexList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                                        $scope.getTagOrderIndexList = getTagOrderIndexList;
                                                                        $scope.getTagOrderIndexList.length = Object.keys(getTagOrderIndexList).length;
                                                                        console.log('res = ',getTagOrderIndexList);

                                                                    }).catch(function(res) {

                                                                    }).finally(function(res) {
                                                                    });
                                                                }
                                                                AppService.succ('จัดเก็บเรียบร้อย'); //จัดเก็บเรียบร้อย END
                                                            });
                                                        }

                                                    });
                                                }//End if (!isError) finally updatePalletSumWeight API

                                            });
                                        }

                                    }); //End Call API getTag_Sum
                                }

                            }); //End Call API FindLocationAndInsert_NewIn
                        }

                    }); //End Cll API getQtyPerPallet_BY_Order_AS_Shipping
                }
                $ionicLoading.hide();
            }); //End Call API getTagByPallet

        }

    }; //End Save Function


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(dataArr) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save(dataArr,'read barcode');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });

    };



})


.controller('Menu_RackCtrl', function($scope, $state, $filter, $ionicPopup, $ionicLoading, App, AppService, LoginService, $cordovaBarcodeScanner) {

    $scope.data = {};
    $scope.getStatusPalletList = {};
    var isError = false;
    var PalletStatus_Index_1, TAG_No, QTY1, Itemstatus, rd, FL, Fullwork;
    $ionicLoading.show();
    var keyCnt = 0; 


    /*--------------------------------------
    Call API GetStatusPallet
    ------------------------------------- */
    App.API('GetStatusPallet', { objsession: angular.copy(LoginService.getLoginData()), pstrWhere: '' }).then(function(res) {
        $scope.getStatusPalletList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
    }).catch(function(res) {
        AppService.err('GetStatusPallet', res);
    }).finally(function(res) {
       
        $ionicLoading.hide();
        AppService.focus('input-PalletNoBar');
    });


    /*--------------------------------------
    changePalletStatus Function
    ------------------------------------- */
    $scope.changePalletStatus = function(PalletStatus_Index) {

        $scope.isDisable = false;

        if (PalletStatus_Index) {

            switch (PalletStatus_Index) {
                case '0010000000002': //'BG':
                case '0010000000003': //'WH':
                    $scope.isDisable = true; //not show
                    break;
                case '0010000000004': //'RD':
                case '0010000000015': //'PD':
                case '0010000000005': //'AS':
                case '0010000000007': //'MT':
                case '0010000000008': //'DE':
                case '0010000000009': //'SH':
                    $scope.isDisable = false; //show
                    // case 'HD' not found
                    // case 'RT': not found
                    break;
                default:
                    $scope.isDisable = true; //not show
            }

        }

    };


    /*--------------------------------------
    checkBarCode Function
    ------------------------------------- */
    $scope.checkBarCode = function(action) {
        if(action == 'read barcode'){
            keyCnt += 1;
            var curTextCount = $scope.data.PalletBarcode==null? 0 : $scope.data.PalletBarcode.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
             keyCnt = 0;
        isError = false;
        var barcodeVal = $scope.data.PalletBarcode;
        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
             keyCnt = 0;
        if (!angular.copy($scope.data.PalletBarcode)) {
            AppService.err('', 'กรุณาระบุเลขที่ Pallet', 'input-PalletNoBar');
        } else {
            $ionicLoading.show();
            App.API('getPalletTagTORD', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: angular.copy($scope.data.PalletBarcode)
            }).then(function(res) {
               
                console.log('res =',res);
                if (!res['diffgr:diffgram']) {
                    AppService.err('', 'ไม่พบข้อมุล Pallet No. นี้', 'input-PalletNoBar');
                    $scope.data = {};
                } else {

                    var dataObj = res['diffgr:diffgram'].NewDataSet.Table1[0];

                    PalletStatus_Index_1 = dataObj.PalletStatus_Index;
                    TAG_No = dataObj.TAG_No;
                    QTY1 = dataObj.Qty_per_TAG;

                    $scope.data.Product = dataObj.Str1_T;
                    $scope.data.Lot = dataObj.PLot;
                    $scope.data.OrderDate = $filter('date')(dataObj.Order_Date, 'dd/MM/yyyy');
                    $scope.data.OrderNo = dataObj.Order_No;
                    $scope.data.PalletStatusId = dataObj.PalletStatus_Id;
                    $scope.data.PalletStatus = 'RD'

                    // if (dataObj.PalletStatus_Id) {
                    //     switch (dataObj.PalletStatus_Id) {
                    //         case 'BG':
                    //             $scope.data.PalletStatus = '0010000000002';
                    //             break;
                    //         case 'WH':
                    //             $scope.data.PalletStatus = '0010000000003';
                    //             break;
                    //         case 'RD':
                    //             $scope.data.PalletStatus = '0010000000004';
                    //             break;
                    //         case 'PD':
                    //             $scope.data.PalletStatus = '00100000000015';
                    //             break;
                    //         default:
                    //             $scope.data.PalletStatus = '';
                    //     }
                    // }

                    $scope.data.RefNo1 = dataObj.Ref_No1;
                    $scope.data.HH = dataObj.Warehouse;
                    $scope.data.Location = dataObj.Location;
                    $scope.data.Rack = dataObj.Location_Alias_Really;
                    rd = dataObj.rd;
                    FL = dataObj.FL;
                    Fullwork = dataObj.fullwork;
                    $scope.data.Rd_FL_Fullwork = '' + dataObj.rd + '/' + dataObj.FL + '/' + dataObj.fullwork;

                }

            }).catch(function(res) {
                isError = true;
                AppService.err('getPalletTagTORD', res);
            }).finally(function(res) {
               

                if (!isError) {

                    App.API('getTag_Sum', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pOrder_Index: '',
                        Pallet_No: angular.copy($scope.data.PalletBarcode),
                    }).then(function(res) {
                       

                        var getTag_Sum = (!res['diffgr:diffgram']) ? null : res['diffgr:diffgram'].NewDataSet.Table1[0];
                        console.log('res = ',getTag_Sum);
                        if (getTag_Sum) {
                            $scope.data.CountTagRoll = getTag_Sum.Count_Tag;
                            $scope.data.WeightTagKG = getTag_Sum.Weight_Tag;
                            $scope.data.QtyTagM = getTag_Sum.Qty_Tag;
                        }

                    }).catch(function(res) {
                        isError = true;
                        AppService.err('getTag_Sum', res);
                    }).finally(function() {
                       
                        $ionicLoading.hide();
                        AppService.focus('input-location');
                    });

                }

            });
        }
        

    };


    /*--------------------------------------
    save Function
    ------------------------------------- */
    $scope.save = function(dataArr) {
        isError = false;

        if (!dataArr.PalletBarcode) {
            isError = true;
            AppService.err('', 'กรุณาป้อน Pallet No!');
            $scope.data.PalletBarcode = null;
            AppService.focus('input-PalletNoBar');
        } else if (!dataArr.locationScan) {
            isError = true;
            $scope.data.locationScan = null;
            AppService.err('', 'กรุณาป้อน ตำแหน่งจัดเก็บ', 'input-location');
        } else if (!isError) {

            App.API('GetLocation_Index', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrLocation: dataArr.locationScan
            }).then(function(res) {
               
                console.log('res = ',res);
                if (!res) {
                    isError = true;
                    $scope.data.locationScan = null;
                    AppService.err('', 'ไม่พบตำแหน่งจัดเก็บนี้ในระบบ', 'input-location');
                }

            }).catch(function(res) {
                isError = true;
                AppService.err('GetLocation_Index', res);
            }).finally(function(res) {
               

                if (!isError) {

                    var SaveRelocate = function(){

                        // if (PalletStatus_Index_1 != '0010000000012') {
                        //     PalletStatus_Index_1 = '0010000000012';
                        //     Itemstatus = '0010000000001';
                        // } else {
                        //     Itemstatus = '0010000000005';
                        // }
                        $ionicLoading.show();
                        App.API('saveRelocate', {
                            objsession: angular.copy(LoginService.getLoginData()),
                            OldTag_No: TAG_No,
                            NewPallet_No: '',
                            dblQtyMove: QTY1,
                            pstrNewLocation_Ailas: dataArr.locationScan,
                            pstrNewItemStatus_Index: Itemstatus,
                            //pstrNewPalletStatus_Index: PalletStatus_Index_1,
                            pstrNewPalletStatus_Index: '0010000000004',
                            pstrNewPallet_No: dataArr.PalletBarcode
                        }).then(function(res) {
                           

                        }).catch(function(res) {
                            isError = true;
                            AppService.err('saveRelocate', res);
                        }).finally(function(res) {
                           

                            if (!isError) {
                                var pcs = 1;
                                App.API('updatePalletSumWeight', {
                                    objsession: angular.copy(LoginService.getLoginData()),
                                    pallet_no: angular.copy($scope.data.PalletBarcode), // '0010000853620' Fix
                                    count: angular.copy($scope.data.QtyTagM), // 999 Fix
                                    weight: angular.copy($scope.data.WeightTagKG), // 999 Fix
                                    fag: 'WHPutawayToLoc', //Fix
                                    lot: '', //Fix
                                    sku: ''
                                }).then(function(res) {
                                   
                                }).catch(function(res) {
                                    isError = false;
                                    AppService.err('updatePalletSumWeight', res);
                                }).finally(function(res) {
                                   $ionicLoading.hide();

                                    if (!isError) {
                                        pcs = pcs + 1;
                                        $scope.data.Rd_FL_Fullwork = (rd + pcs) + '/' + FL + '/' + Fullwork;
                                        AppService.succ('ย้ายแล้ว');
                                        $scope.data = {};
                                        $scope.isDisable = false;
                                        document.getElementById('input-PalletNoBar').focus();
                                    }

                                });
                            }

                        });
                    }; // End Save Relocate Function

                    // var isFnErr = function() {
                    // if (!dataArr.PalletStatus) {
                    //     $ionicPopup.alert({
                    //         title: 'Error',
                    //         template: 'เลือกสถานะพาเลทใหม่!'
                    //     }).then(function(err) {
                    //         if (err) {
                    //             AppService.focus('input-PalletStatus');
                    //             return true;
                    //         }
                    //     });

                    // } else 
                    if (dataArr.locationScan != dataArr.Location) {
                        $ionicPopup.confirm({
                            title: 'Confirm',
                            template: 'ตำแหน่งไม่ตรงกับตำแหน่งแนะนำ ต้องการจัดเก็บหรือไม่ ?'
                        }).then(function(res) {
                            if (!res) {
                                $scope.data.locationScan = null;
                                AppService.focus('input-location');
                                return true;
                            } else {
                                SaveRelocate();
                                //return false;
                            }
                        });

                    }
                    // };


                    // if (!isFnErr()) {
                    
                    // }

                }

            });

        }

    };


    /*--------------------------------------
    scanBarcode Functionr
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled && imageData.text) {
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.checkBarCode('read barcode');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


    /*--------------------------------------
    scanLocation Function
    ------------------------------------- */
    $scope.scanLocation = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled && imageData.text) {
                $scope.data.locationScan = imageData.text.toUpperCase();
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})


.controller('Menu_PayProductGenaralCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $filter, LoginService, App, AppService, $cordovaBarcodeScanner) {

    $scope.data = {};
    $scope.getWithdrawItemList = {};
    $scope.getWithdrawItemList.length = 0;
    $scope.countSTATE = 0;
    var isError = false;
    var keyCnt = 0 ;

    $ionicLoading.show();

    /*--------------------------------------
    Call API GetWithdraw_Request
    ------------------------------------- */
    App.API('GetWithdraw_Request', { 
        objsession: angular.copy(LoginService.getLoginData()), 
        pstrWhere: "AND DocumentType_Index <> '0010000000006' and Status IN (1,3) AND Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)",
        pbooDamage: false 
    }).then(function(res) {       
        var dataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.getWithdrawRequestList = dataSet;
        console.log('res = ',$scope.getWithdrawRequestList);
        AppService.focus('input-selectOrderNumber');
    }).catch(function(res) {
        AppService.err('GetWithdraw_Request', res);
    }).finally(function(res) {       
        $ionicLoading.hide();
    });


    var findByValue = function(key, Value, isOptions){
        return AppService.findObjValue($scope.getWithdrawItemList, key, Value, isOptions);
    };


    /*--------------------------------------
    changeOrderNumber Function
    ------------------------------------- */
    $scope.changeOrderNumber = function(Withdraw_Index){

        isError = false;

        $ionicLoading.show();
        App.API('GetWithdraw_Request', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "AND Withdraw_Index = '" + Withdraw_Index + "'",
            pbooDamage: false 
        }).then(function(res) {

            var dataSetOnChange = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
            console.log('GetWithdraw_Request Withdraw_Index -> ',dataSetOnChange);
            if(Object.keys(dataSetOnChange).length > 0){
                $scope.data.Department_Id = (dataSetOnChange.Department_Id) ? dataSetOnChange.Department_Id : 'ไม่ระบุ';
                $scope.data.Withdraw_Date = (dataSetOnChange.Withdraw_Date) ? $filter('date')(dataSetOnChange.Withdraw_Date, 'dd/MM/yyyy') : 'ไม่ระบุ';
                if(dataSetOnChange.DocumentType_Id){
                    $scope.data.DocumentType_Id = dataSetOnChange.DocumentType_Id;
                    $scope.data.DocumentType = dataSetOnChange.DocumentType;
                }
            }else{
                AppService.err('', 'ไม่มีรายละเอียดของใบเบิกนี้');
            }
        }).catch(function(res) {
            isError = true;
            AppService.err('changeOrderNumber', res);
        }).finally(function(res) {

            if(!isError){
                App.API('GetWithdrawItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWithdraw_Index: (Withdraw_Index) ? Withdraw_Index : ''
                }).then(function(res) {
                    var dataTB = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    console.log('GetWithdrawItem = ',dataTB);
                    $scope.getWithdrawItemList = dataTB;
                    $scope.getWithdrawItemList.length = Object.keys(dataTB).length;

                    var findSTATE_isNotNull = function(){
                        return $.grep(dataTB, function(n, i){
                          return n.STATE != null;
                        });
                    };
                    $scope.countSTATE = findSTATE_isNotNull().length;

                }).catch(function(res){
                    isError = true;
                    AppService.err('GetWithdrawItem', res);
                }).finally(function(){
                    $ionicLoading.hide();
                });
            }

        });

    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(action){

        isError = false;
        var barcodeVal = $scope.data.PalletBarcode;
        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
             keyCnt = 0;

        if($scope.data.PalletBarcode && $scope.getWithdrawItemList.length > 0){

            var resFind_PALLET_x0020_NO = findByValue('PALLET_x0020_NO', $scope.data.PalletBarcode, true);
            var resFind = AppService.findObjValue(resFind_PALLET_x0020_NO, 'STATE', null, true);
            var n = 0;
            if(resFind.length > 0){
                console.log('search Pallet = ',resFind);
                if(!isError){
                    //for(var n in resFind){
                    function loopArray(n){ 
                        if(n >= resFind.length) return;
                    
                    // for(var n = 0 ; resFind.length > n; n++){
                        console.log('Pallet = ',resFind[n]);
                        if(resFind[n]['WITHDRAWITEM-STATUS'] == '-9' || resFind[n]['WITHDRAWITEM-STATUS'] == '-10'){
                            isError = true;
                            $scope.data.PalletBarcode = null;
                            AppService.err('', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !', 'input-PalletNoBar');
                        }else if(parseInt(resFind[n]['Qty_Bal']) != parseInt(resFind[n]['QTY'])){
                            isError = true;
                           e.log("parseInt(resFind[n]['QTY']) = ", parseInt(resFind[n]['QTY']) );
                            AppService.err('', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !');
                        }else{

                            $ionicLoading.show();
                            App.API('CHEKPICK_WITHDRAWITEM_STATUS', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                WithdrawItem_Index: resFind[n]['WithdrawItem_Index']
                            }).then(function(res) {
                                console.log('res = ',res);
                                $scope.res = res;
                                if(res === true){
                                    isError = true;
                                    AppService.err('', 'Pallet_No '+$scope.data.PalletBarcode+': ถูกเบิกแล้ว !', 'input-PalletNoBar');
                                    $scope.data.PalletBarcode = null;
                                }else{

                                    var loaction = resFind[n]['Location_Alias'];

                                    //Call save pick item
                                    App.API('SavePickItem_Withdraw', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pstrTag_No: resFind[n]['TAG_x0020_NO'],
                                        pdblQtyMove: resFind[n]['QTY'],
                                        pstrNewLocation_Ailas: loaction,
                                        pstrNewItemStatus_Index: '0010000000001',
                                        pstrNewPalletStatus_Index: '0010000000007',
                                        Document_No: resFind[n]['Withdraw_No'],
                                        Document_Index: resFind[n]['Withdraw_Index'],
                                        Documentitem_Index: resFind[n]['WithdrawItem_Index'],
                                        Description: '',
                                        isPicking: true
                                    }).then(function(resSavePick) {
                                        console.log('res SavePickItem_Withdraw = ',resSavePick);
                                        if(resSavePick == 'PASS'){

                                            var intCount = 0;
                                            var arrDataRow = [];

                                            for(var x in $scope.getWithdrawItemList){ 
                                                arrDataRow[x] = $scope.getWithdrawItemList[x];
                                                if(arrDataRow[x]['WithdrawItem_Index'] == resFind[n]['WithdrawItem_Index']){
                                                    arrDataRow[x]['STATE'] = 'เบิกแล้ว';
                                                    arrDataRow[x]['WITHDRAWITEM-STATUS'] = '-9';
                                                    arrDataRow[x]['PICKINGQTY'] = resFind[0]['QTY'];
                                                    arrDataRow[x]['Location_Alias'] = loaction;
                                                }

                                                if(arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-9' || arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-10'){
                                                    intCount++;
                                                }
                                            }
                                            console.log('arrDataRow = ', arrDataRow);
                                            $scope.getWithdrawItemList = arrDataRow;                
                                            $scope.getWithdrawItemList.length = arrDataRow.length;
                                            $scope.countSTATE = intCount;
                                            n++;
                                            loopArray(n);
                                        }else{
                                            isError = true;
                                            AppService.err('', 'ผิดพลาด ในการย้าย Pallet_No '+$scope.data.PalletBarcode+' ลองอีกครั้ง !');
                                        }

                                    }).catch(function(res){
                                        isError = true;
                                        AppService.err('SavePickItem_Withdraw', res);
                                    }).finally(function(){
                                        $ionicLoading.hide();
                                        $scope.data.PalletBarcode = null;
                                        AppService.focus('input-PalletNoBar');
                                    }); //End call api SavePickItem_Withdraw
                                }

                            }).catch(function(res){
                                isError = true;
                                AppService.err('CHEKPICK_WITHDRAWITEM_STATUS', res);
                            }).finally(function(){
                                $ionicLoading.hide();
                                $scope.data.PalletSearchFlag = "yes";

                            }); // End call api CHEKPICK_WITHDRAWITEM_STATUS

                        }//end else
                    }//End for resFind
                    loopArray(n);
                }

            }else{

                var AssingPallet_No_To_Tag = function(){
                    $ionicLoading.show();
                    App.API('getPalletInBGPallet', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pstrWhere: "and PALLET_No = '"+$scope.data.PalletBarcode+"'"
                    }).then(function(res) {

                        var dataInBGPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                        console.log('res = ',dataInBGPallet);

                        if(Object.keys(dataInBGPallet).length > 0){

                            if(dataInBGPallet.PalletStatus_Index == '0010000000000'){

                                var ObjDataRowArrItem = findByValue('PALLET_x0020_NO', '', true);

                                if(ObjDataRowArrItem.length > 0 && $scope.data.OrderNumber){

                                    App.API('GetWithdrawItem', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pstrWithdraw_Index: $scope.data.OrderNumber
                                    }).then(function(res) {

                                        var obj_dataset_item = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                        console.log('res = ',obj_dataset_item);
                                        
                                        if(Object.keys(obj_dataset_item).length > 0){
                                            var ObjDataFindSTATE = findByValue('STATE', '', false);
                                            $scope.getWithdrawItemList = obj_dataset_item;
                                            $scope.getWithdrawItemList.length = Object.keys(obj_dataset_item).length;
                                            $scope.countSTATE = ObjDataFindSTATE.length;
                                            return true;
                                        }

                                    }).catch(function(res){
                                        isError = true;
                                        AppService.err('GetWithdrawItem', res);
                                    }).finally(function(){});
                                }
                            }

                        }
                        $ionicLoading.hide();
                        return false;

                    }).catch(function(res){
                        isError = true;
                        AppService.err('getPalletInBGPallet', res);
                    }).finally(function(){

                                $ionicLoading.hide();
                                $scope.data.PalletSearchFlag = "yes";
                    });

                };  //End Fn AssingPallet_No_To_Tag()


                var SwapPallet = function(){

                    $ionicLoading.show();
                    App.API('chk_Pallet_IN_Withdraw_IS_Picked', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pstrPalletNo: $scope.data.PalletBarcode
                    }).then(function(res) {
                        console.log('res = ',res);
                        if(res){
                            AppService.err('', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!');
                            return true;
                        }else{

                            App.API('getVIEW_TAG_TPIPL', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pstrWhere: " and PALLET_No='" + $scope.data.PalletBarcode + "' and Qty_Bal > 0"
                            }).then(function(res) {

                                var dtVIEW_TAG = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                console.log('res = ',dtVIEW_TAG);
                                if(Object.keys(dtVIEW_TAG).length > 0){

                                    if($scope.getWithdrawItemList[0]['Customer_Index'] != dtVIEW_TAG[0]['Customer_Index']){
                                        AppService.err('', 'พาเลท '+$scope.data.PalletBarcode+' ไม่ใช่ลูกค้าคนนี้');
                                        return false;
                                    }

                                    var odrArrItem = $filter('filter')($scope.getWithdrawItemList, {
                                        LOT_x002F_BATCH: dtVIEW_TAG[0]['PLot'],
                                        SKU_x0020_ID: dtVIEW_TAG[0]['Sku_Id'],
                                        'WITHDRAWITEM-STATUS': '1',
                                        Location_Alias: dtVIEW_TAG[0]['Location_Alias'],
                                        STATUS: dtVIEW_TAG[0]['Description'],
                                    }, false);

                                    if(odrArrItem.length > 0 && $scope.data.OrderNumber){

                                        App.API('GetWithdrawItem', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pstrWithdraw_Index: $scope.data.OrderNumber
                                        }).then(function(res) {

                                            var obj_dataset_item = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                                            if(Object.keys(obj_dataset_item).length > 0){
                                                var ObjDataFindSTATE = findByValue('STATE', '', false);
                                                $scope.getWithdrawItemList.length = Object.keys(angular.copy($scope.getWithdrawItemList)).length;
                                                $scope.countSTATE = ObjDataFindSTATE.length;
                                            }
                                            return true;

                                        }).catch(function(res){
                                            isError = true;
                                            AppService.err('GetWithdrawItem', res);
                                        }).finally(function(){});

                                    }else{
                                        AppService.err('', 'ไม่สามารถเบิกพาเลทนี้แทนได้เนื่องจาก Grade หรือ Lot ไม่ตรงใบเบิก !');
                                        return false;
                                    }

                                }else{
                                    AppService.err('', 'ไม่พบพาเลทนี้ในรายการ !');
                                    return false;
                                }
                                
                            }).catch(function(res){
                                isError = true;
                                AppService.err('getVIEW_TAG_TPIPL', res);
                            }).finally(function(){
                                $ionicLoading.hide();
                            });

                        }
                    }).catch(function(res){
                        isError = true;
                        AppService.err('chk_Pallet_IN_Withdraw_IS_Picked', res);
                    }).finally(function(){});

                };  //End Fn SwapPallet()


                if(AssingPallet_No_To_Tag()){
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }else if(SwapPallet()){
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }else{
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }
            } //End if (resFind.length > 0)

        }else{
            if ($scope.getWithdrawItemList.length == 0){
                AppService.err('', 'กรุณาเลือกเลขที่ใบรับสินค้า','input-selectOrderNumber');
            }else if (!$scope.data.PalletBarcode){
                AppService.err('', 'กรุณากรอกเลขที่ Pallet!','input-PalletNoBar');
            }
        } //End if($scope.data.PalletBarcode && $scope.getWithdrawItemList.length > 0)

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.OrderNumber || $scope.getWithdrawItemList.length == 0){
            AppService.err('', 'ไม่มีรายการ');
        }else{

        $ionicPopup.confirm({
            title: 'Confirm',
            template: 'จำนวนของที่เบิก '+$scope.countSTATE+' ยืนยันการบันทึกหรือไม่ ?'
          }).then(function(res) {
            if(res) {

                $ionicLoading.show();
                App.API('GetWithdrawItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWithdraw_Index: $scope.data.OrderNumber
                }).then(function(res) {
                    var dataTB = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.getWithdrawItemList = dataTB;
                    $scope.getWithdrawItemList.length = Object.keys(dataTB).length;
                    console.log('res = ',$scope.getWithdrawItemList);

                    var findSTATE_isNotNull = function(){
                        return $.grep(dataTB, function(n, i){
                          return n.STATE != null;
                        });
                    };
                    $scope.countSTATE = findSTATE_isNotNull().length;

                    if(findByValue('WITHDRAWITEM-STATUS', '-9', false).length > 0){
                        $scope.data.PalletBarcode = null;
                        AppService.err('', 'หยิบไม่ครบรายการ', 'input-PalletNoBar');
                    }else{

                        App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', { 
                            objsession: angular.copy(LoginService.getLoginData()), 
                            Withdraw_Index: $scope.data.OrderNumber,
                            phRemark: 'MOBILE REQUEST RD TO MT',
                            Status: 2
                        }).then(function(res) {
                            $scope.data.OrderNumber = "";
                            $scope.data.PalletBarcode = "";
                            $scope.data.DocumentType_Id = "";
                            $scope.data.DocumentType = "";
                            $scope.data.Department_Id = "";
                            $scope.data.Withdraw_Date = "";
                            AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)');
                        }).catch(function(res){
                            AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res);
                        }).finally(function(){
                            $ionicLoading.hide();
                        });
                    }

                }).catch(function(res){
                    AppService.err('GetWithdrawItem', res);
                }).finally(function(){});

            } else {
                $scope.data.PalletBarcode = null;
                AppService.focus('input-PalletNoBar');
            }
        });
        }//end if else
    };


    /*--------------------------------------
    scanBarcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled && imageData.text) {
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.search('');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


})


.controller('Menu_PayProductWorkShopCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $filter, LoginService, App, AppService, $cordovaBarcodeScanner) {

    $scope.data = {};
    $scope.getWithdrawItemList = {};
    $scope.getWithdrawItemList.length = 0;
    $scope.countSTATE = 0;
    var isError = false;
    var keyCnt = 0;

    $ionicLoading.show();

    /*--------------------------------------
    Call API GetWithdraw_Request
    ------------------------------------- */
    App.API('GetWithdraw_Request', { 
        objsession: angular.copy(LoginService.getLoginData()), 
        pstrWhere: "AND DocumentType_Index <> '0010000000006' and Status IN (1,3) AND Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)",
        pbooDamage: false 
    }).then(function(res) {       
        var dataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        $scope.getWithdrawRequestList = dataSet;
        console.log('res = ',$scope.getWithdrawRequestList);
        AppService.focus('input-selectOrderNumber');
    }).catch(function(res) {
        AppService.err('GetWithdraw_Request', res);
    }).finally(function(res) {       
        $ionicLoading.hide();
    });


    var findByValue = function(key, Value, isOptions){
        return AppService.findObjValue($scope.getWithdrawItemList, key, Value, isOptions);
    };


    /*--------------------------------------
    changeOrderNumber Function
    ------------------------------------- */
    $scope.changeOrderNumber = function(Withdraw_Index){

        isError = false;

        $ionicLoading.show();
        App.API('GetWithdraw_Request', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "AND Withdraw_Index = '" + Withdraw_Index + "'",
            pbooDamage: false 
        }).then(function(res) {

            var dataSetOnChange = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
            console.log('GetWithdraw_Request Withdraw_Index -> ',dataSetOnChange);
            if(Object.keys(dataSetOnChange).length > 0){
                $scope.data.Department_Id = (dataSetOnChange.Department_Id) ? dataSetOnChange.Department_Id : 'ไม่ระบุ';
                $scope.data.Withdraw_Date = (dataSetOnChange.Withdraw_Date) ? $filter('date')(dataSetOnChange.Withdraw_Date, 'dd/MM/yyyy') : 'ไม่ระบุ';
                if(dataSetOnChange.DocumentType_Id){
                    $scope.data.DocumentType_Id = dataSetOnChange.DocumentType_Id;
                    $scope.data.DocumentType = dataSetOnChange.DocumentType;
                }
            }else{
                AppService.err('', 'ไม่มีรายละเอียดของใบเบิกนี้');
            }
        }).catch(function(res) {
            isError = true;
            AppService.err('changeOrderNumber', res);
        }).finally(function(res) {

            if(!isError){
                App.API('GetWithdrawItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWithdraw_Index: (Withdraw_Index) ? Withdraw_Index : ''
                }).then(function(res) {
                    var dataTB = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    console.log('GetWithdrawItem = ',dataTB);
                    $scope.getWithdrawItemList = dataTB;
                    $scope.getWithdrawItemList.length = Object.keys(dataTB).length;

                    var findSTATE_isNotNull = function(){
                        return $.grep(dataTB, function(n, i){
                          return n.STATE != null;
                        });
                    };
                    $scope.countSTATE = findSTATE_isNotNull().length;

                }).catch(function(res){
                    isError = true;
                    AppService.err('GetWithdrawItem', res);
                }).finally(function(){
                    $ionicLoading.hide();
                });
            }

        });

    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(action){

        isError = false;
        var barcodeVal = $scope.data.PalletBarcode;
        if(action == 'read barcode'){

            keyCnt += 1;
            var curTextCount = barcodeVal==null? 0 : barcodeVal.length;
            console.log('current inut text length: ' + curTextCount);
            console.log('current inut keyCnt: ' + keyCnt);
            if(keyCnt==1 && curTextCount>1){

                //console.log('+++CONGRATULATION ++++++++ input value is a barcode.');
                $scope.data.PalletSearchFlag = "yes";
            }else{
                $scope.data.PalletSearchFlag = "no";// set flag to stop search
            }
            console.log('flag is '+ $scope.data.PalletSearchFlag );
            if($scope.data.PalletSearchFlag == 'no'){
                $scope.data.PalletSearchFlag = "yes";// set search flag back to allow do searching
                console.log('exit seach');
                return;
            }
        }
             keyCnt = 0;

        if($scope.data.PalletBarcode && $scope.getWithdrawItemList.length > 0){

            var resFind_PALLET_x0020_NO = findByValue('PALLET_x0020_NO', $scope.data.PalletBarcode, true);
            var resFind = AppService.findObjValue(resFind_PALLET_x0020_NO, 'STATE', null, true);
            var n = 0;
            if(resFind.length > 0){
                console.log('search Pallet = ',resFind);
                if(!isError){
                    //for(var n in resFind){
                    function loopArray(n){ 
                        if(n >= resFind.length) return;
                    
                    // for(var n = 0 ; resFind.length > n; n++){
                        console.log('Pallet = ',resFind[n]);
                        if(resFind[n]['WITHDRAWITEM-STATUS'] == '-9' || resFind[n]['WITHDRAWITEM-STATUS'] == '-10'){
                            isError = true;
                            $scope.data.PalletBarcode = null;
                            AppService.err('', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !', 'input-PalletNoBar');
                        }else if(parseInt(resFind[n]['Qty_Bal']) != parseInt(resFind[n]['QTY'])){
                            isError = true;
                           e.log("parseInt(resFind[n]['QTY']) = ", parseInt(resFind[n]['QTY']) );
                            AppService.err('', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !');
                        }else{

                            $ionicLoading.show();
                            App.API('CHEKPICK_WITHDRAWITEM_STATUS', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                WithdrawItem_Index: resFind[n]['WithdrawItem_Index']
                            }).then(function(res) {
                                console.log('res = ',res);
                                $scope.res = res;
                                if(res === true){
                                    isError = true;
                                    AppService.err('', 'Pallet_No '+$scope.data.PalletBarcode+': ถูกเบิกแล้ว !', 'input-PalletNoBar');
                                    $scope.data.PalletBarcode = null;
                                }else{

                                    var loaction = resFind[n]['Location_Alias'];

                                    //Call save pick item
                                    App.API('SavePickItem_Withdraw', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pstrTag_No: resFind[n]['TAG_x0020_NO'],
                                        pdblQtyMove: resFind[n]['QTY'],
                                        pstrNewLocation_Ailas: loaction,
                                        pstrNewItemStatus_Index: '0010000000001',
                                        pstrNewPalletStatus_Index: '0010000000007',
                                        Document_No: resFind[n]['Withdraw_No'],
                                        Document_Index: resFind[n]['Withdraw_Index'],
                                        Documentitem_Index: resFind[n]['WithdrawItem_Index'],
                                        Description: '',
                                        isPicking: true
                                    }).then(function(resSavePick) {
                                        console.log('res SavePickItem_Withdraw = ',resSavePick);
                                        if(resSavePick == 'PASS'){

                                            var intCount = 0;
                                            var arrDataRow = [];

                                            for(var x in $scope.getWithdrawItemList){ 
                                                arrDataRow[x] = $scope.getWithdrawItemList[x];
                                                if(arrDataRow[x]['WithdrawItem_Index'] == resFind[n]['WithdrawItem_Index']){
                                                    arrDataRow[x]['STATE'] = 'เบิกแล้ว';
                                                    arrDataRow[x]['WITHDRAWITEM-STATUS'] = '-9';
                                                    arrDataRow[x]['PICKINGQTY'] = resFind[0]['QTY'];
                                                    arrDataRow[x]['Location_Alias'] = loaction;
                                                }

                                                if(arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-9' || arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-10'){
                                                    intCount++;
                                                }
                                            }
                                            console.log('arrDataRow = ', arrDataRow);
                                            $scope.getWithdrawItemList = arrDataRow;                
                                            $scope.getWithdrawItemList.length = arrDataRow.length;
                                            $scope.countSTATE = intCount;
                                            n++;
                                            loopArray(n);
                                        }else{
                                            isError = true;
                                            AppService.err('', 'ผิดพลาด ในการย้าย Pallet_No '+$scope.data.PalletBarcode+' ลองอีกครั้ง !');
                                        }

                                    }).catch(function(res){
                                        isError = true;
                                        AppService.err('SavePickItem_Withdraw', res);
                                    }).finally(function(){
                                        $ionicLoading.hide();
                                        $scope.data.PalletBarcode = null;
                                        AppService.focus('input-PalletNoBar');
                                    }); //End call api SavePickItem_Withdraw
                                }

                            }).catch(function(res){
                                isError = true;
                                AppService.err('CHEKPICK_WITHDRAWITEM_STATUS', res);
                            }).finally(function(){

                            }); // End call api CHEKPICK_WITHDRAWITEM_STATUS

                        }//end else
                    }//End for resFind
                    loopArray(n);
                }

            }else{

                var AssingPallet_No_To_Tag = function(){
                    $ionicLoading.show();
                    App.API('getPalletInBGPallet', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pstrWhere: "and PALLET_No = '"+$scope.data.PalletBarcode+"'"
                    }).then(function(res) {

                        var dataInBGPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                        console.log('res = ',dataInBGPallet);

                        if(Object.keys(dataInBGPallet).length > 0){

                            if(dataInBGPallet.PalletStatus_Index == '0010000000000'){

                                var ObjDataRowArrItem = findByValue('PALLET_x0020_NO', '', true);

                                if(ObjDataRowArrItem.length > 0 && $scope.data.OrderNumber){

                                    App.API('GetWithdrawItem', { 
                                        objsession: angular.copy(LoginService.getLoginData()), 
                                        pstrWithdraw_Index: $scope.data.OrderNumber
                                    }).then(function(res) {

                                        var obj_dataset_item = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                        console.log('res = ',obj_dataset_item);
                                        
                                        if(Object.keys(obj_dataset_item).length > 0){
                                            var ObjDataFindSTATE = findByValue('STATE', '', false);
                                            $scope.getWithdrawItemList = obj_dataset_item;
                                            $scope.getWithdrawItemList.length = Object.keys(obj_dataset_item).length;
                                            $scope.countSTATE = ObjDataFindSTATE.length;
                                            return true;
                                        }

                                    }).catch(function(res){
                                        isError = true;
                                        AppService.err('GetWithdrawItem', res);
                                    }).finally(function(){});
                                }
                            }

                        }
                        $ionicLoading.hide();
                        return false;

                    }).catch(function(res){
                        isError = true;
                        AppService.err('getPalletInBGPallet', res);
                    }).finally(function(){});

                };  //End Fn AssingPallet_No_To_Tag()


                var SwapPallet = function(){

                    $ionicLoading.show();
                    App.API('chk_Pallet_IN_Withdraw_IS_Picked', { 
                        objsession: angular.copy(LoginService.getLoginData()), 
                        pstrPalletNo: $scope.data.PalletBarcode
                    }).then(function(res) {
                        console.log('res = ',res);
                        if(res){
                            AppService.err('', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!');
                            return true;
                        }else{

                            App.API('getVIEW_TAG_TPIPL', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pstrWhere: " and PALLET_No='" + $scope.data.PalletBarcode + "' and Qty_Bal > 0"
                            }).then(function(res) {

                                var dtVIEW_TAG = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                console.log('res = ',dtVIEW_TAG);
                                if(Object.keys(dtVIEW_TAG).length > 0){

                                    if($scope.getWithdrawItemList[0]['Customer_Index'] != dtVIEW_TAG[0]['Customer_Index']){
                                        AppService.err('', 'พาเลท '+$scope.data.PalletBarcode+' ไม่ใช่ลูกค้าคนนี้');
                                        return false;
                                    }

                                    var odrArrItem = $filter('filter')($scope.getWithdrawItemList, {
                                        LOT_x002F_BATCH: dtVIEW_TAG[0]['PLot'],
                                        SKU_x0020_ID: dtVIEW_TAG[0]['Sku_Id'],
                                        'WITHDRAWITEM-STATUS': '1',
                                        Location_Alias: dtVIEW_TAG[0]['Location_Alias'],
                                        STATUS: dtVIEW_TAG[0]['Description'],
                                    }, false);

                                    if(odrArrItem.length > 0 && $scope.data.OrderNumber){

                                        App.API('GetWithdrawItem', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pstrWithdraw_Index: $scope.data.OrderNumber
                                        }).then(function(res) {

                                            var obj_dataset_item = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                                            if(Object.keys(obj_dataset_item).length > 0){
                                                var ObjDataFindSTATE = findByValue('STATE', '', false);
                                                $scope.getWithdrawItemList.length = Object.keys(angular.copy($scope.getWithdrawItemList)).length;
                                                $scope.countSTATE = ObjDataFindSTATE.length;
                                            }
                                            return true;

                                        }).catch(function(res){
                                            isError = true;
                                            AppService.err('GetWithdrawItem', res);
                                        }).finally(function(){});

                                    }else{
                                        AppService.err('', 'ไม่สามารถเบิกพาเลทนี้แทนได้เนื่องจาก Grade หรือ Lot ไม่ตรงใบเบิก !');
                                        return false;
                                    }

                                }else{
                                    AppService.err('', 'ไม่พบพาเลทนี้ในรายการ !');
                                    return false;
                                }
                                
                            }).catch(function(res){
                                isError = true;
                                AppService.err('getVIEW_TAG_TPIPL', res);
                            }).finally(function(){
                                $ionicLoading.hide();
                            });

                        }
                    }).catch(function(res){
                        isError = true;
                        AppService.err('chk_Pallet_IN_Withdraw_IS_Picked', res);
                    }).finally(function(){});

                };  //End Fn SwapPallet()


                if(AssingPallet_No_To_Tag()){
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }else if(SwapPallet()){
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }else{
                    $scope.data.PalletBarcode = null;
                    AppService.focus('input-PalletNoBar');
                }
            } //End if (resFind.length > 0)

        }else{
            if ($scope.getWithdrawItemList.length == 0){
                AppService.err('', 'กรุณาเลือกเลขที่ใบรับสินค้า','input-selectOrderNumber');
            }else if (!$scope.data.PalletBarcode){
                AppService.err('', 'กรุณากรอกเลขที่ Pallet!','input-PalletNoBar');
            }
        } //End if($scope.data.PalletBarcode && $scope.getWithdrawItemList.length > 0)

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

        if(!$scope.data.OrderNumber || $scope.getWithdrawItemList.length == 0){
            AppService.err('', 'ไม่มีรายการ');
        }else{

        $ionicPopup.confirm({
            title: 'Confirm',
            template: 'จำนวนของที่เบิก '+$scope.countSTATE+' ยืนยันการบันทึกหรือไม่ ?'
          }).then(function(res) {
            if(res) {

                $ionicLoading.show();
                App.API('GetWithdrawItem', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    pstrWithdraw_Index: $scope.data.OrderNumber
                }).then(function(res) {
                    var dataTB = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    $scope.getWithdrawItemList = dataTB;
                    $scope.getWithdrawItemList.length = Object.keys(dataTB).length;
                    console.log('res = ',$scope.getWithdrawItemList);

                    var findSTATE_isNotNull = function(){
                        return $.grep(dataTB, function(n, i){
                          return n.STATE != null;
                        });
                    };
                    $scope.countSTATE = findSTATE_isNotNull().length;

                    if(findByValue('WITHDRAWITEM-STATUS', '-9', false).length > 0){
                        $scope.data.PalletBarcode = null;
                        AppService.err('', 'หยิบไม่ครบรายการ', 'input-PalletNoBar');
                    }else{

                        App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', { 
                            objsession: angular.copy(LoginService.getLoginData()), 
                            Withdraw_Index: $scope.data.OrderNumber,
                            phRemark: 'MOBILE REQUEST RD TO MT',
                            Status: 2
                        }).then(function(res) {
                            $scope.data.OrderNumber = "";
                            $scope.data.PalletBarcode = "";
                            $scope.data.DocumentType_Id = "";
                            $scope.data.DocumentType = "";
                            $scope.data.Department_Id = "";
                            $scope.data.Withdraw_Date = "";
                            AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)');
                        }).catch(function(res){
                            AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res);
                        }).finally(function(){
                            $ionicLoading.hide();
                        });
                    }

                }).catch(function(res){
                    AppService.err('GetWithdrawItem', res);
                }).finally(function(){});

            } else {
                $scope.data.PalletBarcode = null;
                AppService.focus('input-PalletNoBar');
            }
        });
        }//end if else
    };


    /*--------------------------------------
    scanBarcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled && imageData.text) {
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.search('');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


});