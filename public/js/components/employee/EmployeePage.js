const EmployeePage = {
    config: () => {
        return {

            id: "employeeList",

            rows: [{
                //меню поиска
                view: 'toolbar',
                elements: [
                    {
                        view: "search", placeholder: "Search..", width: 300, height: 50, id: "employeeSearch"
                    },
                    {},
                    {
                        view: "button", width: 150, value: 'Добавить', popup: "add_employee"
                    },
                ]
            },
                {//списки

                    cols: [
                        {

                            view: "datatable",
                            select: "row",
                            id: "employeeTable",
                            height: 500,
                            autoConfig: true,
                            scrollX: false,
                            fillspace : true,
                            columns: [
                                {
                                    fillspace: true,
                                    sort:"string",
                                    id: "FirstNameE",
                                    header: "Имя"
                                },
                                {
                                    fillspace: true,
                                    sort:"string",
                                    id: "MiddleNameE",
                                    header: "Отчество"
                                },
                                {
                                    fillspace: true,
                                    sort:"string",
                                    id: "LastNameE",
                                    header: "Фамилия"
                                }

                            ]
                        },
                        {
                            padding: 20,
                            rows: [
                                {
                                    view: "text",
                                    labelWidth: 150,
                                    label: "Имя",
                                    id: "infoFirstNameEmployee"
                                },
                                {
                                    view: "text",
                                    labelWidth: 150,
                                    label: "Отчество",
                                    id: "infoMiddleNameEmployee"
                                },
                                {
                                    view: "text",
                                    label: "Фамилия",
                                    labelWidth: 150,
                                    id: "infoLastNameEmployee"
                                },

                                {
                                    view: "text",
                                    label: "Телефон",
                                    labelWidth: 150,
                                    id: "infoPhoneEmployee"
                                },
                                {
                                    view: "text",
                                    labelWidth: 150,
                                    label: "Почта",
                                    id: "infoEmailEmployee"
                                },
                                {
                                    view: "list",
                                    id: "listOfAssessmentE",
                                    template:"#Date#",
                                    height: 200
                                },
                                {},
                                {
                                    cols:[
                                        {
                                            view: "button",
                                            id: "deleteEmployee",
                                            value: "Удалить",
                                        },
                                        {
                                            view: "button",
                                            id: "SaveEmployee",
                                            value: "Сохранить",
                                        },
                                        {
                                            view: "button",
                                            popup: "addEmployeeInAssess",
                                            value :"Добавить в ассессмент",
                                            id: "infoAssesE",
                                            height: 50
                                        }]
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    },

    init: () => {

        //окно подробной инфы
        $$('employeeTable').attachEvent("onItemClick", function (id) {

            let item = this.getItem(id);
            selectITEM = item;
            $$('listOfAssessmentE').clearAll();

            $$('infoFirstNameEmployee').setValue(item.FirstNameE);
            $$('infoMiddleNameEmployee').setValue(item.MiddleNameE);
            $$('infoLastNameEmployee').setValue(item.LastNameE);
            $$('infoPhoneEmployee').setValue(item.PhoneE);
            $$('infoEmailEmployee').setValue(item.EmailE);

            if (item.ListOfAssessment) {
                const list = $$('listOfAssessmentE');
                for (const assessment of item.ListOfAssessment) {
                    list.add(assessment)
                }
            }
        });

        //удаление
        $$('deleteEmployee').attachEvent("onItemClick", function () {

            if (selectITEM) {
                let table = $$('employeeTable');
                table.remove(table.getSelectedId());

                $$('infoFirstNameEmployee').setValue("");
                $$('infoMiddleNameEmployee').setValue("");
                $$('infoLastNameEmployee').setValue("");
                $$('infoPhoneEmployee').setValue("");
                $$('infoEmailEmployee').setValue("");

                fetch(`/employee/${selectITEM.Id}`, {
                    method: 'DELETE',
                }).then(text => console.log(text));
                webix.message("Сотрудник удален");

                //assessment update
                ($$('assessmentTable').serialize()).forEach(function (assessment) {
                    if (assessment.Employees) {
                        let index = assessment.Employees.findIndex(el => el.Id === selectITEM.Id);
                        assessment.Employees.splice(index, 1);
                    }
                });
            }
        });

        //редактирование
        $$('SaveEmployee').attachEvent("onItemClick", function () {
            if (selectITEM) {
                let item = {
                    FirstNameE: $$('infoFirstNameEmployee').getValue(),
                    MiddleNameE: $$('infoMiddleNameEmployee').getValue(),
                    LastNameE: $$('infoLastNameEmployee').getValue(),
                    PhoneE: $$('infoPhoneEmployee').getValue(),
                    EmailE: $$('infoEmailEmployee').getValue(),
                };
                fetch(`/employee/${selectITEM.Id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(item)
                })
                    .then(res => res.text())
                    .then(text => console.log(text))
                    .then($$('employeeTable').updateItem(selectITEM.id, item));
                webix.message("Изменения сохранены")
            }
        })

        //поиск
        $$("employeeSearch").attachEvent("onEnter", function () {

            let str = this.getValue();

            fetch(`/employee/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    str: str
                })
            })
                .then(res => res.json())
                .then(res => {
                    if (res) {
                        $$('employeeTable').clearAll();
                        res.forEach(function (item) {
                            $$('employeeTable').add(item)
                        })
                    } else {
                        webix.message("Сотрудники не найдены")
                    }
                })
        });

        //ДОБАВИТЬ СОТРУДНИКА В АССЕССМЕНТ:ЗАПОЛНЕНИЕ ТАБЛИЦЫ ВО ВСПЛЫВАЮЩЕМ ОКНЕ
        $$('infoAssesE').attachEvent('onItemClick', () => {
            if (selectITEM) {
                $$('tableAddEmployeeInAssess').clearAll();
                fetch('/assessment', {method: 'GET'})
                    .then(response => response.json())
                    .then(response => {
                            response.forEach(function (item) {
                                let x = true;
                                if (selectITEM.ListOfAssessment == null) {
                                    $$('tableAddEmployeeInAssess').add(item)
                                } else {
                                    selectITEM.ListOfAssessment.forEach(function (assessment) {
                                        if (assessment.Id === item.Id)
                                            x = false
                                    });
                                    if (x) {
                                        $$('tableAddEmployeeInAssess').add(item)
                                    }
                                }
                            })
                        }
                    )
            }
        });
    }
};