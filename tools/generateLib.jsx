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

    //list all files and get content
    var expressions = [];

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
            var expression = {};
            expression.name = file.name.substring(0, file.name.length - 3);
            file.open('r');
            var fileContent = file.read();
            var match = fileContent.match(reDoc);
            expression.doc = match[1];
            expression.expressionWithDoc = match[2];
            expression.original = fileContent;
            expression.expression = match[2].replace( reRemoveDoc , '').replace(reRemoveComment, '').replace( reRemoveSpaces, '');//.replace( reRemoveEmpty, '');
            file.close();
            expressions.push(expression);
        }
    }

    getExpresssions(expressionFolder);   
    
    //create content
    var jsContent = '';
    var jsFUllContent = '';
    var jsxincContent = [
        'if (typeof DuAEF === "undefined") DuAEF = {};',
        'if (typeof DuAEF.DuExpression === "undefined") DuAEF.DuExpression = {};',
        '/**',
        '* Expression Library',
        '* @namespace',
        '* @memberof DuAEF.DuExpression',
        '*/',
        'DuAEF.DuExpression.Library = {};',
        '',
        ''
        ].join('\n');
    for (var i = 0, num = expressions.length; i < num; i++)
    {
        var exp = expressions[i];
        jsxincContent += exp.doc + '\n';
        jsxincContent += 'DuAEF.DuExpression.Library.' + exp.name + " = " + scriptifyExpression(exp.expression) + '\n\n';
        jsFullContent += exp.original + '\n\n';
        jsContent += exp.expression + '\n';
    }

    //write
    var jsxinc = new File(repoFolder.absoluteURI + "/build/DuExpression_scripting.jsxinc");
    var js = new File(repoFolder.absoluteURI + "/build/DuExpression.js");
    var jsFull = new File(repoFolder.absoluteURI + "/build/DuExpression_full.js");
    var text = new File(repoFolder.absoluteURI + "/build/DuExpression_sourceText.js");
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