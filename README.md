# Extension de F95 France

## Installation de l'extension

Lien de téléchargement: [Accèder à l'extension](https://github.com/Hunteraulo1/f95list-ext/releases) _(Regarder dans Assets)_

**Pour Firefox:**
- Il faut glisser le fichier **.xpi** dans directement sur le navigateur _ou l'ouvrir avec Firefox_.


**Pour Chrome:**
- Il faut aller dans la page des extensions _(chrome://extensions/)_
- Cliquer en haut à droite sur **Mode développeur**
- Puis glisser l'archive **.zip** dans la page

## Documentation de réference

[Extension Development Basics](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/)

## Installation (développement)

Pour installer les dépendences :

Bun:
```bash
bun install
```

## Autres commandes

Commandes de lintage :

Bun:
```bash
bun run lint
bun run format
```

## Développement

Pour démarrez un serveur de développement :

Bun:
```bash
bun run dev
```

## Production

Pour créer une version de production de l'extension:

Firefox:
```bash
bun run build:firefox
```

Chrome:
```bash
bun run build:chrome
```

Firefox + Chrome:
```bash
bun run build
```
