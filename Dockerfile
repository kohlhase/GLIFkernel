FROM python:3.10

USER root

RUN echo "deb http://ftp.de.debian.org/debian bullseye main\n" >> /etc/apt/sources.list

RUN apt update && apt install libffi7

RUN wget https://github.com/GrammaticalFramework/gf-core/releases/download/3.11/gf-3.11-ubuntu-20.04.deb \
    && apt install ./gf-3.11-ubuntu-20.04.deb \
    && apt install graphviz -y \
    && apt install default-jre -y \
    && rm -rf /var/lib/apt/lists


RUN adduser worker

# install elpi
RUN apt update \
    && apt install -y opam sudo \
    && sudo -u worker opam init --disable-sandboxing --auto-setup \
    && sudo -u worker opam update \
    && sudo -u worker opam install --yes elpi \
    && rm -rf /home/worker/.opam/default/lib /home/worker/.opam/default/.opam-switch /home/worker/.opam/repo \
    && apt remove opam -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists

ENV PATH="/home/worker/.opam/default/bin:${PATH}"

# GF RGL
USER worker
WORKDIR /home/worker
RUN wget https://github.com/GrammaticalFramework/gf-rgl/releases/download/20201114/gf-rgl-20201114.zip \
    && unzip gf-rgl-20201114.zip
ENV GF_LIB_PATH="/home/worker/gf-rgl-20201114-test"

# SET UP MMT

WORKDIR /home/worker
RUN wget https://nc.kwarc.info/s/xneiiLxBYdMJHfq/download/mmt.jar \
    && echo "\n\n" | java -jar mmt.jar :setup \
    && rm mmt.jar \
    && java -jar MMT/systems/MMT/deploy/mmt.jar lmh install \
    && mkdir /home/worker/MMT/content/COMMA
ENV MMT_PATH="/home/worker/MMT/systems/MMT"
WORKDIR /home/worker/MMT/content/COMMA
RUN git clone https://gl.mathhub.info/COMMA/glforthel.git && git clone https://gl.mathhub.info/COMMA/GLF.git

RUN python3 -m pip install git+https://github.com/jfschaefer/glifcore
RUN python3 -m pip install git+https://github.com/jfschaefer/glifkernel
RUN python3 -m glif_kernel.install


WORKDIR /home/worker
RUN git clone --depth=1 https://github.com/jfschaefer/glifkernel
WORKDIR /home/worker/glifkernel
USER root
RUN apt update && apt install -y npm && cd codemirror-lang-glif && npm install --save && cd ../jupyterlab_glif_extension && python3 -m pip install -e . && jupyter labextension develop --overwrite . && npm cache clean && apt remove npm && rm -rf /var/lib/apt/lists
USER worker
WORKDIR /home/worker/glifkernel/notebooks


CMD ["python3", "-m", "notebook", "--no-browser", "--ip=0.0.0.0", "--port=8888"]

