var SubnetAdviser = angular.module('SubnetAdviser', []);

function SubnetAdviserCtrl($scope, $http) {

	$scope.voctet = _.range(16, 29);
	$scope.existingSubnetCIDR = [];
    $scope.generate = function(){
    	$('.block-ui').show();
    	var existingSubnetCIDR = $scope.existingSubnetCIDR;
    	$scope.networkValidity = SubnetCIDRAdviser.isValidVPC($scope.params.networkip, $scope.params.subnetmask);
    	if($scope.networkValidity.isValid) {
    		$scope.probabal_subnets = SubnetCIDRAdviser.calculate($scope.params.networkip , $scope.params.subnetmask, existingSubnetCIDR);
    	}
    	hideLoader();
    };

    var hideLoader = function() {
    	setTimeout(function(){ $('.block-ui').hide(); }, 1200);
    }

    $scope.setDefaults = function() {
    	$scope.params = {
    		'networkip': '10.0.0.0',
    		'subnetmask': 16
    	};
    	$scope.networkValidity = {
    		'isValid': true
    	};
    };

    $scope.addToExisting = function(s) {
    	$scope.existingSubnetCIDR.push(s);
    	$scope.generate();
    }

    $scope.display3rdOctet = function(range) {
    	return (range) ? range.from+' - '+range.to : 'none';
    }

    $scope.toggleList = function(range) {
    	$scope.hidesubnetlist = ($scope.hidesubnetlist) ? false : true;
    }

    $scope.setDefaults();
    $scope.generate();
}