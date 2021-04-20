// requires loadAdvancedMode.js and loadGlifHighlighting.js
define([
        'base/js/namespace',
        'notebook/js/codecell',
        'codemirror/lib/codemirror'
], function (Jupyter, codecell, CodeMirror) {
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
    }
  }
});
