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

// Builder une nouvelle version avec ou sans tag
function builderNouvelleVersion(version, withTag) {
    const tagStatus = withTag ? 'AVEC' : 'SANS';
    console.log(`Choix sélectionné : 'Builder version v${version}' -> ${tagStatus} tag`);

    if (withTag) {
        execSync(`git tag -a ${version} -m "v${version}"`, { cwd: '/docs' });
        execSync(`mike deploy --push --update-aliases v${version} latest`, { cwd: '/docs' });
        execSync(`mike set-default --push latest`, { cwd: '/docs' });
    }

    mkdocsBuild();
    renameSiteDir(version);

    generateDefaultPDF();
}

// Focntion pour générer le pdf par defaut embarqué dans le site
function generateDefaultPDF() {
    const assetPdfPath = `/docs/content/assets/pdf/site.pdf`;
    const assetPdfDir = path.dirname(newPath); // Récupérer le chemin du répertoire parent
    fs.mkdirSync(assetPdfDir, { recursive: true });

	const { site_name = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
    execSync(`node export_to_pdf http://localhost:8000/print_page.html "${assetPdfPath}" "${site_name}"`, { stdio: 'inherit', cwd: '/scripts/lib' });
}

// Fonction pour générer la documentation en PDF
function generateDocPDF() {
    generateDefaultPDF();

	const { site_name = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
	const currentTag = getCurrentTag();

    console.log("Génération de la documentation au format PDF...");
	const pdfPath = `/docs/${site_name}_${currentTag}.pdf`;
    execSync(`node export_to_pdf http://localhost:8000/print_page.html "${pdfPath}" "${site_name}"`, { stdio: 'inherit', cwd: '/scripts/lib' });

    console.log(`\n==> Le PDF a été généré dans "${pdfPath}"`);
}


// Fonction pour builder avec mkdocs
function mkdocsBuild() {
    console.log("### mkdocs build");
    execSync('mkdocs build', { stdio: 'inherit', cwd: '/docs' });
}

function generateStandaloneHtml() {
    mkdocsBuild();

	const { site_dir = 'site', plugins } = yaml.load(fs.readFileSync('/docs/mkdocs.yml', 'utf8'));
	const currentTag = getCurrentTag();

	const htmlIndexPath = `/docs/${site_dir}/print_page.html`;
	const htmlStdlnOutPath = `/docs/${site_dir}_${currentTag}_single-page.html`;
    execSync(`htmlark "${htmlIndexPath}" -o "${htmlStdlnOutPath}"`, { stdio: 'inherit', cwd: '/docs' });
}

// Renommer le dossier `site_dir`
function renameSiteDir(version) {
    const siteDir = getSiteDir();
    const destinationDir = `${siteDir} v${version}`;

    if (fs.existsSync(destinationDir)) {
        console.log("Le répertoire ${destinationDir} existe déjà. Suppression...");
        fs.rmSync(destinationDir, { recursive: true, force: true });
    }

    if (fs.existsSync(siteDir)) {
        fs.renameSync(siteDir, destinationDir);
        console.log("Le répertoire ${siteDir} a été renommé en ${destinationDir}");
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