// Credits for script: https://github.com/majkinetor/mm-docs-template/blob/master/source/pdf/print.js
// Requires: npm i --save puppeteer

const puppeteer = require('puppeteer');
var args = process.argv.slice(2);
var url = args[0];
var pdfPath = args[1];
var title = args[2];
var version = args[3];
var date = args[4];

console.log('Saving', url, 'to', pdfPath);

// date – formatted print date
// title – document title
// url – document location
// pageNumber – current page number
// totalPages – total pages in the document
headerHtml = `
<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 10px; padding-left: 1em; padding-right: 1em;">
    <span>
        ${title}
        ${version !== undefined ? ' v' + version : ''}
    </span>
    <span>${date}</span>
</div>`;

footerHtml = `
 <div style="font-size: 10px; padding-right: 1em; text-align: right; width: 100%;">
     <span class="pageNumber"></span> / <span class="totalPages"></span>
 </div>`;

(async() => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser', // Utiliser Chromium d'Alpine
        args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Bloquer les vidéos pour éviter les timeouts
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.resourceType() === 'media') {
            request.abort(); // Bloquer les ressources vidéo
        } else {
            request.continue();
        }
    });

    // Augmenter le délai d'attente à 60 secondes
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Supprimer les liens cliquables derrière les images
    await page.evaluate(() => {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            const link = img.closest('a');
            if (link) {
                // Retirer l'attribut href du lien
                link.removeAttribute('href');
            }
        });
    });

    await page.pdf({
        path: pdfPath, // path to save pdf file
        format: 'A4', // page format
        displayHeaderFooter: true, // display header and footer (in this example, required!)
        printBackground: true, // print background
        landscape: false, // use horizontal page layout
        headerTemplate: headerHtml, // indicate html template for header
        footerTemplate: footerHtml,
        scale: 1, // Scale amount must be between 0.1 and 2
        margin: { // increase margins (in this example, required!)
            top: 80,
            bottom: 80,
            left: 30,
            right: 30
        }
    });

    await browser.close();
})();
