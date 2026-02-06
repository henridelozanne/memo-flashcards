<template>
  <div class="relative h-full p-6">
    <div>
      <PageHeader :title="$t('settings.legalNotice')" back-button-visible @back="$router.back()" />

      <!-- Content -->
      <div class="mx-auto max-w-2xl">
        <div class="rounded-xl p-6 shadow-sm" :style="{ backgroundColor: 'var(--color-white)' }">
          <div class="flex flex-col gap-6 text-[var(--color-black)]">
            <!-- Éditeur -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.editor.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.editor.description') }}
                <a href="mailto:memo.flashcards.contact@gmail.com" class="text-[var(--color-primary)] underline">
                  memo.flashcards.contact@gmail.com
                </a>
              </p>
              <p class="text-sm leading-relaxed">{{ $t('legal.editor.address') }}</p>
            </section>

            <!-- Hébergement -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.hosting.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.hosting.description') }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ $t('legal.hosting.privacy') }}
              </p>
            </section>

            <!-- Données personnelles -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.personalData.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.personalData.collection') }}
              </p>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.personalData.ads') }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ $t('legal.personalData.deletion') }}
              </p>
            </section>

            <!-- Plateformes de distribution -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.distribution.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.distribution.platforms') }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ $t('legal.distribution.policies') }}
              </p>
            </section>

            <!-- Propriété intellectuelle -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.intellectualProperty.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.intellectualProperty.copyright') }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ $t('legal.intellectualProperty.prohibition') }}
              </p>
            </section>

            <!-- Conditions d'utilisation -->
            <section>
              <h2 class="mb-2 text-lg font-semibold">{{ $t('legal.termsOfUse.title') }}</h2>
              <p class="mb-2 text-sm leading-relaxed">
                {{ $t('legal.termsOfUse.version') }}
              </p>
              <p class="text-sm leading-relaxed">
                {{ $t('legal.termsOfUse.compliance') }}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LegalPage' })
</script>
