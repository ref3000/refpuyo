

function setColor( ctx, c ){
  switch( c ){
    case 1:
      ctx.fillStyle = 'rgb(255, 0, 0)';
      break;
    case 2:
      ctx.fillStyle = 'rgb(0, 255, 0)';
      break;
    case 3:
      ctx.fillStyle = 'rgb(0, 0, 255)';
      break;
    case 4:
      ctx.fillStyle = 'rgb(255, 255, 0)';
      break;
    case 5:
      ctx.fillStyle = 'rgb(255, 0, 255)';
      break;
    case 6:
      ctx.fillStyle = 'rgb(200, 200, 200)';
      break;
  }
}

function drawField( ctx, field ){
  ctx.strokeStyle = '#555555';
  for( var y=13; y>0; --y ){
    for( var x=1; x<=6; ++x ){
      var c = field.get(x,y);
      if( c==BRANK ) continue;
      setColor( ctx, c );
      ctx.beginPath();
      ctx.arc(30*x-15, 15+(13-y)*30, 15, 0, Math.PI*2, true);
      ctx.fill();
      if( c==6 ) ctx.stroke();
    }
  }
}

function drawNext( ctx, next ){
	for( var i=0; i<next.length; ++i ){
	  var tumo = next[i];
      setColor( ctx, tumo.axis );
      ctx.beginPath();
      ctx.arc(30*i+15, 45, 15, 0, Math.PI*2, true);
      ctx.fill();
      setColor( ctx, tumo.sub );
      ctx.beginPath();
      ctx.arc(30*i+15, 15, 15, 0, Math.PI*2, true);
      ctx.fill();
	}
}

function drawSelect( ctx, pos, f ){
  ctx.beginPath();
  if( f )
    ctx.strokeStyle = '#ff0000';
  else
    ctx.strokeStyle = '#ffffff';
  var x = 30*(pos.x-1);
  var y = 30*(13-pos.y);
  ctx.strokeRect(x, y, 30, 30);
}

function updateFieldInfo( elm, turn, chain, score, sum ){
  elm.innerHTML = "<CENTER>"+turn+"手目<br>"+chain+" 連鎖<br></CENTER>得点 : "+score+"<br>合計 : "+sum;
}

function drawHistory( ctx, history ){
  ctx.beginPath();
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#ffffff';
  for( var i=0; i<history.length; ++i ){
    var y = 30*(history.length-i-1);
    if( history[i]["class"]=="init" ){
      ctx.fillStyle = '#ff99ff';
    } else if( history[i]["class"]=="set" ){
      ctx.fillStyle = '#99ffff';
    } else if( history[i]["class"]=="edit" ){
      ctx.fillStyle = '#98fb98';
    }
    ctx.fillRect(0, y, 120, 30);
    ctx.strokeRect(0, y, 120, 30);
  }
}

function drawMain( gm, ctx_field, ctx_next, elm_info, ctx_select, ctx_history ){
  ctx_field.clearRect(0, 0, 180, 390);
  ctx_select.clearRect(0, 0, 210, 30);
  var field = gm.getField();
  drawField( ctx_field, field );
  var next = [ gm.getNext(1), gm.getNext(2) ];
  drawNext( ctx_next, next );
  var select_pos = gm.getSelectPos();
  drawSelect( ctx_field, select_pos, gm.getSelectStatus() );
  drawSelectS( ctx_select, gm.select_puyo );
  updateFieldInfo( elm_info, gm.turn, gm.chain_num, gm.score, gm.score_sum );
  drawHistory( ctx_history, gm.history );
}

function drawSelectS( ctx, puyo ){
  ctx.strokeStyle = '#555555';
  for( var x=1; x<=6; ++x ){
    setColor( ctx, x );
    ctx.beginPath();
    ctx.arc(30*x+15, 15, 15, 0, Math.PI*2, true);
    ctx.fill();
    if( x==6 ) ctx.stroke();
  }
  
  ctx.beginPath();
  ctx.strokeStyle = '#ff0000';
  var x = 30*(puyo);
  ctx.strokeRect(x, 0, 30, 30);
}