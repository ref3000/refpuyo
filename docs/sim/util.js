// 乱数生成
myRand = function( seed ){
	this.y;
	if( seed == null ){
		this.y = Math.random() * 2147483647;
	} else {
		this.y = seed;
	}

	this.setSeed = function( seed ){
    	this.y = seed;
	}
	this.rand = function(){
		this.y = this.y ^ (this.y << 13);
		this.y = this.y ^ (this.y >> 17);
		this.y = this.y ^ (this.y << 15);
		return this.y>>>0;
	}
}

// ハッシュ関数
function myHash( str ){
	var r = new myRand(1);
    for( var i=0; i<str.length; ++i ){
    	r.setSeed( r.rand() + str.charCodeAt(i) );
    }
    return r.rand();
}

// GETパラメータ解析
function GetQueryString()
{
    var result = {};
    if( 1 < window.location.search.length )
    {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring( 1 );

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ )
        {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            // パラメータ名をキーとして連想配列に追加する
            result[ paramName ] = paramValue;
        }
    }
    return result;
}

// POSITION型
Pos = function( x, y ){
	this.x = (isNaN(x)) ? 0 : x;
	this.y = (isNaN(y)) ? 0 : y;
}
