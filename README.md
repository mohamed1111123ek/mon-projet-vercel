# mon-projet

Projet Next.js App Router minimal en JavaScript avec backend integre et MongoDB Atlas.

## Structure

```text
mon-projet/
  app/
    layout.js
    page.js
    api/
      save-user/
        route.js
  mongodb.js
  package.json
  .env.local.example
  README.md
```

## Prerequis

- Node.js 18.17 ou plus recent
- Une base MongoDB Atlas avec une chaine de connexion valide

## Installation

1. Installez les dependances :

```bash
npm install
```

2. Creez un fichier `.env.local` a partir de l'exemple puis renseignez votre URI Atlas :

```bash
MONGODB_URI=...
```

3. Lancez le projet en local :

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

## Variables d'environnement

Créez un fichier `.env.local` en local pour les tests, puis ajoutez exactement la meme variable dans Vercel :

```bash
MONGODB_URI=...
```

## Fonctionnement

- La page `/` affiche un formulaire avec `nom`, `prenom` et un upload PDF.
- La page lit aussi les 20 derniers utilisateurs depuis MongoDB et les affiche sous le formulaire.
- La route `GET /api/save-user` retourne la liste des utilisateurs sans le contenu binaire du PDF.
- La route `POST /api/save-user` recoit un formulaire `multipart/form-data`.
- La route valide et nettoie les champs texte, verifie le PDF et impose une taille maximale de 5 Mo.
- Les donnees sont enregistrees dans la base `test_db`, collection `users`.
- Chaque document contient `nom`, `prenom`, `createdAt` et un objet `pdf` avec le nom du fichier, son type, sa taille et ses donnees binaires.

## Deploiement Vercel

1. Mettez le projet dans un repo GitHub.
2. Importez ce repo dans Vercel.
3. Ajoutez la variable d'environnement `MONGODB_URI` dans `Settings > Environment Variables`.
4. Redployez si besoin.

Vercel generera ensuite une URL publique du type :

```text
https://mon-projet.vercel.app
```

## MongoDB Atlas

Pour que l'API puisse ecrire dans Atlas apres deploiement :

1. Creez ou utilisez un cluster Atlas.
2. Creez un utilisateur base de donnees.
3. Recuperez la chaine de connexion.
4. Autorisez l'acces reseau adapte a votre configuration Atlas/Vercel.
