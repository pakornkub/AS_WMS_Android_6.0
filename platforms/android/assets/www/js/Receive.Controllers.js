/**
 * Receive.Controllers Module
 *
 * Description
 */
angular.module('Receive.Controllers', ['ionic'])


    .controller('Receive_NewInCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

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

        let BGOrder_index = '';
        let Qty_Per_Tag = 0;
        let HoldFlag = '';

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.getOrderTopicList = {};
            $scope.getTagOrderIndexList = {};
            $scope.getTagOrderIndexListLength = 0;
            $scope.isDisable = false;
            $scope.isDisable_TF = false;

            $scope.data.PalletCount_itemPutAway = 0;
            $scope.data.PalletCount_itemALL = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (key, value, isOptions) => {
            return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

        };

        /*--------------------------------------
        Call API GetOrderTopic
        ------------------------------------- */
        $scope.GetOrderTopic_API = () => {

            $ionicLoading.show();

            let pstrWhere = " and ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0) " +
                " and tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 ) ";

            App.API('GetOrderTopic', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: pstrWhere
            }).then(function (res) {

                let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    
                    $scope.getOrderTopicList = resDataSet

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
        $scope.changeTF = (Order_Index) => {

            $scope.data.TF = Order_Index;

            loadTF(Order_Index);

        };

        async function loadTF(Order_Index) {
            try {

                $ionicLoading.show();

                let objsession = angular.copy(LoginService.getLoginData());

                if (!Order_Index) {

                    $scope.data = {};

                    $ionicLoading.hide();

                    return;

                } else {

                    const res_GetDetailOrder = await GetDetailOrder(objsession, Order_Index);

                    let resDataSet = (!res_GetDetailOrder['diffgr:diffgram']) ? {} : res_GetDetailOrder['diffgr:diffgram'].NewDataSet.Table1;
                    
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

                    const res_getTag_OrderIndex_TPIPL = await getTag_OrderIndex_TPIPL(objsession, Order_Index);

                    let resDataSet2 = (!res_getTag_OrderIndex_TPIPL['diffgr:diffgram']) ? {} : res_getTag_OrderIndex_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet2).length > 0) {
                        $scope.getTagOrderIndexList = resDataSet2;
                        $scope.getTagOrderIndexListLength = Object.keys(resDataSet2).length;
                    }

                    setFocus('PalletNo');

                }

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let GetDetailOrder = (objsession, Order_Index) => {
            return new Promise((resolve, reject) => {

                let pstrWhere = " and tb_Order.Order_Index ='" + Order_Index + "' ";

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

        let getTag_OrderIndex_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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

        async function searchPallet(dataSearch) {
            try {

                $ionicLoading.show();

                AppService.blur();

                let objsession = angular.copy(LoginService.getLoginData());


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

                const res_getTagByPallet = await getTagByPallet(objsession, dataSearch);

                let resDataSet = (!res_getTagByPallet['diffgr:diffgram']) ? {} : res_getTagByPallet['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                const res_getQtyPerPallet_BY_BGorder_TPIPL = await getQtyPerPallet_BY_BGorder_TPIPL(objsession, dataSearch, BGOrder_index);

                let resDataSet2 = (!res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram']) ? {} : res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet2).length <= 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้ ไม่อยู่ในใบ Bag Out Order หรือจัดเก็บไปแล้ว', 'PalletNo');
                    return;
                }

                Qty_Per_Tag = resDataSet2[0].Total_Qty;
                HoldFlag = resDataSet2[0].HoldFlag;

                const res_FindLocationAndInsert_NewIn = await FindLocationAndInsert_NewIn(objsession, dataSearch, $scope.data.TF, Qty_Per_Tag, HoldFlag);

                if (res_FindLocationAndInsert_NewIn != 'True') {
                    AppService.err('แจ้งเตือน', res_FindLocationAndInsert_NewIn, '');
                    return;
                }

                //AppService.succ('เก็บเรียบร้อย','');

                $scope.isDisable_TF = true;
                $scope.data.Pallet_No = dataSearch;
                $scope.data.PalletNo = null;
                setFocus('PalletNo');

                await loadTF($scope.data.TF);

                const res_getTag_Detail_Putaway_TPIPL = await getTag_Detail_Putaway_TPIPL(objsession, $scope.data.TF);

                let resDataSet3 = (!res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram']) ? {} : res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

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

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let getTagByPallet = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

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

        let getQtyPerPallet_BY_BGorder_TPIPL = (objsession, pPallet_No, pBGOrder_index) => {
            return new Promise((resolve, reject) => {

                App.API('getQtyPerPallet_BY_BGorder_TPIPL', {
                    objsession: objsession,
                    pPallet_No: pPallet_No,
                    pBGOrder_index: pBGOrder_index
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('getQtyPerPallet_BY_BGorder_TPIPL', res));
                });

            })
        }

        let FindLocationAndInsert_NewIn = (objsession, pstrPallet_No, pstrOrder_Index, pdblQty_Per_Tag, pstrHoldFlag) => {
            return new Promise((resolve, reject) => {

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

        let getTag_Detail_Putaway_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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


    })

    .controller('Receive_NoNewInCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

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

        let BGOrder_index = '';
        let Qty_Per_Tag = 0;
        let HoldFlag = '';

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.getOrderTopicList = {};
            $scope.getTagOrderIndexList = {};
            $scope.getTagOrderIndexListLength = 0;
            $scope.isDisable = false;
            $scope.isDisable_TF = false;

            $scope.data.PalletCount_itemPutAway = 0;
            $scope.data.PalletCount_itemALL = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (key, value, isOptions) => {
            return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

        };

        /*--------------------------------------
        Call API GetOrderTopic_NoBagging
        ------------------------------------- */
        $scope.GetOrderTopic_NoBagging_API = () => {

            $ionicLoading.show();

            let pstrWhere = " and ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0) " +
                " and tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 ) ";

            App.API('GetOrderTopic_NoBagging', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: pstrWhere
            }).then(function (res) {

                let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.getOrderTopicList = resDataSet
                   
                    $scope.changeTF(resDataSet[0].Order_Index);
                }


            }).catch(function (res) {
                AppService.err('GetOrderTopic_NoBagging', res);
            }).finally(function (res) {
                $ionicLoading.hide();
            });
        };

        $scope.GetOrderTopic_NoBagging_API();

        /*--------------------------------------
         Event Function changeTF 
        ------------------------------------- */
        $scope.changeTF = (Order_Index) => {

            $scope.data.TF = Order_Index;

            loadTF(Order_Index);

        };

        async function loadTF(Order_Index) {
            try {

                $ionicLoading.show();

                let objsession = angular.copy(LoginService.getLoginData());

                if (!Order_Index) {

                    $scope.data = {};

                    $ionicLoading.hide();

                    return;

                } else {

                    const res_GetDetailOrder = await GetDetailOrder(objsession, Order_Index);

                    let resDataSet = (!res_GetDetailOrder['diffgr:diffgram']) ? {} : res_GetDetailOrder['diffgr:diffgram'].NewDataSet.Table1;

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

                    const res_getTag_OrderIndex_TPIPL = await getTag_OrderIndex_TPIPL(objsession, Order_Index);

                    let resDataSet2 = (!res_getTag_OrderIndex_TPIPL['diffgr:diffgram']) ? {} : res_getTag_OrderIndex_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet2).length > 0) {
                        $scope.getTagOrderIndexList = resDataSet2;
                        $scope.getTagOrderIndexListLength = Object.keys(resDataSet2).length;
                    }

                    setFocus('PalletNo');

                }

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let GetDetailOrder = (objsession, Order_Index) => {
            return new Promise((resolve, reject) => {

                let pstrWhere = " and tb_Order.Order_Index ='" + Order_Index + "' ";

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

        let getTag_OrderIndex_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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

        async function searchPallet(dataSearch) {
            try {

                $ionicLoading.show();

                AppService.blur();

                let objsession = angular.copy(LoginService.getLoginData());


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

                const res_getTagByPallet = await getTagByPallet(objsession, dataSearch);

                let resDataSet = (!res_getTagByPallet['diffgr:diffgram']) ? {} : res_getTagByPallet['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                /*const res_getQtyPerPallet_BY_BGorder_TPIPL = await getQtyPerPallet_BY_BGorder_TPIPL(objsession,dataSearch, BGOrder_index);
    
                let resDataSet2 = (!res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram']) ? {} : res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram'].NewDataSet.Table1;
    
                if(Object.keys(resDataSet2).length <= 0)
                {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน','Pallet นี้ ไม่อยู่ในใบ Bag Out Order หรือจัดเก็บไปแล้ว','PalletNo');
                    return;
                }*/

                Qty_Per_Tag = 0.0;
                HoldFlag = '';

                const res_FindLocationAndInsert_NewIn = await FindLocationAndInsert_NewIn(objsession, dataSearch, $scope.data.TF, Qty_Per_Tag, HoldFlag);

                if (res_FindLocationAndInsert_NewIn != 'True') {
                    AppService.err('แจ้งเตือน', res_FindLocationAndInsert_NewIn, '');
                    return;
                }

                //AppService.succ('เก็บเรียบร้อย','');

                $scope.isDisable_TF = true;
                $scope.data.Pallet_No = dataSearch;
                $scope.data.PalletNo = null;
                setFocus('PalletNo');

                await loadTF($scope.data.TF);

                const res_getTag_Detail_Putaway_TPIPL = await getTag_Detail_Putaway_TPIPL(objsession, $scope.data.TF);

                let resDataSet3 = (!res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram']) ? {} : res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

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

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let getTagByPallet = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

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

        let getQtyPerPallet_BY_BGorder_TPIPL = (objsession, pPallet_No, pBGOrder_index) => {
            return new Promise((resolve, reject) => {

                App.API('getQtyPerPallet_BY_BGorder_TPIPL', {
                    objsession: objsession,
                    pPallet_No: pPallet_No,
                    pBGOrder_index: pBGOrder_index
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('getQtyPerPallet_BY_BGorder_TPIPL', res));
                });

            })
        }

        let FindLocationAndInsert_NewIn = (objsession, pstrPallet_No, pstrOrder_Index, pdblQty_Per_Tag, pstrHoldFlag) => {
            return new Promise((resolve, reject) => {

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

        let getTag_Detail_Putaway_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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

    })

    .controller('Receive_NewIn_AutoCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $filter, $ionicScrollDelegate) {

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

        let BGOrder_index = '';
        let Qty_Per_Tag = 0;
        let HoldFlag = '';

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.getOrderTopicList = {};
            $scope.getTagOrderIndexList = {};
            $scope.getTagOrderIndexListLength = 0;
            $scope.isDisable = false;
            $scope.isDisable_TF = false;

            $scope.data.PalletCount_itemPutAway = 0;
            $scope.data.PalletCount_itemALL = 0;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (key, value, isOptions) => {
            return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

        };

        /*--------------------------------------
        Call API GetOrderTopic_ReciveFixPallet
        ------------------------------------- */
        $scope.GetOrderTopic_ReciveFixPallet_API = () => {

            $ionicLoading.show();

            let pstrWhere = " and ((select count(*) from tb_Tag where tb_Order.Order_Index = tb_tag.Order_Index and Tag_Status <> -1) > 0) " +
                " and tb_Order.Customer_Index in (select  Customer_Index from x_Department_Customer where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1 ) ";

            App.API('GetOrderTopic_ReciveFixPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: pstrWhere
            }).then(function (res) {

                let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.getOrderTopicList = resDataSet
                    
                    $scope.changeTF(resDataSet[0].Order_Index);
                }


            }).catch(function (res) {
                AppService.err('GetOrderTopic_ReciveFixPallet', res);
            }).finally(function (res) {
                $ionicLoading.hide();
            });
        };

        $scope.GetOrderTopic_ReciveFixPallet_API();

        /*--------------------------------------
         Event Function changeTF 
        ------------------------------------- */
        $scope.changeTF = (Order_Index) => {

            $scope.data.TF = Order_Index;
            
            loadTF(Order_Index);

        };

        async function loadTF(Order_Index) {
            try {

                $ionicLoading.show();

                let objsession = angular.copy(LoginService.getLoginData());

                if (!Order_Index) {

                    $scope.data = {};

                    $ionicLoading.hide();

                    return;

                } else {

                    const res_GetDetailOrder = await GetDetailOrder(objsession, Order_Index);

                    let resDataSet = (!res_GetDetailOrder['diffgr:diffgram']) ? {} : res_GetDetailOrder['diffgr:diffgram'].NewDataSet.Table1;

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

                    const res_getTag_OrderIndex_TPIPL = await getTag_OrderIndex_TPIPL(objsession, Order_Index);

                    let resDataSet2 = (!res_getTag_OrderIndex_TPIPL['diffgr:diffgram']) ? {} : res_getTag_OrderIndex_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

                    if (Object.keys(resDataSet2).length > 0) {
                        $scope.getTagOrderIndexList = resDataSet2;
                        $scope.getTagOrderIndexListLength = Object.keys(resDataSet2).length;
                    }

                    setFocus('PalletNo');

                }

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let GetDetailOrder = (objsession, Order_Index) => {
            return new Promise((resolve, reject) => {

                let pstrWhere = " and tb_Order.Order_Index ='" + Order_Index + "' ";

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

        let getTag_OrderIndex_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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

        async function searchPallet(dataSearch) {
            try {

                $ionicLoading.show();

                AppService.blur();

                let objsession = angular.copy(LoginService.getLoginData());


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

                const res_getTagByPallet = await getTagByPallet(objsession, dataSearch);

                let resDataSet = (!res_getTagByPallet['diffgr:diffgram']) ? {} : res_getTagByPallet['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                /*const res_getQtyPerPallet_BY_BGorder_TPIPL = await getQtyPerPallet_BY_BGorder_TPIPL(objsession,dataSearch, BGOrder_index);
    
                let resDataSet2 = (!res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram']) ? {} : res_getQtyPerPallet_BY_BGorder_TPIPL['diffgr:diffgram'].NewDataSet.Table1;
    
                if(Object.keys(resDataSet2).length <= 0)
                {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน','Pallet นี้ ไม่อยู่ในใบ Bag Out Order หรือจัดเก็บไปแล้ว','PalletNo');
                    return;
                }*/

                Qty_Per_Tag = 0.0;
                HoldFlag = '';

                const res_FindLocationAndInsert_NewIn = await FindLocationAndInsert_NewIn(objsession, dataSearch, $scope.data.TF, Qty_Per_Tag, HoldFlag);

                if (res_FindLocationAndInsert_NewIn != 'True') {
                    AppService.err('แจ้งเตือน', res_FindLocationAndInsert_NewIn, '');
                    return;
                }

                //AppService.succ('เก็บเรียบร้อย','');

                $scope.isDisable_TF = true;
                $scope.data.Pallet_No = dataSearch;
                $scope.data.PalletNo = null;
                setFocus('PalletNo');

                await loadTF($scope.data.TF);

                const res_getTag_Detail_Putaway_TPIPL = await getTag_Detail_Putaway_TPIPL(objsession, $scope.data.TF);

                let resDataSet3 = (!res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram']) ? {} : res_getTag_Detail_Putaway_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

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

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let getTagByPallet = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

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

        let getQtyPerPallet_BY_BGorder_TPIPL = (objsession, pPallet_No, pBGOrder_index) => {
            return new Promise((resolve, reject) => {

                App.API('getQtyPerPallet_BY_BGorder_TPIPL', {
                    objsession: objsession,
                    pPallet_No: pPallet_No,
                    pBGOrder_index: pBGOrder_index
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('getQtyPerPallet_BY_BGorder_TPIPL', res));
                });

            })
        }

        let FindLocationAndInsert_NewIn = (objsession, pstrPallet_No, pstrOrder_Index, pdblQty_Per_Tag, pstrHoldFlag) => {
            return new Promise((resolve, reject) => {

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

        let getTag_Detail_Putaway_TPIPL = (objsession, pOrder_Index) => {
            return new Promise((resolve, reject) => {

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

    })

    .controller('Receive_ProductGeneralCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService) {

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
        $scope.setSelected = (Order_Index, Order_No) => {
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
                $state.go('receive_ProductGeneral_Selected', { Order_Index: selectedOrder_Index, Order_No: selectedOrder_No });
            }
        };

        /*--------------------------------------
        Call API GetOrderTopic_ReciveNoFixPallet
        ------------------------------------- */
        let GetOrderTopic_ReciveNoFixPallet = () => {

            $ionicLoading.show();

            let strWhere = " and tb_Order.Customer_Index in ( select  Customer_Index from x_Department_Customer ";

            strWhere += " where Department_Index = '" + angular.copy(LoginService.getLoginData('Department_Index')) + "' and IsUse = 1) ";

            App.API('GetOrderTopic_ReciveNoFixPallet', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrWhere: strWhere
            }).then(function (res) {

                let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.orderTopicList = resDataSet;
                    $scope.orderTopicListLength = Object.keys(resDataSet).length;
                }
                else {
                    AppService.err('แจ้งเตือน', 'ไม่มีรายการรับสินค้า', '');
                    return;
                }

            }).catch(function (res) {
                AppService.err('GetOrderTopic_ReciveNoFixPallet', res);
            }).finally(function (res) {
                $ionicLoading.hide();
            });
        };

        GetOrderTopic_ReciveNoFixPallet();

    })

    .controller('Receive_ProductGeneral_SelectedCtrl', function ($scope, $ionicPopup, $state, $ionicLoading, $cordovaBarcodeScanner, App, AppService, LoginService, $stateParams, $ionicHistory) {

        /*--------------------------------------
        Data Function
        --------------------------------------*/
        $scope.data = {};
        $scope.datatablesList = {};
        $scope.datatablesListLength = 0;
        let Tag_No = null;

        let Order_Index = $stateParams.Order_Index;
        let Order_No = $stateParams.Order_No;
        let Sysloc = (Order_No) ? Order_No.substring(0, 2) : null;

        let keyCnt = 0;

        let clearData = () => {
            $scope.data = {};
            $scope.datatablesList = {};
            $scope.datatablesListLength = 0;
            Tag_No = null;
        };

        let setFocus = (id) => {
            AppService.focus(id);
        }

        let findByValue = (key, value, isOptions) => {
            return AppService.findObjValue($scope.dataTableItem, key, value, isOptions);
        };

        clearData();

        $scope.$on('$ionicView.enter', function () {
            setFocus('PalletNo');
        });

        $scope.DisplayFlag = 0

        $scope.changeDisplay = (value) => {

            $scope.DisplayFlag = value;

        };

        $scope.data.Order_No = $stateParams.Order_No;
        $scope.data.PalletCount = '0/0';
        $scope.data.SysLocation = (Sysloc == 'WH') ? 'WH14' : 'XX-FLOOR';


        /*--------------------------------------
        Call API getTag_Receive
        --------------------------------------*/
        let getTag_Receive = () => {

            $ionicLoading.show();

            App.API('getTag_Receive', {
                objsession: angular.copy(LoginService.getLoginData()),
                pstrorder_index: Order_Index
            }).then(function (res) {

                let resDataSet = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length <= 0) {
                    AppService.err('แจ้งเตือน', 'กรุณาจัดการ TAG ก่อนรับเข้า', '');
                    Tag_No = null;
                    clearData();
                    $ionicHistory.goBack();
                    return;
                }

                $scope.datatablesList = resDataSet;
                $scope.datatablesListLength = Object.keys(resDataSet).length;

                let datatables = {}
                let i = 0;

                for (let x in $scope.datatablesList) {
                    if ($scope.datatablesList[x].itemstatus == 1) {
                        datatables[i] = $scope.datatablesList[x];

                        i++;
                    }
                }

                if (Object.keys(datatables).length <= 0) {
                    Tag_No = null;
                    AppService.err('แจ้งเตือน', 'จัดเก็บรายการเรียบร้อยแล้ว', '');
                    $ionicHistory.goBack();
                    return;
                }

                $scope.data.SKU = datatables[0].Sku_Id;
                $scope.data.Lot = datatables[0].PLot;
                $scope.data.TotalQty = datatables[0].Qty_per_TAG;
                $scope.data.PackageQty = parseFloat(datatables[0].Qty_per_TAG) / parseFloat(datatables[0].UnitWeight_Index);
                Tag_No = datatables[0].TAG_No;

                let countStatus = 0;

                for (let x in $scope.datatablesList) {
                    if ($scope.datatablesList[x].itemstatus == 2) {
                        countStatus++;
                    }
                }

                $scope.data.PalletCount = countStatus + '/' + $scope.datatablesListLength;

                $scope.data.PalletNo = null;
                setFocus('PalletNo');


            }).catch(function (res) {
                AppService.err('getTag_Receive', res);
            }).finally(function (res) {
                $ionicLoading.hide();
            });

        }

        if (Order_Index && Order_No) {
            getTag_Receive();
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

        async function searchPallet(dataSearch) {
            try {

                $ionicLoading.show();

                AppService.blur();

                let objsession = angular.copy(LoginService.getLoginData());


                const res_getTagByPallet = await getTagByPallet(objsession, dataSearch);

                let resDataSet = (!res_getTagByPallet['diffgr:diffgram']) ? {} : res_getTagByPallet['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet).length > 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'Pallet นี้กำลังใช้งาน', 'PalletNo');
                    return;
                }

                const res_getQtyPerPallet_TPIPL = await getQtyPerPallet_TPIPL(objsession, dataSearch);

                let resDataSet2 = (!res_getQtyPerPallet_TPIPL['diffgr:diffgram']) ? {} : res_getQtyPerPallet_TPIPL['diffgr:diffgram'].NewDataSet.Table1;

                if (Object.keys(resDataSet2).length <= 0) {
                    $scope.data.PalletNo = null;
                    AppService.err('แจ้งเตือน', 'ไม่มี Pallet นี้ในระบบ!', 'PalletNo');
                    return;
                }

                const res_FindLocationAndInsert_Receive_V2 = await FindLocationAndInsert_Receive_V2(objsession, dataSearch, $scope.data.TotalQty, '0010000000004', Tag_No, $scope.data.Lot, $scope.data.SysLocation);

                if (res_FindLocationAndInsert_Receive_V2 != 'True') {
                    AppService.err('แจ้งเตือน', res_FindLocationAndInsert_Receive_V2, '');
                    return;
                }

                getTag_Receive();

                $scope.data.PalletNo = null;
                AppService.succ('เก็บเรียบร้อย', 'PalletNo');

                $ionicLoading.hide();

            } catch (error) {
                console.log("Error occurred");
                AppService.err('Error', 'Error occurred', '');
                return;
            }
        }

        let getTagByPallet = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

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

        let getQtyPerPallet_TPIPL = (objsession, pPallet_No) => {
            return new Promise((resolve, reject) => {

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

        let FindLocationAndInsert_Receive_V2 = (objsession, pPallet_No, pQtyPerPallet, pstrNewPalletStatus_Index, pstrTag_no, plot, plocation_Alias) => {
            return new Promise((resolve, reject) => {

                App.API('FindLocationAndInsert_Receive_V2', {
                    objsession: objsession,
                    pPallet_No: pPallet_No,
                    pQtyPerPallet: pQtyPerPallet,
                    pstrNewPalletStatus_Index: pstrNewPalletStatus_Index,
                    pstrTag_no: pstrTag_no,
                    plot: plot,
                    plocation_Alias: plocation_Alias
                }).then(function (res) {
                    resolve(res);
                }).catch(function (res) {
                    reject(AppService.err('FindLocationAndInsert_Receive_V2', res));
                });

            })
        }


    });


