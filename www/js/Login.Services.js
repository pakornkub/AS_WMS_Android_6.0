/**
 * Login.Services Module
 *
 * Description
 */


angular.module('Login.Services', [])

.service('LoginService', function($window) {
    //console.log('55555');
    //consolnpme.log('LoginService_test:::>',checkUser);
    return {
        LoginData: {
            Version: "3.5.208.30",
            Branch_ID: "1",
            // ConnectionStr: "Data Source=authorwise.co.th;Initial Catalog=WMS_Site_AS;User Id=sa; Password=Autt1211!",
            // ConnectionStr: "Data Source=192.168.23.60;Initial Catalog=WMS_TEST;User ID=sa; PWD=kascodb",

            ConnectionStr: "Data Source=192.168.23.60;Initial Catalog=WMS_Site_AS;User ID=sa; PWD=kascodb;",

           
            //  ConnectionStr: "Data Source=27.254.109.166\SQLEXPRESS,1433; Initial Catalog=WMS_Site_AS;User Id=sa; Password=Aut1211!; ",
            Userindex: "0010000000000",
            Username: "admin",
            UserFullName: "administator",
            Group_index: "0010000000000",
            Status_id: "0",
            Department_Index: "0010000000019",
            Host_Name: "",
            Host_IP: ""
        },
        test: {
            Version: '',
            Branch_ID: '',
            ConnectionStr: '',
            Userindex: '',
            Username: '',
            UserFullName: '',
            Group_index:'',
            Status_id: '',
            Department_Index: '',
            Host_Name:'' ,
            Host_IP: ''
        },
        getLoginData: function(key) {
            if (key != null)
                // return (this.LoginData[key]) ? this.LoginData[key] : $window.localStorage.getItem(key);
                return (this.LoginData[key]) ? this.LoginData[key] : $window.localStorage.getItem(key);
            else
                return this.LoginData;
            // return (this.LoginData['Username']) ? this.LoginData : $window.localStorage.getItem('LoginData');
        },
        setLoginData: function(key, value) {
            this.LoginData[key] = value;
            $window.localStorage.setItem(key, value);
            $window.localStorage.setItem('LoginData', angular.toJson(this.LoginData, true));
        },
        clearValueLoginData: function() {
            for (var i in this.LoginData) {
                this.LoginData[i] = '';
                if ($window.localStorage.getItem(i))
                    $window.localStorage.removeItem(i);
            }
        }

    };
})

.factory('LoginFactory', function() {
    return {

    };
})


;
