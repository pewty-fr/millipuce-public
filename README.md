# millipuce-public

Site portfolio de Camille Potevin — [millipuce.fr](https://millipuce.fr).

Site statique généré avec [Astro](https://astro.build) à partir de `config.yaml` et du dossier `images/`,
puis publié à chaque push sur `main` : le workflow `.github/workflows/deploy.yaml` construit le site et
l’écrit sur la branche `github-pages`, que GitHub Pages sert sur millipuce.fr.

## Ajouter ou modifier du contenu

- **Une illustration** : déposer le fichier dans `images/work/`. Les fichiers sont triés par nom, le plus
  grand numéro en premier (`032_xxx.jpg` apparaîtra en tête de la galerie).
- **Un projet** : créer un dossier dans `images/`, y déposer les images, puis l’ajouter dans `config.yaml` :

  ```yaml
  projects:
    - text: Illustrations pour …        # texte utilisé si pas de title
      imageDir: images/mon-projet
      title: Mon projet                  # optionnel
      client: Nom du client              # optionnel
      year: 2026                         # optionnel
      cover: image-de-couverture.jpg     # optionnel (sinon la première image)
      description: Quelques mots …       # optionnel
  ```

- **À propos / contact** : sections `about` et `contact` de `config.yaml`.

Formats acceptés : jpg, png, gif (animé ou non), webp. Les images sont redimensionnées et converties
automatiquement à la construction du site : inutile de les compresser avant.

## Développement

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
```
