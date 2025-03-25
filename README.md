# mkdocs-materials

## Index

- [Index](#index)
- [Quick start](#quick-start)
- [Actions](#actions)
  - [Actualisation de la documentation](#actualisation-de-la-documentation)
  - [Visualisation (version en cours)](#visualisation-version-en-cours)
  - [Publier une nouvelle version](#publier-une-nouvelle-version)
  - [Builder une version html pour diffusion](#builder-une-version-html-pour-diffusion)
  - [Visualisation (released versions)](#visualisation-released-versions)
  - [Export au format PDF](#export-au-format-pdf)
- [Autre](#autre)
  - [Installation docker](#installation-docker)
  - [Docker-compose](#docker-compose)
  - [Documentation](#documentation)
  - [Customisation theme material](#customisation-theme-material)
  - [Themes](#themes)
  - [Plugins](#plugins)


## Quick start

> ⚠️ **Note:** Nécessite d'executer les commandes au sein du container :  
>   `docker exec -it <container_name> ash`
 
Pour simplifier la gestion des actions, un script est mis en place dans le répertoire `/scripts`
```commandline
/scripts/builder-assistant.sh
```

Ce qui affiche le menu suivant (et laissez-vous guidez):
```
? Action : (Use arrow keys)
❯ Builder une nouvelle version
  Generer la documentation au format PDF
  Generer la documentation au format HTML (page html standalone)
  Quitter 
```

## Actions

### Actualisation de la documentation
- Editer les fichiers `.md` du répertoire `content` *(défini dans le mkdocs.yml: docs_dir: 'content')*

- Rajouter des pages dans la partie `nav` du fichier `mkdocs.yml`

- Simplifier la maintenance en appelant une page existante à l'aide du plugin 'include-markdown'  
    `{%`  
        `include-markdown 'general/pageXXX.md'`  
        `start="<!--balise-name-start-->"`  
        `end="<!--balise-name-end-->"`    
    `%}` 


### Visualisation (version en cours)

- L'image docker `pingouinfinihub/mkdocs-material` permet de **visualiser les pages en cours d'écriture** dans le répertoire
`/docs` du container via le port `8000`
  > **Note**: le répertoire et le port ayant probablement été bindés, à adapter selon la conf docker !

- Les modifications entrainent un rechargement automatique de la page.

### Publier une nouvelle version

  > 💡 **Astuce** : Se référer au §[Quick start](#quick-start) pour se simplifier la vie !

---

  > ⚠️ **Note:** Nécessite d'executer les commandes au sein du container :  
  >   `docker exec -it <container_name> ash`

Si vous souhaitez **publier une nouvelle version** de la documentation de votre projet, choisissez un identifiant de version
et mettez à jour l'alias défini comme version par défaut.

  > ⚠️  **Note:** version `0.1` dans l'exemple ci-dessous, à adapter.

```bash
mike deploy --push --update-aliases 0.1 latest
```

Lorsque vous publiez une nouvelle version, mettez toujours à jour l'alias pour qu'il pointe vers la dernière version :

```bash
mike set-default --push latest
```

### Builder une version html pour diffusion

> 💡 **Astuce** : Se référer au §[Quick start](#quick-start) pour se simplifier la vie !

---
  > ⚠️ **Note:** Nécessite d'executer les commandes au sein du container :  
  >   `docker exec -it <container_name> ash`

Lorsque vous avez terminé votre travail d'édition, vous pouvez créer un **site statique** à partir de vos fichiers Markdown :

```bash
mkdocs build
```


### Visualisation (released versions)

- L'image docker `pingouinfinihub/mkdocs-material` permet de visualiser les versions livrées, et deployées sur le git, 
via le port `8001`
  > ⚠️ **Note**: le port ayant probablement été bindé, à adapter selon la conf docker !

### Export au format PDF

> 💡 **Astuce** : Se référer au §[Quick start](#quick-start) pour se simplifier la vie !

---

> ⚠️ **Note:** Nécessite d'executer les commandes au sein du container :  
>   `docker exec -it <container_name> ash`

Pour **exporter la documentation au format pdf** :

```bash
node /scripts/lib/export_to_pdf.js http://<ip>>:<port>>/print_page.html out.pdf 'title' 'v12.3' 'JJ/MM/AAAA hh:mm'
```

Utilisation du plugin [mkdocs-print-site-plugin](https://timvink.github.io/mkdocs-print-site-plugin/how-to/export-PDF.html)  
Les options possibles pour adapter la forme du pdf (à adapter dans `export_to_pdf.js`) -> [ici](https://pptr.dev/api/puppeteer.pdfoptions)


### Export au format HTML

> 💡 **Astuce** : Se référer au §[Quick start](#quick-start) pour se simplifier la vie !

---

> ⚠️ **Note:** Nécessite d'executer les commandes au sein du container :  
>   `docker exec -it <container_name> ash`

Pour **exporter la documentation au format html**, il faut préalablement avoir build le site, puis lancer:

```bash
mkdocs build
cd site/
htmlark print_page/index.html -o standalone.html
```

Utilisation du plugin [mkdocs-print-site-plugin](https://timvink.github.io/mkdocs-print-site-plugin/how-to/export-HTML.html)



## Autre

### Installation docker
[https://squidfunk.github.io/mkdocs-material/getting-started/](https://squidfunk.github.io/mkdocs-material/getting-started/)

### docker-compose

  > ⚠️ **Note**: adapter le `<path>` et les `<port>`

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

### Référence Github `squidfunk/mkdocs-material`
[https://github.com/squidfunk/mkdocs-material](https://github.com/squidfunk/mkdocs-material)

### Changelog
[https://squidfunk.github.io/mkdocs-material/changelog/](https://squidfunk.github.io/mkdocs-material/changelog/)

### Documentation
[https://www.mkdocs.org/getting-started/](https://www.mkdocs.org/getting-started/)

### Customisation theme material
[https://squidfunk.github.io/mkdocs-material/setup/](https://squidfunk.github.io/mkdocs-material/setup/)

### Themes
[https://github.com/mkdocs/mkdocs/wiki/MkDocs-Themes](https://github.com/mkdocs/mkdocs/wiki/MkDocs-Themes)  
[https://www.wheelodex.org/entry-points/mkdocs.themes/](https://www.wheelodex.org/entry-points/mkdocs.themes/)

### Plugins
[https://github.com/mkdocs/catalog](https://github.com/mkdocs/catalog)
