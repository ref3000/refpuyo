GameManager = function() {
  this.pos_x = 3;  // 軸x
  this.pos_y = 12; // 軸y
  this.dir   = 0;  // 向き
  this.turn  = 1;  // 何手目か
  this.select_pos    = new Pos(); // どこを選択しているか
  this.select_status = false;     // 選択中かどうか
  this.select_puyo   = BRANK;       // 選択してるぷよの種類
  this.field      = new Field(); // フィールド
  this.next       = new Next();  // ネクスト
  this.chain_flag = false; // 連鎖中かどうか
  this.chain_num = 0; // 連鎖数
  this.score     = 0; // 得点
  this.score_sum = 0; // 合計得点
  this.history = [ { class:"init" } ];  // 履歴
  
  // privateな関数群のつもり
  this.getSubPosX = function(){
    return this.pos_x+((this.dir==1)?1:(this.dir==3)?-1:0);
  }
  this.getSubPosY = function(){
    return this.pos_y+((this.dir==0)?1:(this.dir==2)?-1:0);
  }
  this.tumoAvailable = function(){
  	var x1 = this.pos_x;
  	var y1 = this.pos_y;
  	var x2 = this.getSubPosX();
  	var y2 = this.getSubPosY();
  	if( this.field.get( x1, y1 )!=BRANK ) return false;
  	if( this.field.get( x2, y2 )!=BRANK ) return false;
  	return true;
  }
  this.canMove = function(){
    return this.pos_x != -1;
  }
  
  // publicな関数群のつもり
  this.moveLeft = function(){
    if( !this.canMove() ) return;
    this.pos_x--;
    if( !this.tumoAvailable() ) this.pos_x++;
  }
  this.moveRight = function(){
    if( !this.canMove() ) return;
    this.pos_x++;
    if( !this.tumoAvailable() ) this.pos_x--;
  }
  this.turnLeft = function(){
    if( !this.canMove() ) return;
    this.dir = (this.dir+3)%4;
    if( this.tumoAvailable() ) return;
    switch( this.dir ){
    case 2:
    	if( this.pos_y>=13 ) break;
    	this.pos_y++;
    	return;
    case 1:
    	this.pos_x--;
        if( this.tumoAvailable() ) return;
        this.pos_x++;
    	break;
    case 3:
    	this.pos_x++;
        if( this.tumoAvailable() ) return;
        this.pos_x--;
    	break;
    }
    this.dir = (this.dir+1)%4;
  }
  this.turnRight = function(){
    if( !this.canMove() ) return;
    this.dir = (this.dir+1)%4;
    if( this.tumoAvailable() ) return;
    switch( this.dir ){
    case 2:
    	if( this.pos_y>=13 ) break;
    	this.pos_y++;
    	return;
    case 1:
    	this.pos_x--;
        if( this.tumoAvailable() ) return;
        this.pos_x++;
    	break;
    case 3:
    	this.pos_x++;
        if( this.tumoAvailable() ) return;
        this.pos_x--;
    	break;
    }
    this.dir = (this.dir+3)%4;
  }
  this.getField = function(){
    if( this.pos_x==-1 ) return this.field;
    var fieldAll = new Field();
    fieldAll.copy( this.field );
  	var x1 = this.pos_x;
  	var y1 = this.pos_y;
  	var x2 = this.getSubPosX();
  	var y2 = this.getSubPosY();
  	var tumo = this.next.get( this.turn );
    fieldAll.set( x1, y1, tumo.axis );
    fieldAll.set( x2, y2, tumo.sub  );
    return fieldAll;
  }
  this.getNext = function( n ){
    if( n==null ) return this.next;
    return this.next.get( this.turn+n );
  }
  this.setTumo = function(){
    if( this.pos_x==-1 ) return;
    var tumo = this.next.get( this.turn );
  	this.field.setTumo( this.pos_x, this.dir, tumo );
    this.history.push( { class:"set", pos:this.pos_x, dir:this.dir, field:newField(this.field) } );
    //console.log(this.history);
    this.pos_x = -1;
  }
  this.nextTurn = function(){
      var his_last = this.history[this.history.length-1];
      his_last.field.copy( this.field ); // フィールドを発火後の形に更新
      this.turn++;
      this.pos_x = 3;
      this.pos_y = 12;
      this.dir = 0;
  }
  this.step = function(){
    if( fallField( this.field ) ) return; // 落下があったら終了
    if( canFire( this.field ) ){
      var step = fireStepField( this.field );
      this.chain_num++;
      var base = step.num*10;
      var rate = 0;
      var A = [0,8,16,32,64,96,128,160,192,224,256,288,320,352,384,416,448,480,512];
      var B = [0,3,6,12,24];
      var C = [0,2,3,4,5,6,7,10];
      if( this.chain_num>19 )
        rate = 512;
      else
        rate = A[this.chain_num-1];
      rate += B[step.color-1];
      for( var i=0; i<step.connections.length; ++i ){
        var n = step.connections[i];
        if(n>11)
          rate += 10;
        else
          rate += C[n-4];
      }
      if( rate==0 ) rate = 1;
      var score = base*rate;
      this.score += score;
      this.score_sum += score;
    }
  }
  this.isChain = function(){
    return this.chain_flag;
  }
  this.debug = function(){
    //console.log(deleteConnection(this.field,3,3));
  }
  this.setFieldColor = function( x, y, c ){
    this.field.set( x,y,c );
  }
  this.select = function( x, y ){
    this.select_pos.x = x;
    this.select_pos.y = y;
    if( this.select_status ){
      this.field.set( x, y, this.select_puyo );
      // 履歴書き込み
      var his_last = this.history[this.history.length-1];
      if( his_last.class=="edit" ){
        //this.history.push( { class:"edit", field:-1 } );
        console.log("edit dayo");
      } else {
        //this.history.push( { class:"edit", field:newField(this.field) } );
        console.log("tigauyo");
      }
    }
  }
  this.getSelectPos = function(){
    return this.select_pos;
  }
  this.selectStatus = function( f ){
    this.select_status = f;
  }
  this.getSelectStatus = function(){
    return this.select_status;
  }
}
