
/**
* Shipping.Controllers Module
*
* Description
*/
angular.module('Shipping.Controllers', ['ionic'])

.controller('Shipping_SaleCtrl', function($ionicPopup, $scope, $state, $cordovaBarcodeScanner, $filter, $ionicLoading, App, AppService, LoginService) {
	
	$scope.data = {};
	$scope.getWithdrawItemList = {};
    $scope.getWithdrawItemList.length = 0;
    $scope.countSTATE = 0;
	var isError = false;
    var kk1=0;
    var kk3 = 0;
    var keyCnt = 0;
    /*--------------------------------------
    Call API GetWithdraw_Request
    ------------------------------------- */
    $scope.GetWithdraw_Request_API = function(){

        $ionicLoading.show();
        App.API('GetWithdraw_Request', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "AND DocumentType_Index = '0010000000006' and Status IN (1) " +
            "AND Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and   IsUse = 1)" ,
            pbooDamage: false
        }).then(function(res) {
            var data = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.getWithdrawRequestList = data;
            AppService.focus('input-selectOrderNumber');
            console.log('GetWithdraw_Request::::',data);
        }).catch(function(res) {
            AppService.err('GetWithdraw_Request', res);
        }).finally(function(res) {       
            $ionicLoading.hide();
        });

    };
    $scope.GetWithdraw_Request_API();
	

    /*--------------------------------------
    Load GetWithdrawItem Function
    ------------------------------------- */
    var loadGetWithdrawItem = function(Withdraw_Index){

    	App.API('GetWithdrawItem', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWithdraw_Index: (Withdraw_Index) ? Withdraw_Index : ''
        }).then(function(res) {
            var dataTB = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            console.log('GetWithdrawItem:::',dataTB);
            $scope.getWithdrawItemList = dataTB;
            $scope.getWithdrawItemList.length = Object.keys(dataTB).length;
            $scope.countSTATE = AppService.findObjValue($scope.getWithdrawItemList, 'STATE', null, false).length;
        }).catch(function(res){
            isError = true;
            AppService.err('GetWithdrawItem', res);
        }).finally(function(){
            $ionicLoading.hide();
        });

    };


    /*--------------------------------------
    Change Order Number Function
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
            if(Object.keys(dataSetOnChange).length > 0){

                $scope.data.Department_Id = (dataSetOnChange.Department_Id) ? dataSetOnChange.Department_Id : 'ไม่ระบุ';
                $scope.data.Withdraw_Date = (dataSetOnChange.Withdraw_Date) ? $filter('date')(dataSetOnChange.Withdraw_Date, 'dd/MM/yyyy') : 'ไม่ระบุ';
                if(dataSetOnChange.DocumentType_Id){
                    $scope.data.DocumentType_Id = dataSetOnChange.DocumentType_Id;
                    $scope.data.DocumentType = dataSetOnChange.DocumentType;
                }

            }else{
            	isError = true;
                AppService.err('', 'ไม่มีรายละเอียดของใบเบิกนี้');
            }
        }).catch(function(res) {
            isError = true;
            AppService.err('changeOrderNumber', res);
        }).finally(function(res) {
            if(!isError){
               loadGetWithdrawItem(Withdraw_Index);
            }

        });

    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function(action){
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
        isError = false;
        if($scope.data.PalletBarcode && $scope.getWithdrawItemList.length > 0){
            var n=0;
            var resFind_PALLET_x0020_NO = AppService.findObjValue($scope.getWithdrawItemList, 'PALLET_x0020_NO', $scope.data.PalletBarcode, true);
            var resFind = AppService.findObjValue(resFind_PALLET_x0020_NO, 'STATE', null , true);
            //Object.keys(dataInBGPallet).length
            if(resFind.length > 0){
                var k=0;
                var kk = 0;
                console.log('resFind.length :::',resFind.length );
                console.log('Object.keys(resFind).length:::', Object.keys(resFind).length );
                console.log('resFind::::',resFind);
                if(!isError){
                    //for(var n=0; n<resFind.length; n++){
                   function loopArray(n){ 
                        if(n >= resFind.length) return;
                    //for(var n in resFind){
                        //var k=0;
                        //var vv=kk;
                        console.log('วนก่อนครั้งที่:',kk);
                        if(resFind[kk]['WITHDRAWITEM-STATUS'] == '-9' || resFind[kk]['WITHDRAWITEM-STATUS'] == '-10'){
                            isError = true;
                            AppService.err('', 'Pallet '+$scope.data.PalletBarcode+' ถูกเบิกแล้ว!', 'input-PalletNoBar');
                            $scope.data.PalletBarcode = null;
                        }else if(parseInt(resFind[kk]['Qty_Bal']) != parseInt(resFind[kk]['QTY'])){
                            isError = true;
                            AppService.err('', 'จำนวนสินค้าที่เบิกไม่มีในรายการนี้ !');
                        }else{

                            //var kk1=0;
                            $ionicLoading.show();
                            App.API('CHEKPICK_WITHDRAWITEM_STATUS', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                WithdrawItem_Index: resFind[n]['WithdrawItem_Index']
                               // WithdrawItem_Index: resFind[kk1]['WithdrawItem_Index']
                            }).then(function(res) {
                                //var kk1=0;
                                if(res === true){
                                    isError = true;
                                    AppService.err('', 'Pallet_No '+$scope.data.PalletBarcode+': ถูกเบิกแล้ว !', 'input-PalletNoBar');
                                    $scope.data.PalletBarcode = null;
                                }else{

                                    var loaction = resFind[n]['Location_Alias'];
                                
                                    console.log('CHEKPICK_WITHDRAWITEM_STATUS วนครั้งที่:',n);
                                    console.log('CHEKPICK_WITHDRAWITEM_STATUS555:',resFind[n]['TAG_x0020_NO']);

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
                                        Description: 'MOBILE REQUEST RD TO MT',
                                        isPicking: true
                                    }).then(function(resSavePick) {


                                        if(resSavePick == 'PASS'){
                                            var intCount = 0;
                                            var arrDataRow = [];
                                           
                                                
                                            for(var x in $scope.getWithdrawItemList){ 
                                                arrDataRow[x] = $scope.getWithdrawItemList[x];
                                                  
                                                    if(arrDataRow[x]['WithdrawItem_Index'] == resFind[n]['WithdrawItem_Index']){
                                                        arrDataRow[x]['STATE'] = 'เบิกแล้ว';
                                                        arrDataRow[x]['WITHDRAWITEM-STATUS'] = '-9';
                                                        arrDataRow[x]['PICKINGQTY'] = resFind[n]['QTY'];
                                                        arrDataRow[x]['Location_Alias'] = loaction;
                                                        
                                                         kk3=kk3+1;
                                                    }
                                                  

                                                    if(arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-9' || arrDataRow[x]['WITHDRAWITEM-STATUS'] == '-10'){
                                                        intCount++;
                                                    }
                                            }
                                            //console.log('arrDataRow :::',arrDataRow);
                                            $scope.getWithdrawItemList = arrDataRow;                
                                            $scope.getWithdrawItemList.length = arrDataRow.length;
                                            $scope.countSTATE = intCount;
                                            n++;
                                            loopArray(n);

                                        }else{
                                            isError = true;
                                            console.log('Error SavePickItem_Withdraw วนครั้งที่ :::',kk3);
                                            AppService.err('', 'ผิดพลาด ในการย้าย Pallet_No '+$scope.data.PalletBarcode+' ลองอีกครั้ง !');
                                        }

                                    }).catch(function(res){
                                        isError = true;
                                        AppService.err('SavePickItem_Withdraw', res);
                                    }).finally(function(){
                                        $ionicLoading.hide();
                                        $scope.data.PalletBarcode = null;
                                        AppService.focus('input-PalletNoBar');

                                        //$scope.getTagOrderIndexList = getTagOrderIndexList;
                                        //$scope.getTagOrderIndexList.length = Object.keys(getTagOrderIndexList).length;
                                        //console.log('$scope.getTagOrderIndexList ::,',getTagOrderIndexList);
                                        //console.log('$scope.getTagOrderIndexList.length::,',Object.keys(getTagOrderIndexList).length);
                                    });
                                           kk1=kk1+1;
                                           if(kk1 >= resFind.length){
                                                kk1 = resFind.length;
                                            }

                                }

                            }).catch(function(res){
                                isError = true;
                                AppService.err('CHEKPICK_WITHDRAWITEM_STATUS', res);
                            }).finally(function(){


                            });

                        }//end else

                                    kk = kk+1;
                                    console.log('kk check:::',kk);
                                    if(kk > resFind.length)
                                    {
                                        kk=resFind.length;
                                    }

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

                        if(Object.keys(dataInBGPallet).length > 0){
                            if(dataInBGPallet.PalletStatus_Index == '0010000000000'){

                                var ObjDataRowArrItem = AppService.findObjValue($scope.getWithdrawItemList, 'PALLET_x0020_NO', '', true);
                                if(ObjDataRowArrItem.length > 0){
                                    $ionicLoading.hide();
                                    return true;
                                }else{
                                	$ionicLoading.hide();
                        			return false;
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
                        if(res){
                            AppService.err('', 'พาเลทนี้ถูกหยิบในใบเบิกอื่นแล้ว!');
                            return true;
                        }else{

                            App.API('getVIEW_TAG_TPIPL', { 
                                objsession: angular.copy(LoginService.getLoginData()), 
                                pstrWhere: " and PALLET_No='" + $scope.data.PalletBarcode + "' and Qty_Bal > 0"
                            }).then(function(res) {

                                var dtVIEW_TAG = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
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

                                        App.API('SwapPalletInWithDraw', { 
                                            objsession: angular.copy(LoginService.getLoginData()), 
                                            pstrWithdrawItem_Index: $scope.getWithdrawItemList[0]['WithdrawItem_Index'],
                                            pstrPalletNo: $scope.data.PalletBarcode,
                                            pstrWithdraw_Index: $scope.data.OrderNumber
                                        }).then(function(isres) {
											
											loadGetWithdrawItem($scope.data.OrderNumber);
											return true;

                                        }).catch(function(res){
                                            isError = true;
                                            AppService.err('SwapPalletInWithDraw', res);
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
            }


        }

    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){

    	$ionicLoading.show();
        if(!$scope.data.OrderNumber || $scope.getWithdrawItemList.length == 0){
            AppService.err('', 'ไม่มีรายการ');
        }else{

        	if(AppService.findObjValue($scope.getWithdrawItemList, 'WITHDRAWITEM-STATUS', '-9', false).length > 0){
                $scope.data.PalletBarcode = null;
                AppService.err('', 'หยิบไม่ครบรายการ', 'input-PalletNoBar');
            }else{

            	App.API('waitConfirmWithdrawStatus_Confirm_TranferStatus', { 
                    objsession: angular.copy(LoginService.getLoginData()), 
                    Withdraw_Index: $scope.data.OrderNumber,
                    Status: 2,
                    phRemark: 'MOBILE REQUEST RD TO MT'
                }).then(function(res) {
                    AppService.succ('หยิบครบทุกรายการแล้ว (รอการยืนยันการหยิบสินค้า)');
                }).catch(function(res){
                    AppService.err('waitConfirmWithdrawStatus_Confirm_TranferStatus', res);
                }).finally(function(){
                    $ionicLoading.hide();
                });

            }

        }//end if else
    };


})

.controller('Shipping_NewInShippingCtrl', function($ionicPopup, $scope, $state, $cordovaBarcodeScanner, $filter, $ionicLoading, App, AppService, LoginService) {
  
  	$scope.data = {};
  	$scope.data.ItemPutAway = 0;
  	$scope.data.ItemALL = 0;
  	$scope.dataTFList = {};
  	$scope.dataTFList.length = 0;
  	$scope.getTagOrderIndexList = {};
  	$scope.getTagOrderIndexList.length = 0;
  	$scope.isDisable = false;
  	var isError = false;
    var keyCnt = 0;

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){
        $ionicLoading.show();
        App.API('GetOrderTopic', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "And (ms_DocumentType.DocumentType_Index IN ('0010000000057','0010000000089')) " +
            "and ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0) " + 
            "AND tb_Order.Customer_Index in (select Customer_Index from x_Department_Customer " + 
            "where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1)" ,
            pbooDamage: false
        }).then(function(res) {
            var dataTFList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.dataTFList = dataTFList;
            $scope.dataTFList.length = Object.keys(dataTFList).length;
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
        	$scope.data = {};
        	$scope.data.ItemPutAway = 0;
		  	$scope.data.ItemALL = 0;
		  	$scope.getTagOrderIndexList = {};
		  	$scope.getTagOrderIndexList.length = 0;
            AppService.focus('select-TF');
        } else {

            $scope.data.TF = value;
            var order = value.split(',');
            Order_No = order[0]; 
            Order_Index = order[1]; 

            $ionicLoading.show();
            App.API('GetDetailOrder', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: "and tb_Order.Order_Index= '" + Order_Index + "'"
            }).then(function(res) {

                var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0]; //[2351];  //fix test [0]
                if (Object.keys(dataDetailOrder).length >= 0){
	                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
	                $scope.data.ItemPutAway = (dataDetailOrder.itemPutAway === undefined) ? 0 : dataDetailOrder.itemPutAway;
	                $scope.data.ItemALL = (dataDetailOrder.itemALL === undefined) ? 0 : dataDetailOrder.itemALL;
	                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;

	                if (dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
	                    $ionicLoading.hide();
	                    $scope.isDisable = true;
	                    $ionicPopup.alert({
	                        title: 'Success',
	                        template: 'จัดเก็บเรียบร้อย'
	                    }).then(function(err) {});
	                }
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

                    }).catch(function(res) {
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

        isError = false;
        if (!dataArr.TF){
            AppService.err('', 'กรุณาเลือกใบรับสินค้า');
        }else if (!dataArr.PalletBarcode){
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!');
        }else if (Object.keys($scope.getTagOrderIndexList).length == 0){
            AppService.err('', 'ไม่มีรายการในใบรับนี้ กรุณาจัดการ Tag ก่อน');
        }else{

            $ionicLoading.show();           
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataArr.PalletBarcode
            }).then(function(res) {
                var getTagByPallet = res['diffgr:diffgram'];
                if (getTagByPallet && Object.keys(res['diffgr:diffgram'].NewDataSet.Table1).length > 0) {
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน');
                    isError = true;
                }
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

                        var Qty_BY_Order_AS_Shipping = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ',Qty_BY_Order_AS_Shipping);
                        if (Object.keys(Qty_BY_Order_AS_Shipping).length <= 0) {
                            $scope.data.PalletBarcode = null;
                            AppService.err('', 'Pallet นี้ ไม่อยู่ใน Order นี้', 'input-PalletNoBar');
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
                                pdblQty_Per_Tag: (Qty_Per_Tag) ? Qty_Per_Tag : 0,
                                pstrHoldFlag: ''
                            }).then(function(res) {

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
                                        pOrder_Index: Order_Index, 
                                        Pallet_No: $scope.data.PalletNo,
                                    }).then(function(res) {

                                        var getTag_Sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                        if (Object.keys(getTag_Sum).length > 0) {
                                            $scope.data.CountTagRoll = getTag_Sum[0].Count_Tag;
                                            $scope.data.WeightTagKG = getTag_Sum[0].Weight_Tag;
                                            $scope.data.QtyTagM = getTag_Sum[0].Qty_Tag;
                                        }
                                    }).catch(function(res) {
                                        isError = true;
                                        AppService.err('getTag_Sum', res);
                                    }).finally(function(res) {

                                    	if (!isError) {
                                            App.API('updatePalletSumWeight', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pallet_no: $scope.data.PalletNo,
                                                count: $scope.data.QtyTagM,
                                                weight: $scope.data.WeightTagKG,
                                                fag: 'NewIn_V2',
                                                lot: '',
                                                sku: ''
                                            }).then(function(res) {
                                               
                                            }).catch(function(res) {
                                                isError = true;
                                                AppService.err('updatePalletSumWeight', res);
                                            }).finally(function(res) {

                                            	if (!isError) {
                                                    App.API('getTag_Detail_Putaway_TPIPL', {
                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                        pOrder_Index: Order_Index,
                                                    }).then(function(res) {                                                       

                                                        var getTag_Detail_Putaway_TPIPL = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                        if (Object.keys(getTag_Detail_Putaway_TPIPL).length > 0) {
                                                            $scope.data.SkuID = getTag_Detail_Putaway_TPIPL[0].sku_Id;
                                                            $scope.data.Lot = getTag_Detail_Putaway_TPIPL[0].plot;
                                                            $scope.data.OrderDate = $filter('date')(getTag_Detail_Putaway_TPIPL[0].Order_Date, 'dd/MM/yyyy');
                                                            $scope.data.CountTagRoll = getTag_Detail_Putaway_TPIPL[0].qty_per_tag;
                                                            $scope.data.StartStatus = 'BG';
                                                            $scope.data.EndStatus = 'WH';
                                                            $scope.data.LocationAlias = getTag_Detail_Putaway_TPIPL[0].location_alias;
                                                        }
                                                    }).catch(function(res) {
                                                        isError = true;
                                                        AppService.err('getTag_Detail_Putaway_TPIPL', res);
                                                    }).finally(function(res) {                                                       
                                                        
                                                        App.API('GetDetailOrder', {
                                                            objsession: angular.copy(LoginService.getLoginData()),
                                                            pstrWhere: "and tb_Order.Order_Index= '" + Order_Index + "'"
                                                        }).then(function(res) {

                                                            var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0]; //[2351];  //fix test [0]
                                                            if (Object.keys(dataDetailOrder).length >= 0){
                                                                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
                                                                $scope.data.ItemPutAway = (dataDetailOrder.itemPutAway === undefined) ? 0 : dataDetailOrder.itemPutAway;
                                                                $scope.data.ItemALL = (dataDetailOrder.itemALL === undefined) ? 0 : dataDetailOrder.itemALL;
                                                                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;

                                                                if (dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
                                                                    $ionicLoading.hide();
                                                                    $scope.isDisable = true;
                                                                    $ionicPopup.alert({
                                                                        title: 'Success',
                                                                        template: 'จัดเก็บเรียบร้อย'
                                                                    }).then(function(err) {});
                                                                }
                                                            }

                                                        }).catch(function(res) {
                                                            isError = true;
                                                            AppService.err('GetDetailOrder', res);
                                                        }).finally(function(res) {
                                                            $ionicLoading.hide();
                                                        });
                                                        
                                                    });
                                                }

                                            }); // End Call API updatePalletSumWeight
                                        }

                                    }); //End Call API getTag_Sum
                                }

                            }); //End Call API FindLocationAndInsert_NewIn
                        }

                    }); //End Call API getQtyPerPallet_BY_Order_AS_Shipping
                }

            }); //End Call API getTagByPallet

        }

    };


    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(dataArr) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save(dataArr,'');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


  
})

.controller('Shipping_CustomerReturnCtrl', function($ionicPopup, $scope, $state, $cordovaBarcodeScanner, $filter, $ionicLoading, App, AppService, LoginService) {
  
  	$scope.data = {};
  	$scope.data.ItemPutAway = 0;
  	$scope.data.ItemALL = 0;
  	$scope.dataTFList = {};
  	$scope.dataTFList.length = 0;
  	$scope.getTagOrderIndexList = {};
  	$scope.getTagOrderIndexList.length = 0;
  	$scope.isDisable = false;
  	var isError = false;
    var keyCnt = 0;

    /*--------------------------------------
    Call API GetOrderTopic_API
    ------------------------------------- */
    $scope.GetOrderTopic_API = function(){

        $ionicLoading.show();
        App.API('GetOrderTopic', { 
            objsession: angular.copy(LoginService.getLoginData()), 
            pstrWhere: "And (ms_DocumentType.DocumentType_Index IN ('0010000000004')) " +
            "AND tb_Order.Customer_Index in (select Customer_Index from x_Department_Customer " + 
            "where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1)" ,
            // pstrWhere: "" ,
            pbooDamage: false
        }).then(function(res) {
            var dataTFList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            $scope.dataTFList = dataTFList;
            $scope.dataTFList.length = Object.keys(dataTFList).length;
            console.log('res = ',$scope.dataTFList);
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
        	$scope.data.ItemPutAway = 0;
		  	$scope.data.ItemALL = 0;
		  	$scope.getTagOrderIndexList = {};
		  	$scope.getTagOrderIndexList.length = 0;
            AppService.focus('select-TF');
        } else {

            $scope.data.TF = value;
            var order = value.split(',');
            Order_No = order[0]; 
            Order_Index = order[1]; 

            $ionicLoading.show();
            App.API('GetDetailOrder', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: "and tb_Order.Order_Index= '" + Order_Index + "'"
            }).then(function(res) {

                var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                if (Object.keys(dataDetailOrder).length >= 0){
	                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
	                $scope.data.ItemPutAway = (dataDetailOrder.itemPutAway === undefined) ? 0 : dataDetailOrder.itemPutAway;
	                $scope.data.ItemALL = (dataDetailOrder.itemALL === undefined) ? 0 : dataDetailOrder.itemALL;
	                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;

	                if (dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
	                    $ionicLoading.hide();
	                    $scope.isDisable = true;
	                    $ionicPopup.alert({
	                        title: 'Success',
	                        template: 'จัดเก็บเรียบร้อย'
	                    }).then(function(err) {});
	                }
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

                    }).catch(function(res) {
                        AppService.err('getTag_OrderIndex_TPIPL', res);
                    }).finally(function(res) {
                        $ionicLoading.hide();
                        AppService.focus('input-PalletNoBar');
                    });
                }

            }); // End Call API GetDetailOrder

        }
    };


    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(dataArr,action) {

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

        isError = false;
        if (!dataArr.TF){
            AppService.err('', 'กรุณาเลือกใบรับสินค้า');
        }else if (!dataArr.PalletBarcode){
            AppService.err('', 'กรุณากรอกเลขที่ Pallet!');
        }else if (Object.keys($scope.getTagOrderIndexList).length == 0){
            AppService.err('', 'ไม่มีรายการในใบรับนี้ กรุณาจัดการ Tag ก่อน');
        }else{

            $ionicLoading.show();           
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataArr.PalletBarcode
            }).then(function(res) {

                var getTagByPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                if (Object.keys(getTagByPallet).length > 0) {
                    AppService.err('', 'Pallet นี้ กำลังใช้งาน');
                    isError = true;
                }
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
                        var Qty_BY_Order_AS_Shipping = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        if (Object.keys(Qty_BY_Order_AS_Shipping).length <= 0) {
                            $scope.data.PalletBarcode = null;
                            AppService.err('', 'Pallet นี้ ไม่อยู่ใน Order นี้', 'input-PalletNoBar');
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
                                pdblQty_Per_Tag: (Qty_Per_Tag) ? Qty_Per_Tag : 0,
                                pstrHoldFlag: ''
                            }).then(function(res) {

                                var FindLocationAndInsert_NewIn = res;
                                if (FindLocationAndInsert_NewIn) {
                                    AppService.err('', 'จัดเก็บเรียบร้อย');
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
                                        pOrder_Index: Order_Index, 
                                        Pallet_No: $scope.data.PalletNo,
                                    }).then(function(res) {

                                        var getTag_Sum = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                        if (Object.keys(getTag_Sum).length > 0) {
                                            $scope.data.CountTagRoll = getTag_Sum[0].Count_Tag;
                                            $scope.data.WeightTagKG = getTag_Sum[0].Weight_Tag;
                                            $scope.data.QtyTagM = getTag_Sum[0].Qty_Tag;
                                        }
                                    }).catch(function(res) {
                                        isError = true;
                                        AppService.err('getTag_Sum', res);
                                    }).finally(function(res) {

                                    	if (!isError) {
                                            App.API('updatePalletSumWeight', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                pallet_no: $scope.data.PalletNo,
                                                count: $scope.data.QtyTagM,
                                                weight: $scope.data.WeightTagKG,
                                                fag: 'NewIn_V2',
                                                lot: '',
                                                sku: ''
                                            }).then(function(res) {
                                               
                                            }).catch(function(res) {
                                                isError = true;
                                                AppService.err('updatePalletSumWeight', res);
                                            }).finally(function(res) {

                                            	if (!isError) {
                                                    App.API('getTag_Detail_Putaway_TPIPL', {
                                                        objsession: angular.copy(LoginService.getLoginData()),
                                                        pOrder_Index: Order_Index,
                                                    }).then(function(res) {                                                       

                                                        var getTag_Detail_Putaway_TPIPL = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                                                         console.log('res = ',getTag_Detail_Putaway_TPIPL);
                                                        if (Object.keys(getTag_Detail_Putaway_TPIPL).length > 0) {
                                                            $scope.data.SkuID = getTag_Detail_Putaway_TPIPL[0].sku_Id;
                                                            $scope.data.Lot = getTag_Detail_Putaway_TPIPL[0].plot;
                                                            $scope.data.OrderDate = $filter('date')(getTag_Detail_Putaway_TPIPL[0].Order_Date, 'dd/MM/yyyy');
                                                            $scope.data.CountTagRoll = getTag_Detail_Putaway_TPIPL[0].qty_per_tag;
                                                            $scope.data.StartStatus = 'BG';
                                                            $scope.data.EndStatus = 'WH';
                                                            $scope.data.LocationAlias = getTag_Detail_Putaway_TPIPL[0].location_alias;
                                                        }
                                                    }).catch(function(res) {
                                                        isError = true;
                                                        AppService.err('getTag_Detail_Putaway_TPIPL', res);
                                                    }).finally(function(res) {   

                                                        App.API('GetDetailOrder', {
                                                            objsession: angular.copy(LoginService.getLoginData()),
                                                            pstrWhere: "and tb_Order.Order_Index= '" + Order_Index + "'"
                                                        }).then(function(res) {

                                                            var dataDetailOrder = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
                                                            if (Object.keys(dataDetailOrder).length >= 0){
                                                                $scope.data.Ref_No1 = dataDetailOrder.Ref_No1;
                                                                $scope.data.ItemPutAway = (dataDetailOrder.itemPutAway === undefined) ? 0 : dataDetailOrder.itemPutAway;
                                                                $scope.data.ItemALL = (dataDetailOrder.itemALL === undefined) ? 0 : dataDetailOrder.itemALL;
                                                                $scope.data.BaggingOrder_index = dataDetailOrder.baggingorder_index;

                                                                if (dataDetailOrder.itemPutAway == dataDetailOrder.itemALL) {
                                                                    $ionicLoading.hide();
                                                                    $scope.isDisable = true;
                                                                    $ionicPopup.alert({
                                                                        title: 'Success',
                                                                        template: 'จัดเก็บเรียบร้อย'
                                                                    }).then(function(err) {});
                                                                }
                                                            }

                                                        }).catch(function(res) {
                                                            isError = true;
                                                            AppService.err('GetDetailOrder', res);
                                                        }).finally(function(res) {
                                                            $ionicLoading.hide();
                                                        });
                                                    });
                                                }

                                            }); //End Call API updatePalletSumWeight
                                        }

                                    }); //End Call API getTag_Sum
                                }

                            }); //End Call API FindLocationAndInsert_NewIn
                        }

                    }); //End Call API getQtyPerPallet_BY_Order_AS_Shipping
                }

            }); //End Call API getTagByPallet

        }

    };
      	

    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function(dataArr) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (!imageData.cancelled){
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.save(dataArr,'');
            }
        }, function(error) {
            AppService.err('scanBarcode', error);
        });
    };


  
});