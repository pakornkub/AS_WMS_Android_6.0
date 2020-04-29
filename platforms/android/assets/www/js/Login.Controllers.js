/**
 * Login.Controllers Module
 *
 * Description
 */
angular.module('Login.Controllers', ['ionic'])

  .controller('LoginCtrl', function ($filter, $ionicPlatform, $scope, $state, $ionicHistory, App, md5, $ionicPopup, $cordovaKeyboard, $ionicLoading, LoginService, AppService) {


    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    LoginService.clearValueLoginData();
    $scope.isFocus = true;

    // var res = '{"Table1":[{ "t1": "1234","t2": "aaaaa"}]}';
    // console.log(res);
    // var obj = JSON.parse(res);
    // console.log(obj);
    //  var dataTag = obj.Table1;
    //  console.log(dataTag.length);

    $scope.$on('$ionicView.enter', function () {
      inputFocus();
    });

    $ionicLoading.show();

    App.API('LoadBranch').then(function (res) {
      $scope.loadBranchList = (!res['diffgr:diffgram']) ? {} : res['diffgr:diffgram'].NewDataSet.Table1;
    }).catch(function (res) {
      $ionicLoading.hide();
      APIError(res);
    }).finally(function (res) {
      $ionicLoading.hide();
      inputFocus();
    });

    $scope.login = function (login) {
      login.database = 1;
      //console.log(login.database);
      $ionicLoading.show();
      if (!login.database) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'กรุณาเลือกฐานข้อมูล'
        }).then(function (res) {
          inputFocus();
          $scope.isFocus = true;
        });
      } else {


        var usr = login.username;
        var pwd = md5.createHash(login.password || '');

        //console.log('usr:', usr);
        //console.log('pwd:', pwd);


        /*var md5Pass = md5.createHash(login.pass || '');
    var tempUsr = login.username;
    var usr = null;
    var pwd = null;
    console.log('tempUsr:',tempUsr);
    console.log('md5Pass:',md5Pass);
  
    if(tempUsr.length==2){
       usr = tempUsr;
       pwd = md5Pass;
       console.log('usr:',usr);
       console.log('pwd:',pwd);
    }else{
      $ionicPopup.alert({
        title: 'Error',
        template: 'กรุณากรอกข้อมูลผู้ใช้ให้ถูกต้อง'
      }).then(function(res) {
        inputFocus();
        $scope.isFocus = true;
      });
      $ionicLoading.hide();
      return;
    }*/

        App.API('CheckUser', {
          UserName: usr,
          Password: pwd

        }).then(function (res) {

          var checkUser = res['diffgr:diffgram'];

          if (!checkUser) {
            $ionicPopup.alert({
              title: 'Error',
              template: 'ผู้ใช้หรือรหัสไม่ถูกต้อง'
            }).then(function (res) {
              inputFocus();
              $scope.isFocus = true;
              //console.log('checkUser::::', res);
              $ionicLoading.hide();
            });

          } else {

            App.API('SelectDB', {
              Branch_Id: login.database
            }).then(function (resSelectDB) {

              checkUser = res['diffgr:diffgram'].NewDataSet.Table1[0];

              /* Set Global Dataset*/
              LoginService.setLoginData('Version', '3.5.208.26');
              LoginService.setLoginData('Branch_ID', login.database);
              LoginService.setLoginData('ConnectionStr', resSelectDB);/*"Data Source=192.168.21.50;Initial Catalog=WMS_Site_TPIPL;User ID=sa; PWD=kascodb;"*/
              LoginService.setLoginData('Userindex', checkUser.user_index);
              LoginService.setLoginData('Username', checkUser.userName);
              LoginService.setLoginData('UserFullName', checkUser.userFullName);
              LoginService.setLoginData('Group_index', (!checkUser.group_index) ? '00000' : checkUser.group_index);
              LoginService.setLoginData('Status_id', checkUser.status_id);
              LoginService.setLoginData('Department_Index', checkUser.Department_Index);
              // LoginService.setLoginData('Host_Name', null);
              // LoginService.setLoginData('Host_IP', null);
              //console.log('LoginData==', angular.toJson(LoginService.LoginData,true));
              $state.go('app', {
                'menuPage': 'app',
                'namePage': 'Main Menu'
              }); //MainMenu

            }).catch(function (resSelectDB) {
              APIError(resSelectDB);
            }).finally(function (resSelectDB) {
              $ionicLoading.hide();
            });

          }

        }).catch(function (res) {
          APIError(res);
        }).finally(function (res) {
          $ionicLoading.hide();
        });

      }
    };

    $scope.exit = function () {
      ionic.Platform.exitApp();
    };

    function APIError(err) {
      $ionicPopup.alert({
        title: 'Error',
        template: angular.toJson(err, true)
      }).then(function (err) {});
    }

    function inputFocus() {
      AppService.focus('input-username');
      /*if(window.cordova && window.cordova.plugins.Keyboard)
        cordova.plugins.Keyboard.show();
      // $cordovaKeyboard.show();
      // $scope.$broadcast('$cordovaKeyboard:show');*/
    }



    /**- Debug   
     * Me.pos = txtUserName.Text.ToString().IndexOf("_")
     * Me.user = txtUserName.Text.ToString().Substring(0, Me.pos()).ToString  
     * Me.pass = txtUserName.Text.ToString().Substring(Me.pos() + 1).ToString 
     */

    /**
     * set Password to MD5
     * Web Service call SelectDB(Branch_ID) and keep String Connectionbuffer
     */



  });
