/**
 * Store.Controllers Module
 *
 * Description
 */
angular.module('Store.Controllers', ['ionic'])

  .controller('Store_ProcessPalletCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

    var keyCnt = 0;
    var resCnt = 0;

    var Qty_item2 = 0;

    var checkStatus = {};
    var checkType = {};
    var checkLocation = {};

    var value = {};

    $scope.DetailTypeList = {};

    /*--------------------------------------
    clearData Function
    ------------------------------------- */
    var clearData = function () {
      $scope.data = {};
    };

    var clearData_Pallet = function () {
      $scope.data.PalletNo = '';
      $scope.data.Pallet_No = '';
      $scope.data.Grade = '';
      $scope.data.Lot = '';
      $scope.data.Location = '';
      $scope.data.Document = '';
      $scope.data.Qty = '';
      $scope.data.Bag = '';
      $scope.data.Status = '';
      //$scope.data.FTLT = getData.FT;
      $scope.data.Customer = '';
      $scope.data.CustomerShip = '';
      $scope.data.PalletType = '';
      $scope.data.Remark = '';
    };

    clearData();

    $scope.$on('$ionicView.enter', function () {
      setFocus();
    });

    /*--------------------------------------
    setValues Function
    ------------------------------------- */
    var setValues = function (getData) {
      $scope.data.Pallet_No = $scope.data.PalletNo;
      $scope.data.Grade = getData.SKU_Id;
      $scope.data.Lot = getData.Plot;
      $scope.data.Location = getData.Location;
      $scope.data.Document = getData.Doc_No;
      $scope.data.Qty = getData.QTY + Qty_item2;
      $scope.data.Bag = (getData.QTY / getData.Unit_Weight) + (Qty_item2 / getData.Unit_Weight);
      $scope.data.Status = getData.PalletStatus_id;
      //$scope.data.FTLT = getData.FT;
      $scope.data.Customer = getData.Customer;
      $scope.data.CustomerShip = getData.CustomerSH;
      $scope.data.PalletType = getData.PalletType_id;
    };


    /*--------------------------------------
    Check_Pallet Function
    ------------------------------------- */
    var Check_Pallet = function (dataS) {

      //var lot = dataS.substring(0, pos);
      //var roll = dataS.substring(pos + 1);

      $ionicLoading.show();
      AppService.blur();
      App.API('chk_Balance_Pallet', {

        objsession: angular.copy(LoginService.getLoginData()),
        pPalletNo: dataS

      }).then(function (resChk) {

        if (resChk === true) {

          clearData_Pallet();
          AppService.err('', 'สถานะ Pallet No. ผิดพลาด กรุณาติดต่อ Admin', 'PalletNo');

        } else {

          App.API('get_Current_Pallet', {
            objsession: angular.copy(LoginService.getLoginData()),
            pPalletNo: dataS
          }).then(function (resPallet) {

            var dataPallet = (!resPallet['diffgr:diffgram']) ? {} : resPallet['diffgr:diffgram'].NewDataSet.Table1;
            resCnt = Object.keys(dataPallet).length;

            if (resCnt == 2) {
              Qty_item2 = dataPallet[1].QTY;
            }

            //console.log('res = ', dataPallet);

            if (dataPallet[0].PalletStatus_id === null) {

              clearData_Pallet();
              AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');

            } else {

              App.API('getBalancePallet_No', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: dataS
              }).then(function (res) {

                var getBalancePallet_No = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                //console.log('res = ', getBalancePallet_No);

                if (Object.keys(getBalancePallet_No).length == 0) {


                  if (!dataPallet[0].PalletStatus_id) {

                    clearData_Pallet();
                    AppService.err('', 'ไม่พบ Pallet No. นี้ในระบบ', 'PalletNo');

                  } else {

                    checkStatus = checkPalletStatus($scope.data.Type, $scope.data.DetailType, dataPallet[0].PalletStatus_id);
                    checkType = checkPalletType(dataS);
                    checkLocation = checkPalletLocation($scope.data.Type, $scope.data.DetailType, dataPallet[0].PalletStatus_id, dataPallet[0].Location);

                    //console.log($scope.data.Type +' ' +$scope.data.Status+ ' ' + dataPallet[0].Location);

                    if (checkStatus.fag == false) {

                      clearData_Pallet();
                      AppService.err('', checkStatus.alert, 'PalletNo');

                    } else if (checkType.fag == false) {

                      clearData_Pallet();
                      AppService.err('', checkType.alert, 'PalletNo');

                    } else if (checkLocation.fag == false) {

                      clearData_Pallet();
                      AppService.err('', checkLocation.alert, 'PalletNo');

                    } else {

                      setValues(dataPallet[0]);

                      $scope.data.PalletSearchFlag = 'yes'; // set flag to false as defaut
                      $scope.data.PalletNo = '';

                      setFocus();

                    }

                  }

                } else {

                  clearData_Pallet();
                  AppService.err('', 'Pallet No. นี้มีสินค้าใน Stock แล้ว', 'PalletNo');

                }

              }).catch(function (res) {
                AppService.err('getBalancePallet_No', res);
              }).finally(function () {}); // End Call API getBalancePallet_No
              $ionicLoading.hide();
            }

          }).catch(function (resPallet) {
            AppService.err('get_Current_Pallet', resPallet);
          }).finally(function (res) {});

        }

      }).catch(function (resChk) {
        AppService.err('chk_Balance_Pallet', resChk);
      }).finally(function (res) {});

    };


    /*--------------------------------------
    Select Type Function
    ------------------------------------- */
    $scope.select_type = function (dataSelect) {

      var type = dataSelect;

      $scope.DetailTypeList = {};

      if (type == '1') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: 'เลือก'
        }, {
          DetailID: '1',
          DetailType: 'รับคืนจากลูกค้า (EM+SH=>CR)' //EM>CR
        }, {
          DetailID: '2',
          DetailType: 'รับคืนจาก PD (EM+BG=>CR)' //EM>CR
        }, {
          DetailID: '3',
          DetailType: 'ถังหมดอายุล้างใหม่ (EQ=>CR)' //EQ>CR
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '3') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: 'เลือก'
        }, {
          DetailID: '10',
          DetailType: 'PC ตรวจผ่านเก็บ IBC (EQ)' //CF>EQ
        }, {
          DetailID: '11',
          DetailType: 'รับคืนจากการเบิกเกินจำนวน (EM=>EQ)' //EM>EQ
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '4') {
        $scope.DetailTypeList = [{
            DetailID: '',
            DetailType: '-'
          }
          /*, {
                    DetailID: '4',
                    DetailType: 'PD เบิกใช้งาน' //EQ>EM
                  }, {
                    DetailID: '5',
                    DetailType: 'PD ส่งคืน/ส่งล้าง' //??>EM
                  }, {
                    DetailID: '6',
                    DetailType: 'เบิก Reprocess' //EQ>EM
                  }*/
        ];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '5') {
        $scope.DetailTypeList = [{
            DetailID: '',
            DetailType: 'เลือก'
          }, {
            DetailID: '7',
            DetailType: 'นำไปบรรจุ Waste (เปลี่ยนประเภทถัง)' //เปลี่ยน PalletType
          }, {
            DetailID: '8',
            DetailType: 'ส่ง GA เป็น Scrap' //??>DMP
          }
          /*, {
                    DetailID: '9',
                    DetailType: 'Damage' //??>DM
                  }*/
        ];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '6') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: '-'
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '7') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: '-'
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      } else if (type == '2') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: '-'
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      }
      else if (type == '8') {
        $scope.DetailTypeList = [{
          DetailID: '',
          DetailType: '-'
        }];

        //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
        $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

      }
      /*else if (type == '3') {
              $scope.DetailTypeList = [{
                DetailID: '',
                DetailType: '-'
              }];

              //$scope.data = {DetailType : $scope.DetailTypeList[0].DetailID};
              $scope.data.DetailType = $scope.DetailTypeList[0].DetailID;

            }*/

    };


    /*--------------------------------------
    Search Function
    ------------------------------------- */
    $scope.search = function (dataSearch, searchType) {
      
      if (!dataSearch) {
        clearData_Pallet();
        AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');
        return;
      } 
        
      if (searchType == 'read location') {
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
    Save Item Function
    ------------------------------------- */
    $scope.save = function () {


      if (!$scope.data.Type) {

        AppService.err('', 'กรุณาเลือกประเภท', 'Type');



      } else if (!$scope.data.DetailType && ($scope.data.Type != '2' && $scope.data.Type != '4' && $scope.data.Type != '6' && $scope.data.Type != '8')) {

        AppService.err('', 'กรุณาเลือกรายละเอียดของประเภท', 'DetailType');



      } else if (!$scope.data.Pallet_No) {

        AppService.err('', 'กรุณา Scan Pallet No.', 'PalletNo');



      } else {


        checkStatus = checkPalletStatus($scope.data.Type, $scope.data.DetailType, $scope.data.Status);
        checkType = checkPalletType($scope.data.Pallet_No);
        checkLocation = checkPalletLocation($scope.data.Type, $scope.data.DetailType, $scope.data.Status, $scope.data.Location);

        //console.log(checkStatus);

        if (checkStatus.fag == false) {


          AppService.err('', checkStatus.alert, 'PalletNo');

        } else if (checkType.fag == false) {


          AppService.err('', checkType.alert, 'PalletNo');

        } else if (checkLocation.fag == false) {


          AppService.err('', checkLocation.alert, 'PalletNo');

        } else {

          $ionicPopup.confirm({
            title: 'Confirm',
            template: 'ยืนยันการบันทึกหรือไม่ ?'
          }).then(function (res) {

            if (res) {
              $ionicLoading.show();
              AppService.blur();

              App.API('ST_ProcessBulk_EditPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pPallet_No: $scope.data.Pallet_No,
                pRemark: $scope.data.Remark,
                pType: $scope.data.Type,
                pDetailType: $scope.data.DetailType

              }).then(function (result) {

                //API not return
                //console.log('result = ', result);

                if (result) {

                  clearData_Pallet();
                  AppService.succ('Update Pallet นี้เรียบร้อย', 'PalletNo');
                  //clearData();

                } else {
                  AppService.err('', 'ไม่สามารถบันทึกได้กรุณาติดต่อ IT', 'PalletNo');
                }

              }).catch(function (result) {
                AppService.err('Store_ProcessPallet_EditPallet', result);
              }).finally(function () {
                $ionicLoading.hide();
              });
            }

          }); //End Confirm Popup

        }
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

    var setFocus = function () {
      $scope.data.PalletNo = '';
      AppService.focus('PalletNo');
    };


    var checkPalletStatus = function (Type, DetailType, Status) {

      if (Type == 1 && (DetailType == 1 || DetailType == 2) && Status != 'EM') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EM'
        };

      } else if (Type == 1 && (DetailType == 3) && Status != 'EQ') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EQ'
        };

      } else if (Type == 2 && Status != 'CR') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น CR'
        };
      } else if (Type == 3 && (DetailType == 10) && Status != 'CF') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น CF'
        };
      } else if (Type == 3 && (DetailType == 11) && Status != 'EM') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EM'
        };
      } else if (Type == 4 /*&& (DetailType == 12DetailType == 4 || DetailType == 6)*/ && Status != 'EQ') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EQ'
        };
      } else if (Type == 5 && DetailType == 9 && (Status != 'EQ' || Status != 'EM' || Status != 'CR' || Status != 'CF')) {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EQ, EM, CR, CF'
        };
      } else if (Type == 7 && Status != 'EM') {
        value = {
          fag: false,
          alert: 'สถานะไม่เป็น EM'
        };
      } else {
        value = {
          fag: true,
          alert: ''
        };
      }

      return value;
    };

    var checkPalletType = function (Pallet) {


      var str = Pallet;
      var res = str.substring(0, 1);

      if (res != 'B') {
        value = {
          fag: false,
          alert: 'Pallet นี้ไม่ใช้ประเภท Bulk'
        };
      } else {
        value = {
          fag: true,
          alert: ''
        };
      }

      return value;


    };


    var checkPalletLocation = function (Type, DetailType, Status, Location) {


      if (Type == 1 && DetailType == 1 && Status == 'EM' && Location != 'SH') {
        value = {
          fag: false,
          alert: 'Pallet นี้ ไม่ได้อยู่ใน Zone : SH'
        };
      } else {
        value = {
          fag: true,
          alert: ''
        };
      }

      return value;

    };


  });


