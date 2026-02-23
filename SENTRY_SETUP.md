# Configuration Sentry

Ce guide explique comment configurer Sentry pour le monitoring d'erreurs et de performance de l'app Cortx.

## 🎯 Pourquoi Sentry ?

Sentry capture automatiquement :

- ✅ Toutes les erreurs JavaScript/TypeScript
- ✅ Les crashes natifs iOS
- ✅ Le contexte complet (stack trace, device info, actions utilisateur)
- ✅ Les métriques de performance

Cela permet de détecter et corriger rapidement les bugs en production.

---

## 📋 Étape 1 : Créer un compte Sentry

1. Aller sur [sentry.io](https://sentry.io)
2. Créer un compte gratuit (5,000 erreurs/mois)
3. Choisir **Vue** comme plateforme

---

## 📋 Étape 2 : Créer un projet

1. Dans Sentry, cliquer sur **Create Project**
2. Sélectionner **Vue** comme plateforme
3. Nommer le projet : `cortx`
4. Cliquer sur **Create Project**

---

## 📋 Étape 3 : Récupérer le DSN

1. Une fois le projet créé, vous verrez le **DSN** (Data Source Name)
2. Format : `https://[key]@[organization].ingest.sentry.io/[project-id]`
3. Copier cette valeur

Exemple :

```
https://abc123def456ghi789jkl012mno345pq@o1234567.ingest.sentry.io/9876543
```

---

## 📋 Étape 4 : Configurer l'app

1. Créer un fichier `.env` à la racine du projet (s'il n'existe pas déjà) :

   ```bash
   cp .env.example .env
   ```

2. Ajouter votre DSN dans `.env` :

   ```env
   SENTRY_DSN=https://abc123def456ghi789jkl012mno345pq@o1234567.ingest.sentry.io/9876543
   ```

3. **Important** : Ne commitez jamais le fichier `.env` (il est déjà dans `.gitignore`)

---

## ✅ Vérifier l'installation

### En développement

Sentry est automatiquement désactivé en mode dev pour ne pas polluer vos données.

### En production

1. Builder l'app : `npm run build`
2. Lancer l'app sur un device
3. Provoquer une erreur volontaire (ex: cliquer sur un bouton cassé)
4. Aller dans Sentry → **Issues** pour voir l'erreur apparaître

---

## 🔧 Configuration avancée

### Filtrer les erreurs

Le plugin Sentry (`plugins/sentry.client.ts`) est déjà configuré pour filtrer les erreurs communes non pertinentes :

- Erreurs réseau génériques
- Erreurs de navigateur bénignes

### Performance monitoring

Le `tracesSampleRate` est configuré à **20%** pour ne pas consommer tout le quota gratuit. Vous pouvez l'ajuster dans `plugins/sentry.client.ts`.

### Release tracking

Chaque erreur est automatiquement tagguée avec la version de l'app (depuis `package.json`) pour suivre les régressions entre versions.

---

## 📊 Utiliser Sentry

### Dashboard principal

- **Issues** : Voir toutes les erreurs groupées
- **Performance** : Métriques de performance (temps de chargement, API)
- **Releases** : Suivre les erreurs par version

### Comprendre une erreur

Chaque erreur contient :

- Stack trace complète
- Device info (OS, modèle, version)
- Breadcrumbs (actions avant l'erreur)
- Variables de contexte

### Configurer des alertes

1. Aller dans **Alerts** → **Create Alert Rule**
2. Choisir les conditions (ex: nouvelle erreur, pic d'erreurs)
3. Configurer la notification (email, Slack, etc.)

---

## 💡 Best Practices

1. ✅ **Résoudre les erreurs fréquentes en priorité** (onglet Issues, tri par fréquence)
2. ✅ **Créer des releases** à chaque déploiement pour tracking précis
3. ✅ **Configurer des alertes** pour les erreurs qui affectent >10 users
4. ✅ **Ajouter du contexte custom** si nécessaire (voir doc Sentry)

---

## 🆘 Ressources

- [Documentation Sentry Capacitor](https://docs.sentry.io/platforms/javascript/guides/capacitor/)
- [Dashboard Sentry](https://sentry.io)
- [Discord Support](https://discord.gg/sentry)
