# The Duduf After Effects Framework Expression Library

This folder contains useful and re-usable expression snippets and functions, which can be used as-is or in scripts.

## How to use

Each snippet/function is stored in its own file, and all are documented in the source code, using jsdoc syntax. The comprehensive documentation of these expressions is also available at [duaef-expressions.rainboxlab.org](http://duaef-expressions.rainboxlab.org)

### In your expressions

You can just copy and paste the file content in your own expression. If you wish, you can skip the documentation part (between `/**` and `*/`) and keep only the actual code under it.

### To generate expressions via scripting

You could "stringify" these expressions, but a useful file containing them is already automatically generated to include them easily in your scripts. More info about this here soon?.

## Contribution guidelines

Your contributions are welcomed and you can improve the existing expressions or add your own. Just follow these guidelines, to make the automatic generation of the library and the inclusion in the framework easier.

- The file name is a short name, without any space or special character, using camelCase.
- The expression **has to be documented**, using jsdoc, at the beginning of the file. See the existing files if you don't know how to do this.
- **Do not use single quotes `'` at all** in the file.