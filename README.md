# The Duduf After Effects Framework Expression Library

This repository contains useful and re-usable expression snippets and functions, which can be used as-is or in scripts.

## How to use the library

**Each file in the root folder is a class or a function which can be used in expressions**, and all are documented in the source code, using jsdoc syntax. The comprehensive documentation of these expressions is also available at [duaef-expressions.rainboxlab.org](http://duaef-expressions.rainboxlab.org)

Some functions depends on other ones. This is advertised with the `@requires` tag in the documentation header in each file.

### In your expressions

There are several ways to use this library in your expressions.

If you only need a specfic function, you can just copy it from the corresponding file into your expression. But be careful to also copy its dependencies (if any) which are listed with the `@requires` tag in the documentation header of the file.

An easier way to use the library is to include all of it in your expressions. Don't worry, it will not be heavy. Including a bunch of functions is not a problem in terms of performance, it's when actually using them that you may have to be careful. This way, you won't have to worry about dependencies.

There are two ways to include the whole library in your expressions:

- **Copy the content of [build/DuExpression.js](https://github.com/Rainbox-dev/DuAEF_ExpressionLib/blob/master/build/DuExpressio.js) at the beginning of your expression**.  
This is the easy way, but it is going to take a lot of place at the beginning of the expression and may be a bit scary.  
You'll also need to copy it in all the expressions where you need to use the library.

- **Or you can copy the contents of [build/DuExpression_sourceText.js](https://github.com/Rainbox-dev/DuAEF_ExpressionLib/blob/master/build/DuExpressionn_sourceText.js) in the expression of the sourceText property of a Text Layer and eval this text in your expressions**.  
  1. Add a Text Layer in the composition, rename it to "ExpressionLib" for example.
  2. Copy the content of [build/DuExpression_sourceText.js](https://github.com/Rainbox-dev/DuAEF_ExpressionLib/blob/master/build/DuExpressionn_sourceText.js) in the expression of the sourceText property.
  3. In the beginning of your expression, add this line: `eval(thisComp.layer("ExpressionLib").text.sourceText);`.

The library is now available in your expression. With the second method it is not directly included in it and it is easier to use it in several expressions at once.  
You can also copy and paste the "ExpressionLib" text layer in other compositions.

### To generate expressions via scripting

If you're using [DuAEF](https://github.com/Rainbox-dev/DuAEF), each function is available in the `DuAEF.DuExpression.Library` namespace; each object is the string representation of the corresponding expression. They're all listed and documented in the [DuAEF Reference](http://duaef-reference.rainboxlab.org).

If you're not using the complete DuAEF, just include the [`build/DuExpression_scripting.jsxinc` file](https://github.com/Rainbox-dev/DuAEF_ExpressionLib/blob/master/build/DuExpression_scripting.jsxinc) in your script with `#include DuExpression_scripting.jsxinc` to make the `DuAEF.DuExpression.Library` namespace available. Then, each object in the namespace correponds to the string representation of each expression.

Example:

    var myExpression = DuAEF.Expressions.Library.checkEffect;
    myExpression += '\ncheckEffect( thisLayer.effect(1), 1, "Blur" );

> Note that due to the [licence of DuAEF](https://github.com/Rainbox-dev/DuAEF/blob/master/LICENSE.md), if you use DuAEF in your own script, your script has to be free and open source, released under a license compatible with the [GNU General Public Licence](https://github.com/Rainbox-dev/DuAEF/blob/master/LICENSE.md). **This is mandatory**.  
But we tolerate the use of this expression library in any script or expression, as long as you don't include the full DuAEF framework (the library itself is licensed under the LGPLv3 license).

## Contribution guidelines

Your contributions are welcomed and you can improve the existing expressions or add your own. Just follow these guidelines, to make the automatic generation of the library and the inclusion in the framework easier.

- The file name is a short name, without any space or special character, using camelCase.
- The expression **has to be documented**, using jsdoc, at the beginning of the file. See the existing files if you don't know how to do this.
- Each file contains one function **and just one function** or one class **and just one class**.
- If a function `Foo` uses another class or function `Bar`, the two have to be stored in separate files. **Use the @requires parameter** in the doc of the function `Foo` to point to class or function `Bar`.
