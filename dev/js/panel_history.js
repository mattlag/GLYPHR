// start of file

//-------------------
// History Panel
//-------------------
	function makePanel_History(){

		var content = "<div class='navarea_header'>";

		if(!_UI.popout) {
			content += "<h1 class='panelsupertitle'>"+_UI.navhere.toUpperCase();
			content += "<span class='supertitleseperator'>&#x276F;&#x276F;</span>";
			content += getSelectedChar().charhtml;
			content += "</h1>";
		}

		content += "<h1 class='paneltitle'>edit history</h1>";

		var q = _UI.charundoq;

		if(_UI.navhere === 'linked shapes'){
			content = "<h1 class='paneltitle'>linked shapes history</h1>";
			q = _UI.linkedshapeundoq;
		}

		content += "</div><div class='navarea_section'>";

		//debug("MAKEPANEL_HISTORY - rolling out queue\n" + json(q));

		content += "<button style='width:100px;' class='"+(q.length>0? "buttonsel": "buttondis")+"' onclick='pullundoq();clickTool(\"pathedit\");'>undo" + ((q.length > 0) ? (" (" + q.length + ")") : "") + "</button><br>";
		content += "<table class='detail'>";

		var te, currchar;
		for(var e=q.length-1; e>=0; e--){
			te = q[e];

			if(te.char !== currchar){
				content += "<tr><td colspan=3 ><div class='history_char'>"+getCharName(te.char)+"</div></td></tr>";
				currchar = te.char;
			}

			content += "<tr>"+
				"<td class='leftcol'>&nbsp;</td>"+
				"<td class='history_action'>"+te.name+"</td>"+
				"<td class='history_date'>"+new Date(te.date).toLocaleString()+"</td>"+
				"</tr>";
		}

		content += "</table>";
		content += "</div>";

		return content;
	}

// end of file