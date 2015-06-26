var _d = document;
var _w = window;
var _m = Math;
// (function(_d, _w, _m){
	'use strict'
	var size = 60;
	var num = 7;
	var width = size * num;
	var height = size * (num + 1) + 20;
	var frame = 0;
	var offset = [size/2, size/2];

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
		var colors = [
			"#dddddd",
			"#9fc44f",
			"#267357",
			"#c65953",
			"#36a152",
			"#7db7d4",
			"#c29147",
			'#eecde4',
			'#12213a',
			'#05040e',
		]
		var rect = createRect(x * size, y * size + size, size, size)
		var color = colors[val]
		drawRect(rect, color)
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
				matrix[y][x] = _m.floor(_m.random() * num)
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

	var popAll = function(matrix){
		var changed = false;
		var pops = []
		for(var y = 0; y < num; y++){
			for(var x = 0; x < num; x++){
				if(mustPop(matrix, x, y)){
					changed = true;
					pops.push([x, y])
				}
			}
		}
		pops.forEach(function(xy){
			var x = xy[0];
			var y = xy[1];
			matrix[y][x] = 0
			breakBlocks(matrix, x, y);
		})
		return changed;
	}

	var fallAll = function(matrix){
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
		return changed;
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
		var y = -1;
		while(y + 1 < num && matrix[y+1][x] == 0){
			y += 1;
		}
		if(y == -1){
			return
		}
		matrix[y][x] = cursor.value;
		cursor.value = 1 + _m.floor(_m.random() * (num + 2))
		cursor.moves_left -=  1;
		if(cursor.moves_left == 0){
			cursor.moves_max = _m.max(5, cursor.moves_max - 1)
			cursor.moves_left = cursor.moves_max
			step();
			shiftRow(matrix);
			step();
		}
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
	
	var step = function(){
		var speed = 500;
		var changed = true;
		var stepPop = function(){
			changed = popAll(matrix);
			if(changed){
				_w.setTimeout(stepFall, speed)
			}else{
				_w.requestAnimationFrame(step)
			}
		}
		var stepFall = function(){
			changed = fallAll(matrix);
			if(changed){
				_w.setTimeout(stepFall, speed)
			}else{
				_w.requestAnimationFrame(stepPop)
			}
		}
		stepFall(matrix);
	}

	var drawClicks = function(left, max){
		var w = size/4;
		var m = 1;
		for(var i = 0; i < max; i++){
			if(i < left){
				var color = "#12213a";
			}else{
				var color= "#7db7d4";
			}
			var rect = createRect(i * (w + m) - size/2 + w/2, num * size + size/2 + w/2 + m, w, w);
			drawRect(rect, color);
		}
	}

	var draw = function(){
		clearContext(context, width, height);
		drawMatrix(matrix);
		drawCell(cursor.position, -1, cursor.value);
		drawClicks(cursor.moves_left, cursor.moves_max);
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
			step();
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