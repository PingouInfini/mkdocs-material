# Copyright (c) 2016-2025 Martin Donath <martin.donath@squidfunk.com>
# Updated by PingouInfini

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.

FROM python:3.11-alpine3.21 AS build

# Build-time flags
ARG WITH_PLUGINS=true

# Environment variables
ENV PACKAGES=/usr/local/lib/python3.11/site-packages
ENV PYTHONDONTWRITEBYTECODE=1

# Set build directory
WORKDIR /tmp

# Copy files necessary for build
COPY material material
COPY package.json package.json
COPY README.md README.md
COPY *requirements.txt ./
COPY pyproject.toml pyproject.toml

# Perform build and cleanup artifacts and caches
RUN \
  apk upgrade --update-cache -a \
&& \
  apk add --no-cache \
    cairo \
    freetype-dev \
    git \
    git-fast-import \
    jpeg-dev \
    openssh \
    tini \
    zlib-dev \
    # Libs for MkDocs PDF Export Plugin
    py3-pip \
    py3-pillow \
    py3-cffi \
    py3-brotli \
    gcc \
    g++ \
    musl-dev \
    python3-dev \
    pango \
    fontconfig \
    ttf-freefont \
    font-noto \
    terminus-font \
&& \
    fc-cache -f \
&& \
    fc-list | sort \
&& \
  apk add --no-cache --virtual .build \
    gcc \
    libffi-dev \
    musl-dev \
&& \
  pip install --no-cache-dir --upgrade pip \
&& \
  pip install --no-cache-dir . \
&& \
  if [ "${WITH_PLUGINS}" = "true" ]; then \
    pip install --no-cache-dir \
      mkdocs-material[recommended] \
      mkdocs-material[imaging]; \
  fi \
&& \
  if [ -e user-requirements.txt ]; then \
    pip install -U -r user-requirements.txt; \
  fi \
&& \
  apk del .build \
&& \
  for theme in mkdocs readthedocs; do \
    rm -rf ${PACKAGES}/mkdocs/themes/$theme; \
    ln -s \
      ${PACKAGES}/material/templates \
      ${PACKAGES}/mkdocs/themes/$theme; \
  done \
&& \
  rm -rf /tmp/* /root/.cache \
&& \
  find ${PACKAGES} \
    -type f \
    -path "*/__pycache__/*" \
    -exec rm -f {} \;

# Installer les dépendances pour Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    mesa-gl \
    udev \
    libc6-compat

# Définir l'emplacement du cache Puppeteer pour Chromium
ENV PUPPETEER_CACHE_DIR=/root/.cache/puppeteer

# Install 'mike' with pip
RUN pip install mike

# Install 'mkdocs-print-site-plugin' with pip
RUN pip install weasyprint
RUN weasyprint --info
RUN pip install mkdocs-print-site-plugin
RUN pip install htmlark[http,parsers]

# Install 'mkdocs-glightbox' with pip
RUN pip install mkdocs-glightbox

# Install 'mkdocs-video' with pip
RUN pip install mkdocs-video

# Install 'mkdocs-include-markdown-plugin' with pip
RUN pip install mkdocs-include-markdown-plugin

# Trust directory, required for git >= 2.35.2
RUN git config --global --add safe.directory /docs &&\
    git config --global --add safe.directory /site

# Configure git
RUN git config --global user.name "PingouInfini"
RUN git config --global user.email "pingouin@banquise.org"

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Copy builder-assistant and dependencies
COPY scripts/ /scripts
COPY scripts/lib/ /scripts/lib

# Set working directory
WORKDIR /scripts/lib
RUN npm install

# Set working directory
WORKDIR /docs
RUN git init

# Init mkdocs
COPY mkdocs.yml .
COPY .gitignore .
COPY content/ content

RUN chmod +x /scripts/builder-assistant.sh

# Publish 1st version
RUN sed -i 's/mkdocs-materials/mkdocs-materials v0.1/g' content/index.md
RUN git add .
RUN git commit -am "init commit"
RUN git tag -a 0.1 -m "0.1"
RUN mike deploy --update-aliases 0.1 latest

# Publish 2nd version
RUN sed -i 's/v0.1/v0.2/g' content/index.md
RUN git add .
RUN git commit -am "commit 2nd version"
RUN git tag -a 0.2 -m "0.2"
RUN mike deploy --update-aliases 0.2 latest

# Set default
RUN mike set-default latest

# Expose MkDocs and mike development server port
EXPOSE 8000
EXPOSE 8001

# Install supervisord
RUN apk add --no-cache supervisor

# Create a supervisord configuration file to manage 'mike' and 'mkdocs'
COPY supervisord/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set the default command to start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]