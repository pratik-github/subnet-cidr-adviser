/**
 * @namespace
 * @author Pratik tayade
 *
 * AdviserHelper 0.0.1
**/
function AdviserHelper(){
  
};

AdviserHelper.prototype.allowedOctets = function(){
  return [128, 64, 32, 16, 8, 4, 2, 1, 128, 64, 32, 16];
};

AdviserHelper.prototype.cleanOctets = function( o ){
  var res = [];
  o.forEach(function(n) {
  var byte1 = Math.max( 0, Math.min( 255, parseInt( n )));
    res.push((isNaN( byte1 ) ? 0 : byte1 ));
  });
  return res;
};

AdviserHelper.prototype.IPv4SubnetMaskRange = function( netmaskbits ){
  return {'max': 28 , 'min': netmaskbits || 16};
};

AdviserHelper.prototype.kickValidation = function( a, msg, c ){
  return msg;
};

AdviserHelper.prototype.ip2Integer = function( ip ){
  var ipBytes = ip.split('.');
  return ( parseInt(ipBytes[3]) + (256 * parseInt(ipBytes[2])) + (256 * 256 * parseInt(ipBytes[1])) + (256 * 256 * 256 * parseInt(ipBytes[0])));
};

AdviserHelper.prototype.getUnique = function( arr ){
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

AdviserHelper.prototype.probabalCombinations = function( arr, Addressbytes, position_ ){
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

AdviserHelper.prototype.IPv4PossibleSubnets = function( o, existingSubnetCIDR ){
  var openBlock = Math.floor(o.netmaskBits/8);
  var blockReminder = o.netmaskBits%8;
  var subnets = [];
  var startIndex = ((o.subnetMaskRange.min + 3) < o.subnetMaskRange.max) ? (o.subnetMaskRange.min + 3) : o.subnetMaskRange.max;
  // Let's suggest large range first.....
  for(var i = startIndex; i <= o.subnetMaskRange.max; i++) {
    subnets = subnets.concat(AdviserHelper.generatePossibleSubnetFor(o, i, existingSubnetCIDR));
  }
  for(var j = o.subnetMaskRange.min; j < startIndex; j++) {
    subnets = subnets.concat(AdviserHelper.generatePossibleSubnetFor(o, j, existingSubnetCIDR));
  }
  return subnets;
};

AdviserHelper.prototype.isSubnetOverlap = function( existingSubnetCIDR, subnetCIDR ){
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

AdviserHelper.prototype.getIpRangeForSubnet = function( subnetCIDR ){
  var subnet = {
  'netMask': subnetCIDR.split('/')[1],
  'pureAddressbytes': subnetCIDR.split('/')[0].split('.')
  };
  var position_ = Math.ceil(subnet.netMask/8) - 1;
  var sIndex = subnet.pureAddressbytes.slice();
  var eIndex = subnet.pureAddressbytes.slice();
  eIndex[position_] = parseInt(eIndex[position_]) +  ((!AdviserHelper.allowedOctets[subnet.netMask%8 - 1]) ? 0 : AdviserHelper.allowedOctets[subnet.netMask%8 - 1] - 1);
  if(position_ == 2 && eIndex[3] < 255) {
    eIndex[3] = 255;
  }
  return {'start': sIndex.join('.'), 'end': eIndex.join('.')};
};

AdviserHelper.prototype.generatePossibleSubnetFor = function( o, i, existingSubnetCIDR ){
  var sliceTo = (i%8 == 0) ? 8 : i%8;
  var filteredOctets = [];
  var position_ = Math.ceil(i/8) - 1;
  var subnets = [];
  if((o.netmaskBits == 24 && i == 24) || (o.netmaskBits == 16 && i == 16)) {
    filteredOctets.push(o.pureAddressbytes[2]);
  } else if(o.netmaskBits%8 <= sliceTo && i <= 24) {
    filteredOctets = AdviserHelper.allowedOctets.slice(o.netmaskBits%8, sliceTo);
    filteredOctets.push(o.pureAddressbytes[2]);
  } else if(i >= 24 && o.pureAddressbytes[3] == 0) {
    filteredOctets = AdviserHelper.allowedOctets.slice(0, sliceTo);
    filteredOctets.push(o.pureAddressbytes[3]);
  } else {
    filteredOctets = AdviserHelper.allowedOctets.slice(0, sliceTo);
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
    'to': o.pureAddressbytes[2] + ((AdviserHelper.allowedOctets[o.netmaskBits%8 - 1] === undefined) ? 256 : AdviserHelper.allowedOctets[o.netmaskBits%8 - 1]) - 1
  } : false
  };
  var doesOverlap = AdviserHelper.isSubnetOverlap(existingSubnetCIDR, subnetObject.value);
  if( doesOverlap === false || subnetObject.range !== false) {
  if(doesOverlap && subnetObject.range !== false) {
    subnetObject.moverlap = true;
  }
  subnets.push(subnetObject);
  }   
  });
  return subnets;
};

module.exports = AdviserHelper;
