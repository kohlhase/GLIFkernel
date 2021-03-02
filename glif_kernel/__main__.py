from ipykernel.kernelapp import IPKernelApp
from glif_kernel import kernel

IPKernelApp.launch_instance(kernel_class=kernel.GlifKernel)
