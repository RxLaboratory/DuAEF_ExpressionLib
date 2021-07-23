(function(){

    var thisScriptFile = new File($.fileName);
    var repoFolder = thisScriptFile.parent.parent;
    var expressionFolder = new Folder(repoFolder.absoluteURI + '/src');

    //A regex to separate documentation from actual js code
    var reDoc = /(\/\*\*(?:\s|\S)*?\*\/)([\s\S]*)/m;
    var reRemoveDoc = /\/\*\*(?:\s|\S)*?\*\//gm;
    var reRemoveComment = /\/\/.*$/gm;
    var reRemoveSpaces = /^[\r\n\s]*|[\r\n\s]*$/gm;
    var reRemoveEmpty = /[\r\n]*/gm;
    var reRequirements = /\s*\s*@requires\s*(\w+)/gm;
    var reRequirement = /\s*\s*@requires\s*(\w+)/;

    function scriptifyExpression( exp, min ) {

        if (typeof min === 'undefined') min = true;

        function line(str, min)
        {
            var l = str.replace( "\r", "" ).replace(/'/g , "\\'");
            return l;
        }

        var expArray = exp.split( '\n' );
        var expString;
        if (min) expString = "'" + line( expArray[0] );
        else expString = "['" + line( expArray[0] ) + "'";

        for ( var i = 1; i < expArray.length; i++ ) {
            var l = line( expArray[i] );
            if (l != '' && !min) expString += ",\n\t'" + line( expArray[i] ) + "'";
            else if (min) expString += line( expArray[i] );
        }
        if (min) expString += "'";
        else expString += "\n\t].join('\\n');";

        return expString;
    }

    //create content
    var jsContent = '';
    var jsFUllContent = '';
    // get jsxinc header
    var jxincHeaderFile = new File(expressionFolder.absoluteURI + "/" + "DuExpression_scripting_header.jsxinc" );
    jxincHeaderFile.open('r');
    var jsxincContent = jxincHeaderFile.read() + '\n';
    jxincHeaderFile.close();

    function filter( f ) {
        if (f instanceof Folder) return true;
        var name = f.name.split('.');
        var ext = name[name.length-1];
        if (ext == "js") return true;
    }

    function getExpresssions( folder )
    {
        var expressionFiles = folder.getFiles(filter);
        for (var i = 0, num = expressionFiles.length; i < num; i++)
        {
            var file = expressionFiles[i];
            if (file instanceof Folder)
            {
                getExpresssions( file );
                continue;
            }
            file.encoding = 'UTF-8';
            var name = file.name.substring(0, file.name.length - 3);
            file.open('r');
            var fileContent = file.read();
            var match = fileContent.match(reDoc);
            var doc = match[1];
            var expressionWithDoc = match[2];
            var original = fileContent;
            var expression = match[2].replace( reRemoveDoc , '').replace(reRemoveComment, '').replace( reRemoveSpaces, '');//.replace( reRemoveEmpty, '');

            jsxincContent += doc + '\n';
            jsxincContent += 'DuAEExpression.Library["' + name + '"] = {};\n';
            jsxincContent += 'DuAEExpression.Library["' + name + '"].expression = ' + scriptifyExpression(expression, false) + '\n';
            var reqs = doc.match(reRequirements);
            jsxincContent += 'DuAEExpression.Library["' + name + '"].requirements = [';
            if(reqs) {  
                for (var r = 0, rN = reqs.length; r < rN; r++)
                {
                    var req = reRequirement.exec(reqs[r]);
                    if (!req) continue;
                    if (r!=0) jsxincContent += ',';
                    jsxincContent += '"' + req[1] + '"';
                }
            }
            jsxincContent += '];\n\n';

            jsFullContent += original + '\n\n';

            jsContent += expression + '\n';

            file.close();
        }
    }

    getExpresssions(expressionFolder);   
    
    //write
    var jsxinc = new File(repoFolder.absoluteURI + "/build/DuExpression_scripting.jsxinc");
    var js = new File(repoFolder.absoluteURI + "/build/DuExpression.js");
    var jsFull = new File(repoFolder.absoluteURI + "/build/DuExpression_full.js");
    var text = new File(repoFolder.absoluteURI + "/build/DuExpression_sourceText.js");

    jsxinc.encoding = 'UTF-8';
    js.encoding = 'UTF-8';
    jsFull.encoding = 'UTF-8';
    text.encoding = 'UTF-8';
    
    if (jsxinc.open('w'))
    {
        jsxinc.write(jsxincContent);
        jsxinc.close();
    }
    else alert('Whoops!\n' + jsxinc.fsName + '\ncould not be written.');

    if (js.open('w'))
    {
        js.write(jsContent);
        js.close();
    }
    else alert('Whoops!\n' + js.fsName + '\ncould not be written.');

    if (jsFull.open('w'))
    {
        jsFull.write(jsFullContent);
        jsFull.close();
    }
    else alert('Whoops!\n' + jsFull.fsName + '\ncould not be written.');

    if (text.open('w'))
    {
        text.write(scriptifyExpression(jsContent));
        text.close();
    }
    else alert('Whoops!\n' + text.fsName + '\ncould not be written.');
})();