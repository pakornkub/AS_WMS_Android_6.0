// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'angularSoap', 'angular-md5', 'LocalStorageModule', 'App.Controllers', 
  'Login.Controllers', 'Login.Services', 'Menu.Controllers', 'Main.Controllers',
  'Store.Controllers', 'Production.Controllers', 'Shipping.Controllers', 'Additional.Controllers', 'Pallet.Controllers','TumblingMix.Controllers'])

/*test*/
// .constant('API', {
//     url: 'http://authorwise.co.th/tpipl/Business_Layer.asmx'
// })

.constant('API', {
    url: 'http://192.168.23.60/WMS_Android_V1/Business_Layer.asmx'
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
        
        $state.current.name == "main_NewInUnwire" || 
        $state.current.name == "main_NewInUnwireBP" || 
        //$state.current.name == "main_NewInUnwireBP_Selected" ||
        $state.current.name == "main_ProductGeneral" || 
        $state.current.name == "main_ProductGeneral_Selected" ||
        $state.current.name == "main_UserCustomerReturn" || 
        $state.current.name == "main_PayProductGenaral" || 
        $state.current.name == "main_ProductGeneralLot" || 
        $state.current.name == "main_ProductGeneralLot_Selected" ||

        //$state.current.name == "store_ReceiveRawMatPackingChemical" || 
        //$state.current.name == "store_ReceiveRawMatPackingChemical_Selected" ||
        $state.current.name == "store_WeighingChemical" ||

        $state.current.name == "production_PackingRoll" || 
        $state.current.name == "production_PackToPallet" || 
        $state.current.name == "production_DeleteRoll" || 
        $state.current.name == "production_ReceiveRawMat" || 
        $state.current.name == "production_ReceiveRawMat_Selected" ||
        $state.current.name == "production_IssueRawMat" || 

        $state.current.name == "shipping_Sale" || 
        $state.current.name == "shipping_NewInShipping" || 
        $state.current.name == "shipping_CustomerReturn" || 

        $state.current.name == "additional_MoveRoll" || 
        $state.current.name == "additional_MovePallet" || 
        $state.current.name == "additional_MoveLocation" || 
        $state.current.name == "additional_CheckRollPallet" || 
        $state.current.name == "additional_CheckLocation" || 

        $state.current.name == "pallet_SplitPallet" || 
        $state.current.name == "pallet_CombinePallet" || 
        $state.current.name == "pallet_ClearPallet" ||
        
        $state.current.name == "tumblingmix_MixRawMat") {
        
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

    .state('main_NewInUnwire', {
      url: '/Main_NewInUnwire',
      templateUrl: 'templates/Main_NewInUnwire.html',
      controller: 'Main_NewInUnwireCtrl'
    })

    .state('main_NewInUnwireBP', {
      url: '/Main_NewInUnwireBP',
      templateUrl: 'templates/Main_NewInUnwireBP.html',
      controller: 'Main_NewInUnwireBPCtrl'
    })

    /*.state('main_NewInUnwireBP_Selected', {
      url: '/Main_NewInUnwireBP_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Main_NewInUnwireBP_Selected.html',
      controller: 'Main_NewInUnwireBP_SelectedCtrl'
    })*/

    .state('main_ProductGeneral', {
      url: '/Main_ProductGeneral',
      templateUrl: 'templates/Main_ProductGeneral.html',
      controller: 'Main_ProductGeneralCtrl'
    })

    .state('main_ProductGeneral_Selected', {
      url: '/Main_ProductGeneral_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Main_ProductGeneral_Selected.html',
      controller: 'Main_ProductGeneral_SelectedCtrl'
    })

    .state('main_UserCustomerReturn', {
      url: '/Main_UserCustomerReturn',
      templateUrl: 'templates/Main_UserCustomerReturn.html',
      controller: 'Main_UserCustomerReturnCtrl'
    })

    .state('main_PayProductGenaral', {
      url: '/Main_PayProductGenaral',
      templateUrl: 'templates/Main_PayProductGenaral.html',
      controller: 'Main_PayProductGenaralCtrl'
    })

    .state('main_ProductGeneralLot', {
      url: '/Main_ProductGeneralLot',
      templateUrl: 'templates/Main_ProductGeneralLot.html',
      controller: 'Main_ProductGeneralLotCtrl'
    })

    .state('main_ProductGeneralLot_Selected', {
      url: '/Main_ProductGeneralLot_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Main_ProductGeneralLot_Selected.html',
      controller: 'Main_ProductGeneralLot_SelectedCtrl'
    })


    /*Menu Store*/
    .state('Store', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    /*.state('store_ReceiveRawMatPackingChemical', {
      url: '/Store_ReceiveRawMatPackingChemical',
      templateUrl: 'templates/Store_ReceiveRawMatPackingChemical.html',
      controller: 'Store_ReceiveRawMatPackingChemicalCtrl'
    })

    .state('store_ReceiveRawMatPackingChemical_Selected', {
      url: '/Store_ReceiveRawMatPackingChemical_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Store_ReceiveRawMatPackingChemical_Selected.html',
      controller: 'Store_ReceiveRawMatPackingChemical_SelectedCtrl'
    })*/

    .state('store_WeighingChemical', {
      url: '/Store_WeighingChemical/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Store_WeighingChemical.html',
      controller: 'Store_WeighingChemicalCtrl'
    })

    /*Menu Production*/
    .state('Production', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('production_PackingRoll', {
      url: '/Production_PackingRoll',
      templateUrl: 'templates/Production_PackingRoll.html',
      controller: 'Production_PackingRollCtrl'
    })

    .state('production_PackToPallet', {
      url: '/Production_PackToPallet',
      templateUrl: 'templates/Production_PackToPallet.html',
      controller: 'Production_PackToPalletCtrl'
    })

    .state('production_DeleteRoll', {
      url: '/Production_DeleteRoll',
      templateUrl: 'templates/Production_DeleteRoll.html',
      controller: 'Production_DeleteRollCtrl'
    })

    .state('production_ReceiveRawMat', {
      url: '/Production_ReceiveRawMat',
      templateUrl: 'templates/Production_ReceiveRawMat.html',
      controller: 'Production_ReceiveRawMatCtrl'
    })

    .state('production_ReceiveRawMat_Selected', {
      url: '/Production_ReceiveRawMat_Selected/{Order_Index}/{Order_No}',
      templateUrl: 'templates/Production_ReceiveRawMat_Selected.html',
      controller: 'Production_ReceiveRawMat_SelectedCtrl'
    })

    .state('production_IssueRawMat', {
      url: '/Production_IssueRawMat',
      templateUrl: 'templates/Production_IssueRawMat.html',
      controller: 'Production_IssueRawMatCtrl'
    })

    /*Menu Shipping*/
    .state('Shipping', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('shipping_Sale', {
      url: '/Shipping_Sale',
      templateUrl: 'templates/Shipping_Sale.html',
      controller: 'Shipping_SaleCtrl'
    })

    .state('shipping_NewInShipping', {
      url: '/Shipping_NewInShipping',
      templateUrl: 'templates/Shipping_NewInShipping.html',
      controller: 'Shipping_NewInShippingCtrl'
    })

    .state('shipping_CustomerReturn', {
      url: '/Shipping_CustomerReturn',
      templateUrl: 'templates/Shipping_CustomerReturn.html',
      controller: 'Shipping_CustomerReturnCtrl'
    })

    /*Menu Additional*/
    .state('Additional', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('additional_MoveRoll', {
      url: '/Additional_MoveRoll',
      templateUrl: 'templates/Additional_MoveRoll.html',
      controller: 'Additional_MoveRollCtrl'
    })

    .state('additional_MovePallet', {
      url: '/Additional_MovePallet',
      templateUrl: 'templates/Additional_MovePallet.html',
      controller: 'Additional_MovePalletCtrl'
    })

    .state('additional_MoveLocation', {
      url: '/Additional_MoveLocation',
      templateUrl: 'templates/Additional_MoveLocation.html',
      controller: 'Additional_MoveLocationCtrl'
    })

    .state('additional_CheckRollPallet', {
      url: '/Additional_CheckRollPallet',
      templateUrl: 'templates/Additional_CheckRollPallet.html',
      controller: 'Additional_CheckRollPalletCtrl'
    })

    .state('additional_CheckLocation', {
      url: '/Additional_CheckLocation',
      templateUrl: 'templates/Additional_CheckLocation.html',
      controller: 'Additional_CheckLocationCtrl'
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

    /*Menu Tumbling Mix*/
    .state('TumblingMix', {
      url: '/{menuPage}/{namePage}',
      templateUrl: 'templates/Menu.html',
      controller: 'MenuCtrl'
    })

    .state('tumblingmix_MixRawMat', {
      url: '/TumblingMix_MixRawMat',
      templateUrl: 'templates/TumblingMix_MixRawMat.html',
      controller: 'TumblingMix_MixRawMatCtrl'
    })

    $urlRouterProvider.otherwise('/login');
})


