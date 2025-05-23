# Extension de F95 France

## Fonctionnalités de l'extension

- Lister tous les jeux de F95 France
- Lister les mises à jour de la liste
- Ajouter un drapeau sur les jeux traduits _(sur F95z)_

## Installation de l'extension

Lien de téléchargement: [Accéder à l'extension](https://github.com/Hunteraulo1/f95list-ext/releases) _(Regarder dans Assets)_

## Installation

**Pour Firefox:** *(mise à jour automatique)*
- Il faut glisser le fichier **.xpi** sur le navigateur _ou l'ouvrir avec Firefox_.

**Pour Chrome:** *(mise à jour manuelle)*
- Il faut aller dans la page des extensions _(chrome://extensions/)_
- Cliquer en haut à droite sur **Mode développeur**
- Puis glisser l'archive **.zip** dans la page

## Documentation de réference

- [Extension Development Basics](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/)
- [WXT](https://wxt.dev/guide/introduction.html)
- [Svelte](https://svelte.dev/docs/)
- [Shadcn-Svelte](https://next.shadcn-svelte.com/docs/)
- [Tailwind](https://tailwindcss.com/docs/)
- [Valibot](https://valibot.dev/guides/)

## Installation (pour les développeurs)

Pour installer les dépendences:
```bash
bun install
```

## Autres commandes

Commandes de lintage:
```bash
bun run lint
bun run format
```

Svelte-check + Lint + Format:
```bash
bun run check
```

## Développement

Pour démarrez un serveur de développement:
Firefox:
```bash
bun run dev:firefox
```

Chrome:
```bash
bun run dev:chrome
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
