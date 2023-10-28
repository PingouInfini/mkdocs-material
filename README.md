# mkdocs-materials

## Index

- [Index](#index)
- [Actions](#actions)
  - [Actualisation de la documentation](#actualisation-de-la-documentation)
  - [Visualisation (version en cours)](#visualisation-version-en-cours)
  - [Publier une nouvelle version](#publier-une-nouvelle-version)
  - [Builder une version html pour diffusion](#builder-une-version-html-pour-diffusion)
  - [Visualisation (released versions)](#visualisation-released-versions)
- [Autre](#autre)
  - [Installation docker](#installation-docker)
  - [Docker-compose](#docker-compose)
  - [Documentation](#documentation)
  - [Customisation theme material](#customisation-theme-material)
  - [Themes](#themes)
  - [Plugins](#plugins)


## Actions

### Actualisation de la documentation
- Editer les fichiers `.md` du répertoire `content` *(défini dans le mkdocs.yml: docs_dir: 'content')*

- Rajouter des pages dans la partie `nav` du fichier `mkdocs.yml`

- Simplifier la maintenance en appelant la même page à 2 endroits différents en créant des similink

### Visualisation (version en cours)

- L'image docker `pingouinfinihub/mkdocs-material` permet de visualiser les pages en cours d'écriture dans le répertoire
`/docs` du container via le port `8000`
  > **Note**: le répertoire et le port ayant probablement été bindés, à adapter selon la conf docker !

- Les modifications entrainent un rechargement automatique de la page.

### Publier une nouvelle version

  > **Note:** Nécessite d'executer les commandes au sein du container *(docker exec)*

Si vous souhaitez publier une nouvelle version de la documentation de votre projet, choisissez un identifiant de version
et mettez à jour l'alias défini comme version par défaut.

    > **Note:** version "0.1" dans l'exemple ci-dessous, à adapter.

```bash
mike deploy --push --update-aliases 0.1 latest
```

Lorsque vous publiez une nouvelle version, mettez toujours à jour l'alias pour qu'il pointe vers la dernière version :

```bash
mike set-default --push latest
```

### Builder une version html pour diffusion

> **Note:** Nécessite d'executer les commandes au sein du container *(docker exec)*

Lorsque vous avez terminé votre travail d'édition, vous pouvez créer un site statique à partir de vos fichiers Markdown :

```bash
mkdocs build
```


### Visualisation (released versions)

- L'image docker `pingouinfinihub/mkdocs-material` permet de visualiser les versions livrées, et deployées sur le git, 
via le port `8001`
  - **nota**: le port ayant probablement été bindé, à adapter selon la conf docker !


## Autre

### Installation docker
https://squidfunk.github.io/mkdocs-material/getting-started/  

### docker-compose

**nota**: adapter le `<path>` et les `<port>`
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

