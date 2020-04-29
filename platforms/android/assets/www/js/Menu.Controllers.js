
/**
* MainMenu.Controllers Module
*
* Description
*/

angular.module('Menu.Controllers', ['ionic'])

.controller('MenuCtrl', function($scope, $state, $ionicHistory, $stateParams, LoginService) {

	$scope.namePage = $stateParams.namePage;
	$scope.menuList = {};
	// var data = angular.copy(LoginService.getLoginData());

	switch($stateParams.menuPage){
		case 'app':
			console.log('data.Group_index==',angular.copy(LoginService.getLoginData('Group_index')));
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Transport:'ขนส่ง',Bagging:'Bagging',RS:'RS',Pallet:'Pallet',Film:'Film',Store:'Store'};
					console.log('User:admin');
					break;
	
				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/
					$scope.menuList = {Additional:'เมนูเสริม',Bagging:'Bagging',Pallet:'Pallet'};
					console.log('User:BG');
					break;

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Pallet:'Pallet',Film:'Film'};
					console.log('User:WH');
					break;

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Transport:'ขนส่ง',Pallet:'Pallet'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/
					$scope.menuList = {Additional:'เมนูเสริม',Bagging:'Bagging',Pallet:'Pallet'};
					console.log('User:FL BG');
					break;

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Pallet:'Pallet',Film:'Film'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Transport:'ขนส่ง',Pallet:'Pallet'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',Pallet:'Pallet',Film:'Film'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {Main: 'เมนูหลัก',Additional:'เมนูเสริม',Receive:'รับสินค้า',RS:'RS',Pallet:'Pallet'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/
					$scope.menuList = {Additional:'เมนูเสริม',Bagging:'Bagging',Pallet:'Pallet'};
					console.log('User:RA');
					break;

				case '0010000000013' :
					/*AC*/
					$scope.menuList = {Additional:'เมนูเสริม',Store:'Store'};
					console.log('User:AC');
					break;
			}
			break;

		case 'Main':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location', main_PickingRack: 'ตักลงจาก Rack',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',main_WHIssueDamage:'จ่ายสินค้าเสียหาย',main_WHTransferToSH: 'โอนสินค้าให้ SH'};
					console.log('User:admin');
					break;
	
				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/
					
				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location', main_PickingRack: 'ตักลงจาก Rack',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',main_WHIssueDamage:'จ่ายสินค้าเสียหาย',main_WHTransferToSH: 'โอนสินค้าให้ SH'};
					console.log('User:WH');
					break;

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location', main_PickingRack: 'ตักลงจาก Rack',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',main_WHIssueDamage:'จ่ายสินค้าเสียหาย',main_WHTransferToSH: 'โอนสินค้าให้ SH'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location', main_PickingRack: 'ตักลงจาก Rack',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',main_WHIssueDamage:'จ่ายสินค้าเสียหาย',main_WHTransferToSH: 'โอนสินค้าให้ SH'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {main_Rack:'เก็บเข้า Rack/Location',transport_PayProductGenaral:'จ่ายสินค้าทั่วไป'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/

				case '0010000000013': 
					/*AC*/
			}
			break;

		case 'Store':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {store_ProcessPallet:'Bulk Pallet Process'};
					console.log('User:admin');
					break;
	
				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/

				case '0010000000025':
					/*FL SH*/

				case '0010000000026':
					/*LT WH*/

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 

				case '0010000000029' : case '0010000000030':
					/*RA*/

				case '0010000000013': 
					/*AC*/
					$scope.menuList = {store_ProcessPallet:'Bulk Pallet Process'};
					console.log('User:AC');
					break;
			}
			break;
		
		case 'Bagging':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {bagging_BagJumbo:'Bag Jumbo',bagging_BagFilm:'Bag Film',bagging_CancelPallet:'ยกเลิก Pallet',bagging_UpdatePallet:'แก้ไข Pallet'};
					console.log('User:admin');
					break;
	
				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/
					$scope.menuList = {bagging_BagJumbo:'Bag Jumbo',bagging_CancelPallet:'ยกเลิก Pallet',bagging_UpdatePallet:'แก้ไข Pallet'};
					console.log('User:BG');
					break;

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 

				case '0010000000023':
					/*FL BG*/
					$scope.menuList = {bagging_BagJumbo:'Bag Jumbo',bagging_CancelPallet:'ยกเลิก Pallet',bagging_UpdatePallet:'แก้ไข Pallet'};
					console.log('User:FL BG');
					break;

				case '0010000000024':
					/*FL WH*/

				case '0010000000025':
					/*FL SH*/

				case '0010000000026':
					/*LT WH*/

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 

				case '0010000000029' : case '0010000000030':
					/*RA*/
					$scope.menuList = {bagging_BagFilm:'Bag Film',bagging_CancelPallet:'ยกเลิก Pallet',bagging_UpdatePallet:'แก้ไข Pallet'};
					console.log('User:RA');
					break;

				case '0010000000013': 
					/*AC*/
			}
			break;
		
		case 'Transport':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',transport_SHTransferToDockout:'โอนสินค้าไปท่าขึ้น',transport_SHLoading:'Load สินค้าขึ้นรถ',transport_SHReceive:'รับ Pallet จากลูกค้า'};
					console.log('User:admin');
					break;

				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 
					$scope.menuList = {transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',transport_SHTransferToDockout:'โอนสินค้าไปท่าขึ้น',transport_SHLoading:'Load สินค้าขึ้นรถ',transport_SHReceive:'รับ Pallet จากลูกค้า'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {transport_PayProductGenaral:'จ่ายสินค้าทั่วไป',transport_SHTransferToDockout:'โอนสินค้าไปท่าขึ้น',transport_SHLoading:'Load สินค้าขึ้นรถ',transport_SHReceive:'รับ Pallet จากลูกค้า'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 

				case '0010000000029' : case '0010000000030':
					/*RA*/

				case '0010000000013':
					/*AC*/ 
			}
			break;

		case 'Additional':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){

				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:admin');
					break;
	
				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location'};
					console.log('User:BG');
					break;

				case '0010000000004' : case '0010000000005' : case  '0010000000006':
					/*WH*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:WH');
					break;

				case '0010000000007' : case  '0010000000008' : case  '0010000000009': 
					/*SH*/ 
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location'};
					console.log('User:FL BG');
					break;

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location',additional_AddPalletToTag:'เพิ่มเลข Pallet',additional_MovePalletToLocation:'โอนสินค้าภายใน'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location'};
					console.log('User:RA');
					break;

				case '0010000000013': 
					/*AC*/
					$scope.menuList = {additional_CheckPallet:'ตราวจสอบ Pallet',additional_CheckLocation:'ตราวจสอบ Location'};
					console.log('User:AC');
					break;
			}
			break;	

		case 'Pallet':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:admin');
					break;

				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet'};
					console.log('User:BG');
					break;

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:WH');
					break;

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet'};
					console.log('User:BG');
					break;

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet',pallet_SplitPallet:'Split Pallet',pallet_CombinePallet:'Combine Pallet'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/	
					$scope.menuList = {pallet_ClearPallet:'Clear Pallet'};
					console.log('User:RA');
					break;

				case '0010000000013': 
					/*AC*/
			}
			break;

		case 'Film':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {film_NewIn:'รับโอน Bagging Film',film_NoNewIn:'รับโอน No Bagging Film',film_ProductGeneral:'รับสินค้าทั่วไป Film'};
					console.log('User:admin');
					break;

				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/
					$scope.menuList = {film_NewIn:'รับโอน Bagging Film',film_NoNewIn:'รับโอน No Bagging Film',film_ProductGeneral:'รับสินค้าทั่วไป Film'};
					console.log('User:WH');
					break;

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {film_NewIn:'รับโอน Bagging Film',film_NoNewIn:'รับโอน No Bagging Film',film_ProductGeneral:'รับสินค้าทั่วไป Film'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {film_NewIn:'รับโอน Bagging Film',film_NoNewIn:'รับโอน No Bagging Film',film_ProductGeneral:'รับสินค้าทั่วไป Film'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 

				case '0010000000029' : case '0010000000030':
					/*RA*/	

				case '0010000000013': 
					/*AC*/
			}
			break;
		
		case 'Receive':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {receive_NewIn:'รับโอน Bagging',receive_NoNewIn:'รับโอน No Bagging',receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:admin');
					break;

				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/
					$scope.menuList = {receive_NewIn:'รับโอน Bagging',receive_NoNewIn:'รับโอน No Bagging',receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:WH');
					break;

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 
					$scope.menuList = {receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:SH');
					break;

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/
					$scope.menuList = {receive_NewIn:'รับโอน Bagging',receive_NoNewIn:'รับโอน No Bagging',receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:FL WH');
					break;

				case '0010000000025':
					/*FL SH*/
					$scope.menuList = {receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:FL SH');
					break;

				case '0010000000026':
					/*LT WH*/
					$scope.menuList = {receive_NewIn:'รับโอน Bagging',receive_NoNewIn:'รับโอน No Bagging',receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:LT WH');
					break;

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {receive_NewIn_Auto:'รับ Auto',receive_ProductGeneral:'รับ Manual'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/

				case '0010000000013': 
					/*AC*/	
			}
			break;

		case 'RS':
			switch(angular.copy(LoginService.getLoginData('Group_index'))){
				case '0010000000000': 
					/*Admin*/
					$scope.menuList = {rs_ReceiveDM:'รับ (Dammage Transfer)',rs_TranferPick:'โอน RS (หยิบ)',rs_TranferPut:'โอน RS (เก็บ)',rs_AssignPallet:'Assign Pallet'};
					console.log('User:admin');
					break;

				case '0010000000001' : case '0010000000002' : case '0010000000003' : case '0010000000055':
					/*BG*/

				case '0010000000004' : case '0010000000005' : case '0010000000006':
					/*WH*/

				case '0010000000007' : case '0010000000008' : case '0010000000009': 
					/*SH*/ 

				case '0010000000023':
					/*FL BG*/

				case '0010000000024':
					/*FL WH*/

				case '0010000000025':
					/*FL SH*/

				case '0010000000026':
					/*LT WH*/

				case '0010000000016' : case '0010000000017' : case '0010000000018' : case '0010000000027' : case '0010000000088':
					/*RS*/ 
					$scope.menuList = {rs_ReceiveDM:'รับ (Dammage Transfer)',rs_TranferPick:'โอน RS (หยิบ)',rs_TranferPut:'โอน RS (เก็บ)',rs_AssignPallet:'Assign Pallet'};
					console.log('User:RS');
					break;

				case '0010000000029' : case '0010000000030':
					/*RA*/

				case '0010000000013': 
					/*AC*/	
			}
			break;
	}

	$scope.clickMenu = function(key, name){
		/*Menu page*/
		if($stateParams.menuPage == 'app')
			$state.go(key, {'menuPage':key, 'namePage':name});
		else

			if(key == 'rs_TranferPick')
			{
				$state.go(key,{'TypeTOW':'Pick','isAssing':false,'isDammage':false});
			}
			else if(key == 'rs_TranferPut')
			{
				$state.go(key,{'TypeTOW':'Put','isAssing':false,'isDammage':false});
			}
			else if(key == 'rs_AssignPallet')
			{
				$state.go(key,{'TypeTOW':'Pick','isAssing':true,'isDammage':false});
			}
			else if(key == 'rs_ReceiveDM')
			{
				$state.go(key,{'TypeTOW':'Put','isAssing':false,'isDammage':true});
			}
			else
			{
				$state.go(key);
			}
			
	};

	$scope.GoBack = function(){ 
		$scope.$ionicGoBack(); 
	};

	

	
});




