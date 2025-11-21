import type { SqliteConnection } from '~/lib/sqlite'

// Connexion singleton partagée entre tous les composables
let dbConnection: SqliteConnection | null = null
let isInitializing = false
let initPromise: Promise<SqliteConnection> | null = null

export const useDatabase = () => {
  const getDbConnection = async (): Promise<SqliteConnection> => {
    // Si une connexion existe déjà, la retourner
    if (dbConnection) {
      return dbConnection
    }

    // Si une initialisation est en cours, attendre qu'elle se termine
    if (isInitializing && initPromise) {
      return initPromise
    }

    // Démarrer l'initialisation
    isInitializing = true
    initPromise = initializeConnection()

    try {
      dbConnection = await initPromise
      return dbConnection
    } finally {
      isInitializing = false
      initPromise = null
    }
  }

  const initializeConnection = async (): Promise<SqliteConnection> => {
    const { default: openDatabase } = await import('~/lib/sqlite')
    const connection = await openDatabase('memoflash')

    // Initialiser toutes les tables nécessaires
    await connection.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default-user',
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default-user',
        collection_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        compartment INTEGER NOT NULL DEFAULT 1,
        next_review_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER,
        archived INTEGER DEFAULT 0,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        total_reviews INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        first_name TEXT,
        goal TEXT,
        situation TEXT,
        notification_hour TEXT DEFAULT '20:00',
        language TEXT DEFAULT 'en',
        onboarding_completed_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    `)

    return connection
  }

  const closeConnection = async (): Promise<void> => {
    if (dbConnection) {
      await dbConnection.close()
      dbConnection = null
    }
  }

  return {
    getDbConnection,
    closeConnection,
  }
}
