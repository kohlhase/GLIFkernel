from ipykernel.kernelbase import Kernel
from glif import glif

class GlifKernel(Kernel):
    implementation = 'GLIF Kernel'
    implementation_version = '0.0.1'
    language = 'GLIF'
    language_version = '0.0.1'
    language_info = {
        'name': 'GLIF',
        'mimetype': 'text/plain',
        'file_extension': '.glif',  # ???
    }
    banner = "GLIF"

    def __init__(self, **kwargs):
        Kernel.__init__(self, **kwargs)
        self.glif = glif.Glif()

    def do_execute(self, code, silent, store_history=True, user_expressions=None, allow_stdin=False):
        r = self.glif.executeCommand(code.strip())
        if not silent:
            if r.value:
                stream_content = {'name': 'stdout', 'text': str(r.value)}
            else:
                stream_content = {'name': 'stdout', 'text': str(r.logs)}
            self.send_response(self.iopub_socket, 'stream', stream_content)

        return {'status': 'ok',
                'execution_count': self.execution_count,   # incremented by base class
                'payload': [],
                'user_expressions': {},
               }

    def do_shutdown(self, restart):
        self.glif.do_shutdown()
        return {'status': 'ok', 'restart': restart}

