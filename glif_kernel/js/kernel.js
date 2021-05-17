// requires loadAdvancedMode.js and loadGlifHighlighting.js
define([
        'base/js/namespace',
        'notebook/js/codecell',
        'codemirror/lib/codemirror',
        'require'
], function (Jupyter, codecell, CodeMirror, require) {
  return {
    onload: function() {
      "use strict";
      loadAdvancedMode(CodeMirror);
      loadGlifHighlighting(CodeMirror);

      CodeMirror.defineMIME("text/glif", "glif");
      var cells = Jupyter.notebook.get_cells().forEach(function (cell) {
        if (cell instanceof codecell.CodeCell) {
          cell.auto_highlight();
        }
      });

      // load glif.css
      var element = document.createElement("link");
      element.type = "text/css";
      element.rel = "stylesheet";
      element.href = require.toUrl("./glif.css");
      document.getElementsByTagName("head")[0].appendChild(element);
    }
  }
});
