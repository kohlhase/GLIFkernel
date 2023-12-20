from setuptools import setup

setup(
    name='glif_kernel',
    version='0.0.1',    
    description='GLIF kernel',
    url='https://github.com/jfschaefer/GLIFkernel',
    author='Jan Frederik Schaefer',
    packages=['glif_kernel'],
    # license='BSD 2-clause',  # TODO: License (also in classifiers)
    install_requires=[   # TODO: determine minimum versions
        'setuptools',
        'ipykernel',
        'ipython',
        'ipywidgets',
        'jupyter-client'   # TODO: glifcore
    ],
    classifiers=[       # https://pypi.org/pypi?%3Aaction=list_classifiers
        'Development Status :: 1 - Planning',
        'Programming Language :: Python :: 3',
    ],
    include_package_data = True,
)
