module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@modules': './src/modules',
            '@services': './src/services',
            '@utils': './src/utils',
            '@context': './src/context',
            '@hooks': './src/hooks',
            '@types': './src/types',
            '@config': './src/config',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
