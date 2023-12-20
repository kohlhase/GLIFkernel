import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IEditorLanguageRegistry
} from '@jupyterlab/codemirror';


// import { sql } from '@codemirror/lang-sql';
import {GLIFCell} from 'codemirror-lang-glif';


/**
 * Initialization data for the jupyter_glif extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter_glif:plugin',
  description: 'A JupyterLab extension for GLIF (for now, just syntax highlighting)',
  autoStart: true,
  requires: [IEditorLanguageRegistry],
  activate: (app: JupyterFrontEnd, registry: IEditorLanguageRegistry) => {
    console.log('JupyterLab extension jupyter_glif is activated!');
        registry.addLanguage({
            name: 'glif',
            mime: 'text/glif',
            // support: sql()
            support: GLIFCell()
        });
    console.log('JupyterLab extension jupyter_glif is activated DONE!');
  }
};

export default plugin;
