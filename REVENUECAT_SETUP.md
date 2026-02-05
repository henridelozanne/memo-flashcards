# Configuration RevenueCat - Guide complet

## 📋 Étapes à suivre

### 1. Créer un compte RevenueCat

1. Aller sur [https://app.revenuecat.com/signup](https://app.revenuecat.com/signup)
2. Créer un compte gratuit
3. Créer un nouveau projet "Memo Flashcards"

### 2. Configurer l'app dans RevenueCat

1. Dans le dashboard RevenueCat, aller dans "Apps"
2. Cliquer sur "Add new app"
3. Remplir les informations :
   - **App name**: Memo Flashcards
   - **Bundle ID**: `votre.bundle.id` (doit correspondre à celui dans `capacitor.config.ts`)
   - **Platform**: iOS

### 3. Obtenir la clé API

1. Dans RevenueCat, aller dans **Project Settings** > **API Keys**
2. Copier la clé **iOS API Key** (publique)
3. L'ajouter dans le fichier `composables/useSubscription.ts` :
   ```typescript
   const apiKey = 'votre_cle_api_revenuecat_ici'
   ```

### 4. Créer les produits dans App Store Connect

1. Aller sur [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sélectionner votre app
3. Aller dans **Subscriptions** (sous "Monetization")
4. Créer un **Subscription Group** (ex: "Premium")
5. Créer les 2 abonnements :

#### Abonnement mensuel

- **Product ID**: `memo_premium_monthly` (noter cet ID)
- **Reference name**: Premium Monthly
- **Duration**: 1 month
- **Price**: Choisir le prix (ex: 4.99€)
- **Free trial**: 7 days (optionnel)

#### Abonnement à vie (Non-Consumable)

- **Product ID**: `memo_premium_lifetime` (noter cet ID)
- **Reference name**: Premium Lifetime
- **Type**: Non-Consumable In-App Purchase
- **Price**: Choisir le prix (ex: 49.99€)

### 5. Lier les produits dans RevenueCat

1. Dans RevenueCat, aller dans **Products**
2. Cliquer sur **Add Product**
3. Pour chaque produit :
   - **Product identifier**: Utiliser l'ID d'App Store Connect
   - **Platform**: iOS
   - **Type**: Subscription (monthly) ou Non-consumable (lifetime)

### 6. Créer un Entitlement

1. Dans RevenueCat, aller dans **Entitlements**
2. Cliquer sur **Add Entitlement**
3. Créer :
   - **Identifier**: `premium` (utilisé dans le code)
   - **Name**: Premium Access
4. Attacher les 2 produits à cet entitlement

### 7. Créer une Offering

1. Dans RevenueCat, aller dans **Offerings**
2. Créer une nouvelle offering :
   - **Identifier**: `default` (sera automatiquement la "current offering")
   - **Name**: Default Offering
3. Ajouter les packages :
   - **Monthly Package**: Type "MONTHLY", lier au produit `memo_premium_monthly`
   - **Lifetime Package**: Type "LIFETIME", lier au produit `memo_premium_lifetime`

### 8. Configurer le Sandbox Testing

1. Sur votre Mac, créer un compte Sandbox dans App Store Connect
2. Sur l'iPhone/simulateur :
   - Settings > App Store > Sandbox Account
   - Se connecter avec le compte sandbox

### 9. Mettre à jour l'API Key dans le code

Dans `composables/useSubscription.ts`, ligne 9-10 :

```typescript
// Remplacer par votre vraie clé API
const apiKey = 'VOTRE_CLE_API_IOS_REVENUECAT'
```

### 10. Optionnel : Lier l'utilisateur Supabase

Dans `plugins/revenuecat.client.ts` ou après l'auth Supabase :

```typescript
const { setUserId } = useSubscription()
const userId = await getCurrentUserId()
if (userId) {
  await setUserId(userId)
}
```

## 🧪 Tester le flow complet

### Test 1 : Sandbox Purchase

1. Builder et lancer l'app sur un device/simulateur iOS
2. Compléter l'onboarding jusqu'au paywall
3. Tester l'achat avec le compte sandbox
4. Vérifier que l'abonnement est actif dans les Settings

### Test 2 : Restore Purchases

1. Désinstaller l'app
2. Réinstaller et compléter l'onboarding
3. Aller dans Settings
4. Cliquer sur "Restaurer les achats"
5. Vérifier que l'abonnement est restauré

### Test 3 : Subscription Status

Dans le dashboard RevenueCat :

1. Aller dans **Customers**
2. Chercher par l'App User ID
3. Vérifier que l'entitlement "premium" est actif

## 📊 Structure des fichiers créés

```
composables/
  useSubscription.ts      → Logique RevenueCat (init, purchase, restore)

store/
  subscription.ts         → État global (isSubscribed, offerings, customerInfo)

pages/
  paywall.vue             → Écran d'achat (intégration RevenueCat)
  settings.vue            → Bouton "Restore Purchases"

plugins/
  revenuecat.client.ts    → Init automatique au démarrage

components/icons/
  IconRefresh.vue         → Icône pour "Restore Purchases"
```

## 🔑 Points importants

1. **API Key** : Ne jamais commiter la vraie clé API dans Git (pour l'instant c'est OK car c'est une clé publique, mais créer une variable d'environnement serait mieux)

2. **Product IDs** : Doivent être identiques entre App Store Connect et RevenueCat

3. **Entitlement** : Le code vérifie `customerInfo.entitlements.active`, donc au moins un entitlement doit être configuré

4. **Package Types** :
   - `MONTHLY` pour l'abonnement mensuel
   - `LIFETIME` pour l'achat à vie

5. **Free Trial** : Configuré dans App Store Connect, pas dans le code

## 🚀 Prochaines étapes

Après la configuration :

1. ✅ Tester les achats sandbox
2. ⏭️ Créer un middleware pour protéger les features premium
3. ⏭️ Tester en production avec des comptes réels
4. ⏭️ Analyser les conversions dans le dashboard RevenueCat

## 📚 Ressources

- [Documentation RevenueCat](https://docs.revenuecat.com/)
- [RevenueCat Capacitor SDK](https://github.com/RevenueCat/purchases-capacitor)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Sandbox Testing Guide](https://docs.revenuecat.com/docs/sandbox)
