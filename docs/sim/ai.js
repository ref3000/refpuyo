

var PATTERN = [ // x1,y1,x2,y2 // 1が軸 2が属 // yは高さとの増分
  [ 1, 1, 1, 2 ], // dir0
  [ 2, 1, 2, 2 ],
  [ 3, 1, 3, 2 ],
  [ 4, 1, 4, 2 ],
  [ 5, 1, 5, 2 ],
  [ 6, 1, 6, 2 ],
  [ 1, 1, 2, 1 ], // dir1
  [ 2, 1, 3, 1 ],
  [ 3, 1, 4, 1 ],
  [ 4, 1, 5, 1 ],
  [ 5, 1, 6, 1 ],
  [ 1, 2, 1, 1 ], // dir2
  [ 2, 2, 2, 1 ],
  [ 3, 2, 3, 1 ],
  [ 4, 2, 4, 1 ],
  [ 5, 2, 5, 1 ],
  [ 6, 2, 6, 1 ],
  [ 2, 1, 1, 1 ], // dir3
  [ 3, 1, 2, 1 ],
  [ 4, 1, 3, 1 ],
  [ 5, 1, 4, 1 ],
  [ 6, 1, 5, 1 ],
];

function canMawashi( h, n ){
  switch( n ){
  case 0 : if( h[1]>12 || h[2]>12 ) return false; break; // dir0
  case 1 : if( h[2]>12            ) return false; break;
  case 2 : if( h[3]>12            ) return false; break;
  case 3 : if( h[4]>12            ) return false; break;
  case 4 : if( h[5]>12 || h[4]>12 ) return false; break;
  case 5 : if( h[6]>12 || h[4]>12 || h[5]>12 ) return false; break;
  case 6 : if( h[1]>12 || h[2]>12 ) return false; break; // dir1
  case 7 : if( h[2]>12 || h[3]>12 ) return false; break;
  case 8 : if( h[3]>12 || h[4]>12 ) return false; break;
  case 9 : if( h[4]>12 || h[5]>12 ) return false; break;
  case 10: if( h[5]>12 || h[6]>12 ) return false; break;
  case 11: if( h[1]>11 || h[2]>12 ) return false; break; // dir2
  case 12: if( h[2]>11            ) return false; break;
  case 13: if( h[3]>11            ) return false; break;
  case 14: if( h[4]>11            ) return false; break;
  case 15: if( h[5]>11 || h[4]>12 ) return false; break;
  case 16: if( h[6]>11 || h[4]>12 || h[5]>12 ) return false; break;
  case 17: if( h[1]>12 || h[2]>12 ) return false; break; // dir3
  case 18: if( h[2]>12 || h[3]>12 ) return false; break;
  case 19: if( h[3]>12 || h[4]>12 ) return false; break;
  case 20: if( h[4]>12 || h[5]>12 ) return false; break;
  case 21: if( h[5]>12 || h[6]>12 ) return false; break;
  }
  return true;
}

function setPuyoField( field, heights, tumo, n ){
  var ax = PATTERN[n][0];
  var ay = PATTERN[n][1] + heights[ax];
  var sx = PATTERN[n][2];
  var sy = PATTERN[n][3] + heights[sx];
  //if( sy>13 ) return false;
  //if( ay>13 && PATTERN[n][1]==1 ) return false;
  if( canMawashi(heights,n)==false ) return false;
  if( ay<=13 ) field.set( ax, ay, tumo.axis );
  field.set( sx, sy, tumo.sub  );
  return true;
}

function getHeights( field ){
  var heights = [0,0,0,0,0,0,0];
  for( var x=1; x<=6; ++x ){
    var h = 0;
    for( var y=1; y<=13; ++y ){
      if( field.get(x,y)==BRANK ) break;
      h++;
    }
    heights[x] = h;
  }
  return heights;
}

function printField( field ){
  console.log( "printField" );
  for( var y=13; y>=1; --y ){
    var line = "[";
    for( var x=1; x<=6; ++x ){
      line += field.get(x,y);
    }
    line += "]"
    console.log( line );
  }
}

function canFireAI( field, heights ){
  var flags = new Field();
  for( var x=1; x<=6; ++x ){
    for( var y=1; y<=heights[x]; ++y ){
      if( doCountConnection( field, x, y, field.get(x,y), flags )>=4 )
        return true;
    }
  }
  return false;
}

function fireFieldAI( field, heights ){
  var A = [0,8,16,32,64,96,128,160,192,224,256,288,320,352,384,416,448,480,512];
  var B = [0,3,6,12,24];
  var C = [0,2,3,4,5,6,7,10];

  var score = 0;

  for( var chain_num=1; chain_num<=19; ++chain_num ){
    fallField( field );
    if( canFireAI(field,heights)==false ) break;
    var step = fireStepField( field ); // !後でAI用に別に用意する
    var base = step.num*10;
    var rate = 0;
    if( this.chain_num>19 )
      rate = 512;
    else
      rate = A[chain_num-1];
    rate += B[step.color-1];
    for( var i=0; i<step.connections.length; ++i ){
      var n = step.connections[i];
      if(n>11)
        rate += 10;
      else
        rate += C[n-4];
    }
    if( rate==0 ) rate = 1;
    score += base*rate;
  }

  return score;
}

function playAI( gm ){
  var field = new Field();
  field.copy( gm.field );
  var heights = getHeights( field );
  var tumo1   = gm.getNext(0);
  var tumo2   = gm.getNext(1);
  var tumo3   = gm.getNext(2);

  var best_score  = 0;
  var best_pos_id = 0;

  const LOOP1 = (tumo1.axis==tumo1.sub) ? 11 : 22;
  for( var i1=0; i1<LOOP1; ++i1 ){
    var field1 = new Field();
    field1.copy( field );
    if( setPuyoField( field1, heights, tumo1, i1 )==false ) continue;
    var heights1 = getHeights( field1 );
    if( canFireAI( field1, heights1 ) ){
      var score = fireFieldAI( field1, heights1 );
      if( score>best_score ){
        best_score = score;
        best_pos_id = i1;
      }
    }

    const LOOP2 = (tumo2.axis==tumo2.sub) ? 11 : 22;
    for( var i2=0; i2<LOOP2; ++i2 ){
      var field2 = new Field();
      field2.copy( field1 );
      if( setPuyoField( field2, heights1, tumo2, i2 )==false ) continue;
      var heights2 = getHeights( field2 );
      if( canFireAI( field2, heights2 ) ){
        var score = fireFieldAI( field2, heights2 );
        if( score>best_score ){
          best_score = score;
          best_pos_id = i1;
        }
      }

      const LOOP3 = (tumo3.axis==tumo3.sub) ? 11 : 22;
      for( var i3=0; i3<LOOP3; ++i3 ){
        var field3 = new Field();
        field3.copy( field2 );
        if( setPuyoField( field3, heights2, tumo3, i3 )==false ) continue;
        var heights3 = getHeights( field3 );
        if( canFireAI( field3, heights3 ) ){
          var score = fireFieldAI( field3, heights3 );
          if( score>best_score ){
            best_score = score;
            best_pos_id = i1;
          }
        }
      }      
    }
  }

  gm.pos_x = PATTERN[best_pos_id][0];
  if( best_pos_id<6 ){
    gm.dir = 0;
  } else if( best_pos_id<11 ){
    gm.dir = 1;
  } else if( best_pos_id<16 ){
    gm.dir = 2;
  } else {
    gm.dir = 3;
  }
  if( field.get(gm.pos_x,gm.pos_y)!=BRANK || field.get(gm.getSubPosX(),gm.getSubPosY())!=BRANK ){
    gm.pos_y = 13;
  }
}

function aiDebug( gm ){
  var field = new Field();
  field.copy( gm.field );
  var heights = getHeights( field );
  console.log(heights);
  //printField( field );

  for( var i=0; i<22; ++i ){
    console.log( i+":"+setPuyoField( field, heights, gm.getNext(0), i ) );
  }
}