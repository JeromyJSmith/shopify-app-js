import {LandingTemplateSchema} from '@shopify/generate-docs';

const data: LandingTemplateSchema = {
  id: 'guide-custom-apps',
  title: 'Custom apps',
  description:
    'You can use this package to build apps that are distributed in the Shopify Admin, also known as merchant custom apps.\n' +
    'These apps do not Authorize by OAuth, and instead use a access token that has been generated by the Shopify Admin.' +
    '\n\n> Note: Before creating a new app to be distributed with the shopify admin, you should be familiar with the [limitations](/docs/apps/launch/distribution#capabilities-and-requirements) of the different distribution types',
  sections: [
    {
      type: 'Generic',
      anchorLink: 'config-credentials',
      title: 'Configure your app',
      sectionContent:
        'After you have [created and configured your app](https://help.shopify.com/en/manual/apps/app-types/custom-apps) in' +
        '\nthe Shopify Admin update your code with the API Key, API Secret Key, and the access token.',
      codeblock: {
        title: 'Configure your app credentials',
        tabs: [
          {
            title: 'shopify.server.ts',
            code: './examples/guides/custom-apps/config-credentials.example.ts',
            language: 'ts',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'config-settings',
      title: 'Configure your app settings',
      sectionContent:
        'Configure `shopifyApp` with the following values' +
        '\n1. `distribution` - `AppDistribution.ShopifyAdmin`' +
        '\n1. `appUrl` - `https://localhost:3000` or other configured port' +
        '\n1. `isEmbeddedApp` - `false`, merchant custom apps cannot be embedded',
      codeblock: {
        title: 'Configure app settings',
        tabs: [
          {
            title: '/app/shopify.server.ts',
            code: './examples/guides/custom-apps/config-app-settings.example.ts',
            language: 'tsx',
          },
        ],
      },
    },
    {
      type: 'Generic',
      anchorLink: 'local-dev',
      title: 'Run your app locally',
      sectionContent:
        'Merchant custom apps are not compatible with the Shopify CLI, so you must start your app directly.' +
        '\nAfter your app is running you can access it at the following URL: `http://localhost:3000/app?shop=my-shop.myshopify.com`',
      codeblock: {
        title: 'Run your app',
        tabs: [
            {
                title: 'npm',
                language: 'sh',
                code: './examples/guides/custom-apps/run.npm.example.sh',
            },
            {
                title: 'yarn',
                language: 'sh',
                code: './examples/guides/custom-apps/run.yarn.example.sh',
            },
            {
                title: 'pnpm',
                language: 'sh',
                code: './examples/guides/custom-apps/run.pnpm.example.sh',
            },
        ],
      },
    },
    {
      type: 'Resource',
      title: 'Resources',
      anchorLink: 'resources',
      resources: [
        {
          name: 'Custom apps',
          subtitle: 'Create a new custom app',
          url: 'https://help.shopify.com/en/manual/apps/app-types/custom-apps',
          type: 'shopify',
        },
        {
            name: 'App distribution',
            subtitle: 'Understand the different distribution types',
            url: '/docs/apps/launch/distribution',
            type: 'shopify',
          },
      ],
    },
  ],
};

export default data;
