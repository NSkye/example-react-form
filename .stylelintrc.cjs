const propertyGroups = require('stylelint-config-recess-order/groups');

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'selector-class-pattern': '^[A-z0-9\\-_]+$',
  },
};
