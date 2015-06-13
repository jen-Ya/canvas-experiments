(function(_w, _d, _m){
	'use strict';

	var rand_to = function(n){
		return _m.floor(_m.random() * n);
	};

	var color_str = function(r, g, b){
		return "rgb(" + r + "," + g + "," + b + ")";
	};

	var rand_color = function(){
		return color_str(rand_to(256), rand_to(256), rand_to(256));
	};

	// var rule = rand_to(256); // remarkable: 30, 90, 110, 184
	var rule      = 110;
	
	var size      = 10;
	var width     = _m.floor( _w.innerWidth / size );
	var height    = _m.floor( _w.innerHeight / size );
	var colors    = [rand_color(), rand_color()];
	var rules;

	var number_to_rules = function(n){
		return ("00000000" + n.toString(2)).slice(-8).split("").map(function(n){return +n;}).reverse();
	};

	var rules_to_number = function(rules){
		var number = 0;
		for(var x = 0; x < 8; x++){
			if(rules[x]) number += _m.pow(2, x);
		}
		return number;
	};

	var random_line = function(){
		var line = new Array(width);
		for(var x = 0; x < width; x++){
			line[x] = _m.random() > 0.5 ? 1 : 0;
		}
		return line;
	};

	var mirror_rules = function(rules){
		var tmp = rules[4];
		rules[4] = rules[1];
		rules[1] = tmp;
		tmp = rules[6];
		rules[6] = rules[3];
		rules[3] = tmp;
	};

	rules = number_to_rules(rule);

	// single point in center
	var first_line = new Array(width);
	first_line[ _m.floor(width/2) ] = 1;

	var canvas    = _d.createElement('canvas');
	canvas.width  = width * size;
	canvas.height = height * size;
	var context   = canvas.getContext("2d");

	_d.body.appendChild(canvas);

	var next = function(line){
		var next = new Array(width);
		for(var x = 0; x < width; x++){
			var top   = line[x    ];
			var right = line[(x + 1) % line.length];
			var left  = line[(line.length + x - 1) % line.length];

			var val = rules_to_number([left, top, right]);
			next[x] = rules[val];
		}
		return next;
	};

	var invert_cell = function(line, x){
		line[x] = line[x] ? 0 : 1;
	};

	var invert_line = function(line){
		for(var x = 0; x < line.length; x++){
			invert_cell(line, x);
		}
		return line;
	};

	var draw_line = function(line, y){
		for(var x = 0; x < width; x++){
			context.fillStyle = line[x] ? colors[0] : colors[1];
			context.fillRect(x * size, y * size, size, size);
		}
	};

	var frame = function(line, y){
		var next_line = line;
		for(var d = 0; d<100; d++){
			draw_line(next_line, y + d);
			next_line = next(next_line);
			if(y + d >= height - 1){
				return;
			}
		}
		_w.requestAnimationFrame(function() { frame(next_line,  y + 100); });
	};

	var redraw = function(){
		_w.requestAnimationFrame(function(){ frame(first_line, 0); });
	};

	redraw();

	canvas.onclick = function(event){
		// first row:
		if(event.offsetY < size){ 
			var x = _m.floor(event.offsetX / size);
			invert_cell(first_line, x);
			redraw();
		}
	};

	var set_rule_text = function(rules){
		var rule_number = rules_to_number(rules);
		var rule_container = _d.getElementById('rule');
		rule_container.innerHTML = '#' + rule_number;
	};

	var set_rule_checkboxes = function(rules){
		$('#rules').find('input').each(function(i, element){
			var x = $(element).data('x');
			var val = (rules[x] === 1);
			$(element).prop('checked', val);
		});
	};

	var complement = function(rules){
		invert_line(rules);
		rules.reverse();
	};

	$('#complement').click(function(){
		complement(rules);
		set_rule_text(rules);
		set_rule_checkboxes(rules);
		redraw();
	});

	$('#invert_line').click(function(){
		invert_line(first_line);
		redraw();
	});

	$('#mirror').click(function(){
		mirror_rules(rules);
		set_rule_text(rules);
		set_rule_checkboxes(rules);
		redraw();
	});

	$('#random_line').click(function(){
		first_line = random_line(width);
		redraw();
	});

	$('#single_point').click(function(){
		first_line = new Array(width);
		first_line[_m.floor(width/2)] = 1;
		redraw();
	});

	$('#rules').find('input').click(function(){
		var x = $(this).data('x');
		var val = $(this).prop('checked');
		console.log(x, val);
		rules[x] = val;
		set_rule_text(rules);
		redraw();
	});

	var set_colors = function(colors){
		for(var i = 0; i < 2; i++){
			var cols = colors[i].match(/\d+/g);
			var $cols = $('#colors .color').eq(i).find('input');
			$cols.eq(0).val(cols[0]);
			$cols.eq(1).val(cols[1]);
			$cols.eq(2).val(cols[2]);
		}
	};

	$('#colors input').change(function(){
		for(var i = 0; i < 2; i++){
			var $cols = $('#colors .color').eq(i).find('input');
			var r = $cols.eq(0).val();
			var g = $cols.eq(1).val();
			var b = $cols.eq(2).val();
			colors[i] = color_str(r, g, b);
			console.log(i, colors[i]);
		}
		redraw();
	});


	set_colors(colors);
	set_rule_text(rules);
	set_rule_checkboxes(rules);


})(window, document, Math);