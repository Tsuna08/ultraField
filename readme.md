```javascript
{
  key: 'medical_use',
    type: 'ultraField',
    templateOptions: {
      label: 'Наименование лекарственных препаратов по МНН',
      required: true
    },
    data: {
      mainTitle: 'mnn',                       // Жирный заголовок
      additionalTitle: 'trade_name',          // Простой заголовок
      titleInBrackets: 'trade_name',          // Простой заголовок в скобках
      description: [                          // Дополнительное описание. Например 'Остаток на складе:'(label) 10(quantity) упак.(esklp_prep_dosage_pack),
                                              // 'Цена:'(label) 120(price) '₽'(descriptionLabel)
        { name: 'form', label: 'Форма выпуска:' },
        { name: 'quantity', label: 'Остаток на складе:', descriptionField: 'esklp_prep_dosage_pack' },
        { name: 'price', label: 'Цена:', descriptionLabel: '₽' }
      ],
      titleField: [                           // Значения переменных, которые будут отображаться в поле на сером фоне
        { name: 'mnn', label: 'МНН:' },
        { name: 'form', label: 'Форма выпуска:' },
        { name: 'dosage_text', label: 'Дозировка:' },
        { name: 'dosage_text', non_bold_label: 'Дозировка:' }, // - не жирный Лэйбл перед name
        { name: 'dosage_text', label: 'Дозировка:', in_brackets: true }, //in_brackets - оборачивает в скобки
        { name: 'quantity', label: 'Остаток на складе:', descriptionField: 'esklp_prep_dosage_pack' , descriptionLabel: '₽'  },
      ],
    withoutMask: true,                        // Поиск без жесткой маски, на бэкенд отправляется набор параметров (param1, param2...).
                                              // Бэкенд должен уметь работать с такими параметрами
    filter: ['mnn', 'form', 'dosage_text'],   // Фильтры, по этим переменным будет производиться подсветка совпадений
    dynamicValue: ['okpd2'],                  // Динамически изменяемое значение при множественном выборе
    valueProp: 'id',                          // Значение переменной, которое будет возвращаться
    multiSelect: true,                        // Множественный выбор (если единственный выбор, то не будет серого фона)
    disabledField: false,                     // Поле не активно (серый фон),
    defaultResetValue: null,                  // Значение, которое будет возвращать поле, если будет нажата кнопка с крестиком
    divider: ',',                             // Разделитель переменных при поиске. Например, 'аспирин, таблетки'
    icon: 'fa fa-medkit',                     // Иконка вначале каждой строки списка
    placeholder: 'Введите МНН',
    inline: false                             // вывод Дополнительного описания и основногозаголовка
                                              // без переноса на новую строку
    noEndPoint: true                          // если значение true, то точка после каждого заголовка НЕ                                              ставиться
    },
    controller: ($scope, Data, Pharmacy) => {
      Data.get(Pharmacy.DirectoryMedicines.list, {    // Загрузка данных для отображения titleField (серый блок в поле)
        filter: { id: $scope.model.medical_use }
      }).then(response => {
        $scope.fieldValue = response.results          // Результат запроса обязательно присвоить переменной $scope.fieldValue
      })
      $scope.$watchGroup(['searchingData', 'fieldValueData'], newValue => { searchingData - строка поиска
        fieldValueData - Все данные выбранного значения из выпадающего списка
        Data.list(Pharmacy.DirectoryMedicines.list, { // Загрузка данных для выпадающего списка
          filter: {
            limit: !newValue[0] ? 10 : 200,
            mnn\_\_icontains: newValue[0] ? newValue[0].mnn : '',
            drug_form_icontains: newValue[0] ? newValue[0].form : ''
          }
        }).then(response => {
          $scope.to.options = response.results        // Результат запроса обязательно нужно присвоить
                                                      // переменной $scope.to.options иначе список не отобразится

          $scope.options.data.count = response.count // Число результатов запроса обязательно нужно присвоить
                                                    // переменной $scope.options.data.count
        })
        $scope.model.code_okpd2_text = newValue[1] && newValue[1].length != 0 ? newValue[1] : ''
      })
    }
}
```
