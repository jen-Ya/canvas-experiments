var _d = document;
var _w = window;
var _m = Math;
// (function(_d, _w, _m){
	'use strict'
	var size = _m.floor(_m.min(_w.innerWidth/7, (_w.innerHeight)/9));
	var num = 7;
	var width = size * num;
	var height = size * (num + 2);
	var frame = 0;
	var offset = [size/2, size/2];
	var colors = [
			"rgb(240,240,240)",
			"#9fc44f",
			"#267357",
			"#c65953",
			"#36a152",
			"#7db7d4",
			"#c29147",
			'#eecde4',
			'#42516a',
			'#05040e',
		]

	var createCanvas = function(width, height){
		var canvas = _d.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}

	var clearContext = function(context, width, height, color){
		if(color){
			var rect = createRect(width, height, 0, 0);
			drawRect(rect, color)
		}else{
			context.clearRect(0, 0, width, height);
		}
	}

	var drawMatrix = function(matrix){
		for(var y = 0; y < num; y++){
			for(var x = 0; x < num; x++){
				drawCell(x, y, matrix[y][x])
			}
		}
	}

	var drawCell = function(x, y, val){
		var rect = createRect(x * size, y * size + size, size, size)
		var color = colors[val]
		// drawRect(rect, colors)
		drawCircle(x*size, y*size + size, size /2, color);
		drawNum(val, x * size, y * size + size, size)
	}

	var drawNum =  function(val, x, y, size){
		'breakpoint'
		var color = '#ffffff';
		if(val == 0 || val > num){
			return
		}
		var pos = function(i){
			return [_m.cos(_m.PI/4 * 1 + 2 * _m.PI / val * i) * size/3 + x, _m.sin(_m.PI/4 * 1 + 2 * _m.PI / val * i) * size/3 + y];
		}
		if(val == 1){
			drawCircle(x, y, size/num/2, color)
			return
		}
		for(var i = 0; i < val; i++){
			var xy = pos(i);
			drawCircle(xy[0], xy[1], size/num/2, color)
		}
	}

	var drawRect = function(rect, color){
		if(color){
			context.fillStyle = color;
		}
		context.fillRect(offset[0] + rect.position.x - rect.size.x/2, offset[1] + rect.position.y - rect.size.y/2,
			rect.size.x, rect.size.y);
	}

	var drawCircle = function(x, y, r, color){
		if(color){
			context.fillStyle = color;
		}
		context.beginPath();
		context.arc(offset[0] + x, offset[1] + y, r, 2 * _m.PI, false);
		context.fill();
	}

	var mustPop = function(matrix, x, y){
		if(matrix[y][x] == 0 || matrix[y][x] > num){
			return false;
		}
		var countHor = function(x, y){
			var c = 1;
			var xx = x;
			while(++xx < num && matrix[y][xx] != 0){
				c++;
			}
			xx = x;
			while(--xx >= 0 && matrix[y][xx] != 0){
				c++;
			}
			return c;
		}
		var countVert = function(x, y){
			var c = 1;
			var yy = y;
			while(++yy < num && matrix[yy][x] != 0){
				c++;
			}
			yy = y;
			while(--yy >= 0 && matrix[yy][x] != 0){
				c++;
			}
			return c;
		}
		return countVert(x, y) == matrix[y][x] || countHor(x, y) == matrix[y][x];
	}

	var breakBlocks = function(matrix, x, y){
		var in_range = function(x, y){
			return x >= 0 && y >= 0 && x < 7 && y < 7;
		}
		var br = function(matrix, x, y){
			if(matrix[y][x] == num + 1){
				matrix[y][x] = 1 + _m.floor(_m.random() * (num - 1))
				return
			}
			matrix[y][x] = matrix[y][x] - 1;
		}
		var neighbours = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		]

		neighbours.forEach(function(xy){
			var x = xy[0]; var y = xy[1];
			if(in_range(x, y) && matrix[y][x] > num){
				br(matrix, x, y)
			}
		})
	}

	var countCells = function(matrix){
		s = 0;
		for(var y = 0; y < num; y++){
			for(var x = 0; x < num; x++){
				if(m[y][x] > 0){
					s++;
				}
			}
		}
		return s;
	}

	var popAll = function(matrix, onchanged, onunchanged){
		var speed = 100;
		var pops = [];
		var animatePops = function(pops, speed, callback){
			var start = Date.now();
			var step = function(){
				var diff = Date.now() - start;
				var p = diff / speed;
				if(p >= 1){
					callback();
				}else{
					var color = "rgba(240,240,240,"+p+")";
					pops.forEach(function(xy){
						drawCircle(xy[0] * size, (xy[1] + 1) * size, size/2, color);
					})
					_w.requestAnimationFrame(step);
				};
			}
			_w.requestAnimationFrame(step)
		}
		for(var y = 0; y < num; y++){
			for(var x = 0; x < num; x++){
				if(mustPop(matrix, x, y)){
					pops.push([x, y])
				}
			}
		}
		if(pops.length > 0){
			cursor.score += pops.length;
			animatePops(pops, speed, function(){
				pops.forEach(function(xy){
					var x = xy[0];
					var y = xy[1];
					matrix[y][x] = 0
					breakBlocks(matrix, x, y);
				})
				onchanged();
				return true;
			});
		}else{
			onunchanged();
			return false;
		}
	}

	var fallAll = function(matrix, onchanged, onunchanged){
		var changed = false;
		for(var y = num - 1; y >= 1; y--){
			for(var x = 0; x < num; x++){
				if(matrix[y][x] == 0 && matrix[y-1][x] > 0){
					changed = true;
					matrix[y][x] = matrix[y-1][x];
					matrix[y-1][x] = 0;
				}
			}
		}
		if(changed){
			_w.setTimeout(function(){
				onchanged()				
			}, 100);
		}else{
			onunchanged()
		}
	}

	var createRect = function(x, y, width, height){
		return {
			size : {
				x : width,
				y : height
			},
			position : {
				x : x,
				y : y
			}
		}
	}

	var canvas = createCanvas(width, height);
	_d.body.appendChild(canvas);

	var context = canvas.getContext("2d");

	var cursor = {
		position : 0,
		value : 1 + _m.floor(_m.random() * (num + 2)),
		count : 0,
		moves_max : 14,
		moves_left : 14,
		score : 0,
	}

	canvas.onmousemove = function(event){
		var x = _m.floor(event.offsetX / size);
		var x = _m.min(_m.max(x, 0), num)
		cursor.position = x;
	}

	var shiftRow = function(matrix){
		for(var x = 0; x < num; x++){
			if(matrix[0][x] != 0){
				console.error('game over')
				return;
			}
		}
		for(var y = 1; y < num - 1; y++){
			for(var x = 0; x < num; x++){
				matrix[y][x] = matrix[y+1][x]
			}
		}
		for(var x = 0; x < num; x++){
			matrix[num - 1][x] = num + 2;
		}
	}

	canvas.onclick = function(event){
		var x = _m.floor(event.offsetX / size);
		var x = _m.min(_m.max(x, 0), num)
		cursor.position = x;
		if(matrix[0][x] != 0){
			return
		}
		matrix[0][x] = cursor.value;
		cursor.value = 1 + _m.floor(_m.random() * (num + 2))
		cursor.moves_left -=  1;
		step(function(){
			if(cursor.moves_left <= 0){
				cursor.moves_max = _m.max(5, cursor.moves_max - 1)
				cursor.moves_left = cursor.moves_max
				shiftRow(matrix);
				step();
			}
		});
	}

	var new_matrix = function(x, y, fun){
		if(fun === undefined){
			fun = function(x, y){return 0}
		}
		var matrix = [];
		for(var yy = 0; yy < y; yy++){
			matrix[yy] = [];
			for(var xx = 0; xx < x; xx++){
				matrix[yy][xx] = fun(xx, yy);
			}
		}
		return matrix;
	}

	// popAll(matrix);
	// 
	
	
	var matrix = new_matrix(num, num, function(x, y){
		if(y < num - 3){
			return 0;
		}
		return _m.floor(_m.random() * (num + 3));
	});
	
	var step = function(callback){
		var speed = 100;
		var changed = true;
		var pause = 500;
		var stepPop = function(){
			popAll(matrix, function(){
				_w.setTimeout(stepFall(), 1000);
			}, function(){
				if(callback){
					callback()
				}
			});
		}
		var stepFall = function(){
			fallAll(matrix, function(){
				stepFall()
			}, function(){
				stepPop()
				// _w.requestAnimationFrame(stepPop)
			});
		}
		stepFall(matrix);
	}

	var drawMoves = function(left, max){
		var w = size/4;
		var m = 1;
		for(var i = 0; i < max; i++){
			if(i < left){
				var color = colors[8];
			}else{
				var color= colors[5];
			}
			// var rect = createRect(i * (w + m) - size/2 + w/2, num * size + size/2 + w/2 + m, w, w);
			drawCircle(i * (w + m) - size/2 + w/2, num * size + size/2 + w/2 + m, w/2, color);
		}
	}

	var drawScore = function(score){
		context.fillStyle = colors[8];
		context.font = "" + size/4 + "px Arial";
		var text = "Score: " + score
		context.fillText("Score: " + score, (num-2) * size, (num + 1 + 1/4) * size);
	}

	var draw = function(){
		clearContext(context, width, height);
		drawMatrix(matrix);
		drawCell(cursor.position, -1, cursor.value);
		drawMoves(cursor.moves_left, cursor.moves_max);
		drawScore(cursor.score)
		_w.requestAnimationFrame(draw);
		++frame;
	}

	// TESTS:
	var test = function(){
		var assert = function(cond){
			if(!cond){
				// throw Error("assertion error")
				console.error("assertion error")
			}
		}
		var run = function(){
			drawMatrix(matrix)
			_w.requestAnimationFrame(draw);
			step(function(){
				console.log('step done')
			});
		}

		var testOne = function(){
			var matrix = new_matrix(7, 7)
			matrix[6][3] = 4
			matrix[6][2] = 2
			matrix[6][4] = 3

			assert(mustPop(matrix, 4, 6) === true)
			assert(mustPop(matrix, 2, 6) === false)
			assert(mustPop(matrix, 3, 6) === false)
		}

		var testTwo = function(){
			var matrix = new_matrix(7, 7)
			for(var x = 0; x < 7; x++){
				matrix[6][x] = 7
			}

			assert(mustPop(matrix, 4, 6) === true)
			assert(mustPop(matrix, 2, 6) === true)
			assert(mustPop(matrix, 3, 6) === true)
		}

		var a = [run, testOne, testTwo]
		a.forEach(function(i, e){
			i.call();
		}) 	
	}
	test()

// })(document, window, Math);