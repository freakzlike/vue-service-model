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
        text: 'Guide (Old)',
        link: '/guide-old/'
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
        title: 'Guide (Old)',
        path: '/guide-old/',
        collapsable: false,
        children: [
          '/guide-old/base-model.md',
          '/guide-old/service-model.md',
          '/guide-old/fields.md',
          '/guide-old/model-manager.md',
          '/guide-old/components.md'
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
