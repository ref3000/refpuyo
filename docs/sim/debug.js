
function d_debug( gm ){
  d_history( gm );
}

function d_history( gm ){
  console.log("d_history");
  for( var i=0; i<gm.history.length; ++i ){
    var his = gm.history[i];
    console.log( his );
  }
  
}
