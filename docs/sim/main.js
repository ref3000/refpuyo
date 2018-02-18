
var gm = new GameManager();

onload = function() {
  // GETパラメータ解析
  var query = GetQueryString();
  for( var item in query ){
    switch( item ){
    case 'n':
    case 'next':
      gm.getNext().reset( myHash(query[item]) );
      break;
    case 'f':
    case 'field':
      gm.getField().reset();
      var str = query[item];
      for( var i=0; i<str.length; ++i ){
        var x = i%6 + 1;
        var y = Math.floor(i/6) + 1;
        var n = Number(str[i]);
        if( y>=14 ) break;
        if( 0<=n && n<=9 ) gm.setFieldColor( x,y,Number(str[i]) );
      }
      break;
    }
  }

  // canvas要素取得
  canvas_back  = document.getElementById('id_canvas_back');
  if (!canvas_back || !canvas_back.getContext) {
    alert("本ページの閲覧はHTML5対応ブラウザで行ってください");
    return false;
  }
  ctx_back      = canvas_back.getContext('2d');
  //canvas_back2  = document.getElementById('id_canvas_back2');
  //ctx_back2     = canvas_back2.getContext('2d');
  canvas_field  = document.getElementById('id_canvas_field');
  ctx_field     = canvas_field.getContext('2d');
  //canvas_field2 = document.getElementById('id_canvas_field2');
  //ctx_field2    = canvas_field2.getContext('2d');
  canvas_next   = document.getElementById('id_canvas_next');
  ctx_next      = canvas_next.getContext('2d');
  canvas_select = document.getElementById('id_canvas_select');
  ctx_select    = canvas_select.getContext('2d');
  canvas_history= document.getElementById('id_canvas_history');
  ctx_history   = canvas_history.getContext('2d');
  // 背景描画
  var picture = new Image();
  picture.onload = function() {ctx_back.drawImage(picture,0,0);};
  picture.src = "back.png";
  //var picture2 = new Image();
  //picture2.onload = function() {ctx_back2.drawImage(picture2,0,0);};
  //picture2.src = "back.png";
  // フィールド描画
  drawField( ctx_field, gm.getField() );
  // ネクスト描画
  var next = [ gm.getNext(1), gm.getNext(2) ];
  drawNext( ctx_next, next );
  // infoの書き込み
  field_info = document.getElementById('field_info');
  updateFieldInfo(field_info,1,0,0,0);

  // イベント登録
  window.addEventListener( 'keydown', eventKeydown, true );
  canvas_field.addEventListener( 'mousemove' , eventMousemove, true );
  canvas_field.addEventListener( 'mouseout'  , eventMouseout,  true );
  canvas_field.addEventListener( 'mousedown' , eventMousedown, true );
  //canvas_field.addEventListener( 'mouseup'   , eventMouseup, true );

  canvas_select.addEventListener( 'mousemove' , eventMousemove_s, true );
  canvas_select.addEventListener( 'mouseout'  , eventMouseout_s,  true );
  canvas_select.addEventListener( 'mousedown' , eventMousedown_s, true );


  clickElm = document.getElementById("btn_right");
  clickElm.addEventListener( 'click' , eventBtnR, true );
  clickElm = document.getElementById("btn_left");
  clickElm.addEventListener( 'click' , eventBtnL, true );
  clickElm = document.getElementById("btn_down");
  clickElm.addEventListener( 'click' , eventBtnD, true );
  clickElm = document.getElementById("btn_a");
  clickElm.addEventListener( 'click' , eventBtnA, true );
  clickElm = document.getElementById("btn_b");
  clickElm.addEventListener( 'click' , eventBtnB, true );
  clickElm = document.getElementById("btn_for");
  clickElm.addEventListener( 'click' , eventBtnFor, true );
  clickElm = document.getElementById("btn_back");
  clickElm.addEventListener( 'click' , eventBtnBack, true );

  setInterval( drawLoop,33 );
}

function eventKeydown(event) {
  var code = event.keyCode;
  switch (code) {
  case 37: // ←キー
    execLeft();
    event.preventDefault();
    break;
  case 39: // →キー
    execRight();
    event.preventDefault();
    break;
  case 38: // ↑キー
    gm.step();
    event.preventDefault();
    break;
  case 40: // ↓キー
    execDown();
    event.preventDefault();
    break;
  case 88: // x
    execTurnRight();
    event.preventDefault();
    break;
  case 90: // z
    execTurnLeft();
    event.preventDefault();
    break;
  case 67: // c
    playAI( gm );
    break;
  case 68: // d
    d_debug( gm );
    //gm.debug();
    //aiDebug( gm );
  }
}

var sctimerid;
function stepChain(){
  clearTimeout( sctimerid );
  sctimerid = setTimeout( function(){
    gm.step();
    if( canFire(gm.getField())||canFall(gm.getField()) ){
      stepChain();  
    } else {
      gm.nextTurn();
    }
  }, document.getElementById('speed_slider').value );
}

function fieldSelect(e){
  var rect = e.target.getBoundingClientRect();
  var x = 1 + Math.floor( (e.clientX-rect.left)/30 );
  var y = 13- Math.floor( (e.clientY-rect.top) /30 );
  gm.select( x, y );
}

function eventMousemove(e) {
  fieldSelect(e);
}

function eventMousedown(e) {
  gm.selectStatus( true );
  fieldSelect(e);
}

function eventMouseout(e) {
  gm.select( -1, -1 );
}

function fieldSelectS(e){
  var rect = e.target.getBoundingClientRect();
  var x = Math.floor( (e.clientX-rect.left)/30 );
  gm.select_puyo = x;
}

function eventMousemove_s(e) {
  //console.log("move");
}

function eventMousedown_s(e) {
  fieldSelectS(e);
}

function eventMouseout_s(e) {
  //console.log("out");
}

document.onmousedown = function (e){
  gm.selectStatus( true );
};

document.onmouseup = function (e){
  gm.selectStatus( false );
};

function drawLoop(){
  canvas_history.height = 30*(gm.history.length);
  drawMain( gm, ctx_field, ctx_next, field_info, ctx_select, ctx_history );
}

function eventBtnD(){
    execDown();
}
function eventBtnR(){
  execRight();
}
function eventBtnL(){
  execLeft();
}
function eventBtnA(){
  execTurnRight();
}
function eventBtnB(){
  execTurnLeft();
}
function eventBtnFor(){
  playAI( gm );
  //execTurnRight();
}
function eventBtnBack(){
  //execTurnLeft();
}

function execRight(){
  gm.moveRight();
}
function execLeft(){
  gm.moveLeft();
}
function execTurnRight(){
  gm.turnRight();
}
function execTurnLeft(){
  gm.turnLeft();
}
function execDown(){
  fallField( gm.field );
  gm.setTumo();
  if( canFire(gm.getField()) ){
    gm.chain_num = 0;
    gm.score = 0;
    stepChain();
  } else {
    gm.nextTurn();
  }
}