(function () {
    var table = document.getElementById('table'),
        tbody = table.tBodies[0],
        searchField = document.getElementById('search-field'),
        searchButton = document.getElementById('search-button'),
        nameField = document.getElementById('name-field'),
        countField = document.getElementById('count-field'),
        priceField = document.getElementById('price-field'),
        addNewButton = document.getElementById('add-button'),
        addUpdateButton = document.getElementById('add-update-button'),
        form = document.getElementById('form'),
        template = document.getElementById('template-row'),
        data = [
            {
                name: "First Product",
                count: 10,
                price: 100000,
                id: 1
            },
            {
                name: "Second Product",
                count: 20,
                price: 200000,
                id: 2
            }
        ],
        filteredData = data.slice();

    // вешаем обработчики событий
    searchButton.addEventListener('click', search);
    addNewButton.addEventListener('click', onAddNewClick);
    form.addEventListener('submit', addUpdateItem);
    priceField.addEventListener('focus', onPriceFocus);
    priceField.addEventListener('blur', onPriceBlur);
    nameField.addEventListener('input', isFormValid);
    countField.addEventListener('input', onCountInput);
    priceField.addEventListener('input', isFormValid);
    table.addEventListener('click', onTableClick);

    // отрисовка таблицы
    function renderTable() {
        tbody.innerHTML = '';
        filteredData.forEach(function(item) {
            renderTableRow(item);
        })
    }

    // отрисовки отдельной строки таблицы
    function renderTableRow(item) {
        var row = template.cloneNode(true);

        row.id = '';
        row.className = '';

        row.dataset.id = item.id;
        row.cells[0].querySelector('.product-name').textContent = item.name;
        row.cells[0].querySelector('.product-count').textContent = item.count;
        row.cells[1].textContent = convertNumberToPrice(item.price);

        tbody.appendChild(row);
    }

    // поиск
    function search() {
        var text = searchField.value.trim().toLowerCase();

        if (text) {
            filteredData = data.filter(function(item) {
                return item.name.toLowerCase().indexOf(text) !== -1;
            });
        } else {
            filteredData = data.slice();
        }

        renderTable();
    }

    // обработчик нажатия на кнопку "Add New"
    function onAddNewClick() {
        nameField.value = '';
        countField.value = '';
        priceField.value = '';
        showForm(true);
    }

    // функция отображения формы добавления/изменения
    function showForm(isAdding, productId) {
        isFormValid();
        addUpdateButton.textContent = isAdding ? 'Add' : 'Update';

        if (isAdding) {
            form.classList.add('adding');
        } else {
            form.classList.remove('adding');
        }

        if (productId) {
            form.dataset.id = productId;
        } else {
            delete form.dataset.id;
        }
    }

    // добавление/изменение товара
    function addUpdateItem(event) {
        event.preventDefault();

        if (!isFormValid()) {
            return;
        }

        var name = nameField.value,
            price = convertPriceToNumber(priceField.value),
            count = parseInt(countField.value),
            item = {
                name: name,
                price: price,
                count: count,
                id: data.length + 1
            };

        data.push(item);
        filteredData.push(item);

        var productId = form.dataset.id;

        if (productId) {
            productId = parseInt(productId);
            var index1 = filteredData.findIndex(function(item) {
                    return item.id === productId;
                }),
                index2 = data.findIndex(function(item) {
                    return item.id === productId;
                });

            if (~index1) {
                filteredData.splice(index1, 1);
            }
            if (~index2) {
                data.splice(index2, 1);
            }
        }

        nameField.value = '';
        countField.value = '';
        priceField.value = '';
        showForm(true);

        renderTable();
    }

    // обработчик кликов внутри таблицы
    function onTableClick(event) {
        var el = event.target,
            id,
            item,
            index1,
            index2;

        if (el.closest('.sort')) { // сортировка
            el = el.closest('.sort');
            el.classList.toggle('sort-down');

            var isSortDown = el.classList.contains('sort-down'),
                sortParam = el.dataset.sortParam;

            filteredData = filteredData.sort(function(a, b) {
                if (isSortDown) {
                    return a[sortParam].toString() < b[sortParam].toString() ? 1 : -1;
                } else {
                    return a[sortParam].toString() > b[sortParam].toString() ? 1 : -1;
                }
            });

            renderTable();
        } else if (el.closest('.edit-button')) { // редактирование
            id = parseInt(el.closest('tr').dataset.id);
            item = filteredData.find(function(item) {
                return item.id === id;
            });

            nameField.value = item.name;
            countField.value = item.count;
            priceField.value = convertNumberToPrice(item.price);
            showForm(false, id);
        } else if (el.closest('.delete-button')) { // удаление
            if (confirm("Вы действительно хотите удалить товар?")) {
                id = parseInt(el.closest('tr').dataset.id);
                index1 = filteredData.findIndex(function(item) {
                    return item.id === id;
                });
                index2 = data.findIndex(function(item) {
                    return item.id === id;
                });

                if (~index1) {
                    filteredData.splice(index1, 1);
                }
                if (~index2) {
                    data.splice(index2, 1);
                }

                renderTable();
            }
        }
    }

    // обработчик фокуса на поле ввода цены
    function onPriceFocus() {
        priceField.value = convertPriceToNumber(priceField.value);
        priceField.type = "number";
    }

    // обработчик события, когда убрали фокус с поля ввода цены
    function onPriceBlur() {
        priceField.type = "text";
        priceField.value = convertNumberToPrice(priceField.value);
    }

    // обработчик ввода количества
    function onCountInput() {
        countField.value = countField.value.replace(/[^0-9]/g, '');
        isFormValid();
    }

    // конвертация числа в ценовое представление
    function convertNumberToPrice(number) {
        if (!number) {
            return number;
        }
        return '$' + parseFloat(number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    // обратная конвертация из ценового представления
    function convertPriceToNumber(price) {
        if (!price) {
            return 0;
        }
        return price.toString().replace(/[$,]/g, '');
    }

    // проверка корректности названия товара
    function isNameValid(name) {
        name = name.trim();
        return name.length >= 1 && name.length <= 15;
    }

    // проверка корректности цены товара
    function isPriceValid(price) {
        return !price || convertPriceToNumber(price) >= 0;
    }

    // проверка корректности количества товара
    function isCountValid(count) {
        return !count || parseInt(count) >= 0;
    }

    // проверка валидности формы
    function isFormValid() {
        var name = nameField.value,
            price = priceField.value,
            count = countField.value,
            isValid = true;

        if (isNameValid(name)) {
            unmarkFieldError(nameField);
        } else {
            markFieldError(nameField);
            isValid = false;
        }
        if (isCountValid(count)) {
            unmarkFieldError(countField);
        } else {
            markFieldError(countField);
            isValid = false;
        }
        if (isPriceValid(price)) {
            unmarkFieldError(priceField);
        } else {
            markFieldError(priceField);
            isValid = false;
        }

        return isValid;
    }

    // помечаем поле красной рамкой
    function markFieldError(field) {
        field.classList.add('error-field');
    }

    // убираем красную рамку
    function unmarkFieldError(field) {
        field.classList.remove('error-field');
    }

    // изначальная отрисовка формы
    renderTable();
})();