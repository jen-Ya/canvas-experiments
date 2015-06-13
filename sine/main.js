(function(_d, _w, _m){
	'use strict';

	var width = window.innerWidth;
	var height = 400;
	var rectCount = 100;

	var createCanvas = function(width, height){
		var canvas = _d.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	};

	var clearContext = function(context, width, height){
		var rect = createRect(width, height, 0, 0);
		drawRect(rect, 'rgba(0,0,0,0.3)');
	};

	var drawRect = function(rect, color){
		context.fillStyle = color;
		context.fillRect(rect.position.x, rect.position.y,
			rect.size.x, rect.size.y);
	};

	var createRect = function(width, height, x, y){
		return {
			size : {
				x : width,
				y : height
			},
			position : {
				x : x,
				y : y
			}
		};
	};

	var gradient = function(start, end, max, i){
		var diff = (end - start);
		return start + diff * (i / max);
	};

	var sin = function(offset, ampl, freq, phase, frame){
		return offset + _m.sin(frame / freq + phase) * ampl;
	};

	var rects = new Array(rectCount);

	for(var i = 0; i < rectCount; i++){
		rects[i] = createRect(width/rectCount, gradient(1, 0.1, rectCount, i), width/rectCount * i, 0);
	}

	var frame = 0;
	var step = function(){
		clearContext(context, width, height);
		for(var i = 0; i < rectCount; i++){
			var y = sin(100, 20, 2 * rectCount / i , 0, frame);
			rects[i].position.y = y;
			var color = 'rgb(' + gradient(0, 255, rectCount, i) + ', ' + gradient(255, 100, rectCount, i) + ', '+ _m.round(128 + _m.sin(frame / 20) * 127) +')';
			drawRect(rects[i], color);
		}
			
		_w.requestAnimationFrame(step);
		++frame;
	};

	var canvas = createCanvas(width, height);
	_d.body.appendChild(canvas);
	var context = canvas.getContext("2d");
	_w.requestAnimationFrame(step);

})(window.document, window, Math);