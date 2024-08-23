FROM alpine:latest

# Installer bash, python, pip, docker et leurs dépendances
RUN apk add --no-cache \
    bash \
    git \
    jq \
    sudo \
    python3 \
    py3-pip \
    docker \
    && pip install --upgrade pip --break-system-packages

# Définir le répertoire de travail
WORKDIR /app

# Copier le script Python dans l'image Docker
COPY release_watcher.py /app/release_watcher.py

# Copier le fichier de dépendances (si vous en avez un, par exemple requirements.txt)
COPY requirements.txt /app/requirements.txt

# Installer les dépendances Python (si vous avez un requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

# Commande par défaut pour exécuter le script Python
CMD ["python", "/app/release_watcher.py"]