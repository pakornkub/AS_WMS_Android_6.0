/**
 * Store.Controllers Module
 *
 * Description
 */
angular.module('Store.Controllers', ['ionic'])

.controller('Store_WeighingChemicalCtrl', function($ionicPopup,$ionicLoading, $scope, $rootScope, $state, App, LoginService, AppService, $cordovaBarcodeScanner) {
    $scope.data = {};
    $scope.getBagging = {};
    $scope.palletdetail = {};

    var PD_No = "";
    var keyCnt = 0;
    var ProductType_Index = "";
    var Class_product = "";
    var Ref_no5 = "";

    $scope.$on("$destroy", function () {
        if ($rootScope.promise) {
            $rootScope.stopCount();
        }
    });

    /*--------------------------------------
    Call API PD
    ------------------------------------- */
    AppService.startLoading();

    App.API('getProductionMixing', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "and Status = '1' order by Production_No DESC"
        // and Status = '1' and (BaggingOrder_No like 'PD%' or BaggingOrder_No like 'TR%') order by BaggingOrder_No
    }).then(function(res) {
        $scope.getBagging = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
       
    }).catch(function(res) {
        AppService.err('getProductionMixing', res);
    }).finally(function() {
        AppService.stopLoading();
    });

    

    $scope.SelectPD = function(){
        PD_No = $scope.data.BagOrder;
        
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
        }
        else {
          /////////////////////////////////////////////
            App.API('getTagByPallet_WeighingChemical', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataSearch
            }).then(function (resTagByP) {
                var Odt = (!angular.isObject(resTagByP['diffgr:diffgram'])) ? {} : resTagByP['diffgr:diffgram'].NewDataSet.Table1;
                $scope.data.Sku_Id = "";
                $scope.data.Detail = "";
                $scope.data.Lot = "";
                $scope.data.QTY = "";
                $scope.data.TagNo = "";
                $scope.data.Sku_Index = "";
                $scope.data.Customer_Index = "";
                if(!Odt[0]){
                    AppService.err('', 'ไม่มีการรับเข้า Pallet No. นี้ in Store Chemical');
                }else{
                    if(Odt[0].ProductType_Index != '0010000000006'){
                        AppService.err('', 'Pallet นี้ ไม่ใช่ Chemical');
                    }
                    else{
                        // console.log(Odt[0]);
                        $scope.data.Sku_Id = Odt[0].Sku_Id;
                        $scope.data.Detail = Odt[0].Str1;
                        $scope.data.Lot = Odt[0].PLot;
                        $scope.data.QTY = Odt[0].Qty;
                        $scope.data.TagNo = Odt[0].TAG_No;
                        $scope.data.Sku_Index = Odt[0].Sku_Index;
                        $scope.data.Customer_Index = Odt[0].Customer_Index;
                    }
                }
                
               
            }).catch(function (res) {
                AppService.err('getTagByPallet_WeighingChemical', res);
            }).finally(function () {
                AppService.stopLoading();

            });
        
        }
        
      };

    /*--------------------------------------
    Call API Check_Pallet
    ------------------------------------- */
    
    

    
    /*--------------------------------------
    Save Function
    ------------------------------------- */
    $scope.save = function(){
        
        // console.log($scope.data.Sku_Index);
        // console.log($scope.data.TagNo);
        // console.log($scope.data.BagOrder);

        App.API('CheckPallet_WeighingChemical', {
            objsession: angular.copy(LoginService.getLoginData()),
            Sku_Index: $scope.data.Sku_Index,
            Tag_No: $scope.data.TagNo,
            PD: $scope.data.BagOrder
        }).then(function(res) {
            // $scope.Checkpallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            var Checkpallet = (!angular.isObject(res['diffgr:diffgram'])) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

            if(!Checkpallet[0]){
                AppService.err('', 'ไม่มีการจอง Pallet นี้ in Intranet หรือ เลือก PD No. ผิด', 'Intranet');
                
            }else{
                // console.log(Checkpallet[0].Chemical_Sku_Index);
                if(Checkpallet[0].Status == 2){
                    AppService.err('', 'มีการยิง Issue Pallet นี้แล้ว', 'PD');
                }else{
                        
                    $ionicPopup.confirm({
                        title: 'Confirm',
                        template: 'คุณต้องการยืนยัน ?'
                        }).then(function(res) {
                        if(res) {
                            
                            AppService.startLoading();
        
                            App.API('update_WeighingChemical', {
                                objsession: angular.copy(LoginService.getLoginData()),
                                    PD_No: $scope.data.BagOrder,
                                    Chemical_index: Checkpallet[0].Chemical_Sku_Index
                            }).then(function(res) {
                                AppService.succ('ทำการบันทึกเรียบร้อยแล้ว', 'Pallet');
                                $scope.data.Pallet = "";
                                $scope.data.Detail = "";
                                $scope.data.Sku_Id = "";
                                $scope.data.Lot = "";
                                $scope.data.QTY = "";
                                $scope.data.Sku_Index = "";
                                $scope.data.TagNo = "";
                                $scope.data.Customer_Index = "";
                            }).catch(function(res) {
                                AppService.err('update_WeighingChemical', res);
                            }).finally(function() {
                                AppService.stopLoading();
                            });
        
                        }
                    }); //End Popup
                }
                    
            }
            
            
            
            
        }).catch(function(res) {
            AppService.err('CheckPallet_WeighingChemical', res);
        }).finally(function() {
            AppService.stopLoading();
        });
        
        
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

