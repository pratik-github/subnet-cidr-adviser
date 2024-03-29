/**
 * @namespace
 * @author Pratik tayade
 *
 * SubnetCIDRCalculator 1.0.8
**/

function AdviserHelper(){
  
};

AdviserHelper.allowedOctets = function(){
  return [128, 64, 32, 16, 8, 4, 2, 1, 128, 64, 32, 16];
};

AdviserHelper.cleanOctets = function( o ){
  var res = [];
  o.forEach(function(n) {
  var byte1 = Math.max( 0, Math.min( 255, parseInt( n )));
    res.push((isNaN( byte1 ) ? 0 : byte1 ));
  });
  return res;
};

AdviserHelper.IPv4SubnetMaskRange = function( netmaskbits ){
  return {'max': 28 , 'min': netmaskbits || 16};
};

AdviserHelper.kickValidation = function( a, msg, c ){
  return msg;
};

AdviserHelper.ip2Integer = function( ip ){
  var ipBytes = ip.split('.');
  return ( parseInt(ipBytes[3]) + (256 * parseInt(ipBytes[2])) + (256 * 256 * parseInt(ipBytes[1])) + (256 * 256 * 256 * parseInt(ipBytes[0])));
};

AdviserHelper.checkIp = function (ip) {
  if(typeof ip !== 'string') return false; // only do strings
  var matches = ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  return (matches ? true : false);
};

AdviserHelper.ip2long = function (ip_address) {
  if(!AdviserHelper.checkIp(ip_address)) return false; // invalid IP address
  var parts = ip_address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  return parts ? parts[1] * 16777216 + parts[2] * 65536 + parts[3] * 256 + parts[4] * 1 : false;
};

AdviserHelper.long2ip = function (ip) {
  //  discuss at: http://phpjs.org/functions/long2ip/
  // original by: Waldo Malqui Silva (http://waldo.malqui.info)
  if (!isFinite(ip))
    return false;

  return [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.');
};

AdviserHelper.getSubnetDetails = function(subnet) {

  var details = {'hosts': []};
  if(!AdviserHelper.isValidNetwork(subnet)) return ips;

  var size = Math.pow(2, 32 - subnet.split('/')[1] );
  var iprange = AdviserHelper.getIpRangeForSubnet(subnet);
  var first = AdviserHelper.ip2long(iprange.start);
  for (var i = 0; i < size; i++) {
    var ip = i + first;
    details.hosts.push(AdviserHelper.long2ip(ip));
  }
  details.noofhosts = size;
  details.startAddr = iprange.start;
  details.endAddr = iprange.end;
  return details;
};

AdviserHelper.getUnique = function( arr ){
  var u = {}, a = [];
  for(var i = 0, l = arr.length; i < l; ++i){
  if(u.hasOwnProperty(arr[i])) {
   continue;
  }
  a.push(arr[i]);
  u[arr[i]] = 1;
  }
  return a;
};

AdviserHelper.probabalCombinations = function( arr, Addressbytes, position_ ){
  var a = arr, res = [];
  for (var i = 0; i < Math.pow(2, a.length); i++) {
  var bin = (i).toString(2), set = [];
  bin = new Array((a.length-bin.length)+1).join("0")+bin;
  for (var j = 0; j < bin.length; j++) {
    if (bin[j] === "1") {
      set.push(a[j]);
    }
  }

  try {
    var sum = set.reduce(function(a, b) { return a + b; });
    res.push(sum);
    } catch(e) {

    }
  }
  res = res.filter(function(n) { return n >= Addressbytes[position_] });
  if(arr.indexOf(0) != -1) {res.push(0)};
  res = AdviserHelper.getUnique(res);
  return res;
};

AdviserHelper.IPv4PossibleSubnets = function( o, existingSubnetCIDR ){
  var openBlock = Math.floor(o.netmaskBits/8);
  var blockReminder = o.netmaskBits%8;
  var subnetsObj = {'subnets': [], 'subnetsExcluded': []};
  var startIndex = (o.subnetMaskRange.min <= 24) ? 24 : o.subnetMaskRange.min;
  //((o.subnetMaskRange.min + 3) < o.subnetMaskRange.max) ? (o.subnetMaskRange.min + 3) : o.subnetMaskRange.max;
  // Let's suggest large range first.....
  for(var i = startIndex; i <= o.subnetMaskRange.max; i++) {
    var res = AdviserHelper.generatePossibleSubnetFor(o, i, existingSubnetCIDR);
    subnetsObj.subnets = subnetsObj.subnets.concat(res.subnets);
    subnetsObj.subnetsExcluded = subnetsObj.subnetsExcluded.concat(res.subnetsExcluded);
  }

  for(var j = o.subnetMaskRange.min; j < startIndex; j++) {
    var res = AdviserHelper.generatePossibleSubnetFor(o, j, existingSubnetCIDR);
    subnetsObj.subnets = subnetsObj.subnets.concat(res.subnets);
    subnetsObj.subnetsExcluded = subnetsObj.subnetsExcluded.concat(res.subnetsExcluded);
  }

  return subnetsObj;
};

AdviserHelper.inRange = function( s, cidrToValidate ){
  var s1 = s.value.split('.'), s2 = cidrToValidate.split('.');
  delete s1[2] , delete s2[2];
  return (_.isEqual(s1, s2) && cidrToValidate.split('.')[2] >= s.range.from && cidrToValidate.split('.')[2] <= s.range.to) ? true : false;
};

AdviserHelper.isSubnetOverlap = function( existingSubnetCIDR, subnetCIDR ){
  var isOverlap = false;
  var ipRangeforCurrent = AdviserHelper.getIpRangeForSubnet(subnetCIDR);
  existingSubnetCIDR.forEach(function(s) {
  var ipRange = AdviserHelper.getIpRangeForSubnet(s);
  if((AdviserHelper.ip2Integer(ipRangeforCurrent.start) >= AdviserHelper.ip2Integer(ipRange.start) && AdviserHelper.ip2Integer(ipRangeforCurrent.start) <= AdviserHelper.ip2Integer(ipRange.end)) || (AdviserHelper.ip2Integer(ipRangeforCurrent.end) >= AdviserHelper.ip2Integer(ipRange.start) && AdviserHelper.ip2Integer(ipRangeforCurrent.end) <= AdviserHelper.ip2Integer(ipRange.end)) ||  (AdviserHelper.ip2Integer(ipRange.start) >= AdviserHelper.ip2Integer(ipRangeforCurrent.start) && AdviserHelper.ip2Integer(ipRange.start) <= AdviserHelper.ip2Integer(ipRangeforCurrent.end)) || (AdviserHelper.ip2Integer(ipRange.end) >= AdviserHelper.ip2Integer(ipRangeforCurrent.start) && AdviserHelper.ip2Integer(ipRange.end) <= AdviserHelper.ip2Integer(ipRangeforCurrent.end)) ) {
  isOverlap = s;
  }
  });
  return isOverlap;
};

AdviserHelper.getValidCIDR = function( parentVPC_CIDR, existingSubnetCIDR, probabal_subnets, cidrToValidate ){
  var result = {'cidrFound':false, 'newCIDR': ""};
  var parentVPC_CIDRDetail =  parentVPC_CIDR.split("/");
  
  if(probabal_subnets.subnets && probabal_subnets.subnets.length > 0) {
      var subnetObj = (probabal_subnets.subnets[0].range && probabal_subnets.subnets[0].isOverlap) ? suggestCIDRSmartly(existingSubnetCIDR, _.filter(probabal_subnets.subnets, function(s){ return s.range && s.isOverlap; })) : probabal_subnets.subnets[0].value;
      if(subnetObj) {
        result = {'cidrFound':true, 'newCIDR': subnetObj};
      }
  }

  if(cidrToValidate) {
      return AdviserHelper.isValidSubnetCIDR(probabal_subnets.subnets, existingSubnetCIDR, cidrToValidate, parentVPC_CIDRDetail);
  }

  return result;
};

AdviserHelper.getIpRangeForSubnet = function( subnetCIDR ){
  var subnet = {
  'netMask': subnetCIDR.split('/')[1],
  'pureAddressbytes': subnetCIDR.split('/')[0].split('.')
  };
  var allowedOctets = AdviserHelper.allowedOctets();
  var position_ = Math.ceil(subnet.netMask/8) - 1;
  var sIndex = subnet.pureAddressbytes.slice();
  var eIndex = subnet.pureAddressbytes.slice();
  eIndex[position_] = parseInt(eIndex[position_]) +  ((!allowedOctets[subnet.netMask%8 - 1]) ? 0 : allowedOctets[subnet.netMask%8 - 1] - 1);
  if(position_ == 2 && eIndex[3] < 255) {
    eIndex[3] = 255;
  }
  // console.log(sIndex, eIndex);
  return {'start': sIndex.join('.'), 'end': eIndex.join('.')};
};

AdviserHelper.isValidNetwork = function( ip, netmask ){
  var result = {'isValid': true};
  var pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if(netmask < 16 || netmask > 28){
    result = {'isValid': false, 'msg': 'Netmask must be between 16 and 28 inclusive'};
  } else if (!pattern.test(ip)) {
    result = {'isValid': false, 'msg': 'Invalid IP address'};
  }
  return result;
};

AdviserHelper.isValidSubnetCIDR = function( probabal_subnets, existingSubnetCIDR, cidrToValidate, vpcCidr ){
  var result = {
    'isValid': false,
    'msg': 'Invalid CIDR'
  };

  var probabalList = probabal_subnets.subnets
  var existingSubnetCIDR = probabal_subnets.existingSubnetCIDR || [];
  var subnetsExcluded = probabal_subnets.subnetsExcluded

  if(vpcCidr.indexOf('/') != -1) {
    vpcCidr = vpcCidr.split("/");
  }
  var subnetCIDR =  cidrToValidate.split("/");
  if(Number.isInteger(subnetCIDR[1]) && (subnetCIDR[1] < 16 || subnetCIDR[1] > 28)){
      result.isValid = false;
      result.msg = "Netmask must be between 16 and 28 inclusive";
  } else if (vpcCidr && subnetCIDR[1] < vpcCidr[1]){
      result.isValid = false;
      result.msg = "Netmask should be greater than or equal to parent VPC netmask";
  } else if (_.contains(existingSubnetCIDR, cidrToValidate)){
      result.isValid = false;
      result.msg = "This CIDR block is already taken";
  } else {
      result.isValid = (_.find(probabalList, function(s){ return (s.value == cidrToValidate || (s.range !== false && AdviserHelper.inRange(s, cidrToValidate))); })) ? true : false;
  }

  if(result.isValid || (!result.isValid && _.contains(subnetsExcluded, cidrToValidate))) {
    var isOverlap = AdviserHelper.isSubnetOverlap(existingSubnetCIDR, cidrToValidate);
    if(isOverlap  !== false) {
      result.isValid = false;
      result.msg = (isOverlap == cidrToValidate) ? "This CIDR block is already taken" : "CIDR block "+cidrToValidate+" overlaps with pre-existing CIDR block "+isOverlap+".";
    }
  }

  return result;
};

AdviserHelper.generatePossibleSubnetFor = function( o, i, existingSubnetCIDR ){
  var sliceTo = (i%8 == 0) ? 8 : i%8;
  var filteredOctets = [];
  var position_ = Math.ceil(i/8) - 1;
  var subnets = [], subnetsExcluded = [];
  var allowedOctets = AdviserHelper.allowedOctets();
  if((o.netmaskBits == 24 && i == 24) || (o.netmaskBits == 16 && i == 16)) {
    filteredOctets.push(o.pureAddressbytes[2]);
  } else if(o.netmaskBits%8 <= sliceTo && i <= 24) {
    filteredOctets = allowedOctets.slice(o.netmaskBits%8, sliceTo);
    filteredOctets.push(o.pureAddressbytes[2]);
  } else if(i >= 24 && o.pureAddressbytes[3] == 0) {
    filteredOctets = allowedOctets.slice(0, sliceTo);
    filteredOctets.push(o.pureAddressbytes[3]);
  } else {
    filteredOctets = allowedOctets.slice(0, sliceTo);
  }

  var allowedCombinations = AdviserHelper.probabalCombinations(filteredOctets, o.pureAddressbytes, position_);
  allowedCombinations.forEach(function(octet) {
    var subnetobs = o.pureAddressbytes.slice();
    subnetobs[position_] = octet;
    var subnetObject = {
      'value': subnetobs.join('.')+'/'+i,
      'ipRange': AdviserHelper.getIpRangeForSubnet(subnetobs.join('.')+'/'+i),
      'range': (i >= 25 & o.netmaskBits < 24) ? {
        'from': o.pureAddressbytes[2],
        'to': o.pureAddressbytes[2] + ((allowedOctets[o.netmaskBits%8 - 1] === undefined) ? 256 : allowedOctets[o.netmaskBits%8 - 1]) - 1
      } : false
    };
    var doesOverlap = AdviserHelper.isSubnetOverlap(existingSubnetCIDR, subnetObject.value);
    if( doesOverlap === false || subnetObject.range !== false) {    
      if(doesOverlap && subnetObject.range !== false) {   
        subnetObject.isOverlap = true;    
      }   
       subnets.push(subnetObject);
    } else {
      subnetsExcluded.push(subnetObject.value);
    }
  });
  return {'subnets': subnets, 'subnetsExcluded': subnetsExcluded};
};


var SubnetCIDRAdviser = {
  calculate : function( vpcAddress, netmaskBits, existingSubnetCIDR )
  {
    var result = {};
    var existingSubnetCIDR = existingSubnetCIDR || [];
    var subnetsObj = {};

    var networkValidity = AdviserHelper.isValidNetwork( vpcAddress, netmaskBits );
    if(!networkValidity.isValid) {
      return networkValidity;
    }
    var addressOctets = AdviserHelper.cleanOctets(vpcAddress.split( '.', 4 ));
    result.pureAddressbytes = [addressOctets[0], addressOctets[1], addressOctets[2], addressOctets[3]];
    vpcAddress = ( addressOctets[0] +'.'+ addressOctets[1] +'.'+ addressOctets[2] +'.'+ addressOctets[3] );
    result.addressDotQuad = vpcAddress.toString();
    result.netmaskBits = Math.max( 0, Math.min( 32, parseInt( netmaskBits )));  //sanity check: valid values: = 0-32 

    result.subnetMaskRange = AdviserHelper.IPv4SubnetMaskRange( result.netmaskBits );
    subnetsObj = AdviserHelper.IPv4PossibleSubnets( result, existingSubnetCIDR );
    result.subnets = subnetsObj.subnets;
    result.subnetsExcluded = subnetsObj.subnetsExcluded;
    return result;
  },
  isValidVPC : function( ip, netmask )
  {
    return AdviserHelper.isValidNetwork( ip, netmask );
  },
  isSubnetOverlap : function( existingSubnetCIDR, subnetCIDR )
  {
    return AdviserHelper.isSubnetOverlap( existingSubnetCIDR, subnetCIDR );
  },
  getIpRangeForSubnet : function( subnetCIDR )
  {
    return AdviserHelper.getIpRangeForSubnet( subnetCIDR );
  },
  getNextValidCIDR : function( parentVPC_CIDR, existingSubnetCIDR, probabal_subnets, cidrToValidate )
  {
    return AdviserHelper.getValidCIDR( parentVPC_CIDR, existingSubnetCIDR, probabal_subnets, cidrToValidate );
  },
  isValidSubnetCIDR : function( probabal_subnets, existingSubnetCIDR, cidrToValidate, vpcCidr )
  {
    return AdviserHelper.isValidSubnetCIDR( probabal_subnets, existingSubnetCIDR, cidrToValidate, vpcCidr );
  },
  getSubnetDetails : function( subnet )
  {
    return AdviserHelper.getSubnetDetails( subnet );
  }
};

if( ( typeof define === 'function' ) )
{
  define( [], function() { return SubnetCIDRAdviser; } );
}
else if( typeof exports === 'object' )
{
  module.exports = SubnetCIDRAdviser;
}
