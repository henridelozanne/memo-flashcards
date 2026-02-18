# PostHog Analytics - Événements Trackés

Ce document liste tous les événements PostHog trackés dans l'application MemoLooper.

## Configuration

- **Package**: `posthog-js`
- **Plugin**: `plugins/posthog.client.ts`
- **Composable**: `composables/usePosthog.ts`
- **Variables d'environnement**:
  - `POSTHOG_KEY`: Clé API PostHog (requis en production)
  - `POSTHOG_HOST`: Host PostHog (par défaut: `https://app.posthog.com`)

## Événements

### 🃏 Gestion des Cartes

#### `card_created`

Déclenché quand une nouvelle carte est créée.

- **Properties**:
  - `collection_id`: ID de la collection
  - `compartment`: Compartiment initial (toujours 1)
  - `immediate_review`: Si la révision immédiate est activée

#### `card_updated`

Déclenché quand une carte est modifiée.

- **Properties**:
  - `card_id`: ID de la carte
  - `collection_id`: ID de la collection

#### `card_deleted`

Déclenché quand une carte est supprimée.

- **Properties**:
  - `card_id`: ID de la carte
  - `collection_id`: ID de la collection
  - `compartment`: Compartiment au moment de la suppression

#### `review_answer`

Déclenché quand l'utilisateur répond à une carte pendant une révision.

- **Properties**:
  - `card_id`: ID de la carte
  - `collection_id`: ID de la collection
  - `was_correct`: Boolean - si la réponse était correcte
  - `compartment_before`: Compartiment avant la réponse
  - `compartment_after`: Compartiment après la réponse
  - `total_reviews`: Nombre total de révisions de cette carte

### 📚 Gestion des Collections

#### `collection_created`

Déclenché quand une nouvelle collection est créée.

- **Properties**:
  - `collection_id`: ID de la collection
  - `collection_name_length`: Longueur du nom de la collection

#### `collection_updated`

Déclenché quand une collection est modifiée.

- **Properties**:
  - `collection_id`: ID de la collection
  - `new_name_length`: Longueur du nouveau nom

#### `collection_deleted`

Déclenché quand une collection est supprimée.

- **Properties**:
  - `collection_id`: ID de la collection

### 🎯 Sessions de Révision

#### `review_session_started`

Déclenché au début d'une session de révision.

- **Properties**:
  - `cards_count`: Nombre de cartes dans la session
  - `is_practice_mode`: Boolean - si c'est le mode pratique

#### `review_session_completed`

Déclenché à la fin d'une session de révision.

- **Properties**:
  - `cards_reviewed`: Nombre de cartes révisées
  - `correct_count`: Nombre de réponses correctes
  - `wrong_count`: Nombre de réponses incorrectes
  - `success_rate`: Pourcentage de réussite (0-100)
  - `is_practice_mode`: Boolean - si c'était le mode pratique

### 💳 Abonnement & Monétisation

#### `subscription_purchase_attempted`

Déclenché quand l'utilisateur tente d'acheter un abonnement.

- **Properties**:
  - `package_id`: ID du package RevenueCat
  - `product_id`: ID du produit

#### `subscription_purchased`

Déclenché quand l'achat est réussi.

- **Properties**:
  - `package_id`: ID du package RevenueCat
  - `product_id`: ID du produit acheté
  - `subscription_status`: Status de l'abonnement (`free`, `monthly`, `monthly_trial`, `lifetime`)

#### `subscription_purchase_cancelled`

Déclenché quand l'utilisateur annule l'achat.

- **Properties**:
  - `package_id`: ID du package RevenueCat

#### `subscription_purchase_failed`

Déclenché quand l'achat échoue.

- **Properties**:
  - `package_id`: ID du package RevenueCat
  - `error_code`: Code d'erreur
  - `error_message`: Message d'erreur

#### `subscription_restored`

Déclenché quand les achats sont restaurés.

- **Properties**:
  - `subscription_status`: Status de l'abonnement
  - `product_id`: ID du produit restauré
  - `is_subscribed`: Boolean - si l'utilisateur a un abonnement actif

### ⚙️ Paramètres & Préférences

#### `language_changed`

Déclenché quand l'utilisateur change la langue de l'application.

- **Properties**:
  - `previous_language`: Code de langue précédent (ex: `en`, `fr`)
  - `new_language`: Nouveau code de langue

#### `notification_time_changed`

Déclenché quand l'utilisateur change l'heure de notification.

- **Properties**:
  - `new_time`: Nouvelle heure (format HH:MM)
  - `previous_time`: Heure précédente (format HH:MM)

#### `practice_mode_option_changed`

Déclenché quand l'utilisateur change une option du mode pratique.

- **Properties**:
  - `option`: Nom de l'option changée (`mostFailed`, `onlyDue`, `onlyNew`, `excludeNew`, `swapQuestionAnswer`)
  - `value`: Boolean - nouvelle valeur de l'option

### 🎓 Onboarding

#### `onboarding_completed`

Déclenché quand l'utilisateur termine l'onboarding.

- **Properties**:
  - `subscription_status`: Status de l'abonnement à la fin de l'onboarding
  - `subscription_product_id`: ID du produit si abonné
  - `first_name`: Prénom de l'utilisateur
  - `goal`: Objectif choisi
  - `situation`: Situation choisie
  - `language`: Langue choisie
  - `notification_hour`: Heure de notification choisie

## Événements Automatiques

PostHog capture automatiquement:

- **Pageviews**: Toutes les pages visitées
- **Pageleave**: Quand l'utilisateur quitte une page
- **Autocapture**: Clicks, inputs, etc. (si activé)

## Notes d'Implémentation

- Les événements ne sont trackés qu'en **production** (pas en développement)
- Le plugin PostHog se charge automatiquement côté client
- Les événements sont envoyés de manière asynchrone et ne bloquent pas l'UI
- En cas d'erreur PostHog, l'app continue de fonctionner normalement
- Privacy : `respect_dnt` est activé (respecte Do Not Track)
- Session recording est **désactivé par défaut**

## Analyse des Données

### Métriques Clés à Surveiller

1. **Engagement**:
   - Nombre de cartes créées par utilisateur
   - Fréquence des sessions de révision
   - Taux de complétion des sessions

2. **Rétention**:
   - Utilisateurs actifs quotidiens
   - Retour après l'onboarding
   - Utilisation régulière des révisions

3. **Conversion**:
   - Taux de conversion onboarding → achat
   - Tentatives d'achat vs succès
   - Features bloquées demandant un upgrade

4. **Qualité**:
   - Taux de réussite aux révisions
   - Progression des compartiments
   - Collections les plus utilisées

## Outils Recommandés

Dans PostHog, vous pouvez créer:

- **Insights**: Graphiques personnalisés des événements
- **Funnels**: Parcours utilisateur (ex: onboarding → création carte → review)
- **Cohorts**: Segments d'utilisateurs basés sur leur comportement
- **Dashboards**: Tableaux de bord avec métriques clés

## Contact

Pour toute question sur l'implémentation PostHog:

- Documentation: https://posthog.com/docs
- Repository: https://github.com/henridelozanne/memo-flashcards
