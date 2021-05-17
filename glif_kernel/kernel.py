from ipykernel.kernelbase import Kernel
from glif import glif
from glif import parsing
import os

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
        self.glif = glif.Glif()

    def do_execute(self, code, silent, store_history=True, user_expressions=None, allow_stdin=False):
        if not silent:
            for i,r in enumerate(self.glif.executeCell(code)):
#                 if r.value:
#                     stream_content = {'name': 'stdout', 'text': f'{r.value}\n'}
#                 else:
#                     stream_content = {'name': 'stderr', 'text': str(r.logs)+'\n'}
#                 self.send_response(self.iopub_socket, 'stream', stream_content)
                if r.value:
                    s = str(r.value).replace("\n", "<br/>")
                    html = f'<span class="glif-stdout">{s}</span>'
                else:
                    html = f'<span class="glif-stderr">{str(r.logs)}</span>'

                if i > 0:
                    # separator
                    self.send_response(self.iopub_socket, 'display_data', {
                                'data': { 'text/html': '<hr class="glif-sep"/>' },
                                'metadata': {}, 'transient': {},
                            })

                self.send_response(self.iopub_socket, 'display_data', {
                            'data': { 'text/html': html },
                            'metadata': {}, 'transient': {},
                        })

        return {'status': 'ok',
                'execution_count': self.execution_count,   # incremented by base class
                'payload': [],
                'user_expressions': {},
               }

    def do_shutdown(self, restart):
        self.glif.do_shutdown()
        return {'status': 'ok', 'restart': restart}

