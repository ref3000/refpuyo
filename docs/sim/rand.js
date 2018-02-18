var xsy = Math.random() * 2147483647;
 
function xorshift(){
  xsy = xsy ^ (xsy << 13);
  xsy = xsy ^ (xsy >> 17);
  xsy = xsy ^ (xsy << 15);
  return xsy>>>0;
}

function xorshiftSeed( s ){
  xsy = s;
}