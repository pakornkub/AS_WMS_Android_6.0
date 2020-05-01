/**
 * Production.Controllers Module
 *
 * Description
 */
angular.module('TumblingMix.Controllers', ['ionic'])


.controller('TumblingMix_MixRawMatCtrl', function($ionicPopup, $scope, $state, $filter, $stateParams, $ionicLoading, $cordovaBarcodeScanner, AppService, App, LoginService) {

    $scope.data = {};
    $scope.getBagging = {};
    $scope.getBatch = {};
    $scope.palletdetail = {};

    var PD_No = "";
    var keyCnt = 0;
    var Arraybatch = [];
    var ProductType_Index = "";
    var Class_product = "";
    var Ref_no5 = "";
    var Substr_batch = "";

    /*--------------------------------------
    Call API PD
    ------------------------------------- */
    $ionicLoading.show();

    App.API('getProductionMixing', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "and Status in ('1','2') order by Production_No DESC"
        // and Status = '1' and (BaggingOrder_No like 'PD%' or BaggingOrder_No like 'TR%') order by BaggingOrder_No
    }).then(function(res) {
        $scope.getBagging = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
       
    }).catch(function(res) {
        AppService.err('getProductionMixing', res);
    }).finally(function() {
        //$scope.geBatch_API();
        $ionicLoading.hide();
    });

    

    $scope.SelectPD = function(){
        PD_No = $scope.data.BagOrder;
        $scope.geBatch_API();
    }
    
    /*--------------------------------------
    Call API Batch
    ------------------------------------- */
    
    $scope.geBatch_API = function(){
        App.API('getBatch', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: "and tb_RmBom_Batch.PD = '"+PD_No+"' and (tb_PDMixRawmat.Status <> 2 or tb_PDMixRawmat.Status is Null ) and tb_RmBom_BatchName.Batch_Name not in (select Batch_No from tb_PDMixRawmat where Production_No = '"+PD_No+"' and Status <> -1 and Status = 2) group by tb_RmBom_BatchName.Batch_Name,tb_RmBom_BatchName.Type_Batch "
        }).then(function(res) {
           
            //$scope.getBatch = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            var obj = JSON.parse(res);
            // console.log(obj.Table1);

            $scope.getBatch = obj.Table1;
         
            // $scope.data.Batch = "";
        }).catch(function(res) {
            AppService.err('getBatch', res);
        }).finally(function() {
            $ionicLoading.hide();
        });
    };

    $scope.SelectBatch = function(){
        Arraybatch = $scope.data.Batch.split(",");
        // console.log(Arraybatch[0].substr(13));
        $scope.data.Batch_Number = Arraybatch[0].substr(13);
        
        if(Arraybatch[1] == '1'){
            $scope.data.Type = 'Batch เต็ม';
        }
        else if(Arraybatch[1] == '2'){
            $scope.data.Type = 'Batch เศษ';
        }
        else{
            $scope.data.Type = '';
        }
    }

    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function (dataSearch, searchType) {
        
        if (searchType == 'Pallet') {
          keyCnt += 1;
          var curTextCount = dataSearch == null ? 0 : dataSearch.length;
        //   console.log('current input text length: ' + curTextCount);
        //   console.log('current input keyCnt: ' + keyCnt);
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
        if (!dataSearch) {
          AppService.err('', 'กรุณา Scan Pallet No.', 'Pallet');
        }else if(!Arraybatch[0]){
            AppService.err('', 'กรุณาเลือก Batch', 'Pallet');
        } 
        else {
            //check ว่า ข้อมูลที่กรอกตรง pallet no. มี R ที่ตำแหน่ง 7 ไหม
            var pos = dataSearch.indexOf("R");
			
            if(pos == 7){
                // console.log('มี R เป็น ข้อมูลของ Roll');

                var lot = dataSearch.substring(0, pos);
                var roll = dataSearch.substring(pos + 1);

                $ionicLoading.show();
                App.API('getTagByPallet_TumblingMix_MB', { 
                    objsession: angular.copy(LoginService.getLoginData()),
                    LotNo: lot,
                    RollNo: roll,
                    BatchNo: Arraybatch[0],
                }).then(function(res) {
                    // console.log(res, lot, roll);
                    var getData = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;	
                   
                    if(Object.keys(getData).length > 0){
                        
                        $scope.data.Detail = getData[0].Str1;
                        $scope.data.QTYBegin = getData[0].Qty_BalNEW;
                        $scope.data.QTYStd = getData[0].Qty_std;
                        $scope.data.TagNo = getData[0].TAG_No;
                        $scope.data.Sku_Index = getData[0].Sku_Index_T;
                        // $scope.data.QTYIssue = parseFloat(getData[0].Qty_BalNEW);
                        $scope.data.Customer_Index = getData[0].Customer_Index;
                        $scope.truefalse = false;
                        $scope.CheckBag = true;
                    }else{
                        AppService.err('', 'ไม่มีการรับเข้า Master Batch ถุงนี้. นี้');
                    }
                }).catch(function(res) {
                    AppService.err('getTagByPallet_TumblingMix_MB', res);
                }).finally(function(res) {
                    $ionicLoading.hide();
                });

            }
                
			else{
                // console.log('ไม่มี R');
            App.API('getTagByPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataSearch
            }).then(function (resTagByP) {
                var Odt = (!angular.isObject(resTagByP['diffgr:diffgram'])) ? {} : resTagByP['diffgr:diffgram'].NewDataSet.Table1;
                
                $scope.data.Detail = "";
                $scope.data.QTYBegin = "";
                $scope.data.QTYStd = "";
                $scope.data.TagNo = "";
                $scope.data.Sku_Index = "";
                $scope.data.QTYIssue = "";
                $scope.data.Customer_Index = "";
                if(!Odt[0]){
                    AppService.err('', 'ไม่มีการรับเข้า Pallet No. นี้');
                }else{
                    ProductType_Index = Odt[0].ProductType_Index;
                    Class_product = Odt[0].Str6;
                    if(ProductType_Index == '0010000000006' && Class_product != 'Master_batch' && Class_product != 'Rawmat'){
                        $scope.getCheckPallet_API();
                    }else{
                        $scope.getCheckPallet_NC_API();
                    }
                }
                

            }).catch(function (res) {
                AppService.err('getTagByPallet', res);
            }).finally(function () {
                $ionicLoading.hide();

            });
            }
				
          
        
        }
        
      };

    /*--------------------------------------
    Call API Check_Pallet
    ------------------------------------- */
    
    $scope.getCheckPallet_API = function(){
        App.API('getTagByPallet_TumblingMix', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPallet_No: $scope.data.Pallet,
            BatchNo: Arraybatch[0],
            Batch_Number: Arraybatch[0].substr(13)
        }).then(function(res) {
            $scope.palletdetail = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
    
            if(!$scope.palletdetail[0]){
                AppService.err('', 'Pallet นี้ Batch No ไม่ตรงกับ Batch No ที่เลือก', 'Batch');
                // $scope.data.Pallet = "";  
            }else{
                $scope.data.Detail = $scope.palletdetail[0].Str1;
                $scope.data.QTYBegin = $scope.palletdetail[0].Qty_BalNEW;
                $scope.data.QTYStd = $scope.palletdetail[0].Qty_std;
                $scope.data.TagNo = $scope.palletdetail[0].TAG_No;
                $scope.data.Sku_Index = $scope.palletdetail[0].Sku_Index;
                $scope.data.Customer_Index = $scope.palletdetail[0].Customer_Index;
                $scope.data.QTYIssue = parseFloat($scope.palletdetail[0].Qty_BalNEW);
                Ref_no5 = $scope.palletdetail[0].Ref_No5;
                $scope.truefalse = true;
                $scope.CheckBag = false;
            }
            
        }).catch(function(res) {
            AppService.err('getTagByPallet_TumblingMix', res);
        }).finally(function() {
            $ionicLoading.hide();
        });
    };

    $scope.getCheckPallet_NC_API = function(){
        App.API('getTagByPallet_TumblingMix_NC', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPallet_No: $scope.data.Pallet,
            BatchNo: Arraybatch[0],
            Batch_Number: Arraybatch[0].substr(13)
        }).then(function(res) {
            $scope.palletdetail = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
    
            if(!$scope.palletdetail[0]){
                AppService.err('', 'Pallet นี้ ไม่สามารถใช้งานกับ Batch no นี้ได้', 'Batch');
                $scope.data.Pallet = "";  
            }else{
                $scope.data.Detail = $scope.palletdetail[0].Str1;
                $scope.data.QTYBegin = parseFloat($scope.palletdetail[0].Qty_BalNEW);
                $scope.data.QTYStd = $scope.palletdetail[0].Qty_std;
                $scope.data.TagNo = $scope.palletdetail[0].TAG_No;
                $scope.data.Sku_Index = $scope.palletdetail[0].Sku_Index;
                $scope.data.Customer_Index = $scope.palletdetail[0].Customer_Index;
                // $scope.data.QTYIssue = $scope.palletdetail[0].Qty_BalNEW;
                $scope.truefalse = false;
                $scope.CheckBag = false;
            }
            
        }).catch(function(res) {
            AppService.err('getTagByPallet_TumblingMix_NC', res);
        }).finally(function() {
            $ionicLoading.hide();
        });
    };
    
    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){
        var x = (parseFloat($scope.data.QTYStd)*2.5)/100;
        var max = parseFloat($scope.data.QTYStd)+parseFloat(x);
        var min = parseFloat($scope.data.QTYStd)-parseFloat(x);
        

        App.API('CheckSeqTumblingMix', {
            objsession: angular.copy(LoginService.getLoginData()),
            Sku_Index: $scope.data.Sku_Index,
            BatchNo: Arraybatch[0]
        }).then(function(res) {
            $scope.CheckSeq = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
    
            
            if($scope.CheckSeq[0].num == 0){
                AppService.err('', 'กรุณา Issue ตามลำดับ', 'ISSUE');
            }else{
                
                App.API('CheckPallet_TumblingMix', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    Sku_Index: $scope.data.Sku_Index,
                    BatchNo: Arraybatch[0]
                }).then(function(res) {
                    $scope.Checkpallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    
                    if($scope.truefalse == true && $scope.data.Batch_Number != Ref_no5){
                        AppService.err('', 'Pallet นี้ Batch No ไม่ตรงกับ Batch No ที่เลือก', 'Batch');
                    }else{
                        if($scope.CheckBag == false){
                            if(!$scope.Checkpallet[0]){
                                if(!PD_No){
                                    AppService.err('', 'กรุณาเลือก PD.', 'PD');
                                }else if(!$scope.data.Location){
                                    AppService.err('', 'กรุณากรอก Location', 'Location');
                                }else if(!Arraybatch[0]){
                                    AppService.err('', 'กรุณาเลือก Batch', 'Batch');
                                }else if(!$scope.data.Pallet){
                                    AppService.err('', 'กรุณาเลือก Pallet No.', 'Pallet');
                                }else if(!$scope.data.Detail){
                                    AppService.err('', 'กรุณาเลือก Pallet ให้ถูกต้อง', 'Pallet');
                                }else if($scope.data.Customer_Index != '0010000000194'){
                                    AppService.err('', 'Pallet ไม่ได้อยู่ใน Tumbling Mix', 'Pallet');
                                }else if(!$scope.data.QTYIssue){
                                    AppService.err('', 'กรุณากรอกจำนวนเบิก', 'IssueQty');
                                }else if(parseFloat($scope.data.QTYIssue) > max.toFixed(3)){
                                    AppService.err('', 'จำนวนเบิก มีค่ามากกว่า QTY Std.', 'IssueQty');
                                }else if(parseFloat($scope.data.QTYIssue) < min.toFixed(3)){
                                    AppService.err('', 'จำนวนเบิก มีค่าน้อยกว่า QTY Std.', 'IssueQty');
                                }
                                else if(parseFloat($scope.data.QTYBegin) < parseFloat($scope.data.QTYIssue)){
                                    AppService.err('', 'จำนวนเบิก มีค่ามากกว่า QTY Begin', 'IssueQty');
                                }
                                else{
                                    
                                    $ionicPopup.confirm({
                                        title: 'Confirm',
                                        template: 'คุณต้องการยืนยัน ?'
                                    }).then(function(res) {
                                        if(res) {
                                        
                                            $ionicLoading.show();
                        
                                            App.API('insertPDMixRawmat', {
                                                objsession: angular.copy(LoginService.getLoginData()),
                                                    PD_No: PD_No,
                                                    Location_Index: $scope.data.Location,
                                                    Batch_No: Arraybatch[0],
                                                    Batch_Type: Arraybatch[1],
                                                    Pallet_No: $scope.data.Pallet,
                                                    Tag_No: $scope.data.TagNo,
                                                    Qty_Begin: $scope.data.QTYBegin,
                                                    Qty_Std: $scope.data.QTYStd,
                                                    Qty_Issue: $scope.data.QTYIssue
                                            }).then(function(res) {
                                                AppService.succ('ทำการบันทึกเรียบร้อยแล้ว', 'Pallet');
                                                $scope.geBatch_API();
                                                // $scope.data = {};
                                                // $scope.data.Batch_Number = "";
                                                // $scope.data.Type = "";
                                                $scope.data.Pallet = "";
                                                $scope.data.Detail = "";
                                                $scope.data.QTYBegin = "";
                                                $scope.data.QTYStd = "";
                                                $scope.data.QTYIssue = "";
                                                $scope.data.Sku_Index = "";
                                                $scope.data.TagNo = "";
                                                $scope.data.Customer_Index = "";
                                            }).catch(function(res) {
                                                AppService.err('insertPDMixRawmat', res);
                                            }).finally(function() {
                                                $ionicLoading.hide();
                                            });
                        
                                        }
                                    }); //End Popup
                                }
                            }else{
                                AppService.err('', 'มีการ Mix Rawmat ใน Batch นี้แล้ว', 'Batch'); 
                            }
                        }else{
                            if(!PD_No){
                                AppService.err('', 'กรุณาเลือก PD.', 'PD');
                            }else if(!$scope.data.Location){
                                AppService.err('', 'กรุณากรอก Location', 'Location');
                            }else if(!Arraybatch[0]){
                                AppService.err('', 'กรุณาเลือก Batch', 'Batch');
                            }else if(!$scope.data.Pallet){
                                AppService.err('', 'กรุณาเลือก Pallet No.', 'Pallet');
                            }else if(!$scope.data.Detail){
                                AppService.err('', 'กรุณาเลือก Pallet ให้ถูกต้อง', 'Pallet');
                            }else if($scope.data.Customer_Index != '0010000000194'){
                                AppService.err('', 'Pallet ไม่ได้อยู่ใน Tumbling Mix', 'Pallet');
                            }else if(!$scope.data.QTYIssue){
                                AppService.err('', 'กรุณากรอกจำนวนเบิก', 'IssueQty');
                            }
                            else if(parseFloat($scope.data.QTYBegin) < parseFloat($scope.data.QTYIssue)){
                                AppService.err('', 'จำนวนเบิก มีค่ามากกว่า QTY Begin', 'IssueQty');
                            }
                            else{
                                
                                $ionicPopup.confirm({
                                    title: 'Confirm',
                                    template: 'คุณต้องการยืนยัน ?'
                                }).then(function(res) {
                                    if(res) {
                                    
                                        $ionicLoading.show();
                    
                                        App.API('insertPDMixRawmat', {
                                            objsession: angular.copy(LoginService.getLoginData()),
                                                PD_No: PD_No,
                                                Location_Index: $scope.data.Location,
                                                Batch_No: Arraybatch[0],
                                                Batch_Type: Arraybatch[1],
                                                Pallet_No: $scope.data.Pallet,
                                                Tag_No: $scope.data.TagNo,
                                                Qty_Begin: $scope.data.QTYBegin,
                                                Qty_Std: $scope.data.QTYStd,
                                                Qty_Issue: $scope.data.QTYIssue
                                        }).then(function(res) {
                                            AppService.succ('ทำการบันทึกเรียบร้อยแล้ว', 'Pallet');
                                            $scope.geBatch_API();
                                            // $scope.data = {};
                                            // $scope.data.Batch_Number = "";
                                            // $scope.data.Type = "";
                                            $scope.data.Pallet = "";
                                            $scope.data.Detail = "";
                                            $scope.data.QTYBegin = "";
                                            $scope.data.QTYStd = "";
                                            $scope.data.QTYIssue = "";
                                            $scope.data.Sku_Index = "";
                                            $scope.data.TagNo = "";
                                            $scope.data.Customer_Index = "";
                                        }).catch(function(res) {
                                            AppService.err('insertPDMixRawmat', res);
                                        }).finally(function() {
                                            $ionicLoading.hide();
                                        });
                    
                                    }
                                }); //End Popup
                            }
                        }
                    }
                    
                    
                }).catch(function(res) {
                    AppService.err('CheckPallet_TumblingMix', res);
                }).finally(function() {
                    $ionicLoading.hide();
                });

            }
            
        }).catch(function(res) {
            AppService.err('CheckSeqTumblingMix', res);
        }).finally(function() {
            $ionicLoading.hide();
        });


        // ----



        
        
        
    };
    /*--------------------------------------
    clear Function
    ------------------------------------- */
    $scope.clear = function(){
        $scope.data = {};
    };

    /*--------------------------------------
    Scan Barcode Function
    ------------------------------------- */
    $scope.scanBarcode = function() {
        $scope.data.PalletSearchFlag ='yes';
        //console.log('search flag at Barcode scan:' + $scope.data.PalletSearchFlag);
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            
            if (!imageData.cancelled){
                //$scope.data.PalletSearchFlag ='yes';
               // console.log('search flag at Barcode scan:' + $scope.data.PalletSearchFlag);
                $scope.data.PalletBarcode = imageData.text.toUpperCase();
                $scope.search();
            }
        }, function(error) {
            //isTrySearch= false;
            AppService.err('scanBarcode', error);
        });

    };

    
});

