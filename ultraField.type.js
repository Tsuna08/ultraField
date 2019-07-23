module.exports = {
  name: 'ultraField',
  template: `
  <ultra
    ng-model="model[options.key]"
    options="to.options"
    field-options="options"
    field-value="fieldValue"
    field-value-data="fieldValueData"
    model-value="modelValue"
    stored-value="storedValue"
    searching-data="searchingData">
  </ultra>`,
  wrapper: ['bootstrapLabel', 'bootstrapHasError'],
  controller: $scope => {
    $scope.$watch('modelValue', newValue => {
      if (newValue && newValue.length != 0) $scope.model[$scope.options.key] = newValue
      else if (newValue == '') {
        if ($scope.options.data.defaultResetValue)
          $scope.model[$scope.options.key] = $scope.options.data.defaultResetValue
        else $scope.model[$scope.options.key] = null
      } else if ($scope.storedValue && newValue && newValue.length == 0)
        $scope.model[$scope.options.key] = $scope.storedValue
      else $scope.model[$scope.options.key] = $scope.storedValue
    })
    $scope.storedValue = $scope.model[$scope.options.key]
  }
}
