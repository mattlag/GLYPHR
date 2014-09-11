// start of file

//-------------------------------------------------------
// LINKED SHAPE OBJECT
//-------------------------------------------------------

	function LinkedShape(oa){
		this.objtype = 'linkedshape';

		this.shape = (oa && oa.shape)? new Shape(oa.shape) : new Shape({'name':'Linked Shape'});
		this.usedin = oa.usedin || [];
	}

	LinkedShape.prototype.drawShapeToArea = function(ctx, view) {
		return this.shape.drawShapeToArea(ctx, view);
	};


//-------------------------------------------------------
// LINKED SHAPE INSTANCE OBJECT
//-------------------------------------------------------

	function LinkedShapeInstance(oa){
		this.objtype = 'linkedshapeinstance';

		this.link = oa.link || getFirstLinkedShapeID();
		this.uselinkedshapexy = (isval(oa.uselinkedshapexy)? oa.uselinkedshapexy : true);

		this.name = oa.name || 'Linked Shape Instance';
		this.xpos = oa.xpos || 0;
		this.ypos = oa.ypos || 0;
		this.xlock = isval(oa.xlock)? oa.xlock : false;
		this.ylock = isval(oa.ylock)? oa.ylock : false;
		this.visible = isval(oa.visible)? oa.visible : true;

		// shape settings that don't apply to linkedshapeinstance
		this.path = false;
		this.hlock = false;
		this.wlock = false;

		//debug('LINKEDSHAPEINSTANCE - end');
	}



//-------------------------------------------------------
// LINKED SHAPE INSTANCE METHODS
//-------------------------------------------------------


//	Insert Linked Shape
	function insertLinkedShapeDialog(){
		if(aalength(_GP.linkedshapes)>0){
			var content = 'Choose a Linked Shape to insert as a layer in this character:<br><br>';
			content += makeLinkedShapeThumbs();
			content += '<div style="display:block;"><button onclick="closeDialog();">cancel</button></div>';
			openDialog(content);
			drawSSThumbs();
		} else {
			openDialog('<div class="dialoglargetext">No Linked Shapes exist.  First, create some Linked Shapes, then you can insert them into characters.</div>');
		}
	}

	function insertLinkedShape(lsid, tochar){
		//debug("INSERTLINKEDSHAPE - adding linked shape: " + lsid + " to char: " + _UI.selectedchar);
		var ns = new LinkedShapeInstance({'link':lsid, 'xpos':100, 'ypos':100});

		//debug('INSERT LINKED SHAPE - JSON: \t' + JSON.stringify(ns));
		var ch = getChar(tochar, true);
		ch.charshapes.push(ns);
		ch.calcCharMaxes();

		addToUsedIn(lsid, tochar);

		closeDialog();
		putundoq('insert linked shape from charedit');
		redraw('insertLinkedShape');
	}

	function turnLinkedShapeIntoAShape(){
		var selshape = ss();
		var rastershape = clone(_GP.linkedshapes[selshape.link].shape);

		if(selshape.name === 'Linked Shape Instance'){
			rastershape.name = rastershape.name.replace('Linked Shape from ', '');
		} else {
			rastershape.name = selshape.name;
		}
		// rastershape.name = rastershape.name.replace('Linked Shape Instance', 'Shape');
		// rastershape.name = rastershape.name.replace('Linked Shape from ', '');

		deleteShape();
		addShape(rastershape);

		//debug('TURNLINKEDSHAPEINTOASHAPE - newshape \n'+json(newshape));
		redraw('turnLinkedShapeIntoAShape');
	}

	function makeLinkedShapeThumbs(){
		var re = '<div class="ssthumbcontainer">';
		var tochar = getSelectedCharID();
		for(var lsid in _GP.linkedshapes){
			re += '<table cellpadding=0 cellspacing=0 border=0><tr><td>';
			re += '<canvas class="ssthumb" id="thumb'+lsid+'" onclick="insertLinkedShape(\''+lsid+'\',\''+tochar+'\');" height='+_UI.thumbsize+'" width='+_UI.thumbsize+'></canvas>';
			re += '</td></tr><tr><td>';
			re += _GP.linkedshapes[lsid].shape.name;
			re += '</td></tr></table>';
			//debug('makeLinkedShapeThumbs - created canvas thumb'+lsid);
		}
		re += '</div>';
		return re;
	}


//	UsedIn Array Stuff
	function addToUsedIn(lsid, charid){
		//debug('ADDTOUSEDIN - lsid/charid ' + lsid + '/' + charid);
		var uia = _GP.linkedshapes[lsid].usedin;
		uia.push(''+charid);
		// sort numerically as opposed to alpha
		uia.sort(function(a,b){return a-b;});
	}

	function removeFromUsedIn(lsid, charid){
		//debug("REMOVEFROMUSEDIN - lsid/charid " + lsid + "/" + charid);
		var uia = _GP.linkedshapes[lsid].usedin;
		var charindex = uia.indexOf(''+charid);
		if(charindex != -1){
			uia.splice(charindex, 1);
		}

	}


//	Detials
	function linkedShapeInstanceDetails(s){
		//debug("LINKEDSHAPEINSTANCEDETAILS - start of function");
		content = '<tr><td colspan=3><h3>linked shape</h3></td></tr>';
		content += '<tr><td class="leftcol">&nbsp;</td><td style="margin-top:0px; padding-top:0px;"> name </td><td style="margin-top:0px; padding-top:0px; padding-right:10px;"><input class="input" style="width:90%;" type="text" value="' + s.name + '" onchange="ss().name = this.value; putundoq(\'shape name\'); redraw(\'linkedShapeInstanceDetails\');"></td></tr>';
		content += '<tr><td class="leftcol">&nbsp;</td><td> use linked shape position</td><td>'+checkUI('ss().uselinkedshapexy', true)+'</td></tr>';
		if(!s.uselinkedshapexy){
		content += '<tr><td class="leftcol">&nbsp;</td><td colspan=2><h3 style="font-size:.9em; color:rgb(153,158,163);">x & y values are relative to the linked shape position</h3></td></tr>';
		content += '<tr><td class="leftcol">&nbsp;</td><td style="margin-top:0px; padding-top:0px; text-transform:none;">&#916; x </td><td style="margin-top:0px; padding-top:0px; padding-right:10px;"><input class="input" type="text" value="' + round(s.xpos, 3) + '" onchange="ss().xpos = (this.value*1); putundoq(\'linkedshape xpos\'); redraw(\'linkedShapeInstanceDetails\');">'+spinner()+'</td></tr>';
		content += '<tr><td class="leftcol">&nbsp;</td><td style="margin-top:0px; padding-top:0px; text-transform:none;">&#916; y </td><td style="margin-top:0px; padding-top:0px; padding-right:10px;"><input class="input" type="text" value="' + round(s.ypos, 3) + '" onchange="ss().ypos = (this.value*1); putundoq(\'linkedshape ypos\'); redraw(\'linkedShapeInstanceDetails\');">'+spinner()+'</td></tr>';
		}
		content += '<tr><td class="leftcol">&nbsp;</td><td> linked shape name </td><td>' + _GP.linkedshapes[s.link].shape.name + '</td></tr>';
		content += '<tr><td class="leftcol">&nbsp;</td><td colspan=2><button onclick="goToEditLinkedShape(\''+s.link+'\');">edit this linked shape</button></td></tr>';
		return content;
	}

	function goToEditLinkedShape(lsid){
		_UI.shownlinkedshape = lsid;
		_UI.navhere = 'linked shapes';
		navigate();
	}

	function clickSelectLinkedShape(x,y){
		//debug('CLICKSELECTLinkedShape() - checking x:' + x + ' y:' + y);

		if(_GP.linkedshapes[_UI.shownlinkedshape].shape.isHere(x,y)){
			_UI.selectedshape = _UI.shownlinkedshape;
			//debug('CLICKSELECTLinkedShape() - selecting shape ' + _UI.shownlinkedshape);

			_UI.navprimaryhere = 'npAttributes';
			return true;
		}

		_UI.selectedshape = -1;
		//debug('CLICKSELECTLinkedShape() - deselecting, setting to -1');

		return false;
	}


//	---------------------------
//	Linked Shape Paridy Functions
//	---------------------------
	LinkedShapeInstance.prototype.drawShape_Stack = function(lctx){
		//debug('DRAWLINKEDSHAPE on \n ' + JSON.stringify(this));
		if(this.uselinkedshapexy){
			//debug('------------- uselinkedshapexy=true, calling linkedshapes[this.link].shape.drawShape');
			_GP.linkedshapes[this.link].shape.drawShape_Stack(lctx);
		} else {
			//debug('------------- does not uselinkedshapexy, calling FORCE=true updatepathposition');
			//debug('------------- this.link: ' + this.link);
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.drawShape_Stack(lctx);
		}
	};

	LinkedShapeInstance.prototype.drawShape_Single = function(lctx){
		//debug('DRAWLINKEDSHAPE');
		if(this.uselinkedshapexy){
			//debug('------------- uselinkedshapexy=true, calling linkedshapes[this.link].shape.drawShape');
			_GP.linkedshapes[this.link].shape.drawShape_Single(lctx);
		} else {
			//debug('------------- does not uselinkedshapexy, calling FORCE=true updatepathposition');
			//debug('------------- this.link: ' + this.link);
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.drawShape_Single(lctx);
		}
	};

	LinkedShapeInstance.prototype.genPostScript = function(lastx, lasty){
		//debug('GENLINKEDPOSTSCRIPT');
		if(this.uselinkedshapexy){
			//debug('------------- uselinkedshapexy=true, calling linkedshapes[this.link].shape.drawShape');
			return _GP.linkedshapes[this.link].shape.path.genPathPostScript(lastx, lasty);
		} else {
			//debug('------------- does not uselinkedshapexy, calling FORCE=true updatepathposition');
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			return ns.path.genPathPostScript(lastx, lasty);
		}
	};

	LinkedShapeInstance.prototype.drawShapeToArea = function(lctx, view){
		//debug('DRAWLINKEDSHAPETOAREA - size/offsetx/offsety: ' + size +'/'+ offsetX +'/'+ offsetY);
		if(this.uselinkedshapexy){
			//debug('--------------------- uselinkedshapexy=true, calling drawShapeToArea for linkedshape.');
			_GP.linkedshapes[this.link].shape.drawShapeToArea(lctx, view);
		} else {
			//debug('--------------------- uselinkedshapexy=false, calling updatepathposition with FORCE.');
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.name += ' HAS BEEN MOVED';
			ns.drawShapeToArea(lctx, view);
		}
	};

	LinkedShapeInstance.prototype.drawSelectOutline = function(onlycenter){
		//_GP.linkedshapes[this.link].shape.drawSelectOutline();

		if(this.uselinkedshapexy){
			_GP.linkedshapes[this.link].shape.drawSelectOutline(onlycenter);
		} else {
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos);
			ns.drawSelectOutline(onlycenter);
		}
	};

	LinkedShapeInstance.prototype.draw8points = function(onlycenter){
		//_GP.linkedshapes[this.link].shape.draw8points(onlycenter);
	};

	LinkedShapeInstance.prototype.isHere = function(x,y){
		//debug('ISLINKEDSHAPEHERE - checking ' + x + ',' + y);
		if(this.uselinkedshapexy){
			return _GP.linkedshapes[this.link].shape.isHere(x,y);
		} else {
			var ns = clone(_GP.linkedshapes[this.link].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos);
			return ns.isHere(x,y);
		}
	};

	LinkedShapeInstance.prototype.isOverHandle = function(){ return false; };



//	------------------------------
//	Generic Linked Shape Functions
//	------------------------------

	function getFirstLinkedShapeID(){
		for(var lsid in _GP.linkedshapes){
			if(_GP.linkedshapes.hasOwnProperty(lsid)){
				return lsid;
			}
		}

		return '[ERROR] - LINKEDSHAPES array has zero keys';
	}

	function generateNewLinkedShapeID(){
		_GP.projectsettings.linkedshapecounter++;
		return ('id'+_GP.projectsettings.linkedshapecounter);
	}

// end of file