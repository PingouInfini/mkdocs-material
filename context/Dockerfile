# Use the base image
FROM squidfunk/mkdocs-material:latest

# Install pip
#RUN apk add --no-cache py3-pip git

# Install 'mkdocs-materiel' and plugins with pip
RUN pip install mkdocs-material

# Install 'mike' with pip
RUN pip install mike

# Configure git
RUN git config --global user.name "PingouInfini"
RUN git config --global user.email "pingouin@banquise.org"

# Init directory
WORKDIR /docs
RUN git init

# Init mkdocs
#RUN mkdocs new .
COPY dockerdist/mkdocs/mkdocs.yml .
COPY dockerdist/mkdocs/content/ content

# Publish 1st version
RUN git add .
RUN git commit -am "init commit"
RUN mike deploy --update-aliases 0.1 latest

# Publish 2nd version
RUN echo "Ajout de texte pour v0.2" >> content/index.md
RUN git add .
RUN git commit -am "commit 2nd version"
RUN mike deploy --update-aliases 0.2 latest

# Set default
RUN mike set-default latest

# Install supervisord
RUN apk add --no-cache supervisor

# Create a supervisord configuration file to manage 'mike' and 'mkdocs'
COPY dockerdist/supervisord/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set the default command to start supervisord
#CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

#ENTRYPOINT ["tail", "-f", "/dev/null"]
ENTRYPOINT ["mkdocs"]
CMD ["serve", "--dev-addr=0.0.0.0:8000"]

