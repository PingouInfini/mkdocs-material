const inquirer = require('@inquirer/prompts');
const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');

// Menu principal
async function showMainMenu() {
    const answers = await inquirer.select({
        message: 'Action :',
        choices: [
            { value: 'build', name: 'Builder une nouvelle version' },
            { value: 'generate_doc', name: 'Generer la documentation au format PDF' },
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
        case 'quit':
            console.log("Au revoir!");
            process.exit(0);
            break;
    }
}

// Menu pour builder une nouvelle version
async function showBuildMenu(currentTag, futureMinorVersion, futureMajorVersion) {
    const answers = await inquirer.select({
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
    const { version } = await inquirer.input({
        message: 'Renseigner un numero de version (format x.y) :',
        validate: (input) => /^[0-9]+\.[0-9]+$/.test(input) || 'Format invalide. Utiliser X.Y'
    });

    const { tag } = await inquirer.confirm({
        message: 'Rajouter un tag à la version ?',
        default: true
    });

    builderNouvelleVersion(version, tag);
}

// Builder une nouvelle version avec ou sans tag
function builderNouvelleVersion(version, withTag) {
    const tagStatus = withTag ? 'AVEC' : 'SANS';
    console.log(`Choix sélectionné : 'Builder version v${version}' -> ${tagStatus} tag`);

    if (withTag) {
        execSync(`git tag -a v${version} -m "v${version}"`);
        execSync(`mike deploy --push --update-aliases v${version} latest`);
        execSync(`mike set-default --push latest`);
    }

    mkdocsBuild();
    renameSiteDir(version);
}

// Fonction pour générer la documentation en PDF
function generateDocPDF() {
    console.log("Génération de la documentation au format PDF...");
    execSync('cd /docs && ENABLE_PDF_EXPORT=1 mkdocs build', { stdio: 'inherit' });

    // Charger et parser mkdocs.yml pour récupérer combined_output_path du plugin pdf-export
    const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    const combinedOutputPath = plugins.find(p => p['pdf-export'])['pdf-export'].combined_output_path;
    console.log(`\n==> Le PDF a été généré dans /docs/${site_dir}/${combinedOutputPath}`);
}

// Fonction pour builder avec mkdocs
function mkdocsBuild() {
    console.log("### mkdocs build");
    execSync('mkdocs build', { stdio: 'inherit' });
}

// Renommer le dossier `site_dir`
function renameSiteDir(version) {
    const siteDir = getSiteDir();
    if (fs.existsSync(siteDir)) {
        fs.renameSync(siteDir, `${siteDir} v${version}`);
    }
}

// Obtenir le chemin de `site_dir` depuis mkdocs.yml
function getSiteDir() {
    const mkdocsYml = fs.readFileSync('mkdocs.yml', 'utf8');
    const match = mkdocsYml.match(/site_dir: (.+)/);
    return match ? match[1].trim() : 'site';
}

// Fonction pour calculer la prochaine version
function computeNextTag() {
    let latestTag;
    try {
        latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (err) {
        latestTag = '0.0';
    }

    const [major, minor] = latestTag.split('.').map(Number);
    const futureMinorVersion = `${major}.${minor + 1}`;
    const futureMajorVersion = `${major + 1}.0`;

    showBuildMenu(latestTag, futureMinorVersion, futureMajorVersion);
}

// Lancer le menu principal
showMainMenu();
