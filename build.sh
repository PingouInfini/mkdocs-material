#!/bin/bash

# VARIABLES
build_dir="context/dockerdist/build"

# Vérifier si le répertoire de destination existe
if [ -d "$build_dir" ]; then
    echo "Le répertoire de destination existe déjà. Suppression en cours..."
    rm -rf "$build_dir"
fi

# Cloner le repo depuis GitHub
git clone https://github.com/squidfunk/mkdocs-material.git "$build_dir"

# Vérifier si la commande git a réussi
if [ $? -eq 0 ]; then
    # On remplace par notre site exemple
    #rm -rf "$build_dir"/docs
    cp -r context/dockerdist/mkdocs/mkdocs.yml "$build_dir"/mkdocs.yml
    cp -r context/dockerdist/mkdocs/.gitignore "$build_dir"/.gitignore
    cp -r context/dockerdist/mkdocs/content "$build_dir"/content

    # modification du dockerfile
    cp -f context/Dockerfile "$build_dir"/Dockerfile

    # récupération du supervisord
    cp -r context/dockerdist/supervisord "$build_dir"/supervisord
else
    echo "Le clonage du repo GitHub a échoué."
fi


# ... et on lance le build !
echo "START BUILD..."
docker build -t pingouinfinihub/mkdocs-material $build_dir
echo "... DONE !"

# Pour finir on supprime le clone du repo...
rm -rf "$build_dir"