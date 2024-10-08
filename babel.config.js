module.exports = function(api) {
  api.cache(false);
  return {
    presets: ['babel-preset-expo'], // if you are using Expo
    plugins: [
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV', // Specify your environment variable name
          moduleName: '@env', // Specify the import module name
          path: 'env.d.ts', // Path to your .env file
          allowUndefined: true, // Allow undefined variables
          safe: false, // Set to true if you want to restrict to .env variables only
        },
      ],
    ],
  };
};