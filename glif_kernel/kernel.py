# from ipykernel.kernelbase import Kernel
# it seems easier to use IPythonKernel if we want to use widgets... - TODO: find a more stable solution
from ipykernel.ipkernel import IPythonKernel as Kernel
from ipywidgets import widgets
from IPython.display import display
from glif import Glif
from glif import utils
from glif.commands import Repr
import html
import os

def H(string):
    ''' escapes html chars and replaces '\n' by '<br/>' '''
    return html.escape(str(string)).replace('\n', '<br/>')


class GlifKernel(Kernel):
    implementation = 'GLIF Kernel'
    implementation_version = '0.0.1'
    language = 'glif'
    language_version = '0.0.1'
    language_info = {
        'name': 'GLIF',
        'mimetype': 'text/glif',
        'file_extension': '.glif',  # ???
    }
    banner = "GLIF"

    def __init__(self, **kwargs):
        Kernel.__init__(self, **kwargs)
        self.glif = Glif()
        self.unicode_latex_map = None   # for tab completion, will be loaded on demand
        self.myexecutioncount = 0   # IPythonKernel does it's own thing and overrides the kernelbase.Kernel.execution_count

    def do_execute(self, code, silent, store_history=True, user_expressions=None, allow_stdin=False):
        if not silent:
            for i,r in enumerate(self.glif.executeCell(code)):
                if i > 0:
                    # separator
                    self.html_response('<hr class="glif-sep"/>')
                if r.value:
                    self.handle_items(r.value)
                else:
                    self.html_response(f'<span class="glif-stderr">{H(r.logs)}</span>')

        self.myexecutioncount += 1
        return {'status': 'ok',
                'execution_count': self.myexecutioncount,
                'payload': [],
                'user_expressions': {},
               }

    def html_response(self, html):
        self.send_response(self.iopub_socket, 'display_data', {
                    'data': { 'text/html': html },
                    'metadata': {}, 'transient': {},
                })

    def handle_items(self, items):
        # check current representation
        curRepr = None
        if items.items:
            curRepr = items.items[0].currentRepr
        if not all(i.currentRepr == curRepr for i in items.items):
            self.html_response(f'<span class="glif-stderr">Internal error: Inconsistent output representations</span>')
        if curRepr in {Repr.GRAPH_DOT, Repr.GRAPH_SVG}:
            self.show_graphs(items)
        else:
            self.html_response(f'<span class="glif-stdout">{H(items)}</span>')

    def show_graphs(self, items):
        assert items.items
        label2item = {}
        origidcount = {}
        labels = []
        for i in items.items:
            if not i.original_id in origidcount:
                origidcount[i.original_id] = 0

            ast = i.content[Repr.AST] if Repr.AST in i.content else '[no AST]'
            label = f'{i.original_id}.{origidcount[i.original_id]}. {ast}'
            label2item[label] = i
            labels.append(label)
            origidcount[i.original_id] += 1

        dropdown = widgets.Dropdown(
            layout      = {'width' : 'max-content'},
            options     = labels,
            value       = labels[0],
            description = '',
            disabled    = False,
        )

        image = widgets.Image(format='svg+xml')

        def show_graph(label):
            item = label2item[label]
            if not Repr.GRAPH_SVG in item.content:
                r = utils.dot2svg(item.content[Repr.GRAPH_DOT].encode())
                if r.success:
                    item.content[Repr.GRAPH_SVG] = r.value
                else:
                    self.html_response(f'<span class="glif-stderr">Failed to produce graph:<br/>{H(r.logs)}</span>')
                    return
            image.value = item.content[Repr.GRAPH_SVG]

        show_graph(labels[0])
        dropdown.observe(lambda bunch : show_graph(bunch['new']), names='value')
        display(dropdown, image)

    def do_complete(self, code, cursor_pos):
        if self.unicode_latex_map is None:
            self.unicode_latex_map = {}
            with open(os.path.join(os.path.dirname(__file__), 'unicode-latex-map'), 'r', encoding='utf-8') as fp:
                for line in fp:
                    line = line.strip()
                    if line.startswith('//'):   # comment
                        continue
                    e = line.split('|')
                    if len(e) != 2 or e[0][0] != 'j':
                        print(f'Failed to understand the following entry in unicode-latex-map: {line}')
                    self.unicode_latex_map[e[0][1:]] = e[1]


        # find preceding backslash for character completion
        c = cursor_pos - 1
        while c >= 0 and code[c].isalnum():
            c -= 1
        if c >= 0 and code[c] == '\\' and code[c+1:cursor_pos] in self.unicode_latex_map:
            return {'matches'      : [self.unicode_latex_map[code[c+1 : cursor_pos]]],
                    'cursor_end'   : cursor_pos,
                    'cursor_start' : c,
                    'metadata'     : {},
                    'status'       : 'ok'}


    def do_shutdown(self, restart):
        self.glif.do_shutdown()
        return {'status': 'ok', 'restart': restart}

