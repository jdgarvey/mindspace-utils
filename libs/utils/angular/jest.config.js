module.exports = {
  name: 'utils-angular',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/utils/angular',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
