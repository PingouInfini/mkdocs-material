#!/bin/sh

print_menu_principal(){
    clear
    echo "Menu :"
    echo "1) Builder une nouvelle version"
    echo "2) Generer la documentation au format PDF"
    echo "3) Quitter"
    echo "Veuillez choisir une option : "
}

print_menu_builder(){
    clear
    echo "Builder une nouvelle version :"
    echo "1) Version ACTUELLE [v$current_tag]"
    echo "2) Nouvelle Version MINEURE [v$future_minor_version] + Tag"
    echo "3) Nouvelle Version MAJEURE [v$future_major_version] + Tag"
    echo "4) Nouvelle Version CUSTOM [vX.Y] + (optionnel) Tag"
    echo "5) Precedent"
    echo "6) Quitter"
    echo "Veuillez choisir une option : "
}

mkdocs_build(){
    local site_dir=$(grep 'site_dir' mkdocs.yml | sed -e 's/.*site_dir: /\1/')
    rm -rf "$site_dir"*

    clear
    echo "### mkdocs build"
    mkdocs build
}

builder_nouvelle_version() {
    local tag_version=$2
    if [ "$tag_version" == true ]; then
        with_without="AVEC"
    else
        with_without="SANS"
    fi

    echo "Choix selectionne : 'Builder version v$1' -> $with_without tag, confirmer la selection ? (O/n)"

    read confirmation
    # Convertir la reponse en minuscules pour la comparer
    confirmation=$(echo "$confirmation" | tr '[:upper:]' '[:lower:]')
    if [ "$confirmation" == "n" ]; then
        echo "Annulation de la selection."
        cd -
        exit
    fi

    mkdocs_build

    if [ "$tag_version" == true ]; then
        echo "### git tag -a $1 -m $1"
        git tag -a $1 -m $1
        
        echo "### mike deploy --push --update-aliases $1 latest"
        mike deploy --push --update-aliases $1 latest
    
        echo "### mike set-default --push latest"
        mike set-default --push latest
    fi
}

rename_site_dir() {
    local version="$1"
    local site_dir=$(grep 'site_dir' mkdocs.yml | sed -e 's/.*site_dir: /\1/')

    # Verifier si le repertoire existe
    if [ -d "$site_dir" ]; then
        # Renommer le repertoire en ajoutant le suffixe de version
        mv "$site_dir" "${site_dir} v${version}"
    fi
}


# Fonction pour builder une nouvelle version
compute_next_tag() {
    # Recuperer la valeur du dernier tag
    cd /docs
    git fetch
    latest_tag=$(git describe --tags --abbrev=0)
    cd -

    if [ -z "$latest_tag" ]; then
        current_tag="0.0"
    else
        current_tag=$(echo "$latest_tag" | awk -F '.' '{print $1 "." $2}')
    fi

    # Extraire la partie entiere et la partie decimale du tag
    major_version=$(echo "$current_tag" | cut -d. -f1)
    minor_version=$(echo "$current_tag" | cut -d. -f2)

    # Calculer future_major_version
    future_major_version=$((major_version + 1)).0

    # Calculer future_minor_version
    future_minor_version="$major_version.$((minor_version + 1))"

    while true; do
        print_menu_builder
        read choix

        case $choix in
            1)
                # Version actuelle
                cd /docs
                mkdocs_build
                rename_site_dir $current_tag
                cd -
                exit 0
                ;;
            2)
                # Nouvelle Version Mineure
                cd /docs
                builder_nouvelle_version $future_minor_version true
                rename_site_dir $future_minor_version
                cd -
                exit 0
                ;;
            3)
                # Nouvelle Version Majeure
                cd /docs
                builder_nouvelle_version $future_major_version true
                rename_site_dir $future_major_version
                cd -
                exit 0
                ;;
            4)
                # Version custom
                cd /docs
                echo "Renseigner un numero de version (format x.y) :"
                read future_custom_version

                local regexp='^[0-9]+\.[0-9]+$'  # Expression régulière pour "X.Y"

                if ! [[ "$future_custom_version" =~ $regexp ]]; then
                    echo "Le numéro renseigné ($1) ne respecte pas le format attendu :'[0-9]+.[0-9]+'"
                    echo "Presser une touche pour continuer..."
                    read confirmation
                    cd -
                    compute_next_tag
                fi

                echo "Rajouter un tag a la version ? (O/n)"
                read confirmation
                # Convertir la reponse en minuscules pour la comparer
                confirmation=$(echo "$confirmation" | tr '[:upper:]' '[:lower:]')
                if [ "$confirmation" == "n" ]; then
                    with_tag=false
                else
                    with_tag=true
                fi

                builder_nouvelle_version $future_custom_version $with_tag
                rename_site_dir $future_custom_version
                cd -
                exit 0
                ;;
            5)
                # precedent
                show_choice
                ;;
            6)
                # quitter
                echo "Au revoir!"
                exit 0
                ;;
            *)
                echo "Choix invalide. Veuillez selectionner une option valide."
                ;;
        esac
    done
}

# Fonction pour generer la documentation au format PDF
generer_doc_pdf() {
    clear
    echo "Generation de la documentation au format PDF..."
    cd /docs && ENABLE_PDF_EXPORT=1 mkdocs build && cd -
}

show_choice() {
    while true; do
        print_menu_principal
        read choix

        case $choix in
            1)
                compute_next_tag
                ;;
            2)
                generer_doc_pdf
                exit 0
                ;;
            3)
                echo "Au revoir!"
                exit 0
                ;;
            *)
                echo "Choix invalide. Veuillez selectionner une option valide."
                ;;
        esac
    done
}

show_choice