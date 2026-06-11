export default {
  appId: 'com.memoflashcards.app',
  appName: 'Memo Flashcards',
  webDir: '.output/public',
  ios: {
    contentInset: 'never',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  ...(process.env.CAP_DEV_URL ? { server: { url: process.env.CAP_DEV_URL, cleartext: true } } : {}),
}
