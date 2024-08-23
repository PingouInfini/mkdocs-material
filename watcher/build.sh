#!/bin/bash

docker_connect() {
  # Vérifier si l'utilisateur est déjà connecté à Docker
  if docker info >/dev/null 2>&1; then
    return
  fi

  # Nom du fichier
  file="./docker/docker_password.txt"

  # Vérifier si le fichier commence par "#"
  if [[ $(head -n 1 "$file") == "#"* ]]; then
    # Demander le mot de passe à l'utilisateur
    # shellcheck disable=SC2162
    read -s -p "Veuillez entrer votre mot de passe pour Docker Hub: " password
    echo

    # Utiliser la commande "docker login" avec le mot de passe saisi
    echo "$password" | docker login --username=pingouinfinihub --password-stdin

  else
    # Le fichier ne commence pas par "#", utiliser cat pour lire le contenu
    # shellcheck disable=SC2002
    cat "$file" | docker login --username=pingouinfinihub --password-stdin
  fi
}

docker_connect

docker build -t pingouinfinihub/mkdocs-material-watcher .

docker tag pingouinfinihub/mkdocs-material-watcher pingouinfinihub/mkdocs-material-watcher:latest
docker push pingouinfinihub/mkdocs-material-watcher:latest