import logging
import os
import shutil
import subprocess
import sys
import time

import requests

# Configuration
GITHUB_API_URL = "https://api.github.com/repos/squidfunk/mkdocs-material/releases/latest"
CHECK_INTERVAL = 3600  # Vérifier toutes les heures
LAST_RELEASE_FILE = "last_release.txt"  # Fichier pour stocker la dernière release connue
WORKDIR = "workdir"
BUILD = "build"
REPO_URL = "https://github.com/PingouInfini/mkdocs-material"

# Récupérer la variable d'environnement DOCKER_PASSWORD
DOCKER_PASSWORD = os.getenv('DOCKER_PASSWORD')

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s',
                    level=LOG_LEVEL.upper(),
                    datefmt='%Y-%m-%d %H:%M:%S')

# Vérifier si DOCKER_PASSWORD est vide ou None
if not DOCKER_PASSWORD:
    logging.error("Erreur : La variable d'environnement DOCKER_PASSWORD est manquante.")
    sys.exit(1)


def get_latest_release():
    response = requests.get(GITHUB_API_URL)
    response.raise_for_status()  # Gère les erreurs HTTP
    return response.json()["tag_name"]


def load_last_release():
    try:
        with open(LAST_RELEASE_FILE, "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        return None


def save_last_release(release):
    with open(LAST_RELEASE_FILE, "w") as file:
        file.write(release)


def handle_new_release():
    # 1. Supprimer le répertoire "workdir" ou "build" s'il existe
    if os.path.exists(WORKDIR):
        logging.debug(f"Suppression du répertoire existant : {WORKDIR}")
        shutil.rmtree(WORKDIR)
    if os.path.exists(BUILD):
        logging.debug(f"Suppression du répertoire existant : {BUILD}")
        shutil.rmtree(BUILD)

    # 2. Cloner le dépôt dans "workdir"
    logging.debug(f"Clonage du dépôt {REPO_URL} dans {WORKDIR}")
    subprocess.run(['git', 'clone', REPO_URL, WORKDIR], check=True)

    # 3. Remplacer le contenu de "workdir/docker/docker_password.txt" par la valeur de DOCKER_PASSWORD
    docker_password_file = os.path.join(WORKDIR, 'docker', 'docker_password.txt')
    try:
        with open(docker_password_file, 'w') as file:
            file.write(DOCKER_PASSWORD)
        logging.debug(f"Le fichier {docker_password_file} a été mis à jour avec la valeur de DOCKER_PASSWORD.")
    except Exception as e:
        logging.error(f"Erreur lors de la mise à jour de {docker_password_file} : {e}")
        sys.exit(1)

    # 4. Se déplacer dans le répertoire workdir et lancer build.sh
    original_dir = os.getcwd()  # Sauvegarde du répertoire courant
    os.chdir(WORKDIR)  # Se déplacer dans le répertoire workdir
    try:
        build_script_path = './build.sh'
        if os.path.exists(build_script_path) and os.access(build_script_path, os.X_OK):
            logging.info(f"Lancement du script {build_script_path}")
            with open('../build.log', 'w') as log_file:
                # Exécute le script et redirige stdout et stderr vers le fichier
                subprocess.run(['sh', build_script_path], check=True, stdout=log_file, stderr=log_file)
        else:
            logging.error(f"Le script {build_script_path} est introuvable ou non exécutable")
    finally:
        os.chdir(original_dir)  # Revenir au répertoire initial

    # 5. Supprimer le répertoire workdir après exécution de build.sh
    logging.debug(f"Suppression des répertoires {WORKDIR} et {BUILD} après exécution de build.sh")
    if os.path.exists(WORKDIR):
        shutil.rmtree(WORKDIR)
    if os.path.exists(BUILD):
        shutil.rmtree(BUILD)


def main():
    while True:
        try:
            latest_release = get_latest_release()
            last_release = load_last_release()

            if latest_release != last_release:
                logging.info("")
                logging.info("")
                logging.info("")
                logging.info(f"### Nouvelle release détectée : {latest_release}")
                handle_new_release()  # Effectuer les actions pour la nouvelle release
                save_last_release(latest_release)

        except Exception as e:
            logging.error(f"Erreur lors de la vérification de la release : {e}")

        # Attendre avant la prochaine vérification
        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
