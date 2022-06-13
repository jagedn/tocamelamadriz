<template>
  <v-app light>

    <v-main>
      <v-container fluid>
        <Nuxt />
      </v-container>
    </v-main>
    
    <v-footer
      :absolute="true"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>
