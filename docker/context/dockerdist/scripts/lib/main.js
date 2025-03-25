const { select, input, confirm } = require('@inquirer/prompts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Menu principal
async function showMainMenu() {
    const answers = await select({
        message: 'Action :',
        choices: [
            { value: 'build', name: 'Builder une nouvelle version' },
            { value: 'generate_doc', name: 'Generer la documentation au format PDF' },
            { value: 'generate_html', name: 'Generer la documentation au format HTML' },
            { value: 'quit', name: 'Quitter' }
        ]
    });

    switch (answers) {
        case 'build':
            computeNextTag();
            break;
        case 'generate_doc':
            generateDocPDF();
            break;
        case 'generate_html':
            generateStandaloneHtml();
            break;
        case 'quit':
            console.log("Au revoir!");
            process.exit(0);
            break;
    }
}

// Menu pour builder une nouvelle version
async function showBuildMenu(currentTag, futureMinorVersion, futureMajorVersion) {
    const answers = await select({
        message: `Builder une nouvelle version (Version ACTUELLE [v${currentTag}]) :`,
        choices: [
            { value: 'current', name: `Version ACTUELLE [v${currentTag}]` },
            { value: 'minor', name: `Nouvelle Version MINEURE [v${futureMinorVersion}] + Tag` },
            { value: 'major', name: `Nouvelle Version MAJEURE [v${futureMajorVersion}] + Tag` },
            { value: 'custom', name: 'Nouvelle Version CUSTOM [vX.Y] + (optionnel) Tag' },
            { value: 'back', name: 'Precedent' },
            { value: 'quit', name: 'Quitter' }
        ]
    });

    switch (answers) {
        case 'current':
            builderNouvelleVersion(currentTag, false);
            break;
        case 'minor':
            builderNouvelleVersion(futureMinorVersion, true);
            break;
        case 'major':
            builderNouvelleVersion(futureMajorVersion, true);
            break;
        case 'custom':
            askForCustomVersion();
            break;
        case 'back':
            showMainMenu();
            break;
        case 'quit':
            console.log("Au revoir!");
            process.exit(0);
            break;
    }
}

// Fonction pour générer une version personnalisée
async function askForCustomVersion() {
    const version = await input({
        message: 'Renseigner un numero de version (format x.y) :',
        validate: (input) => /^[0-9]+\.[0-9]+$/.test(input) || 'Format invalide. Utiliser X.Y'
    });

    const tag = await confirm({
        message: 'Rajouter un tag à la version ?',
        default: true
    });

    builderNouvelleVersion(version, tag);
}

// Méthode pour copier un fichier et créer les répertoires manquants
function copyFile(source, destination) {
    try {
        // Créer les répertoires de destination manquants
        const dir = path.dirname(destination);
        fs.mkdirSync(dir, { recursive: true });

        // Copier le fichier
        fs.copyFileSync(source, destination);

        console.log(`Fichier copié de ${source} vers ${destination}`);
    } catch (error) {
        console.error(`Erreur lors de la copie du fichier : ${error.message}`);
    }
}

// Builder une nouvelle version avec ou sans tag
function builderNouvelleVersion(version, withTag) {
    const tagStatus = withTag ? 'AVEC' : 'SANS';
    console.log(`Choix sélectionné : 'Builder version v${version}' -> ${tagStatus} tag`);

    if (withTag) {
        try {
            execSync(`git tag -a ${version} -m "v${version}"`, { cwd: '/docs' });
        } catch (error) {
            console.error(`Erreur lors de la création du tag : ${error.message}`);
        }

        try {
            execSync(`mike deploy --push --update-aliases v${version} latest`, { cwd: '/docs' });
        } catch (error) {
            console.error(`Erreur lors du déploiement avec mike : ${error.message}`);
        }

        try {
            execSync(`mike set-default --push latest`, { cwd: '/docs' });
        } catch (error) {
            console.error(`Erreur lors du réglage par défaut avec mike : ${error.message}`);
        }
    }

    mkdocsBuild();
    renameSiteDir(version);

    generateDefaultPDF(version);

    // Déplacement du default pdf généré dans le site
    const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    copyFile('/docs/content/assets/pdf/site.pdf', `/docs/${site_dir} v${version}/assets/pdf/site.pdf`);
}

function getCurrentDateTime() {
    const now = new Date();

    // Format de la date et de l'heure avec le fuseau horaire de Paris
    const options = {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Pour avoir l'heure au format 24h
    };

    // Obtenir la date et l'heure dans le format souhaité
    const formatter = new Intl.DateTimeFormat('fr-FR', options);
    const parts = formatter.formatToParts(now);

    // Extraire les différentes parties (jour, mois, année, heures, minutes)
    const day = parts.find(part => part.type === 'day').value;
    const month = parts.find(part => part.type === 'month').value;
    const year = parts.find(part => part.type === 'year').value;
    const hours = parts.find(part => part.type === 'hour').value;
    const minutes = parts.find(part => part.type === 'minute').value;

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Focntion pour générer le pdf par defaut embarqué dans le site
function generateDefaultPDF(version) {
    const assetPdfPath = `/docs/content/assets/pdf/site.pdf`;
    const assetPdfDir = path.dirname(assetPdfPath); // Récupérer le chemin du répertoire parent
    fs.mkdirSync(assetPdfDir, { recursive: true });
    buildPDF(assetPdfPath, version);
}

// Fonction pour générer la documentation en PDF
async function generateDocPDF() {
    const currentTag = getCurrentTag();
    const answers = await select({
        message: `Builder une nouvelle version PDF (Version ACTUELLE [v${currentTag}]) :`,
        choices: [{
                value: 'current',
                name: `Version ACTUELLE [v${currentTag}]`
            },
            {
                value: 'custom',
                name: 'Nouvelle Version CUSTOM [vX.Y]'
            },
            {
                value: 'back',
                name: 'Precedent'
            },
            {
                value: 'quit',
                name: 'Quitter'
            }
        ]
    });

    let version;
    switch (answers) {
        case 'current':
            version = currentTag
            break;
        case 'custom':
            version = await input({
                message: 'Renseigner un numero de version (format x.y) :',
                validate: (input) => /^[0-9]+\.[0-9]+$/.test(input) || 'Format invalide. Utiliser X.Y'
            });
            break;
        case 'back':
            showMainMenu();
            return;
        case 'quit':
            console.log("Au revoir!");
            process.exit(0);
            break;
    }

    generateDefaultPDF(version);

    console.log("Génération de la documentation au format PDF...");
    const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    const pdfPath = `/docs/${site_dir} v${version}.pdf`;
    buildPDF(pdfPath, version);
    console.log(`\n==> Le PDF a été généré dans "${pdfPath}"`);
}

async function buildPDF(pdfPath, version) {
    const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    const date = getCurrentDateTime();
    execSync(`node export_to_pdf http://localhost:8000/print_page.html "${pdfPath}" "${site_dir}" "${version}" "${date}"`, { stdio: 'inherit', cwd: '/scripts/lib' });
}

// Fonction pour builder avec mkdocs
function mkdocsBuild() {
    console.log("### mkdocs build");
    execSync('mkdocs build', { stdio: 'inherit', cwd: '/docs' });
}

function generateStandaloneHtml() {
    // Nouveau build permettant de s'appuyer sur une version du print_page.html à jour
    mkdocsBuild();

    const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    const currentTag = getCurrentTag();

    const htmlIndexPath = `/docs/${site_dir}/print_page.html`;
    const htmlStdlnOutPath = `/docs/${site_dir} v${currentTag}.single-page.html`;
    execSync(`htmlark "${htmlIndexPath}" -o "${htmlStdlnOutPath}"`, { stdio: 'inherit', cwd: '/docs' });

    // Supprimer le répertoire site_dir
    fs.rmSync(`/docs/${site_dir}`, { recursive: true, force: true });
}

// Renommer le dossier `site_dir`
function renameSiteDir(version) {
    const siteDir = getSiteDir();
    const destinationDir = `${siteDir} v${version}`;

    if (fs.existsSync(destinationDir)) {
        console.log(`Le répertoire "${destinationDir}" existe déjà. Suppression...`);
        fs.rmSync(destinationDir, { recursive: true, force: true });
    }

    if (fs.existsSync(siteDir)) {
        fs.renameSync(siteDir, destinationDir);
        console.log(`Le répertoire "${siteDir}" a été renommé en "${destinationDir}"`);
    }
}


// Obtenir le chemin de `site_dir` depuis mkdocs.yml
function getSiteDir() {
    const mkdocsYml = fs.readFileSync('/docs/mkdocs.yml', 'utf8');
    const match = mkdocsYml.match(/site_dir: (.+)/);
    return match ? match[1].trim() : 'site';
}

// Fonction pour récupérer la version actuelle
function getCurrentTag() {
    let currentTag;
    try {
        currentTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8', cwd: '/docs' }).trim();
    } catch (err) {
        currentTag = '0.0';
    }
    return currentTag;
}

// Fonction pour calculer la prochaine version
function computeNextTag() {
    const latestTag = getCurrentTag();

    const [major, minor] = latestTag.split('.').map(Number);
    const futureMinorVersion = `${major}.${minor + 1}`;
    const futureMajorVersion = `${major + 1}.0`;

    showBuildMenu(latestTag, futureMinorVersion, futureMajorVersion);
}

// Lancer le menu principal
showMainMenu();