import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '*.md',
  ],
  rules: {
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})
