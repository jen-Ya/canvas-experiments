/* globals _, $V, Vector */

(function(_d, _w, _m){
	'use strict';
	
	var options = {
		grid : 200,
		width : window.innerWidth + 100,
		height: window.innerHeight + 100,
		view : {
			pos : $V([50, 50]),
			size : $V([window.innerWidth - 20, window.innerHeight - 20]),
			zoom : 1
		}
	};

	var draw = {
		'point' : function(point, color){
			this.circle(point, 1, color);
		},
		'circle' : function(position, r, color){
			context.strokeStyle = color || 'white';
			context.beginPath();
			context.arc(position.e(1), position.e(2), r, 2 * _m.PI, false);
			context.stroke();
		},
		'points' : function(points, color){
			points.forEach(function(point){
				this.point(point, color);
			}.bind(this));
		},
		'atoms' : function(atoms){
			atoms.forEach(function(atom){
				this.atom(atom);
			}.bind(this));
		},
		'atom' : function(atom){
			this.point(atom.position, 'rgba(5,200,100,0.2)');
			if(atom.size){
				this.circle(atom.position, atom.size, 'violet');
			}
			atom.type.effects.concat(atom.effects).forEach(function(effect){
				var color = {
					'attract' : 'rgba(0,255,200,0.2)',
					'repulse' : 'rgba(255,200,0,0.2)',
					'eat' : 'rgba(255,10,10,0.9)',
					'follow' : 'rgba(255,100,10,0.6)'
				}[effect.type];
				this.circle(atom.position, effect.r, color);
			}.bind(this));
		}
	};

	var check_collisions = function(atoms){
		var gh = _m.floor(options.height / options.grid);
		var gw = _m.floor(options.width / options.grid);
		var grid = [];
		for(var i = 0; i < gh; i++){
			grid[i] = new Array(gw);
			for(var j = 0; j < gw; j++){
				grid[i][j] = [];
			}
		}
		atoms.forEach(function(atom){
			atom.force = atom.force.x(0.9);
			var x = _m.floor( atom.position.e(1) / options.grid  + gw) % gw;
			var y = _m.floor( atom.position.e(2) / options.grid  + gh) % gh;
			grid[y][x].push(atom);
		});
		atoms.forEach(function(atom){
			var x = _m.floor( atom.position.e(1) / options.grid  + gw) % gw;
			var y = _m.floor( atom.position.e(2) / options.grid  + gh) % gh;
			var neighbours = [];
			for(var dx = -1; dx <= 1; dx++){
				for(var dy = -1; dy <= 1; dy++){
					neighbours = neighbours.concat(grid[(y + dy + gh) % gh][(x + dx + gw) % gw]);
				}
			}
			neighbours.forEach(function(neighbour){
				if(atom == neighbour){
					return;
				}
				var d = neighbour.position.distanceFrom(atom.position);
				atom.type.effects.concat(atom.effects).forEach(function(effect){
					if(d < effect.r + neighbour.size){
						if(effect.affects.indexOf(neighbour.type.name) > -1 ||
							effect.affects.indexOf('*') > -1){
							effect.action.call(effect.options, atom, neighbour);
						}
					}
				});
			});
			atom.type.passive_effects.concat(atom.passive_effects).forEach(function(effect){
				effect.action.call(effect.options, atom);
			});
		});
	};


	var effect_actions = {
		'attract' : function(from, to){
			var direction = from.position.subtract(to.position).toUnitVector().x(this.power);
			to.force = to.force.add(direction);
		},
		'repulse' : function(from, to){
			var direction = to.position.subtract(from.position).toUnitVector().x(this.power);
			to.force = to.force.add(direction);
		},
		'follow' : function(from, to){
			var direction = to.position.subtract(from.position).toUnitVector().x(this.power);
			from.force = direction;
		},
		'escape' : function(from, to){
			var direction = from.position.subtract(to.position);
			from.force = from.force.add(direction).toUnitVector().x(this.power);
		},
		'eat' : function(from, to){
			var d = to.size - _m.max(0, to.size - this.power);
			// from.size += d / 100;
			to.size -= d;
		},
		// passive effects:
		'grow' : function(from){
			from.size = _m.min(from.size + this.power, this.max);
			from.type.effects[0].r = _m.min(from.size + this.power, this.max);
		},
		'divide' : function(from){
			if(from.size >= this.at_size){
				draw.circle(from.position, 15, 'blue');
				from.divide = true;
			}
		},
		'kill' : function(from){
			if(from.size <= this.at_size){
				from.kill = true;
			}
		}
	};
	
	var atom_types = {
		'atom' : {
			name : 'atom',
			effects : [],
			passive_effects : [],
		},
		'both' : {
			name : 'both',
			size : 20,
			effects : [{
				type : 'attract',
				affects : ['both'],
				action : effect_actions.attract,
				r : 70,
				options : {
					power : 1
				}
			},{
				type : 'repulse',
				affects : ['both'],
				action : effect_actions.repulse,
				r : 20,
				options : {
					power : 10
				}
			}],
			passive_effects : []
		},
		'cell' : {
			name : 'cell',
			size : 20,
			effects : [{
				type : 'repulse',
				affects : ['cell', 'both'],
				action : effect_actions.repulse,
				r : 20,
				options : {
					power : 10
				}
			}],
			passive_effects : [{
				type : 'grow',
				action : effect_actions.grow,
				options : {
					power : 0.1,
					max : 100
				}
			},{
				type : 'divide',
				action : effect_actions.divide,
				options : {
					at_size : 99
				}
			},{
				type : 'kill',
				action : effect_actions.kill,
				options : {
					at_size : 5
				}
			}],
			options : {
				size : 20
			}
		},
		'attacker' : {
			name : 'attacker',
			size : 40,
			effects : [{
				type : 'follow',
				affects : ['cell'],
				r : 100,
				action : effect_actions.follow,
				options : {
					power : 5
				}
			},{
				type : 'repulse',
				affects : ['attacker', 'both', 'cell'],
				action : effect_actions.repulse,
				r : 40,
				options : {
					power : 10
				}
			},{
				type : 'eat',
				affects : ['cell'],
				action : effect_actions.eat,
				r : 55,
				options : {
					power : 5
				}
			}],
			passive_effects : []
		}
	};

	var create_atom = function(atom_type, opts){
		var atom = {
			type : atom_types[atom_type],
			effects : [],
			passive_effects : [],
			force : $V([0, 0]),
			size : atom_types[atom_type].size,
		};
		return _.extend(atom, opts);
	};

	var counts = [
		{type : 'both', count : 10},
		{type : 'cell', count : 5},
		{type : 'attacker', count : 3},
	];

	var atoms = [];
	counts.forEach(function(count){
		for(var i = 0; i < count.count; i++){
			atoms.push(create_atom(count.type, {
				position : Vector.Random(2).x(options.view.size.e(1)).add(options.view.pos)
			}));
		}
	});

	var mouse = create_atom('atom', {position : $V([0, 0])});
	atoms.push(mouse);

	var apply_scroll = function(options, scroll){
		var ov = options.view;
		ov.pos = ov.pos.add(scroll);
		ov.pos.setElements([
			_m.min(_m.max(0, ov.pos.e(1)), options.width - ov.size.e(1)),
			_m.min(_m.max(0, ov.pos.e(2)), options.height - ov.size.e(2)),
			]);
	};
	
	var render = function(){
		apply_scroll(options, scroll);
		draw.atoms(atoms);
		check_collisions(atoms);
		context_render.drawImage(canvas,
			options.view.pos.e(1), options.view.pos.e(2),
			options.view.size.e(1) / options.view.zoom, options.view.size.e(2) / options.view.zoom,
			0, 0,
			options.view.size.e(1), options.view.size.e(2));
	};

	var createCanvas = function(width, height){
		var canvas = _d.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	};

	var clearContext = function(context, options, color){
		var buffer = 20;
		if(color){
			context.fillStyle = color;
			context.fillRect(options.view.pos.e(1) - buffer, options.view.pos.e(2) - buffer,
			options.view.size.e(1) / options.view.zoom + buffer * 2, options.view.size.e(2) / options.view.zoom + buffer * 2);
		}else{
			context.clearRect(options.view.pos.e(1), options.view.pos.e(2),
			options.view.size.e(1) / options.view.zoom, options.view.size.e(2) / options.view.zoom);
		}
	};

	var canvas = createCanvas(options.width,
		options.height);
	var canvas_render = createCanvas(options.view.size.e(1),
		options.view.size.e(2));
	var scroll = $V([0, 0]);

	canvas_render.onmousemove = function(event){
		var ov = options.view,
			scroll_of = 100,
			scroll_speed = 10,
			ex = event.offsetX,
			ey = event.offsetY,
			x = ex / options.view.zoom + ov.pos.e(1),
			y = ey / options.view.zoom + ov.pos.e(2);
		scroll.setElements([0, 0]);
		if(ex < scroll_of){
			scroll.elements[0] = -scroll_speed;
		}
		else if(ex > ov.size.e(1) - scroll_of){
			scroll.elements[0] = scroll_speed;
		}
		if(ey < scroll_of){
			scroll.elements[1] = -scroll_speed;
		}
		else if(ey > ov.size.e(2) - scroll_of){
			scroll.elements[1] = scroll_speed;
		}
		mouse.position.setElements([x, y]);
	};

	canvas_render.onmousedown = function(event){
		event.preventDefault();
		var type = event.which == 1 ? 'attract' : 'repulse';
		mouse.effects = [{
			type : type,
			affects : ['*'],
			action : effect_actions[type],
			r : 200,
			options : {
				power : 1
			}
		}];
		return false;
	};

	canvas_render.onmouseup = function(event){
		event.preventDefault();
		mouse.effects = [];
	};
	_d.body.appendChild(canvas_render);

	var context = canvas.getContext("2d");
	var context_render = canvas_render.getContext("2d");

	var calc = function(){
		var apply_own_force = function(atom){
			atom.position = atom.position.add(atom.force);
		};

		var wrap_edges = function(atom){
			atom.position.setElements([
			(atom.position.e(1) + options.width) % options.width,
			(atom.position.e(2) + options.height) % options.height,
			]);
		};
		
		var apply_forces = function(atoms){
			atoms.forEach(function(atom){
				apply_own_force(atom);
				wrap_edges(atom);
			});
		};

		var divide_atoms = function(atoms){
			for(var i = atoms.length - 1; i >= 0; i--){
				var atom = atoms[i];
				if(atom.divide === true){
					draw.circle(atom.position, 10, 'white');
					var left_atom = create_atom(atom.type.name, {
						size : atom.size / 3,
						position : atom.position.add(Vector.Random(2))
					});
					var right_atom = create_atom(atom.type.name, {
						size : atom.size / 3,
						position : atom.position.add(Vector.Random(2))
					});
					atoms.splice(i, 1);
					atoms.push(left_atom);
					atoms.push(right_atom);
				}
			}
		};

		var kill_atoms = function(atoms){
			for(var i = atoms.length - 1; i >=0; i--){
				if(atoms[i].kill === true){
					atoms.splice(i, 1);
				}
			}
		};

		kill_atoms(atoms);
		divide_atoms(atoms);
		apply_forces(atoms);
		
	};

	var step = function(){
		calc();
		render();
		_w.requestAnimationFrame(step);
		clearContext(context, options, 'rgba(0,0,0,1)');
	};

	_w.requestAnimationFrame(step);

})(document, window, Math);