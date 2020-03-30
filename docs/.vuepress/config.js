module.exports = {
  base: '/vue-service-model/',
  title: 'vue-service-model',
  description: 'Vue.js library for handling REST service requests with caching, aggregation and model definitions',
  port: 8085,
  themeConfig: {
    repo: 'freakzlike/vue-service-model',
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          {
            text: 'Guide',
            link: '/guide/'
          },
          {
            text: 'API Reference',
            link: '/api/'
          },
          {
            text: 'Release Notes',
            link: 'https://github.com/freakzlike/vue-service-model/releases'
          }
        ],
        sidebar: [
          '/',
          {
            title: 'Guide',
            collapsable: false,
            children: [
              '/guide/base-model.md',
              '/guide/service-model.md',
              '/guide/fields.md',
              '/guide/model-manager.md',
              '/guide/components.md'
            ]
          },
          {
            title: 'API',
            collapsable: false,
            children: [
              '/api/base-model.md',
              '/api/service-model.md',
              '/api/fields.md',
              '/api/model-manager.md'
            ]
          }
        ]
      }
    }
  }
}
