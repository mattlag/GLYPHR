// start of file

	function loadPage_firstrun(){
		// debug("LOADING PAGE >> loadPage_firstrun");

		var ct = "<table class='firstruntable'><tr>"+
		"<td class='firstruntableleft' vertical-align='middle'><div id='splashscreenlogo'></div>"+
			"<div class='splashver'>"+_UI.thisGlyphrStudioVersion+"<br><br>"+
			"For more informaiton visit <a href='http://www.glyphrstudio.com' target=_new>www.glyphrstudio.com</a><br>"+
			"Glyphr Studio is licensed under a <a href='https://www.gnu.org/licenses/gpl.html' target='_new'>GNU General Public License</a>.<br>" +
			"Which is a free / open source 'copyleft' license. You are free to use, distribute, and modify Glyphr Studio as long as " +
			"this license and its freeness stays intact.</td>"+
		"<td class='firstruntableright' vertical-align='middle'>" + importOrCreateNew() + "</td>"+
		"</tr></table>";

		var mp = getEditDocument().getElementById("mainwrapper");
		mp.innerHTML = ct;
		mp.style.marginLeft = "0px";
		getEditDocument().getElementById("droptarget").addEventListener('dragover', handleDragOver, false);
		getEditDocument().getElementById("droptarget").addEventListener('drop', handleDrop, false);

		document.getElementById('splashscreenlogo').innerHTML = makeGlyphrStudioLogo({'fill':'white', 'width':400});
	}

	function importOrCreateNew(){

		var con = "<div class='newtile'>"+
					"<h3>drag and drop to load a file</h3>"+
					"<div id='droptarget'>Glyphr Project File (.txt)<br>SVG Font File (.svg)</div>"+
				"</div>";
		con += "<div class='newtile'>"+
					"<h3>Start a new Glyphr Project</h3>"+
					"Project name: &nbsp; <input id='newprojectname' type='text' value='My Font'/><br>"+
					"<button onclick='newGlyphrProject(); navigate();' class='buttonsel'>Start a new font from scratch</button>"+
				"</div>";
		// con += "<div class='newtile'>"+
		// 			"<h3>Import SVG Font</h3>"+
		// 			"<button onclick='ioSVG_importSVGfont(_UI.samplesvgfont);' class='buttonsel'>Import SVG Font</button>"+
		// 		"</div>";

		return con;
	}

	function handleDrop(evt) {
		document.getElementById("droptarget").innerHTML = "Loading File...";

		evt.stopPropagation();
		evt.preventDefault();

		var f = evt.dataTransfer.files[0]; // FileList object only first file
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function() {
			return function(e) {
				debug('\n reader.onload - START');
				debug('\t filename: ' + f.name);
				var fname = f.name.split('.');
				fname = fname[fname.length-1].toLowerCase();
				var con;

				if(fname === 'svg') {
					ioSVG_importSVGfont(reader.result);
				} else if(fname === 'txt') {
					importGlyphrProjectFromText(reader.result);
					navigate();
				} else {
					con = '<h1>oops</h1>Could not read file type with suffix ' + fname;
					con += '<br><button onclick="document.getElementById(\'droptarget\').innerHTML = \'Try loading another file\'; closeDialog();">Close</button>';
					openDialog(con);
				}

				debug(' reader.onload - END\n');
			};
		})(f);

		reader.readAsText(f);

	}

	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}


//	-------------------------------
//	IMPORT FUNCTIONS
//	-------------------------------

	function importGlyphrProjectFromText(textcontent){
		// debug("IMPORTGLYPHRPROJECTFROMTEXT");

		var fcontent = JSON.parse(textcontent);
		var vn = fcontent.projectsettings.versionnum;
		var v = fcontent.projectsettings.version;

		// debug(fcontent);

		if(v){
			/*
				UPGRADE DROPPED FILE FROM 0.3 to 0.4
			*/
			if(!vn){
				// debug("\t no versionnum fcontent before migrate:");
				// debug(fcontent);
				fcontent = migrateFromBetaThreeToFour(fcontent);
				vn = '0.4.0';
				// debug("\t no versionnum fcontent after migrate:");
			}

			/*
				CHECK VERSION
			*/
			vn = vn.split(".");
			// debug("\t versionnum found " + vn);

			/* Major Version 0 */
			if(vn[0]*1 === 0){
				// debug("\t Major Version = 0");
				if(vn[1]*1 < 5){
					// debug("\t Minor Version < 5");
					/* Minor Version 0.4 or earlier */
					hydrateGlyphrProject(fcontent);
					// debug("\t _GP after hydrate:");
					// debug(_GP);
				} else {
					/* Minor Version greater than 0.4 */
					document.getElementById("droptarget").innerHTML = "drop file here...";
					alert("Your Glyphr Project was created with a later version of Glyphr Studio.  This version of Glyphr Studio cannot open project files created in the future.  Please go to glyphrstudio.com to get the latest release.");
				}
			} else {
				/* Major Version greater than 0 */
				document.getElementById("droptarget").innerHTML = "drop file here...";
				alert("Your Glyphr Project was created with a later version of Glyphr Studio.  This version of Glyphr Studio cannot open project files created in the future.  Please go to glyphrstudio.com to get the latest release.");
			}

		} else {
			/* No version found */
			document.getElementById("droptarget").innerHTML = "drop file here...";
			alert("File does not appear to be a Glyphr Project.  No version information was found.  Please try a different file...");
		}
	}


	function migrateFromBetaThreeToFour(fc){

		newfc = new GlyphrProject();

		var tls;
		for(var l in fc.linkedshapes){
			if(fc.linkedshapes.hasOwnProperty(l)){
				tls = fc.linkedshapes[l];
				//debug("migrateFromBetaThreeToFour - usedin before " + tls.usedin);
				if(tls.usedin){
					for(var u=0; u<tls.usedin.length; u++){
						tls.usedin[u] = decToHex(tls.usedin[u]);
					}
					//debug("migrateFromBetaThreeToFour - usedin after " + tls.usedin);
				}
			}
		}
		newfc.linkedshapes = fc.linkedshapes;

		for(var e in fc.projectsettings){
			if(newfc.projectsettings.hasOwnProperty(e)){
				newfc.projectsettings[e] = fc.projectsettings[e];
			}
		}

		var tc, hex;
		for(var i=0; i<fc.fontchars.length; i++){
			tc = fc.fontchars[i];
			//debug("migrateFromBetaThreeToFour - fontchars " + i + " is " + tc);
			if(tc){
				hex = "0x00"+tc.cmapcode.substr(2).toUpperCase();
				newfc.fontchars[hex] = tc;
				newfc.fontchars[hex].charhtml = hexToHTML(hex);
				//debug("migrateFromBetaThreeToFour - newfc.fontchars[" + hex + "] is " + json(newfc.fontchars[hex]));
			}
		}

		return newfc;
	}

	function hydrateGlyphrProject(data) {
		// debug("\n hydrateGlyphrProject - START");
		// debug("\t passed: ");
		// debug(data);

		_GP = new GlyphrProject();
		// var oggp = new GlyphrProject();

		// Project Settings
		// merge settings to conform to current .projectsettings
		// but not guides, because they can be custom
		var dataguides = clone(data.projectsettings.guides);
		if(data.projectsettings) _GP.projectsettings = merge(_GP.projectsettings, data.projectsettings);

		// debug('\t merged projectsettings');
		// debug(_GP.projectsettings);

		// Guides
		// Import all gudes
		for (var g in dataguides) {
			if(dataguides.hasOwnProperty(g)){
				_GP.projectsettings.guides[g] = new Guide(dataguides[g]);
			}
		}

		// debug('\t hydrated guides');
		// debug(_GP.projectsettings.guides);
		
		// Metadata
		if(data.metadata) _GP.metadata = merge(_GP.metadata, data.metadata);

		// Ligatures
		for (var lig in data.ligatures) {
			if(data.ligatures.hasOwnProperty(lig)){
				_GP.ligatures[lig] = new Char(data.ligatures[lig]);
			}
		}

		// Kerning
		for (var pair in data.kerning){
			if(data.kerning.hasOwnProperty(pair)){
				_GP.kerning[pair] = new HKern(data.kerning[pair]);
			}
		}

		// Linked Shapes
		for (var lsid in data.linkedshapes) {
			if(data.linkedshapes.hasOwnProperty(lsid)){
				_GP.linkedshapes[lsid] = new LinkedShape(data.linkedshapes[lsid]);
			}
		}

		// Characters
		for (var ch in data.fontchars) {
			if(data.fontchars.hasOwnProperty(ch)){
				_GP.fontchars[ch] = new Char(data.fontchars[ch]);
			}
		}

		// debug('\t hydrated: ');
		// debug(_GP);
		// debug("hydrateGlyphrProject - END\n");

		finalizeGlyphrProject();
		//navigate();
	}

	// Takes a template object of expected keys and default values
	// and an object to import, and overwites template values if
	// they exist in the imported object
	function merge(template, importing) {
		for(var a in template){
			if(template.hasOwnProperty(a)){
				if(typeof template[a] === 'object'){
					if(importing.hasOwnProperty(a)) template[a] = merge(template[a], importing[a]);
				} else {
					if(importing.hasOwnProperty(a)) template[a] = importing[a];
				}
			}
		}

		return template;
	}

	function newGlyphrProject(){
		var fn;
		if(document.getElementById('newprojectname') && document.getElementById('newprojectname').value){
			fn = document.getElementById('newprojectname').value;
		} else {
			fn = 'My Font';
		}

		_GP = new GlyphrProject();

		_GP.projectsettings.name = fn;
		_GP.metadata.font_family = fn;

		_GP.projectsettings.version =  _UI.thisGlyphrStudioVersion;
		_GP.projectsettings.versionnum =  _UI.thisGlyphrStudioVersionNum;

		getChar('0x0020', true).isautowide = false;
		getChar('0x0020', true).charwidth = _GP.projectsettings.upm/2;
		getChar('0x0041', true);

		finalizeGlyphrProject();
		//navigate();
	}


	function finalizeGlyphrProject(){
		// debug("\nfinalizeGlyphrProject \t START");

		// UI Defaults
		_UI.history['character edit'] = new History('fontchars');
		_UI.history['linked shapes'] = new History('linkedshapes');
		_UI.history.ligatures = new History('ligatures');
		_UI.history.kerning = new History('kerning');

		_UI.guides.leftgroup_xmax = new Guide(_UI.guides.leftgroup_xmax);
		_UI.guides.rightgroup_xmin = new Guide(_UI.guides.rightgroup_xmin);

		_UI.selectedchar = getFirstCharID();
		_UI.selectedlinkedshape = getFirstID(_GP.linkedshapes);
		_UI.selectedkern = getFirstID(_GP.kerning);

		resetThumbView();

		_UI.navhere = "character edit";


		// debug("finalizeGlyphrProject \t END\n");
	}

// end of file