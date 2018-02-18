var WALL   = 9;
var BRANK  = 0;
var RED    = 1;
var GREEN  = 2;
var BRUE   = 3;
var YELLOW = 4;
var PURPLE = 5;
var OJAMA  = 6;

Tumo = function() {
	this.axis = 0; // 軸ぷよ
	this.sub  = 0; // 従属ぷよ
}

Next = function( seed ){
	this.r = new myRand();
	this.table = [];
	if( seed!=null ){
		this.r.setSeed( seed );
	}

	this.get = function( n ){
    	return this.table[(n+137)%128]; // 一応n=1が[0]になるように
	}
	this.reset = function( seed ){
		if( seed!=null ){
			this.r.setSeed( seed );
		}
		for( var i=0; i<128; ++i ){
			var tumo = new Tumo();
			tumo.axis = this.r.rand()%4 + 1;
			tumo.sub  = this.r.rand()%4 + 1;
    		this.table[i] = tumo;
		}
	}

	this.reset();
}

// TODO:範囲外の処理
Field = function() {
  this.field = [];
  for( var i=0; i<8*15; ++i ){
    this.field.push( WALL );
  }
  
  this.reset = function(){
	for( var x=1; x<=6; ++x ){
	  for( var y=1; y<=14; ++y ){
	    this.set( x, y, BRANK );
	  }
	}
  }
  this.set = function( x, y, c ){
    this.field[x+8*y] = c;
  }
  this.get = function( x, y ){
  	return this.field[x+8*y];
  }
  this.copy = function( src ){
	for( var x=1; x<=6; ++x ){
	  for( var y=1; y<=13; ++y ){
	    this.set( x, y, src.get(x,y) );
	  }
	}
  }
  this.put = function( x, c ){
  	for( y=1; y<=13; ++y ){
  		if( this.get(x,y)==BRANK ){ this.set(x,y,c); return; }
  	}
  }
  this.setTumo = function( pos, dir, tumo ){
  	var x1 = pos;
  	var x2 = x1 + ( (dir==3) ? -1 : (dir==1) ? 1 : 0 );
    if( dir==2 ){
      this.put( x2, tumo.sub );
      this.put( x1, tumo.axis );
    } else {
      this.put( x1, tumo.axis );
      this.put( x2, tumo.sub );
    }
  }
  
  this.reset();
}

// ユーティリティ
function doCountConnection( field, x, y, p, flags ){
  if( field.get(x,y)==BRANK ) return 0;
  if( field.get(x,y)==OJAMA ) return 0;
  if( field.get(x,y)!=p     ) return 0;
  if( flags.get(x,y)!=BRANK ) return 0;
  if( y>=13                 ) return 0;
  flags.set(x,y,p);
  return doCountConnection( field, x, y+1, p, flags ) +
         doCountConnection( field, x+1, y, p, flags ) +
         doCountConnection( field, x, y-1, p, flags ) +
         doCountConnection( field, x-1, y, p, flags ) + 1;
}

function countConnection( field, x, y ){
  var flags = new Field();
  return doCountConnection( field, x, y, field.get(x,y), flags );
}

function doDeleteConnection( field, x, y, p ){
  if( field.get(x,y)==BRANK ) return 0;
  if( field.get(x,y)==OJAMA ) { field.set(x,y,BRANK); return 0; }
  if( field.get(x,y)!=p     ) return 0;
  if( y>=13                 ) return 0;
  field.set(x,y,BRANK);
  return doDeleteConnection( field, x, y+1, p ) +
         doDeleteConnection( field, x+1, y, p ) +
         doDeleteConnection( field, x, y-1, p ) +
         doDeleteConnection( field, x-1, y, p ) + 1;
}

function deleteConnection( field, x, y ){
  return doDeleteConnection( field, x, y, field.get(x,y) );
}

function canFire( field ){
  var flags = new Field();
  for( var x=1; x<=6; ++x ){
    for( var y=1; y<=12; ++y ){
      if( doCountConnection( field, x, y, field.get(x,y), flags )>=4 )
        return true;
    }
  }
  return false;
}

function canFall( field ){
  for( var x=1; x<=6; ++x ){
    for( var y=2; y<=13; ++y ){
      if( field.get(x,y-1)==BRANK && field.get(x,y)!=BRANK ) return true;
    }
  }
  return false;
}

function fallField( field ){
  var flag = false; // 落下が発生したかどうか
  for( var x=1; x<=6; ++x ){
    var t = 1;
    for( var y=1; y<=13; ++y ){
      var p = field.get(x,y);
      if( p==BRANK ) continue;
      field.set(x,y,field.get(x,t));
      field.set(x,t,p);
      if( t!=y ) flag = true;
      t++;
    }
  }
  return flag;
}

Step = function(){
	this.num   = 0;         // 消えたぷよの数
	this.connections = [];  // 連結数
	this.color = 0;         // 色数
}
function fireStepField( field ){
	var step  = new Step();
    var flags = new Field();
    var color_f = [0,0,0,0,0,0];
    for( var x=1; x<=6; ++x ){
    	for( var y=1; y<=12; ++y ){
    		var c = field.get(x,y);
    		var n = doCountConnection( field, x, y, c, flags );
    		if( n>=4 ){
    			deleteConnection( field,x,y );
    			step.num += n;
    			step.connections.push( n );
    			color_f[ c ] = 1;
			}
		}
	}
	var cnt = 0;
	for( var i=1; i<=5; ++i ){
		if( color_f[i]==1 ) cnt++;
	}
	step.color = cnt;
	return step;
}

function newField( field ){
  var fd = new Field();
  fd.copy(field);
  return fd;
}