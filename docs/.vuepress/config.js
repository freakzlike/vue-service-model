module.exports = {
  base: '/vue-service-model/',
  title: 'vue-service-model',
  description: 'Vue.js library for handling REST service requests with caching, aggregation and model definitions',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  port: 8085,
  themeConfig: {
    repo: 'freakzlike/vue-service-model',
    logo: '/logo.png',
    docsDir: 'docs',
    lastUpdated: 'Last Updated',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    algolia: {
      apiKey: 'fe9b2afde6107c95fc541e87736e6103',
      indexName: 'vue-service-model'
    },
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
        path: '/guide/',
        collapsable: false,
        children: [
          '/guide/getting-started.md',
          '/guide/installation.md',
          '/guide/models.md',
          '/guide/fields.md',
          '/guide/service-model.md',
          '/guide/model-manager.md',
          '/guide/components.md',
          '/guide/configuration.md'
        ]
      },
      {
        title: 'API',
        collapsable: false,
        children: [
          '/api/base-model.md',
          '/api/service-model.md',
          '/api/fields.md',
          '/api/model-manager.md',
          '/api/configuration.md'
        ]
      }
    ]
  }
}
