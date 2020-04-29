// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'angularSoap', 'angular-md5', 'LocalStorageModule', 'App.Controllers', 
  'Login.Controllers', 'Login.Services', 'Menu.Controllers', 'Main.Controllers', /*'Menu_MainMenu.Controllers', 'Menu_MainMenu.Services',*/
  'Store.Controllers', 'Bagging.Controllers', 'Transport.Controllers', 'Additional.Controllers', 'Pallet.Controllers', 'Film.Controllers', 'Receive.Controllers', 'RS.Controllers'])

/*test*/
// .constant('API', {
//     url: 'http://authorwise.co.th/tpipl/Business_Layer.asmx'
// })

.constant('API', {
    url: 'http://192.168.21.50/WMS_Android/Business_Layer.asmx'
    //url: 'http://authorwise.co.th/tpipl/Business_Layer.asmx'
})

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="lines" class="spinner-positive"></ion-spinner>'
})

.run(function($ionicPlatform, $state, $ionicHistory, AppManager, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      // window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      // StatusBar.overlaysWebView(false);
      StatusBar.backgroundColorByHexString("#51f5bc");
      // StatusBar.styleDefault();
    }
    
    AppManager.ConfirmBack($ionicPopup);

  });



  $ionicPlatform.registerBackButtonAction(function(event) {
      console.log('$state.current.name = ',$state.current.name);
      if ($state.current.name == "login") { // your check here
        /*$ionicPopup.confirm({
            title: 'System warning',
            template: 'are you sure you want to exit?'
        }).then(function(res) {
            if (res) {
                ionic.Platform.exitApp();
            }
        });*/
        ionic.Platform.exitApp();
      } else if(
        

        $state.current.name == "main_Rack" || 
        $state.current.name == "main_PickingRack" || 
        $state.current.name == "main_PickingRack_Selected" || 
        $state.current.name == "main_WHTransferToSH" ||
        $state.current.name == "main_WHIssueDamage" ||
        
        $state.current.name == "store_ProcessPallet" || 

        $state.current.name == "bagging_BagJumbo" || 
        $state.current.name == "bagging_CancelPallet" || 
        $state.current.name == "bagging_UpdatePallet" || 
        $state.current.name == "bagging_BagFilm" || 

        /*$state.current.name == "additional_MovePallet" || 
        $state.current.name == "additional_MoveLocation" ||*/
        $state.current.name == "additional_CheckPallet" || 
        $state.current.name == "additional_CheckLocation" ||
        $state.current.name == "additional_AddPalletToTag" ||
        $state.current.name == "additional_MovePalletToLocation" ||

        $state.current.name == "pallet_ClearPallet" ||
        $state.current.name == "pallet_SplitPallet" ||
        $state.current.name == "pallet_CombinePallet" ||
        
        $state.current.name == "film_NewIn" || 
        $state.current.name == "film_NoNewIn" || 
        $state.current.name == "film_ProductGeneral" || 
        $state.current.name == "film_ProductGeneral_Selected" || 

        $state.current.name == "receive_NewIn" || 
        $state.current.name == "receive_NoNewIn" || 
        $state.current.name == "receive_NoNewIn_Selected" || 
        $state.current.name == "receive_NewIn_Auto" || 
        $state.current.name == "receive_ProductGeneral" || 
        $state.current.name == "receive_ProductGeneral_Selected" || 

        $state.current.name == "transport_PayProductGenaral" || 
        $state.current.name == "transport_SHTransferToDockout" || 
        $state.current.name == "transport_SHLoading" ||
        $state.current.name == "transport_SHReceive" ||
        
        $state.current.name == "rs_ReceiveDM" || 
        $state.current.name == "rs_TranferPick" || 
        $state.current.name == "rs_TranferPut" ||
        $state.current.name == "rs_AssignPallet" ||
        $state.current.name == "rs_AssingRS_Selected" ||
        $state.current.name == "rs_TransferOwnerOut_Selected" ||
        $state.current.name == "rs_TransferOwnerIn_Selected" ||
        $state.current.name == "rs_TransferOwnerIn_DM_New_Selected" ) {
        
        $ionicPopup.confirm({
          title: 'Confirm',
          template: 'ต้องการออกจากหน้านี้?'
        }).then(function(res) {
          
          if (res) {
            $scope.$ionicGoBack(); 
          }
        });

      } else {
        $ionicHistory.goBack();
      }

  }, 100);
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/Login.html',
      controller: 'LoginCtrl'
    })

    /*Menu*/
    .state('app', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    /*Menu Main*/
    .state('Main', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('main_Rack', {
      url: '/Main_Rack',
      templateUrl: 'templates/Main_Rack.html',
      controller: 'Main_RackCtrl'
    })

    .state('main_PickingRack', {
      url: '/Main_PickingRack',
      templateUrl: 'templates/Main_PickingRack.html',
      controller: 'Main_PickingRackCtrl'
    })

    .state('main_PickingRack_Selected', {
      url: '/Main_PickingRack_Selected/{Withdraw_Index}/{Withdraw_No}',
      templateUrl: 'templates/Main_PickingRack_Selected.html',
      controller: 'Main_PickingRack_SelectedCtrl'
    })

    .state('main_WHTransferToSH', {
      url: '/Main_WHTransferToSH',
      templateUrl: 'templates/Main_WHTransferToSH.html',
      controller: 'Main_WHTransferToSHCtrl'
    })

    .state('main_WHIssueDamage', {
      url: '/Main_WHIssueDamage',
      templateUrl: 'templates/Main_WHIssueDamage.html',
      controller: 'Main_WHIssueDamageCtrl'
    })


    /*Menu Store*/
    .state('Store', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('store_ProcessPallet', {
      url: '/Store_ProcessPallet',
      templateUrl: 'templates/Store_ProcessPallet.html',
      controller: 'Store_ProcessPalletCtrl'
    })

    /*Menu Bagging*/
    .state('Bagging', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('bagging_BagJumbo', {
      url: '/Bagging_BagJumbo',
      templateUrl: 'templates/Bagging_BagJumbo.html',
      controller: 'Bagging_BagJumboCtrl'
    })

    .state('bagging_BagFilm', {
      url: '/Bagging_BagFilm',
      templateUrl: 'templates/Bagging_BagFilm.html',
      controller: 'Bagging_BagFilmCtrl'
    })

    .state('bagging_CancelPallet', {
      url: '/Bagging_CancelPallet',
      templateUrl: 'templates/Bagging_CancelPallet.html',
      controller: 'Bagging_CancelPalletCtrl'
    })

    .state('bagging_UpdatePallet', {
      url: '/Bagging_UpdatePallet',
      templateUrl: 'templates/Bagging_UpdatePallet.html',
      controller: 'Bagging_UpdatePalletCtrl'
    })

    /*Menu Transport*/
    .state('Transport', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('transport_PayProductGenaral', {
      url: '/Transport_PayProductGenaral',
      templateUrl: 'templates/Transport_PayProductGenaral.html',
      controller: 'Transport_PayProductGenaralCtrl'
    })

    .state('transport_SHTransferToDockout', {
      url: '/Transport_SHTransferToDockout',
      templateUrl: 'templates/Transport_SHTransferToDockout.html',
      controller: 'Transport_SHTransferToDockoutCtrl'
    })

    .state('transport_SHLoading', {
      url: '/Transport_SHLoading',
      templateUrl: 'templates/Transport_SHLoading.html',
      controller: 'Transport_SHLoadingCtrl'
    })

    .state('transport_SHReceive', {
      url: '/Transport_SHReceive',
      templateUrl: 'templates/Transport_SHReceive.html',
      controller: 'Transport_SHReceiveCtrl'
    })

    /*Menu Additional*/
    .state('Additional', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    /*.state('additional_MovePallet', {
      url: '/Additional_MovePallet',
      templateUrl: 'templates/Additional_MovePallet.html',
      controller: 'Additional_MovePalletCtrl'
    })

    .state('additional_MoveLocation', {
      url: '/Additional_MoveLocation',
      templateUrl: 'templates/Additional_MoveLocation.html',
      controller: 'Additional_MoveLocationCtrl'
    })*/

    .state('additional_CheckLocation', {
      url: '/Additional_CheckLocation',
      templateUrl: 'templates/Additional_CheckLocation.html',
      controller: 'Additional_CheckLocationCtrl'
    })

    .state('additional_CheckPallet', {
      url: '/Additional_CheckPallet',
      templateUrl: 'templates/Additional_CheckPallet.html',
      controller: 'Additional_CheckPalletCtrl'
    })

    .state('additional_AddPalletToTag', {
      url: '/Additional_AddPalletToTag',
      templateUrl: 'templates/Additional_AddPalletToTag.html',
      controller: 'Additional_AddPalletToTagCtrl'
    })

    .state('additional_MovePalletToLocation', {
      url: '/Additional_MovePalletToLocation',
      templateUrl: 'templates/Additional_MovePalletToLocation.html',
      controller: 'Additional_MovePalletToLocationCtrl'
    })
   
    /*Menu Pallet*/
    .state('Pallet', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('pallet_ClearPallet', {
      url: '/Pallet_ClearPallet',
      templateUrl: 'templates/Pallet_ClearPallet.html',
      controller: 'Pallet_ClearPalletCtrl'
    })

    .state('pallet_SplitPallet', {
      url: '/Pallet_SplitPallet',
      templateUrl: 'templates/Pallet_SplitPallet.html',
      controller: 'Pallet_SplitPalletCtrl'
    })

    .state('pallet_CombinePallet', {
      url: '/Pallet_CombinePallet',
      templateUrl: 'templates/Pallet_CombinePallet.html',
      controller: 'Pallet_CombinePalletCtrl'
    })

    /*Menu Film*/
    .state('Film', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('film_NewIn', {
      url: '/Film_NewIn',
      templateUrl: 'templates/Film_NewIn.html',
      controller: 'Film_NewInCtrl'
    })

    .state('film_ProductGeneral', {
      url: '/Film_ProductGeneral',
      templateUrl: 'templates/Film_ProductGeneral.html',
      controller: 'Film_ProductGeneralCtrl'
    })

    .state('film_ProductGeneral_Selected', {
      url: '/Film_ProductGeneral_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Film_ProductGeneral_Selected.html',
      controller: 'Film_ProductGeneral_SelectedCtrl'
    })

    .state('film_NoNewIn', {
      url: '/Film_NoNewIn',
      templateUrl: 'templates/Film_NoNewIn.html',
      controller: 'Film_NoNewInCtrl'
    })

    /*Menu Receive*/
    .state('Receive', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('receive_NewIn', {
      url: '/Receive_NewIn',
      templateUrl: 'templates/Receive_NewIn.html',
      controller: 'Receive_NewInCtrl'
    })

    .state('receive_ProductGeneral', {
      url: '/Receive_ProductGeneral',
      templateUrl: 'templates/Receive_ProductGeneral.html',
      controller: 'Receive_ProductGeneralCtrl'
    })

    .state('receive_ProductGeneral_Selected', {
      url: '/Receive_ProductGeneral_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Receive_ProductGeneral_Selected.html',
      controller: 'Receive_ProductGeneral_SelectedCtrl'
    })

    .state('receive_NoNewIn', {
      url: '/Receive_NoNewIn',
      templateUrl: 'templates/Receive_NoNewIn.html',
      controller: 'Receive_NoNewInCtrl'
    })

    .state('receive_NoNewIn_Selected', {
      url: '/Receive_NoNewIn_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Receive_NoNewIn_Selected.html',
      controller: 'Receive_NoNewIn_SelectedCtrl'
    })

    .state('receive_NewIn_Auto', {
      url: '/Receive_NewIn_Auto',
      templateUrl: 'templates/Receive_NewIn_Auto.html',
      controller: 'Receive_NewIn_AutoCtrl'
    })


    /*Menu RS*/
    .state('RS', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('rs_ReceiveDM', {
      url: '/RS_ReceiveDM/{TypeTOW}/{isAssing}/{isDammage}',
      templateUrl: 'templates/RS_ReceiveDM.html',
      controller: 'RS_ReceiveDMCtrl'
    })

    .state('rs_TranferPick', {
      url: '/RS_TransferOwnerMain/{TypeTOW}/{isAssing}/{isDammage}',
      templateUrl: 'templates/RS_TransferOwnerMain.html',
      controller: 'RS_TransferOwnerMainCtrl'
    })

    .state('rs_TranferPut', {
      url: '/RS_TransferOwnerMain/{TypeTOW}/{isAssing}/{isDammage}',
      templateUrl: 'templates/RS_TransferOwnerMain.html',
      controller: 'RS_TransferOwnerMainCtrl'
    })

    .state('rs_AssignPallet', {
      url: '/RS_TransferOwnerMain/{TypeTOW}/{isAssing}/{isDammage}',
      templateUrl: 'templates/RS_TransferOwnerMain.html',
      controller: 'RS_TransferOwnerMainCtrl'
    })

    .state('rs_AssingRS_Selected', {
      url: '/RS_AssingRS_Selected/{TransferOwner_Index}/{TransferOwner_No}/{Cus_Id}/{Cus_Id_New}',
      templateUrl: 'templates/RS_AssingRS_Selected.html',
      controller: 'RS_AssingRS_SelectedCtrl'
    })

    .state('rs_TransferOwnerOut_Selected', {
      url: '/RS_TransferOwnerOut_Selected/{TransferOwner_Index}/{TransferOwner_No}/{Cus_Id}/{Cus_Id_New}',
      templateUrl: 'templates/RS_TransferOwnerOut_Selected.html',
      controller: 'RS_TransferOwnerOut_SelectedCtrl'
    })

    .state('rs_TransferOwnerIn_Selected', {
      url: '/RS_TransferOwnerIn_Selected/{TransferOwner_Index}/{TransferOwner_No}/{Cus_Id}/{Cus_Id_New}',
      templateUrl: 'templates/RS_TransferOwnerIn_Selected.html',
      controller: 'RS_TransferOwnerIn_SelectedCtrl'
    })

    .state('rs_TransferOwnerIn_DM_New_Selected', {
      url: '/RS_TransferOwnerIn_DM_New_Selected/{TransferOwner_Index}/{TransferOwner_No}/{Cus_Id}/{Cus_Id_New}',
      templateUrl: 'templates/RS_TransferOwnerIn_DM_New_Selected.html',
      controller: 'RS_TransferOwnerIn_DM_New_SelectedCtrl'
    })
    

    $urlRouterProvider.otherwise('/login');
})


