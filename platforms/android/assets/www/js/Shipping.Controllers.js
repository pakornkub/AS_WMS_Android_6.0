
/**
* Shipping.Controllers Module
*
* Description
*/
angular.module('Shipping.Controllers', ['ionic'])

.controller('Shipping_SaleCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter) {

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

        var pstrWhere = " AND DocumentType_Index = '0010000000006' and Status IN (1) and Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1) ";

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

.controller('Shipping_NewInShippingCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

    /*--------------------------------------
    Data Function
    --------------------------------------*/
    $scope.data = {};
    $scope.getOrderTopicList = {};
    $scope.getTagOrderIndexList = {};
    $scope.getTagOrderIndexListLength = 0;
    $scope.isDisable = false;
    $scope.isDisable_TF = false;

    $scope.data.PalletCount_itemPutAway = 0;
    $scope.data.PalletCount_itemALL = 0;

    var BGOrder_index = '';
    var Qty_Per_Tag = 0;
    var HoldFlag = '';

    var keyCnt = 0;

    var clearData = function () {
        $scope.data = {};
        $scope.getOrderTopicList = {};
        $scope.getTagOrderIndexList = {};
        $scope.getTagOrderIndexListLength = 0;
        $scope.isDisable = false;
        $scope.isDisable_TF = false;

        $scope.data.PalletCount_itemPutAway = 0;
        $scope.data.PalletCount_itemALL = 0;
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

    $scope.DisplayFlag = 0

    $scope.changeDisplay = function (value) {

        $scope.DisplayFlag = value;

    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function () {

        $ionicLoading.show();

        var pstrWhere = " And (ms_DocumentType.DocumentType_Index IN ('0010000000057','0010000000089')) and ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0) " +
            " and tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 ) ";

        App.API('GetOrderTopic', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: pstrWhere
        }).then(function (res) {

            var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

            if (Object.keys(resDataSet).length > 0) {

                $scope.getOrderTopicList = resDataSet;

                $scope.changeTF(resDataSet[0].Order_Index);

            }


        }).catch(function (res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function (res) {
            $ionicLoading.hide();
        });
    };

    $scope.GetOrderTopic_API();

    /*--------------------------------------
    Event Function changeTF 
    ------------------------------------- */
    $scope.changeTF = function (Order_Index) {

        $scope.data.TF = Order_Index;

        loadTF(Order_Index);

    };

    function loadTF(Order_Index) {
        try {

            $ionicLoading.show();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!Order_Index) {

                $scope.data = {};

                $ionicLoading.hide();

                return;

            } else {

                var res_GetDetailOrder = GetDetailOrder(objsession, Order_Index);

                var res_getTag_OrderIndex_TPIPL = getTag_OrderIndex_TPIPL(objsession, Order_Index);

                Promise.all([res_GetDetailOrder, res_getTag_OrderIndex_TPIPL]).then(function (res) {

                    var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                    var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet).length != -1) {
                        $scope.data.Ref_No1 = resDataSet[0].Ref_No1;
                        $scope.data.PalletCount_itemPutAway = resDataSet[0].itemPutAway;
                        $scope.data.PalletCount_itemALL = resDataSet[0].itemALL;
                        BGOrder_index = (resDataSet[0].baggingorder_index) ? resDataSet[0].baggingorder_index : '';

                        if ($scope.data.PalletCount_itemPutAway == $scope.data.PalletCount_itemALL) {
                            AppService.succ('จัดเก็บเรียบร้อย', '');
                            $scope.isDisable = true;
                        }
                    }

                    if (Object.keys(resDataSet2).length > 0) {
                        $scope.getTagOrderIndexList = resDataSet2;
                        $scope.getTagOrderIndexListLength = Object.keys(resDataSet2).length;
                    }

                    setFocus('PalletNo');

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

    var GetDetailOrder = function (objsession, Order_Index) {
        return new Promise(function (resolve, reject) {

            var pstrWhere = " and tb_Order.Order_Index ='" + Order_Index + "' ";

            App.API('GetDetailOrder', {
                objsession: objsession,
                pstrWhere: pstrWhere
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('GetDetailOrder', res));
            });

        })
    }

    var getTag_OrderIndex_TPIPL = function (objsession, pOrder_Index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_OrderIndex_TPIPL', {
                objsession: objsession,
                pOrder_Index: pOrder_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_OrderIndex_TPIPL', res));
            });

        })
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

            $ionicLoading.show();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!$scope.data.TF) {
                $scope.data.PalletNo = null;
                AppService.err('แจ้งเตือน', 'กรุณาเลือกใบรับสินค้า!', 'PalletNo');
                return;
            }

            if ($scope.getTagOrderIndexList.length <= 0) {
                $scope.data.PalletNo = null;
                AppService.err('แจ้งเตือน', 'ไม่มีรายการในใบรับนี้ กรุณาจัดการ Tag ก่อน', '');
                return;
            }

            var res_getTagByPallet = getTagByPallet(objsession, dataSearch);

            var res_getQtyPerPallet_BY_Order_AS_Shipping = getQtyPerPallet_BY_Order_AS_Shipping(objsession, dataSearch, $scope.data.TF);

            Promise.all([res_getTagByPallet, res_getQtyPerPallet_BY_Order_AS_Shipping]).then(function (res) {

                var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                if (Object.keys(resDataSet2).length <= 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้ ไม่อยู่ในใบรับนี้', 'PalletNo');
                    return;
                }

                Qty_Per_Tag = resDataSet2[0].Qty_per_TAG;
                HoldFlag = '';

                var res_FindLocationAndInsert_NewIn = FindLocationAndInsert_NewIn(objsession, dataSearch, $scope.data.TF, Qty_Per_Tag, HoldFlag);

                var res_getTag_Detail_Putaway_TPIPL = getTag_Detail_Putaway_TPIPL(objsession, $scope.data.TF);

                var res_getTag_Sum = getTag_Sum(objsession, $scope.data.TF, dataSearch);

                Promise.all([res_FindLocationAndInsert_NewIn, res_getTag_Detail_Putaway_TPIPL,res_getTag_Sum]).then(function (res) {

                    if (res[0] != 'True') {
                        AppService.err('แจ้งเตือน', res[0], '');
                        return;
                    }

                    //AppService.succ('เก็บเรียบร้อย','');

                    $scope.isDisable_TF = true;
                    $scope.data.Pallet_No = dataSearch;
                    $scope.data.PalletNo = null;
                    setFocus('PalletNo');

                    loadTF($scope.data.TF);

                    var resDataSet3 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet3).length >= 0) {
                        $scope.data.SKU = resDataSet3[0].sku_Id;
                        $scope.data.Lot = resDataSet3[0].plot;
                        $scope.data.OrderDate = $filter('date')(resDataSet3[0].Order_Date, 'dd/MM/yyyy');
                        $scope.data.Remark = (HoldFlag) ? HoldFlag : '';

                        $scope.data.PackageQty = parseFloat(resDataSet3[0].qty_per_tag) / parseFloat(resDataSet3[0].QTY_per_Bag);
                        $scope.data.SysLocation = resDataSet3[0].location_alias;
                        $scope.data.TotalQty = resDataSet3[0].qty_per_tag
                        $scope.data.ItemStatusFrom = 'BG';
                        $scope.data.ItemStatusTo = 'WH';
                    }

                    var resDataSet4 = (!res[2]['diffgr:diffgram']) ? {} : res[2]['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet4).length >= 0)
                    {
                        $scope.data.Roll = resDataSet4[0].Count_Tag;
                        $scope.data.Weight = resDataSet4[0].Weight_Tag;
                        $scope.data.Length = resDataSet4[0].Qty_Tag;

                        updatePalletSumWeight(objsession, dataSearch, $scope.data.Length, $scope.data.Weight, 'NewIn_V2', ' ', ' ');
                    }

                    $ionicLoading.hide();

                }).catch(function (error) {
                    console.log("Error occurred");
                    AppService.err('Error', 'Error occurred', '');
                    return;
                });

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

    var getQtyPerPallet_BY_Order_AS_Shipping = function (objsession, pPallet_No, pOrder_No) {
        return new Promise(function (resolve, reject) {

            App.API('getQtyPerPallet_BY_Order_AS_Shipping', {
                objsession: objsession,
                pPallet_No: pPallet_No,
                pOrder_No: pOrder_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getQtyPerPallet_BY_Order_AS_Shipping', res));
            });

        })
    }

    var FindLocationAndInsert_NewIn = function (objsession, pstrPallet_No, pstrOrder_Index, pdblQty_Per_Tag, pstrHoldFlag) {
        return new Promise(function (resolve, reject) {

            App.API('FindLocationAndInsert_NewIn', {
                objsession: objsession,
                pstrPallet_No: pstrPallet_No,
                pstrOrder_Index: pstrOrder_Index,
                pdblQty_Per_Tag: pdblQty_Per_Tag,
                pstrHoldFlag: pstrHoldFlag
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('FindLocationAndInsert_NewIn', res));
            });

        })
    }

    var getTag_Detail_Putaway_TPIPL = function (objsession, pOrder_Index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Detail_Putaway_TPIPL', {
                objsession: objsession,
                pOrder_Index: pOrder_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Detail_Putaway_TPIPL', res));
            });

        })
    }

    var getTag_Sum = function (objsession, pOrder_Index, Pallet_No) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Sum', {
                objsession: objsession,
                pOrder_Index: pOrder_Index,
                Pallet_No: Pallet_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Sum', res));
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


})

.controller('Shipping_CustomerReturnCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

    /*--------------------------------------
    Data Function
    --------------------------------------*/
    $scope.data = {};
    $scope.getOrderTopicList = {};
    $scope.getTagOrderIndexList = {};
    $scope.getTagOrderIndexListLength = 0;
    $scope.isDisable = false;
    $scope.isDisable_TF = false;

    $scope.data.PalletCount_itemPutAway = 0;
    $scope.data.PalletCount_itemALL = 0;

    var BGOrder_index = '';
    var Qty_Per_Tag = 0;
    var HoldFlag = '';

    var keyCnt = 0;

    var clearData = function () {
        $scope.data = {};
        $scope.getOrderTopicList = {};
        $scope.getTagOrderIndexList = {};
        $scope.getTagOrderIndexListLength = 0;
        $scope.isDisable = false;
        $scope.isDisable_TF = false;

        $scope.data.PalletCount_itemPutAway = 0;
        $scope.data.PalletCount_itemALL = 0;
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

    $scope.DisplayFlag = 0

    $scope.changeDisplay = function (value) {

        $scope.DisplayFlag = value;

    };

    /*--------------------------------------
    Call API GetOrderTopic
    ------------------------------------- */
    $scope.GetOrderTopic_API = function () {

        $ionicLoading.show();

        var pstrWhere = " And (ms_DocumentType.DocumentType_Index IN ('0010000000004')) " +
            " and tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 ) ";

        App.API('GetOrderTopic', {
            objsession: angular.copy(LoginService.getLoginData()),
            pstrWhere: pstrWhere
        }).then(function (res) {

            var resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

            if (Object.keys(resDataSet).length > 0) {

                $scope.getOrderTopicList = resDataSet;

                $scope.changeTF(resDataSet[0].Order_Index);

            }


        }).catch(function (res) {
            AppService.err('GetOrderTopic', res);
        }).finally(function (res) {
            $ionicLoading.hide();
        });
    };

    $scope.GetOrderTopic_API();

    /*--------------------------------------
    Event Function changeTF 
    ------------------------------------- */
    $scope.changeTF = function (Order_Index) {

        $scope.data.TF = Order_Index;

        loadTF(Order_Index);

    };

    function loadTF(Order_Index) {
        try {

            $ionicLoading.show();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!Order_Index) {

                $scope.data = {};

                $ionicLoading.hide();

                return;

            } else {

                var res_GetDetailOrder = GetDetailOrder(objsession, Order_Index);

                var res_getTag_OrderIndex_TPIPL = getTag_OrderIndex_TPIPL(objsession, Order_Index);

                Promise.all([res_GetDetailOrder, res_getTag_OrderIndex_TPIPL]).then(function (res) {

                    var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                    var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet).length != -1) {
                        $scope.data.Ref_No1 = resDataSet[0].Ref_No1;
                        $scope.data.PalletCount_itemPutAway = resDataSet[0].itemPutAway;
                        $scope.data.PalletCount_itemALL = resDataSet[0].itemALL;
                        BGOrder_index = (resDataSet[0].baggingorder_index) ? resDataSet[0].baggingorder_index : '';

                        if ($scope.data.PalletCount_itemPutAway == $scope.data.PalletCount_itemALL) {
                            AppService.succ('จัดเก็บเรียบร้อย', '');
                            $scope.isDisable = true;
                        }
                    }

                    if (Object.keys(resDataSet2).length > 0) {
                        $scope.getTagOrderIndexList = resDataSet2;
                        $scope.getTagOrderIndexListLength = Object.keys(resDataSet2).length;
                    }

                    setFocus('PalletNo');

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

    var GetDetailOrder = function (objsession, Order_Index) {
        return new Promise(function (resolve, reject) {

            var pstrWhere = " and tb_Order.Order_Index ='" + Order_Index + "' ";

            App.API('GetDetailOrder', {
                objsession: objsession,
                pstrWhere: pstrWhere
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('GetDetailOrder', res));
            });

        })
    }

    var getTag_OrderIndex_TPIPL = function (objsession, pOrder_Index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_OrderIndex_TPIPL', {
                objsession: objsession,
                pOrder_Index: pOrder_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_OrderIndex_TPIPL', res));
            });

        })
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

            $ionicLoading.show();

            AppService.blur();

            var objsession = angular.copy(LoginService.getLoginData());

            if (!$scope.data.TF) {
                $scope.data.PalletNo = null;
                AppService.err('แจ้งเตือน', 'กรุณาเลือกใบรับสินค้า!', 'PalletNo');
                return;
            }

            if ($scope.getTagOrderIndexList.length <= 0) {
                $scope.data.PalletNo = null;
                AppService.err('แจ้งเตือน', 'ไม่มีรายการในใบรับนี้ กรุณาจัดการ Tag ก่อน', '');
                return;
            }

            var res_getTagByPallet = getTagByPallet(objsession, dataSearch);

            var res_getQtyPerPallet_BY_Order_AS_Shipping = getQtyPerPallet_BY_Order_AS_Shipping(objsession, dataSearch, $scope.data.TF);

            Promise.all([res_getTagByPallet, res_getQtyPerPallet_BY_Order_AS_Shipping]).then(function (res) {

                var resDataSet = (!res[0]['diffgr:diffgram']) ? {} : res[0]['diffgr:diffgram'].NewDataSet.Table1;

                var resDataSet2 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                if (Object.keys(resDataSet2).length <= 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้ ไม่อยู่ในใบรับนี้', 'PalletNo');
                    return;
                }

                Qty_Per_Tag = resDataSet2[0].Qty_per_TAG;
                HoldFlag = '';

                var res_FindLocationAndInsert_NewIn = FindLocationAndInsert_NewIn(objsession, dataSearch, $scope.data.TF, Qty_Per_Tag, HoldFlag);

                var res_getTag_Detail_Putaway_TPIPL = getTag_Detail_Putaway_TPIPL(objsession, $scope.data.TF);

                var res_getTag_Sum = getTag_Sum(objsession, $scope.data.TF, dataSearch);

                Promise.all([res_FindLocationAndInsert_NewIn, res_getTag_Detail_Putaway_TPIPL,res_getTag_Sum]).then(function (res) {

                    if (res[0] != 'True') {
                        AppService.err('แจ้งเตือน', res[0], '');
                        return;
                    }

                    //AppService.succ('เก็บเรียบร้อย','');

                    $scope.isDisable_TF = true;
                    $scope.data.Pallet_No = dataSearch;
                    $scope.data.PalletNo = null;
                    setFocus('PalletNo');

                    loadTF($scope.data.TF);

                    var resDataSet3 = (!res[1]['diffgr:diffgram']) ? {} : res[1]['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet3).length >= 0) {
                        $scope.data.SKU = resDataSet3[0].sku_Id;
                        $scope.data.Lot = resDataSet3[0].plot;
                        $scope.data.OrderDate = $filter('date')(resDataSet3[0].Order_Date, 'dd/MM/yyyy');
                        $scope.data.Remark = (HoldFlag) ? HoldFlag : '';

                        $scope.data.PackageQty = parseFloat(resDataSet3[0].qty_per_tag) / parseFloat(resDataSet3[0].QTY_per_Bag);
                        $scope.data.SysLocation = resDataSet3[0].location_alias;
                        $scope.data.TotalQty = resDataSet3[0].qty_per_tag
                        $scope.data.ItemStatusFrom = 'BG';
                        $scope.data.ItemStatusTo = 'WH';
                    }

                    var resDataSet4 = (!res[2]['diffgr:diffgram']) ? {} : res[2]['diffgr:diffgram'].NewDataSet.Table1;

                    if(Object.keys(resDataSet4).length >= 0)
                    {
                        $scope.data.Roll = resDataSet4[0].Count_Tag;
                        $scope.data.Weight = resDataSet4[0].Weight_Tag;
                        $scope.data.Length = resDataSet4[0].Qty_Tag;

                        updatePalletSumWeight(objsession, dataSearch, $scope.data.Length, $scope.data.Weight, 'NewIn_V2', ' ', ' ');
                    }

                    $ionicLoading.hide();

                }).catch(function (error) {
                    console.log("Error occurred");
                    AppService.err('Error', 'Error occurred', '');
                    return;
                });

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

    var getQtyPerPallet_BY_Order_AS_Shipping = function (objsession, pPallet_No, pOrder_No) {
        return new Promise(function (resolve, reject) {

            App.API('getQtyPerPallet_BY_Order_AS_Shipping', {
                objsession: objsession,
                pPallet_No: pPallet_No,
                pOrder_No: pOrder_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getQtyPerPallet_BY_Order_AS_Shipping', res));
            });

        })
    }

    var FindLocationAndInsert_NewIn = function (objsession, pstrPallet_No, pstrOrder_Index, pdblQty_Per_Tag, pstrHoldFlag) {
        return new Promise(function (resolve, reject) {

            App.API('FindLocationAndInsert_NewIn', {
                objsession: objsession,
                pstrPallet_No: pstrPallet_No,
                pstrOrder_Index: pstrOrder_Index,
                pdblQty_Per_Tag: pdblQty_Per_Tag,
                pstrHoldFlag: pstrHoldFlag
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('FindLocationAndInsert_NewIn', res));
            });

        })
    }

    var getTag_Detail_Putaway_TPIPL = function (objsession, pOrder_Index) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Detail_Putaway_TPIPL', {
                objsession: objsession,
                pOrder_Index: pOrder_Index
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Detail_Putaway_TPIPL', res));
            });

        })
    }

    var getTag_Sum = function (objsession, pOrder_Index, Pallet_No) {
        return new Promise(function (resolve, reject) {

            App.API('getTag_Sum', {
                objsession: objsession,
                pOrder_Index: pOrder_Index,
                Pallet_No: Pallet_No
            }).then(function (res) {
                resolve(res);
            }).catch(function (res) {
                reject(AppService.err('getTag_Sum', res));
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


});