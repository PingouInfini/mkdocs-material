#!/bin/bash

# VARIABLES
build_dir="build"

docker_connect() {
  # Nom du fichier
  file="./docker/docker_password.txt"

  # Vérifier si le fichier commence par "#"
  if [[ $(head -n 1 "$file") == "#"* ]]; then
    # Demander le mot de passe à l'utilisateur
    read -s -p "Veuillez entrer votre mot de passe pour Docker Hub: " password
    echo

    # Utiliser la commande "docker login" avec le mot de passe saisi
    echo "$password" | docker login --username=pingouinfinihub --password-stdin

  else
    # Le fichier ne commence pas par "#", utiliser cat pour lire le contenu
    cat "$file" | docker login --username=pingouinfinihub --password-stdin
  fi
}

# Vérifier si le répertoire de destination existe
if [ -d "$build_dir" ]; then
    echo "Le répertoire de destination existe déjà. Suppression en cours..."
    rm -rf "$build_dir"
fi

# Cloner le repo depuis GitHub
git clone https://github.com/squidfunk/mkdocs-material.git "$build_dir"

# Vérifier si la commande git a réussi
if [ $? -eq 0 ]; then
    # On recupère la version courante
    version=$(jq -r '.version' "$build_dir"/package.json)

    # On remplace par notre site exemple
    cp -r docker/context/dockerdist/mkdocs/mkdocs.yml "$build_dir"/mkdocs.yml
    cp -r docker/context/dockerdist/mkdocs/.gitignore "$build_dir"/.gitignore
    cp -rL docker/context/dockerdist/mkdocs/content "$build_dir"/content
    cp README.md docker/context/dockerdist/mkdocs/content/index.md

    # modification du dockerfile
    cp -f docker/context/Dockerfile "$build_dir"/Dockerfile

    # récupération du supervisord
    cp -r docker/context/dockerdist/supervisord "$build_dir"/supervisord
else
    echo "Le clonage du repo GitHub a échoué."
fi


# ... et on lance le build !
echo "Build de la version v""$version"
docker build -t pingouinfinihub/mkdocs-material $build_dir

docker tag pingouinfinihub/mkdocs-material pingouinfinihub/mkdocs-material:"$version"
docker tag pingouinfinihub/mkdocs-material pingouinfinihub/mkdocs-material:latest
docker push pingouinfinihub/mkdocs-material:"$version"
docker push pingouinfinihub/mkdocs-material:latest
echo "Done !"

# Pour finir on supprime le clone du repo...
rm -rf "$build_dir"