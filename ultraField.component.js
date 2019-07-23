module.exports = angular.module('ultra').component('ultra', {
  bindings: {
    options: '<',
    fieldOptions: '<',
    modelValue: '=',
    storedValue: '=',
    searchingData: '=',
    fieldValue: '<',
    fieldValueData: '='
  },
  template: require('./ultraField.template.pug'),
  controller: function($scope, General) {
    var self = this
    let previousValue = undefined
    let optionsWithoutStyle = []

    this.$onInit = () => {
      this.searching = true
      this.options = []
      this.fieldValueData = []
      this.title = []
      this.dynamicArray = []
      this.savedValues = []

      this.class = General.generateUUID()
      this.classForSelectFocus = General.generateUUID()
      this.classForSearchField = General.generateUUID()
      this.classForDropdown = General.generateUUID()

      this.showDropdown = false
      this.blueBorder = false
      this.redClass = false
      this.backlightRed = false
      this.bottom = false

      if (this.storedValue && this.storedValue.length > 0) {
        this.modelValue = this.storedValue
        this.savedValues = this.storedValue
      }
      $('body').on('click', this.bodyClick.bind(this))
    }

    this.bodyClick = event => {
      if (!$(event.target).hasClass(`${this.class}`) && !$(event.target).hasClass(`${this.classForSearchField}`)) {
        if (this.showDropdown == true) {
          this.blueBorder = false
          this.showDropdown = false
          if (
            this.fieldValueData.length == 0 &&
            !this.storedValue &&
            self.fieldOptions.templateOptions.required == true
          ) {
            $("label[for='" + this.fieldOptions.id + "']").addClass('ultra_errorLabelField')
            this.redClass = true
            this.backlightRed = false
          } else {
            this.redClass = false
            this.backlightRed = false
            $("label[for='" + this.fieldOptions.id + "']").removeClass('ultra_errorLabelField')
          }
        }
        $scope.$apply()
      }
    }
    // Сброс данных поля по кнопке Х
    this.resetDataField = () => {
      this.title = []
      this.modelValue = ''
      this.fieldValueData = ''
      this.dynamicArray = []
      this.savedValues = []
      this.searchingText = null
      this.searchingData = {}
    }
    // Удаление заголовка и связанных с ним данных
    this.titleDelete = title => {
      this.title = this.title.filter(item => item.id != title.id)
      this.modelValue = this.modelValue.filter(item => item != title.id && item !== null)
      this.savedValues = this.savedValues.filter(item => item != title.id)
      delete this.dynamicArray[title.id]
      this.fieldValueData = this.dynamicArray.filter(element => element !== null).join(', ')
    }
    this.dropdownOpen = event => {
      if (!self.fieldOptions.data.disabledField) {
        if (this.showDropdown == false) this.showDropdown = true
        else if (this.showDropdown == true) this.showDropdown = false
        if (this.redClass) this.backlightRed = true
        this.blueBorder = true
        let bottomField = document.getElementsByClassName(this.classForSelectFocus)[0].getBoundingClientRect().bottom
        let bottom =
          $(window).height() -
          event.clientY -
          $('.' + this.classForDropdown).height() -
          $('.' + this.classForSelectFocus).height()
        if (
          Math.abs(bottom) < $('.' + this.classForDropdown).height() &&
          bottomField >= $('.' + this.classForDropdown).height()
        ) {
          this.bottom = true
          $('.' + this.classForDropdown).css({ bottom: '100%' })
        } else {
          this.bottom = false
          $('.' + this.classForDropdown).css({ bottom: 'inherit' })
        }
        setTimeout(() => {
          document.getElementsByClassName(this.classForSearchField)[0].focus()
        }, 0)
      }
    }
    // Разделяет строку поиска (searchingText) по divider-у, например по ,
    const dividingSearchingText = searchingText => {
      return searchingText.split(self.fieldOptions.data.divider)
    }
    //экранирование спецсимволов в строке поиска
    this.escapeRegExp = text => {
      let textStr = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      if (textStr.indexOf('\\ ') == 0) return textStr.replace(/\\ /g, '')
      return textStr
    }
    // Подсвечивает совпадения в результате поиска
    const highlightResults = (item, fieldData, searchingText) => {
      let searchingValue = dividingSearchingText(searchingText)
      if (self.fieldOptions.data.withoutMask) {
        searchingValue.forEach((value, index) => {
          fieldData.filter.forEach((element, count) => {
            if (item[element] && value) {
              try {
                let newStr = this.escapeRegExp(value)
                let regexp = new RegExp(newStr.trim(), 'ig')
                item[element] = item[element].replace(regexp, str => {
                  return '<span class="ultra_highlight">' + str + '</span>'
                })
              } catch (e) {
                console.log('error: ', e)
              }
            }
          })
        })
      } else if (fieldData.filter) {
        fieldData.filter.forEach((value, index) => {
          if (item[value] && searchingValue[index]) {
            try {
              let newStr = this.escapeRegExp(searchingValue[index])
              let regexp = new RegExp(newStr.trim(), 'ig')
              item[value] = item[value].replace(regexp, str => {
                return '<span class="ultra_highlight">' + str + '</span>'
              })
            } catch (e) {
              console.log('error: ', e)
            }
          }
        })
      }
    }
    // Создает фильтр
    const createFilter = searchingText => {
      if (!searchingText) return
      let filter = {}
      let splitText = searchingText.split(self.fieldOptions.data.divider)
      if (self.fieldOptions.data.withoutMask) {
        if (splitText)
          splitText.forEach((item, index) => {
            if (item) filter['param' + ++index] = item.trim()
          })
      } else if (self.fieldOptions.data.filter) {
        //Для поиска по заданным в поле фильтрам
        self.fieldOptions.data.filter.forEach((item, index) => {
          if (splitText[index]) filter[item] = splitText[index].trim()
        })
      }
      return filter
    }
    // Добавление нового заголовка
    const putTitle = (title, key, id) => {
      this.title[key] = {
        value: title,
        key: key,
        id: id,
        valueProp: self.fieldOptions.data.valueProp
      }
    }

    this.$doCheck = () => {
      let currentValue = this.searchingText
      if (!angular.equals(currentValue, previousValue)) {
        previousValue = currentValue
        this.searching = true
        this.options = []
        this.searchingData = createFilter(currentValue)
      }
    }

    this.$onChanges = changes => {
      if (changes.fieldValue) {
        let currentFieldValue = []
        if (typeof changes.fieldValue.currentValue == 'object') {
          if (Object.keys(changes.fieldValue.currentValue)[0] != '0')
            currentFieldValue.push(changes.fieldValue.currentValue)
          else currentFieldValue = changes.fieldValue.currentValue
          currentFieldValue.forEach(fieldValue => {
            // Создание заголовков в поле для хранящихся значений (серое поле с крестиком)
            if (self.fieldOptions.data.titleField) {
              let title = []
              let length = title.length
              if (fieldValue)
                self.fieldOptions.data.titleField.forEach(titleField => {
                  if (fieldValue[titleField.name]) {
                    title[length] = {}
                    title[length].name = fieldValue[titleField.name]
                    title[length].label = titleField.label
                    if (titleField.non_bold_label) title[length].non_bold_label = titleField.non_bold_label
                    if (titleField.in_brackets) title[length].name = ' (' + title[length].name + ') '
                    if (titleField.descriptionField) title[length].name += ' ' + fieldValue[titleField.descriptionField]
                    if (titleField.descriptionLabel) title[length].name += ' ' + fieldValue[titleField.descriptionLabel]
                    length = title.length
                  }
                })
              putTitle(title, this.title.length, fieldValue[self.fieldOptions.data.valueProp])
            }
            // Создание динамически изменяемых данных (сделано специально для контракта, надо бы сделать универсальным)
            if (self.fieldOptions.data.dynamicValue) {
              if (fieldValue)
                self.fieldOptions.data.dynamicValue.forEach(dynamicValue => {
                  if (fieldValue[dynamicValue])
                    this.dynamicArray[fieldValue[self.fieldOptions.data.valueProp]] = fieldValue[dynamicValue]
                })
            }
            // Добавление динамически данных в переменную, которую можно получить со стороны поля (сделано тоже специально для контракта)
            this.fieldValueData = this.dynamicArray.filter(element => element !== null).join(', ')
          })
        }
      }
      if (changes.options) {
        this.searching = false
        // Список найденных результатов без тегов для подсветки
        optionsWithoutStyle = angular.copy(this.options)
        // Подсветка совпадения в результате поиска
        if (this.searchingText) {
          changes.options.currentValue.forEach(item => {
            item = highlightResults(item, self.fieldOptions.data, this.searchingText)
          })
        }
      }
    }
    // Добавление нового значения в модель
    const putValueInModel = item => {
      this.savedValues.push(item)
      return this.savedValues
    }

    this.onChoose = property => {
      // Удаляю все оставшиеся теги для подсветки
      for (var key in property) {
        if (typeof property[key] === 'string')
          property[key] = property[key].replace('<span class="ultra_highlight">', '').replace('</span>', '')
      }
      let valueProp = property[self.fieldOptions.data.valueProp]
      if ($.inArray(valueProp, this.modelValue) == -1) {
        this.fieldValueData = property
        let title = []
        let length = title.length
        if (self.fieldOptions.data.titleField) {
          // Создание нового заголовка из списка найденных результатов без тегов для подсветки
          self.fieldOptions.data.titleField.forEach(titleField => {
            if (
              optionsWithoutStyle.filter(item => item[self.fieldOptions.data.valueProp] == valueProp)[0][
                titleField.name
              ]
            ) {
              title[length] = {}
              title[length].name = optionsWithoutStyle.filter(
                item => item[self.fieldOptions.data.valueProp] == valueProp
              )[0][titleField.name]
              title[length].label = titleField.label
              if (titleField.non_bold_label) title[length].non_bold_label = titleField.non_bold_label
              if (titleField.in_brackets) title[length].name = ' (' + title[length].name + ') '
              if (titleField.descriptionField)
                title[length].name +=
                  ' ' +
                  optionsWithoutStyle.filter(item => item[self.fieldOptions.data.valueProp] == valueProp)[0][
                    titleField.descriptionField
                  ]
              if (titleField.descriptionLabel) title[length].name += ' ' + titleField.descriptionLabel
              length = title.length
            }
          })
        }
        // Добавление нового значения и его заголовка
        if (!self.fieldOptions.data.multiSelect) {
          this.modelValue = valueProp
          putTitle(title, 0, property[self.fieldOptions.data.valueProp])
        } else {
          // Добавление нового заголовка
          putTitle(title, this.title.length, property[self.fieldOptions.data.valueProp])
          // Обновление динамических данных (создано специально для контракта)
          if (self.fieldOptions.data.dynamicValue) {
            self.fieldOptions.data.dynamicValue.forEach(dynamicValue => {
              if (property[dynamicValue]) this.dynamicArray[valueProp] = property[dynamicValue]
            })
            // Добавление динамически данных в переменную, которую можно получить со стороны поля (сделано тоже специально для контракта)
            self.fieldValueData = this.dynamicArray.filter(element => element !== null).join(', ')
          }
          this.modelValue = putValueInModel(valueProp)
        }
      }
    }
  }
})
