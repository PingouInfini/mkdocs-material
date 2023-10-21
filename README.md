# mkdocs-materials

## Actions

### Mise à jour
- Editer les fichiers `.md` du répertoire `content` *(défini dans le mkdocs.yml: docs_dir: 'content')*

- Rajouter des pages dans la partie `nav` du fichier `mkdocs.yml`

- Simplifier la maintenance en appelant la même page à 2 endroits différents en créant des similink

### Visualisation (version en cours)

- L'image docker `pingouinfinihub/mkdocs-material` permet de visualiser les pages en cours d'écriture dans le répertoire `/docs` du container sur le port 8000
  - **nota**: le répertoire et le port ayant probablement été bindés, à adapter selon la conf docker !

- Les modifications entrainent un rechargement automatique de la page.

### Publier une nouvelle version et définir une version par défaut

Nécessite d'executer les commandes au sein du container *(docker exec)*

Si vous souhaitez publier une nouvelle version de la documentation de votre projet, choisissez un identifiant de version et mettez à jour l'alias défini comme version par défaut avec *(ici, version 0.1, à adapter)*:

```
mike deploy --push --update-aliases 0.1 latest
```

Lorsque vous publiez une nouvelle version, mettez toujours à jour l'alias pour qu'il pointe vers la dernière version :

```
mike set-default --push latest
```

### Visualisation (versions livrées)

- L'image docker `pingouinfinihub/mkdocs-material` permet de visualiser les versions livrées, et deployé sur le git, sur le port 8001
  - **nota**: le port ayant probablement été bindé, à adapter selon la conf docker !

- 


## Autre

### Installation docker
https://squidfunk.github.io/mkdocs-material/getting-started/  

### docker-compose

**nota**: adapter le `<path>`
```
version: '3'

services:
  mkdocs:
    image: pingouinfinihub/mkdocs-material:latest
    container_name: mkdocs
    ports:
      - <port>:8000 # version en cours
      - <port>:8001 # versions livrées
    volumes:
      - <path>/docker/appdata/mkdocs:/docs
    restart: always
```

### Documentation
https://www.mkdocs.org/getting-started/

### Customisation theme material
https://squidfunk.github.io/mkdocs-material/setup/

### Themes
https://github.com/mkdocs/mkdocs/wiki/MkDocs-Themes
https://www.wheelodex.org/entry-points/mkdocs.themes/

### Plugins
https://github.com/mkdocs/catalog
