const fs = require('fs')
const parse = require('csv-parse')
const { matchesGlob } = require("path");
const { mainModule } = require("process");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function demanderNombreJoueurs() {
    return new Promise((resolve) => {
        rl.question("Entrez le nombre de joueurs (compris entre 3 et 5) : ", (reponse) => {
            let nombreJoueurs = parseInt(reponse);
            if (nombreJoueurs >= 3 && nombre <= 5) {
                resolve(nombreJoueurs);
            } else {
                console.log("Nombre invalide. Essayez encore.");
                resolve(demanderNombreJoueurs());
            }
        });
    });
}

async function demanderNomsJoueurs(nombreJoueurs) {
    let listeJoueurs = [];

    for (let i = 0; i <= nombreJoueurs; i++) {
        await new Promise((resolve) => {
            rl.question(`Quel est le nom du joueur numéro ${i} ? `, (nom) => {
                listeJoueurs.push(nom);
                resolve();
            });
        });
    }

    return listeJoueurs;
}

async function Roles(listeJoueurs) {
    let i = Math.floor(Math.random() * listeJoueurs.length);
    let JoueurDevine = listeJoueurs[i];
    let JoueurIndice = listeJoueurs.slice(0, i).concat(listeJoueurs.slice(i + 1));
    console.log(`${JoueurDevine} devinera le mot des autres joueurs.`);
    return(JoueurDevine, JoueurIndice)
}

async function ListeIndices(JoueurIndice, ChoisirMot){
    let listeIndices = [];
    for (let i = 0; i <= nombreJoueurs - 1; i++) {
        rl.question(`Le mot à deviner est ${ChoisirMot}, quel est ton indice ${JoueurIndice[0]} ? (donner l'indice sans majuscule et au singulier)`, (indice) => {
            listeIndices.push(indice);
        });
    return(listeIndices)
    }
}

async function IndicesValides(listeIndices){
    let MotValide = [];
    for (let i = 0; i <= listeIndices.length - 1; i++){
        let sousliste = listeIndices.slice(0, i).concat(listeIndices.slice(i + 1));
        if (sousliste.includes(listeIndices[i])){
            MotValide.push(0);
        } else{
            MotValide.push(1);
        }
    }
    IndicesValides = Array(listeIndices.length)
    for (let i = 0; i <= listeIndices.length; i ++){
        if (MotValide[i] == 1){
            IndicesValides.push(listeIndices[i]);
        }
    }
    return IndicesValides
}

async function Deviner(IndicesValides, JoueurDevine, ChoisirMot){
    let Mot = '';
    rl.question(`${JoueurDevine} tes indices sont : ${IndicesValides}, quel mot devines-tu ?`, (Tentative) => {
    });
    if (Tentative == ChoisirMot) {
        console.log('Félicitations, tu as gagné !');
        return True
    } else {
        console.log('Aïe aïe aïe... Peut-être la prochaine fois.');
        return False
    }
}

async function ChoisirMot(MotsPrecedents){
    fs.readFileSync(mots.csv, 'utf8', (err, data) => {
        if (err){
            console.error('Erreur dans la lecture des mots :',err);
            return;
        }
        parse(data, {
            delimiter: ','
        }, (err, records) => {
            if (err){
                console.error('Erreur dans le parsing des données :',err);
                return;
            }
        })
    });
}

async function main(){
    console.log('Bienvenu au Just One !');
    let score = 0;
    let MotsPrecedents = [];
    let nombreJoueurs = demanderNombreJoueurs();
    let listeJoueurs = demanderNomsJoueurs(nombreJoueurs);
    r1.question('Combien de manches voulez-vous faire ?', (nombreManches) => {
    });
    for (let i = 0; i <= nombreManches; i ++){
        console.log(`Début de la manche ${i}.`);
        let Roles = Roles(listeJoueurs);
        let JoueurDevine = Roles[0];
        let JoueurIndice = Roles[1];
        let ChoisirMot = ChoisirMot(MotsPrecedents);
        let ListeIndices = ListeIndices(JoueurIndice, ChoisirMot);
        let IndicesValides = IndicesValides(ListeIndices);
        let Resultat = Deviner(IndicesValides, JoueurDevine, ChoisirMot);
        if (Resultat){
            score += 1;
        }
        console.log(`Fin de la manche, score actuel : ${score}`)
        MotsPrecedents.push(ChoisirMot)
    console.log(`Fin de la partie, score ${score} sur ${nombreManches} manches.`)
    }
}

main();
