
/**
* MainMenu.Controllers Module
*
* Description
*/

angular.module('Menu.Controllers', ['ionic'])

	.controller('MenuCtrl', function ($scope, $state, $ionicHistory, $stateParams, LoginService) {

		$scope.namePage = $stateParams.namePage;
		$scope.menuList = {};
		// var data = angular.copy(LoginService.getLoginData());

		switch ($stateParams.menuPage) {
			case 'app':
				// console.log('data.Group_index==',angular.copy(LoginService.getLoginData('Group_index')));
				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { Main: 'เมนูหลัก', Store: 'Store', Production: 'Production', Shipping: 'Shipping', Additional: 'เมนูเสริม', Pallet: 'Pallet', TumblingMix: 'Tumbling Mix' };
						//console.log('User:admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
						$scope.menuList = { Production: 'Production', Additional: 'เมนูเสริม', TumblingMix: 'Tumbling Mix' };
						//console.log('User:PD');
						break;
					case '0010000000110':
						/*TM*/
						$scope.menuList = { Production: 'Production', Additional: 'เมนูเสริม', TumblingMix: 'Tumbling Mix' };
						//console.log('User:TM');
						break;
					case '0010000000008': case '0010000000105':
						/*SH*/
						$scope.menuList = { Shipping: 'Shipping', Additional: 'เมนูเสริม' };
						//console.log('User:SH');
						break;
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
						$scope.menuList = { Main: 'เมนูหลัก', Additional: 'เมนูเสริม' };
						//console.log('User:WH');
						break;
					case '0010000000007':case '0010000000106':
						/*ST*/
						$scope.menuList = { MainMenu: 'เมนูหลัก', Store: 'Store', Additional: 'เมนูเสริม' };
						//console.log('User:ST');
						break;

				}
				break;
				
			case 'Main':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { main_NewInUnwire: 'NewIn, Unwire', main_NewInUnwireBP: 'NewIn, Unwire BP', main_ProductGeneral: 'รับสินค้าทั่วไป', main_UserCustomerReturn: 'รับ User/Customer Return', main_Rack: 'เก็บเข้า Rack', main_PayProductGenaral: 'จ่ายสินค้าทั่วไป' };
						//console.log('User:admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
					case '0010000000110':
						/*TM*/
						$scope.menuList = { main_ProductGeneral: 'รับสินค้าทั่วไป', main_UserCustomerReturn: 'รับ User/Customer Return', main_Rack: 'เก็บเข้า Rack', main_PayProductGenaral: 'จ่ายสินค้าทั่วไป' };
						//console.log('User:TM');
						break;
					case '0010000000008': case '0010000000105':
						/*SH*/
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
						$scope.menuList = { main_NewInUnwire: 'NewIn, Unwire', main_NewInUnwireBP: 'NewIn, Unwire BP', main_UserCustomerReturn: 'รับ User/Customer Return', main_Rack: 'เก็บเข้า Rack', main_PayProductGenaral: 'จ่ายสินค้าทั่วไป' };
						//console.log('User:WH');
						break;
					case '0010000000007':case '0010000000106':
						/*ST*/
						$scope.menuList = { main_ProductGeneral: 'รับสินค้าทั่วไป', main_UserCustomerReturn: 'รับ User/Customer Return', main_Rack: 'เก็บเข้า Rack', main_PayProductGenaral: 'จ่ายสินค้าทั่วไป' };
						//console.log('User:ST');
						break;

				}
				break;

			case 'Store':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { pallet_SplitPallet: 'Split Pallet', pallet_CombinePallet: 'Combine Pallet', additional_MoveLocation: 'Move Location', store_WeighingChemical: 'Weighing Chemical' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
						$scope.menuList = { pallet_CombinePallet: 'รวม Pallet' };
						//console.log('User:PD');
						break;
					case '0010000000110':
						/*TM*/
						$scope.menuList = { pallet_SplitPallet: 'Split Pallet', pallet_CombinePallet: 'Combine Pallet', additional_MoveLocation: 'Move Location', store_WeighingChemical: 'Weighing Chemical' };
						//console.log('User:TM');
						break;
					case '0010000000008': case '0010000000105':
						/*SH*/
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
					case '0010000000007':case '0010000000106':
						/*ST*/
						$scope.menuList = { pallet_SplitPallet: 'Split Pallet', pallet_CombinePallet: 'Combine Pallet', additional_MoveLocation: 'Move Location', store_WeighingChemical: 'Weighing Chemical' };
						//console.log('User:ST');
						break;
				
				}
				break;

			case 'Production':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { production_PackingRoll: 'Packing Roll', production_PackToPallet: 'Pack To Pallet', production_DeleteRoll: 'Delete Roll', production_ReceiveRawMat: 'รับสินค้า Raw Mat', production_IssueRawMat: 'Issue Raw Mat' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
						$scope.menuList = { production_PackingRoll: 'Packing Roll', production_PackToPallet: 'Pack To Pallet', production_DeleteRoll: 'Delete Roll', production_ReceiveRawMat: 'รับสินค้า Raw Mat', production_IssueRawMat: 'Issue Raw Mat' };
						//console.log('User:PD');
						break;
					case '0010000000110':
						/*TM*/		
						$scope.menuList = {production_ReceiveRawMat: 'รับสินค้า Raw Mat'};
						//console.log('User:PD');
						break;
					case '0010000000008': case '0010000000105':
						/*SH*/
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
					case '0010000000007':case '0010000000106':
						/*ST*/
					
				}
				break;

			case 'Shipping':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { shipping_Sale: 'เบิก Sale', shipping_NewInShipping: 'รับสินค้า SH', shipping_CustomerReturn: 'รับ Customer Return' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
					case '0010000000110':
						/*TM*/		
					case '0010000000008': case '0010000000105':
						/*SH*/
						$scope.menuList = { shipping_Sale: 'เบิก Sale', shipping_NewInShipping: 'รับสินค้า SH', shipping_CustomerReturn: 'รับ Customer Return' };
						//console.log('User:SH');
						break;
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
					case '0010000000007':case '0010000000106':
						/*ST*/

				}
				break;

			case 'Additional':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { additional_MoveRoll: 'รวม Roll', additional_MovePallet: 'ย้าย Pallet', additional_MoveLocation: 'Move Location', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
						$scope.menuList = { additional_MoveLocation: 'Move Location', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:PD');
						break;
					case '0010000000110':
						/*TM*/	
						$scope.menuList = { additional_MoveLocation: 'Move Location', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:TM');
						break;	
					case '0010000000008': case '0010000000105':
						/*SH*/
						$scope.menuList = { additional_MovePallet: 'ย้าย Pallet', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:SH');
						break;
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
						$scope.menuList = { additional_MoveRoll: 'รวม Roll', additional_MovePallet: 'ย้าย Pallet', additional_MoveLocation: 'Move Location', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:WH');
						break;
					case '0010000000007':case '0010000000106':
						/*ST*/
						$scope.menuList = { additional_MovePallet: 'ย้าย Pallet', additional_MoveLocation: 'Move Location', additional_CheckRollPallet: 'Check Roll, Pallet', additional_CheckLocation: 'Check Location' };
						//console.log('User:ST');
						break;

				}
				break;

			case 'Pallet':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { pallet_ClearPallet: 'Clear Pallet' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
					case '0010000000110':
						/*TM*/	
					case '0010000000008': case '0010000000105':
						/*SH*/
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
						$scope.menuList = { pallet_ClearPallet: 'Clear Pallet' };
						//console.log('User:WH');
						break;
					case '0010000000007':case '0010000000106':
						/*ST*/

				}
				break;

			case 'TumblingMix':

				switch (angular.copy(LoginService.getLoginData('Group_index'))) {
					case '0010000000000':
						/*Admin*/
						$scope.menuList = { TumblingMix_MixRawmat: 'Mix Rawmat' };
						//console.log('User:Admin');
						break;
					case '0010000000001': case '0010000000002': case '0010000000107':
						/*PD*/
						$scope.menuList = { TumblingMix_MixRawmat: 'Mix Rawmat' };
						//console.log('User:PD');
						break;	
					case '0010000000110':
						/*TM*/
						$scope.menuList = { TumblingMix_MixRawmat: 'Mix Rawmat' };
						//console.log('User:TM');
						break;	
					case '0010000000008': case '0010000000105':
						/*SH*/
					case '0010000000004': case '0010000000005': case '0010000000003': case '0010000000104': case '0010000000094':
						/*WH*/
					case '0010000000007':case '0010000000106':
						/*ST*/

				}
				break;
		}

		$scope.clickMenu = function (key, name) {
			/*Menu page*/
			if ($stateParams.menuPage == 'app')
				$state.go(key, { 'menuPage': key, 'namePage': name });
			else
				$state.go(key);
		};

		$scope.GoBack = function () {
			$scope.$ionicGoBack();
		};




	});




