/**
 * Bagging.Controllers Module
 *
 * Description
 */
angular.module('Bagging.Controllers', ['ionic'])

  .controller('Bagging_BagJumboCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {
    // hudcha
    $scope.data = {};
    $scope.data.Grade = "";
    $scope.data.Lot = "";
    $scope.data.Total = "";
    $scope.data.Count = "";
    $scope.data.Line = "";
    $scope.data.Qty = "";
    $scope.data.MaxSeq = "";

    $scope.data.Package_Index = "";
    $scope.data.Sku_Index = "";
    $scope.data.Remark = "";
    $scope.data.Ratio = "";
    $scope.data.Qty_Per_Pallet = "";

    $scope.getBaggingOrderHeaderList = {};
    $scope.getBaggingOrderHeaderItem = {};
    $scope.countBaggingOrderItemList = {};
    $scope.isDisable = false;
    $scope.BaggingOrder_No = "";
    $scope.BaggingOrder_Index = "";
    $scope.dataTableItem = [];
    $scope.dataTableItemLength = 0;
    var whereStr = "";
    var isExit = true;
    var keyCnt = 0;
    var resCnt = 0;

    var setFocus = function () {
      $scope.data.PalletNo = null;
      AppService.focus('PalletNo');
    };


    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $scope.getBaggingOrderHeader_API = function () {
      $ionicLoading.show();
      App.API('getBaggingOrderHeader', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "And Status ='1'"
      }).then(function (res) {
        $scope.getBaggingOrderHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        //console.log('res = ', res);
      }).catch(function (res) {
        AppService.err('getBaggingOrderHeaderList', res);
      }).finally(function (res) {
        $ionicLoading.hide();
        $("#BaggingOrder").focus();
      });
    };

    $scope.getBaggingOrderHeader_API();


    /*--------------------------------------
    Change Order Function
    ------------------------------------- */
    $scope.changeBaggingOrder = function (value) {

      if (!value) {

        $scope.data = {};
        $scope.getBaggingOrderHeaderItem = {};
        $scope.rollList = {};

      } else {

        $scope.data.BaggingOrder = value;
        var item = value.split(',');
        $scope.BaggingOrder_No = item[0];
        $scope.BaggingOrder_Index = item[1];
        $scope.getBaggingOrderHeaderItem = item;

        $ionicLoading.show();

        App.API('getBaggingOrderHeader', {
          objsession: angular.copy(LoginService.getLoginData()),
          pstrWhere: "And BaggingOrder_No ='" + $scope.BaggingOrder_No + "'"
        }).then(function (res) {

          $scope.getBaggingOrderHeaderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
          $scope.data.Lot = $scope.getBaggingOrderHeaderItem.PLot;
          $scope.data.Qty = $scope.getBaggingOrderHeaderItem.Total_Qty;
          $scope.data.Grade = $scope.getBaggingOrderHeaderItem.Sku_Id;
          $scope.data.Line = $scope.getBaggingOrderHeaderItem.ProductionLine_Index;

          $scope.data.Package_Index = $scope.getBaggingOrderHeaderItem.Package_Index;
          $scope.data.Sku_Index = $scope.getBaggingOrderHeaderItem.Sku_Index;
          $scope.data.Remark = $scope.getBaggingOrderHeaderItem.Remark;
          $scope.data.Ratio = $scope.getBaggingOrderHeaderItem.Ratio;
          $scope.data.Qty_Per_Pallet = $scope.getBaggingOrderHeaderItem.Qty_Per_Pallet;

          //console.log('res = ', $scope.getBaggingOrderHeaderItem);

          App.API('GetLastItem_Seq', {
            objsession: angular.copy(LoginService.getLoginData()),
            pBaggingNo: $scope.BaggingOrder_Index
          }).then(function (res) {

            $scope.countBaggingOrderItemList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            resCnt = Object.keys($scope.countBaggingOrderItemList).length;

            if (resCnt > 0) {
              $scope.data.MaxSeq = ($scope.countBaggingOrderItemList[0].MaxSeq) ? $scope.countBaggingOrderItemList[0].MaxSeq : "0";
              $scope.data.Total = ($scope.countBaggingOrderItemList[0].count_Item) ? $scope.countBaggingOrderItemList[0].count_Item : "0";
            }

            //console.log('res = ', $scope.countBaggingOrderItemList);

          }).catch(function (res) {
            AppService.err('GetLastItem_Seq', res);
          }).finally(function (res) {});

        }).catch(function (res) {
          AppService.err('getBaggingOrderHeader', res);
        }).finally(function (res) {
          //$scope.getGridView_Roll_API();
          $ionicLoading.hide();
          setFocus();
        });
      }
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
        $scope.data.PalletNo = '';
        AppService.err('', 'Scan Pallet No. นี้ไปแล้ว', 'PalletNo');
      } else {

        App.API('getPallet', {
          objsession: angular.copy(LoginService.getLoginData()),
          pstrWhere: " And tb_BGPalletBalance.Pallet_No = '" + dataS + "' "
        }).then(function (res) {

          var getPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
          //console.log('res = ', getPallet);
          if (Object.keys(getPallet).length > 0) {

            App.API('getBalancePallet_No', {
              objsession: angular.copy(LoginService.getLoginData()),
              pPallet_No: dataS
            }).then(function (res) {

              var getBalancePallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
              //console.log('res = ', getBalancePallet_No);
              if (Object.keys(getBalancePallet_No).length == 0) {

                App.API('getPalletCancel_inTranfer', {
                  objsession: angular.copy(LoginService.getLoginData()),
                  pPalletNo: dataS
                }).then(function (res) {

                  var getPalletCancel_inTranfer = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                  //console.log('res = ', getPalletCancel_inTranfer);
                  if (Object.keys(getPalletCancel_inTranfer).length == 0) {

                    App.API('getBaggingPallet_No', {
                      objsession: angular.copy(LoginService.getLoginData()),
                      pPallet_No: dataS
                    }).then(function (res) {

                      var getBaggingPallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                      //console.log('res = ', getBaggingPallet_No);
                      if (Object.keys(getBaggingPallet_No).length == 0) {

                        App.API('getMyBaggingPallet_No', {
                          objsession: angular.copy(LoginService.getLoginData()),
                          pPallet_No: dataS,
                          pBaggingOrder_Index: $scope.BaggingOrder_Index
                        }).then(function (res) {

                          var getMyBaggingPallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                          //console.log('res = ', getMyBaggingPallet_No);
                          if (Object.keys(getMyBaggingPallet_No).length == 0) {

                            if (getPallet[0].PalletStatus == "EM") {

                              $scope.dataTableItem.push({
                                Pallet_No: getPallet[0].Pallet_No,
                                Pallet_Name: getPallet[0].Pallet_Name
                              });

                              $scope.dataTableItemLength = Object.keys($scope.dataTableItem).length;

                              $scope.data.PalletNo = '';
                              $ionicLoading.hide();
                              setFocus();

                            } else {
                              $scope.data.PalletNo = '';
                              AppService.err('', 'Pallet No. นี้ไม่อยู่ในสถานะ EM', 'PalletNo');
                            }

                          } else {
                            $scope.data.PalletNo = '';
                            AppService.err('', 'Pallet No. นี้อยู่ใน BagOut นี้เเล้ว', 'PalletNo');

                          }

                        }).catch(function (res) {
                          AppService.err('getMyBaggingPallet_No', res);
                        }).finally(function () {}); // End Call API getMyBaggingPallet_No

                      } else {
                        $scope.data.PalletNo = '';
                        AppService.err('', 'Pallet No. นี้อยู่ใน BagOut : ' + getBaggingPallet_No[0].BaggingOrder_No + ' ซึ่งยังไม่ได้ TF', 'PalletNo');
                      }

                    }).catch(function (res) {
                      AppService.err('getBaggingPallet_No', res);
                    }).finally(function () {}); // End Call API getBaggingPallet_No

                  } else {
                    $scope.data.PalletNo = '';
                    AppService.err('', 'Pallet No. นี้อยู่ใน Tranfer ที่ยังไม่เสร็จสิ้น', 'PalletNo');
                  }

                }).catch(function (res) {
                  AppService.err('getPalletCancel_inTranfer', res);
                }).finally(function () {}); // End Call API getPalletCancel_inTranfer

              } else {
                $scope.data.PalletNo = '';
                AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');
              }

            }).catch(function (res) {
              AppService.err('getBalancePallet_No', res);
            }).finally(function () {}); // End Call API getBalancePallet_No

          } else {
            $scope.data.PalletNo = '';
            AppService.err('', 'ไม่พบ Pallet No. นี้ ในระบบ', 'PalletNo');
          }

        }).catch(function (res) {
          AppService.err('getPallet', res);
        }).finally(function () {}); //End Call API getPallet

      }

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



          $ionicLoading.show();

          AppService.blur();

          var items = [];
          angular.forEach($scope.dataTableItem, function (value, key) {

            var item = {
              "Pallet_No": value.Pallet_No,
              "Pallet_Name": value.Pallet_Name
            }

            //แก้ไข Pallet Insert เบิ้ล
            let count = 0;

            for (let x in $scope.dataTableItem) {
             if(value.Pallet_No ==  $scope.dataTableItem[x]['Pallet_No'])
             count++;
            }
            //----------------------

            if(count == 1)
            this.push(item);

          }, items);

          var ads = {
            "Table1": items
          };

          //console.log(ads);
          App.API('BagPalletToBG', {
            objsession: angular.copy(LoginService.getLoginData()),
            ads: JSON.stringify(ads),
            pBaggingNo: $scope.BaggingOrder_Index,
            qty: $scope.data.Qty_Per_Pallet,
            sku_index: $scope.data.Sku_Index,
            package: $scope.data.Package_Index,
            weight: $scope.data.Qty_Per_Pallet,
            holdflag: "-",
            palletstatus_index: "0010000000002",
            comment: ($scope.data.Remark) ? $scope.data.Remark : "",
            pItem_Seq: $scope.data.MaxSeq,
            pLot: $scope.data.Lot,
            radio: $scope.data.Ratio

          }).then(function (res) {
            //API not return
            //console.log('res = ', res);
            //if(res == 'True'){
            //$scope.data = {};
            $scope.dataTableItem = [];
            $scope.dataTableItemLength = 0;
            //$scope.data.Count = $scope.dataTableItemLength;
            $scope.changeBaggingOrder($scope.data.BaggingOrder);
            //}
            //AppService.succ('Clear Pallet Success :: ', res);  
            AppService.succ('Bag เรียบร้อยแล้ว','PalletNo');

          }).catch(function (res) {
            AppService.err('BagPalletToBG', res);
          }).finally(function () {
            $ionicLoading.hide();
            setFocus();
          });

        }); //End Confirm Popup

      } else {

        AppService.err('', 'ไม่มีรายการ Pallet', 'PalletNo');
        setFocus();
      }
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
        AppService.err('', 'ไม่มีรายการ Pallet No. ที่เลือก');
      } else {
        for (var i in $scope.dataTableItem) {
          if ($scope.dataTableItem[i].isSelect)
            $scope.dataTableItem.splice(i, 1);
        }

        $scope.dataTableItemLength = $scope.dataTableItemLength-1
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

  })

  .controller('Bagging_BagFilmCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {
    // hudcha
    $scope.data = {};
    $scope.data.Grade = "";
    $scope.data.Lot = "";
    $scope.data.Total = "";
    $scope.data.Count = "";
    $scope.data.Line = "";
    $scope.data.Qty = "";
    $scope.data.MaxSeq = "";

    $scope.data.Package_Index = "";
    $scope.data.Sku_Index = "";
    $scope.data.Remark = "";
    $scope.data.Ratio = "";
    $scope.data.Qty_Per_Pallet = "";

    $scope.getBaggingOrderHeaderList = {};
    $scope.getBaggingOrderHeaderItem = {};
    $scope.countBaggingOrderItemList = {};
    $scope.isDisable = false;
    $scope.BaggingOrder_No = "";
    $scope.BaggingOrder_Index = "";
    $scope.dataTableItem = [];
    $scope.dataTableItemLength = 0;
    var whereStr = "";
    var isExit = true;
    var keyCnt = 0;
    var resCnt = 0;

    var setFocus = function () {
      $scope.data.PalletNo = null;
      AppService.focus('PalletNo');
    };


    /*--------------------------------------
    Call API getBaggingOrderHeader
    ------------------------------------- */
    $scope.getBaggingOrderHeader_API = function () {
      $ionicLoading.show();
      App.API('getBaggingOrderHeader', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: "And Status ='1'"
      }).then(function (res) {
        $scope.getBaggingOrderHeaderList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        //console.log('res = ', res);
      }).catch(function (res) {
        AppService.err('getBaggingOrderHeaderList', res);
      }).finally(function (res) {
        $ionicLoading.hide();
        $("#BaggingOrder").focus();
      });
    };

    $scope.getBaggingOrderHeader_API();


    /*--------------------------------------
    Change Order Function
    ------------------------------------- */
    $scope.changeBaggingOrder = function (value) {

      if (!value) {

        $scope.data = {};
        $scope.getBaggingOrderHeaderItem = {};
        $scope.rollList = {};

      } else {

        $scope.data.BaggingOrder = value;
        var item = value.split(',');
        $scope.BaggingOrder_No = item[0];
        $scope.BaggingOrder_Index = item[1];
        $scope.getBaggingOrderHeaderItem = item;

        $ionicLoading.show();

        App.API('getBaggingOrderHeader', {
          objsession: angular.copy(LoginService.getLoginData()),
          pstrWhere: "And BaggingOrder_No ='" + $scope.BaggingOrder_No + "'"
        }).then(function (res) {

          $scope.getBaggingOrderHeaderItem = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1[0];
          $scope.data.Lot = $scope.getBaggingOrderHeaderItem.PLot;
          $scope.data.Qty = $scope.getBaggingOrderHeaderItem.Total_Qty;
          $scope.data.Grade = $scope.getBaggingOrderHeaderItem.Sku_Id;
          $scope.data.Line = $scope.getBaggingOrderHeaderItem.ProductionLine_Index;

          $scope.data.Package_Index = $scope.getBaggingOrderHeaderItem.Package_Index;
          $scope.data.Sku_Index = $scope.getBaggingOrderHeaderItem.Sku_Index;
          $scope.data.Remark = $scope.getBaggingOrderHeaderItem.Remark;
          $scope.data.Ratio = $scope.getBaggingOrderHeaderItem.Ratio;
          $scope.data.Qty_Per_Pallet = $scope.getBaggingOrderHeaderItem.Qty_Per_Pallet;

          //console.log('res = ', $scope.getBaggingOrderHeaderItem);

          App.API('GetLastItem_Seq', {
            objsession: angular.copy(LoginService.getLoginData()),
            pBaggingNo: $scope.BaggingOrder_Index
          }).then(function (res) {

            $scope.countBaggingOrderItemList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            resCnt = Object.keys($scope.countBaggingOrderItemList).length;

            if (resCnt > 0) {
              $scope.data.MaxSeq = ($scope.countBaggingOrderItemList[0].MaxSeq) ? $scope.countBaggingOrderItemList[0].MaxSeq : "0";
              $scope.data.Total = ($scope.countBaggingOrderItemList[0].count_Item) ? $scope.countBaggingOrderItemList[0].count_Item : "0";
            }

            //console.log('res = ', $scope.countBaggingOrderItemList);

          }).catch(function (res) {
            AppService.err('GetLastItem_Seq', res);
          }).finally(function (res) {});

        }).catch(function (res) {
          AppService.err('getBaggingOrderHeader', res);
        }).finally(function (res) {
          //$scope.getGridView_Roll_API();
          $ionicLoading.hide();
          $("#Qty_Roll").focus();
        });
      }
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

      App.API('getPallet', {
        objsession: angular.copy(LoginService.getLoginData()),
        pstrWhere: " And tb_BGPalletBalance.Pallet_No = '" + dataS + "' "
      }).then(function (res) {

        var getPallet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
        //console.log('res = ', getPallet);
        if (Object.keys(getPallet).length > 0) {

          App.API('getBalancePallet_No', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPallet_No: dataS
          }).then(function (res) {

            var getBalancePallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
            //console.log('res = ', getBalancePallet_No);

            if (Object.keys(getBalancePallet_No).length == 0) {

              App.API('getPalletCancel_inTranfer', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPalletNo: dataS
              }).then(function (res) {

                var getPalletCancel_inTranfer = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                //console.log('res = ', getPalletCancel_inTranfer);
                if (Object.keys(getPalletCancel_inTranfer).length == 0) {

                  App.API('getBaggingPallet_No', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pPallet_No: dataS
                  }).then(function (res) {

                    var getBaggingPallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    //console.log('res = ', getBaggingPallet_No);
                    if (Object.keys(getBaggingPallet_No).length == 0) {

                      App.API('getMyBaggingPallet_No', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPallet_No: dataS,
                        pBaggingOrder_Index: $scope.BaggingOrder_Index
                      }).then(function (res) {

                        var getMyBaggingPallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        //console.log('res = ', getMyBaggingPallet_No);

                        var count_itemBagOut = Object.keys(getMyBaggingPallet_No).length;
                        var count_itemTable = AppService.findObjValue($scope.dataTableItem, 'Pallet_No', dataS, true).length;

                        if (count_itemBagOut >= 2) {
                          $scope.data.PalletNo = '';
                          AppService.err('', 'Pallet No. นี้อยู่ใน BagOut นี้ครบเเล้ว', 'PalletNo');
                          return;
                        }

                        if (count_itemTable >= 2) {
                          $scope.data.PalletNo = '';
                          AppService.err('', 'Scan Pallet No. นี้ครบเเล้ว', 'PalletNo');
                          return;
                        }

                        if (getPallet[0].PalletStatus == "EM") {

                          $scope.dataTableItem.push({
                            Pallet_No: getPallet[0].Pallet_No,
                            Pallet_Name: getPallet[0].Pallet_Name
                          });

                          $scope.dataTableItemLength = Object.keys($scope.dataTableItem).length;

                          $scope.data.PalletNo = '';
                          $ionicLoading.hide();
                          setFocus();
                          

                        } else {
                          $scope.data.PalletNo = '';
                          AppService.err('', 'Pallet No. นี้ไม่อยู่ในสถานะ EM', 'PalletNo');
                        }

                      }).catch(function (res) {
                        AppService.err('getMyBaggingPallet_No', res);
                      }).finally(function () {}); // End Call API getMyBaggingPallet_No

                    } else {
                      $scope.data.PalletNo = '';
                      AppService.err('', 'Pallet No. นี้อยู่ใน BagOut : ' + getBaggingPallet_No[0].BaggingOrder_No + ' ซึ่งยังไม่ได้ TF', 'PalletNo');
                    }

                  }).catch(function (res) {
                    AppService.err('getBaggingPallet_No', res);
                  }).finally(function () {}); // End Call API getBaggingPallet_No

                } else {
                  $scope.data.PalletNo = '';
                  AppService.err('', 'Pallet No. นี้อยู่ใน Tranfer ที่ยังไม่เสร็จสิ้น', 'PalletNo');
                }

              }).catch(function (res) {
                AppService.err('getPalletCancel_inTranfer', res);
              }).finally(function () {}); // End Call API getPalletCancel_inTranfer

            } else {
              $scope.data.PalletNo = '';
              AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');
            }

          }).catch(function (res) {
            AppService.err('getBalancePallet_No', res);
          }).finally(function () {}); // End Call API getBalancePallet_No

        } else {
          $scope.data.PalletNo = '';
          AppService.err('', 'ไม่พบ Pallet No. นี้ ในระบบ', 'PalletNo');
        }

      }).catch(function (res) {
        AppService.err('getPallet', res);
      }).finally(function () {}); //End Call API getPallet

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



          $ionicLoading.show();

          AppService.blur();

          var items = [];
          angular.forEach($scope.dataTableItem, function (value, key) {
            var item = {
              "Pallet_No": value.Pallet_No,
              "Pallet_Name": value.Pallet_Name
            }
            this.push(item);
          }, items);
          var ads = {
            "Table1": items
          };

          //console.log(ads);
          App.API('BagPalletToBG_Film', {
            objsession: angular.copy(LoginService.getLoginData()),
            ads: JSON.stringify(ads),
            pBaggingNo: $scope.BaggingOrder_Index,
            qty: $scope.data.Qty_Per_Pallet,
            sku_index: $scope.data.Sku_Index,
            package: $scope.data.Package_Index,
            weight: $scope.data.Qty_Per_Pallet,
            holdflag: "-",
            palletstatus_index: "0010000000002",
            comment: ($scope.data.Remark) ? $scope.data.Remark : "",
            pItem_Seq: $scope.data.MaxSeq,
            pLot: $scope.data.Lot,
            radio: $scope.data.Ratio,
            Roll_Weight: $scope.data.Qty_Roll

          }).then(function (res) {
            //API not return
            //console.log('res = ', res);
            //if(res == 'True'){
            //$scope.data = {};
            $scope.dataTableItem = [];
            $scope.dataTableItemLength = 0;
            //$scope.data.Count = $scope.dataTableItemLength;
            $scope.changeBaggingOrder($scope.data.BaggingOrder);
            //}
            //AppService.succ('Clear Pallet Success :: ', res);  
            AppService.succ('Bag เรียบร้อยแล้ว','PalletNo');

          }).catch(function (res) {
            AppService.err('BagPalletToBG', res);
          }).finally(function () {
            $ionicLoading.hide();
            setFocus();
          });

        }); //End Confirm Popup

      } else {

        AppService.err('', 'ไม่มีรายการ Pallet', 'PalletNo');
        setFocus();
      }
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
        AppService.err('', 'ไม่มีรายการ Pallet No. ที่เลือก');
      } else {
        for (var i in $scope.dataTableItem) {
          if ($scope.dataTableItem[i].isSelect)
            $scope.dataTableItem.splice(i, 1);
        }

        $scope.dataTableItemLength = $scope.dataTableItemLength-1
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

  })
  
  .controller('Bagging_CancelPalletCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {


    var keyCnt = 0;
    var resCnt = 0;

    var Qty_item2 = 0;

    $scope.LoadBaggingLine_ByUser = [];
    $scope.ReasonList = {};

    var clearData = function () {
      $scope.data = {};
    };

    clearData();

    $scope.$on('$ionicView.enter', function () {
      inputFocus();
    });

    $scope.ReasonList = [{
      Reason: "พาเลทชำรุด"
    }, {
      Reason: "Bag ผิด BagOutOrder"
    }, {
      Reason: "Bagแตก"
    }];


    /*--------------------------------------
    Call API LoadBaggingLine_ByUser_API
    ------------------------------------- */
    $scope.LoadBaggingLine_ByUser_API = function () {
      $ionicLoading.show();
      App.API('LoadBaggingLine_ByUser', {
        objsession: angular.copy(LoginService.getLoginData()),
      }).then(function (res) {

        angular.forEach((!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1, function (value, key) {
          var item = {
            "BaggingLine_No": value.BaggingLine_No
          }
          this.push(item);
        }, $scope.LoadBaggingLine_ByUser);

        console.log('res = ', res);
      }).catch(function (res) {
        AppService.err('LoadBaggingLine_ByUser', res);
      }).finally(function (res) {
        $ionicLoading.hide();
      });
    };

    $scope.LoadBaggingLine_ByUser_API();

    /*--------------------------------------
    setValues Function
    ------------------------------------- */
    var setValues = function (getData) {

      console.log(getData);
      $scope.data.Pallet_No = $scope.data.PalletNo;
      $scope.data.Grade = getData.Sku_Id;
      $scope.data.Lot = getData.PLot;
      $scope.data.Qty = getData.Qty + Qty_item2;
      $scope.data.Bag = (getData.Qty / getData.UnitWeight_Index) + (Qty_item2 / getData.UnitWeight_Index);
      $scope.data.Status = getData.PalletStatus_Id;
      $scope.data.FTLT = getData.HoldFlag;
      $scope.data.BaggingOrderNo = getData.BaggingOrder_No;
      $scope.data.BaggingOrder_Index = getData.BaggingOrder_Index
      $scope.data.Line = getData.BaggingLine_No;
      $scope.data.BaggingOrderDate = getData.BaggingOrder_Date_Conv;
    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function (dataSearch, searchType) {

      if (!dataSearch) {
        clearData();
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

      App.API('chk_Balance_Pallet', {
        objsession: angular.copy(LoginService.getLoginData()),
        pPalletNo: dataS
      }).then(function (resChk) {

        if (resChk === true) {
          $scope.data.PalletNo = null;
          AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'PalletNo');
        } else {

          App.API('get_Current_Pallet', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPalletNo: dataS
          }).then(function (resPallet) {

            var dataPallet = (!resPallet['diffgr:diffgram']) ? {} : resPallet['diffgr:diffgram'].NewDataSet.Table1;
            console.log('res = ', dataPallet);
            if (dataPallet[0].PalletStatus_id === null) {
              $ionicLoading.hide();
              $scope.data.PalletNo = null;
              AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');
            } else {

              App.API('getBalancePallet_No', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataS
              }).then(function (res) {

                var getBalancePallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                console.log('res = ', getBalancePallet_No);
                if (Object.keys(getBalancePallet_No).length == 0) {

                  App.API('getPalletCancel_inTranfer', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pPalletNo: dataS
                  }).then(function (res) {

                    var getPalletCancel_inTranfer = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    console.log('res = ', getPalletCancel_inTranfer);
                    if (Object.keys(getPalletCancel_inTranfer).length == 0) {




                      App.API('getPalletCancel', {
                        objsession: angular.copy(LoginService.getLoginData()),
                        pPalletNo: dataS
                      }).then(function (res) {

                        var getPalletCancel = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                        console.log('res = ', getPalletCancel);
                        if (Object.keys(getPalletCancel).length > 0) {

                          resCnt = Object.keys(getPalletCancel).length;
                          if (resCnt == 2) {
                            Qty_item2 = getPalletCancel[1].Qty;
                          }

                          var pallet_status = getPalletCancel[0].PalletStatus_Id;

                          if (AppService.findObjValue($scope.LoadBaggingLine_ByUser, 'BaggingLine_No', getPalletCancel[0].BaggingLine_No, true).length == 0) {
                            AppService.err('', 'Pallet No. นี้กำลังใช้งานอยู่กับใบ Bagout Line อื่น', 'PalletNo');
                            return;
                          }

                          if (pallet_status == "EM") {
                            AppService.err('', 'Pallet No. นี้อยู่ในสถานะพร้อมใช้', 'PalletNo');
                          } else if (pallet_status == "BG") {

                            setValues(getPalletCancel[0]);

                          } else {
                            AppService.err('', 'Pallet No. นี้ไม่อยู่ในสถานะ ที่จะยกเลิก', 'PalletNo');
                          }


                        } else {
                          AppService.err('', 'ไม่พบ Pallet No. นี้ กำลัง Bag อยู่', 'PalletNo');
                        }


                      }).catch(function (res) {
                        AppService.err('getPalletCancel', res);
                      }).finally(function () {
                        $ionicLoading.hide();
                        $scope.data.PalletSearchFlag = 'yes'; // set flag to false as defaut
                        $scope.data.PalletNo = null;
                      }); // End Call API getPalletCancel


                    } else {
                      AppService.err('', 'Pallet No. นี้อยู่ใน Tranfer ที่ยังไม่เสร็จสิ้น', 'PalletNo');
                    }

                  }).catch(function (res) {
                    AppService.err('getPalletCancel_inTranfer', res);
                  }).finally(function () {}); // End Call API getPalletCancel_inTranfer

                } else {
                  AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');
                }

              }).catch(function (res) {
                AppService.err('getBalancePallet_No', res);
              }).finally(function () {}); // End Call API getBalancePallet_No

            }

          }).catch(function (resPallet) {
            AppService.err('get_Current_Pallet', resPallet);
          }).finally(function (res) {});

        }

      }).catch(function (resChk) {
        AppService.err('chk_Balance_Pallet', resChk);
      }).finally(function (res) {
        inputFocus();
      });

    };

    /*--------------------------------------
    Save Item Function
    ------------------------------------- */
    $scope.save = function () {

      if ($scope.data.Pallet_No) {

        $ionicPopup.confirm({
          title: 'Confirm',
          template: 'ยืนยันการบันทึกหรือไม่ ?'
        }).then(function (res) {


          $ionicLoading.show();

          AppService.blur();

          App.API('CancelPallet', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPallet_No: $scope.data.Pallet_No,
            pBagging_index: $scope.data.BaggingOrder_Index,
            pStatus: $scope.data.Status,
            pReason: $scope.data.Reason,
            pRemark: $scope.data.Remark,

          }).then(function (res) {
            //API not return
            console.log('res = ', res);

            $scope.data.Reason = 0;
            $scope.data.Remark = null;

            AppService.succ('ยกเลิก Pallet นี้เรียบร้อย','PalletNo');

          }).catch(function (res) {
            AppService.err('BagPalletToBG', res);
          }).finally(function () {
            $ionicLoading.hide();
            clearData();
            setFocus();
          });

        }); //End Confirm Popup

      } else {

        AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');
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


    $scope.clear = function () {
      clearData();
    };

    function inputFocus() {
      AppService.focus('PalletNo');
    }

  })

  .controller('Bagging_UpdatePalletCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {


    var keyCnt = 0;
    var resCnt = 0;

    var Qty_item2 = 0;

    var ratio = 0;

    $scope.LoadBaggingLine_ByUser = [];
    $scope.ReasonList = {};
    $scope.StatusFTLTList = {};

    var clearData = function () {
      $scope.data = {};
    };

    clearData();

    $scope.$on('$ionicView.enter', function () {
      inputFocus();
    });

    $scope.ReasonList = [{
      Reason: "ปรับแก้ FT/LT"
    }, {
      Reason: "ปรับแก้น้ำหนัก"
    }];

    $scope.StatusFTLTList = [{
      StatusFTLT: "FT"
    }, {
      StatusFTLT: "LT"
    }];


    /*--------------------------------------
    Call API LoadBaggingLine_ByUser_API
    ------------------------------------- */
    $scope.LoadBaggingLine_ByUser_API = function () {
      $ionicLoading.show();
      App.API('LoadBaggingLine_ByUser', {
        objsession: angular.copy(LoginService.getLoginData()),
      }).then(function (res) {

        angular.forEach((!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1, function (value, key) {
          var item = {
            "BaggingLine_No": value.BaggingLine_No
          }
          this.push(item);
        }, $scope.LoadBaggingLine_ByUser);

        //console.log('res = ', res);
      }).catch(function (res) {
        AppService.err('LoadBaggingLine_ByUser', res);
      }).finally(function (res) {
        $ionicLoading.hide();
      });
    };

    $scope.LoadBaggingLine_ByUser_API();

    /*--------------------------------------
    setValues Function
    ------------------------------------- */
    var setValues = function (getData) {

      //console.log(getData);
      $scope.data.Pallet_No = $scope.data.PalletNo;
      $scope.data.Grade = getData.Sku_Id;
      $scope.data.Lot = getData.PLot;
      $scope.data.Qty = getData.Qty + Qty_item2;
      $scope.data.Bag = (getData.Qty / getData.UnitWeight_Index) + (Qty_item2 / getData.UnitWeight_Index);
      $scope.data.Status = getData.PalletStatus_Id;

      $scope.data.FTLT = (getData.HoldFlag == '-') ? '' : getData.HoldFlag;

      $scope.data.BaggingOrderNo = getData.BaggingOrder_No;
      $scope.data.BaggingOrder_Index = getData.BaggingOrder_Index;
      $scope.data.Line = getData.BaggingLine_No;
      $scope.data.BaggingOrderDate = getData.BaggingOrder_Date_Conv;

      $scope.data.Reason = getData.Reason;
      $scope.data.Remark = getData.Remark;

      ratio = getData.flo1;
    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function (dataSearch, searchType) {
      
      if (!dataSearch) {
        clearData();
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

      App.API('chk_Balance_Pallet', {
        objsession: angular.copy(LoginService.getLoginData()),
        pPalletNo: dataS
      }).then(function (resChk) {

        if (resChk === true) {
          $scope.data.PalletNo = null;
          AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'PalletNo');
        } else {

          App.API('get_Current_Pallet', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPalletNo: dataS
          }).then(function (resPallet) {

            var dataPallet = (!resPallet['diffgr:diffgram']) ? {} : resPallet['diffgr:diffgram'].NewDataSet.Table1;
            //console.log('res = ', dataPallet);
            if (dataPallet[0].PalletStatus_id === null) {
              $ionicLoading.hide();
              $scope.data.PalletNo = null;
              AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');
            } else {

              App.API('getBalancePallet_No', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataS
              }).then(function (res) {

                var getBalancePallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                //console.log('res = ', getBalancePallet_No);
                if (Object.keys(getBalancePallet_No).length == 0) {


                  App.API('getPalletCancel', {
                    objsession: angular.copy(LoginService.getLoginData()),
                    pPalletNo: dataS
                  }).then(function (res) {

                    var getPalletCancel = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
                    //console.log('res = ', getPalletCancel);
                    if (Object.keys(getPalletCancel).length > 0) {

                      resCnt = Object.keys(getPalletCancel).length;
                      if (resCnt == 2) {
                        Qty_item2 = getPalletCancel[1].Qty;
                      }

                      var pallet_status = getPalletCancel[0].PalletStatus_Id;

                      if (AppService.findObjValue($scope.LoadBaggingLine_ByUser, 'BaggingLine_No', getPalletCancel[0].BaggingLine_No, true).length == 0) {
                        AppService.err('', 'Pallet No. นี้กำลังใช้งานอยู่กับใบ Bagout Line อื่น', 'PalletNo');
                        return;
                      }

                      if (pallet_status == "EM") {
                        AppService.err('', 'Pallet No. นี้อยู่ในสถานะพร้อมใช้', 'PalletNo');
                      } else if (pallet_status == "BG") {

                        setValues(getPalletCancel[0]);

                        AppService.focus('Qty');

                      } else {
                        AppService.err('', 'Pallet No. นี้ไม่อยู่ในสถานะ ที่จะแก้ไข', 'PalletNo');
                      }


                    } else {
                      AppService.err('', 'ไม่พบ Pallet No. นี้ กำลัง Bag อยู่', 'PalletNo');
                    }


                  }).catch(function (res) {
                    AppService.err('getPalletCancel', res);
                  }).finally(function () {
                    $ionicLoading.hide();
                    $scope.data.PalletSearchFlag = 'yes'; // set flag to false as defaut
                    $scope.data.PalletNo = null;
                  }); // End Call API getPalletCancel

                } else {
                  AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');
                }

              }).catch(function (res) {
                AppService.err('getBalancePallet_No', res);
              }).finally(function () {}); // End Call API getBalancePallet_No

            }

          }).catch(function (resPallet) {
            AppService.err('get_Current_Pallet', resPallet);
          }).finally(function (res) {});

        }

      }).catch(function (resChk) {
        AppService.err('chk_Balance_Pallet', resChk);
      }).finally(function (res) {
        inputFocus();
      });

    };

    /*--------------------------------------
    Save Item Function
    ------------------------------------- */
    $scope.save = function () {

      if ($scope.data.Pallet_No) {

        if ($scope.data.Qty == 0 || $scope.data.Qty == '') {
          AppService.err('', 'กรอกจำนวนให้มากกว่า 0', 'Qty');
          return;
        }

        if ($scope.data.Qty < ratio) {
          AppService.err('', 'กรอกจำนวนต่อ Pallet มากกว่า ' + ratio + ' kg.', 'Qty');
          return;
        }



        $ionicPopup.confirm({
          title: 'Confirm',
          template: 'ยืนยันการบันทึกหรือไม่ ?'
        }).then(function (res) {


          $ionicLoading.show();

          AppService.blur();

          App.API('EditPallet', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPallet_No: $scope.data.Pallet_No,
            pBaggingNo: $scope.data.BaggingOrder_Index,
            pHoldFlag: $scope.data.FTLT,
            pTotalQty: $scope.data.Qty,
            pReason: $scope.data.Reason,
            pRemark: $scope.data.Remark

          }).then(function (res) {
            //API not return
            //console.log('res = ', res);

            $scope.data.Reason = 0;
            $scope.data.Remark = null;

            AppService.succ('แก้ไข Pallet นี้เรียบร้อย','PalletNo');

          }).catch(function (res) {
            AppService.err('BagPalletToBG', res);
          }).finally(function () {
            $ionicLoading.hide();
            clearData();
            setFocus();
          });

        }); //End Confirm Popup

      } else {

        AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');
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


    $scope.clear = function () {
      clearData();
    };

    function inputFocus() {
      AppService.focus('PalletNo');
    }

  });


