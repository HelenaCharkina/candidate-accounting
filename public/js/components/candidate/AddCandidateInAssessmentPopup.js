webix.ui({
    view: "popup",
    id: "addCandidateInAssess",
    width: 300, height: 500,
    body: {
        rows:[{
            view: "datatable",
            scroll: "y",
            select: "row",
            height: 300,
            //multiselect: "touch",
            id: "tableAddCandidateInAssess",
            columns: [
                {
                    id: "Date",
                    header: "Дата",
                    fillspace: true
                }
            ]
        },
            {
                view: "button",
                id: "buttonAddCandidateInAssess",
                value:"Добавить в ассессмент"
            }
            ]
    }
}).hide();


$$('buttonAddCandidateInAssess').attachEvent("onItemClick", function (id) {

    if (selectITEM) {
        let masId = [];
        ($$('tableAddCandidateInAssess').getSelectedItem(true)).forEach(function (item) {
            masId.push(item)
        })

        let item = {
            Id: selectITEM.Id,
            ListOfAssessment: [],
        }
        masId.forEach(function (a, i) {
            item.ListOfAssessment[i] = {
                Id: a.Id
            }
        })

        fetch(`/candidate/${selectITEM.Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then(res => res.text())
            .then(text => console.log(text))

        let newCandidate = selectITEM
        if (newCandidate.ListOfAssessment == null) {
            newCandidate.ListOfAssessment = []
        }

        for (const item of masId) {
            $$('listOfAssessment').add(item)
            newCandidate.ListOfAssessment.push(item)

            //update assessment
            let idx = ($$('assessmentTable').find(el => el.Id === item.Id))[0].id
            let editAssessment = $$('assessmentTable').getItem(idx)
            if (!editAssessment.Candidates) {
                editAssessment.Candidates = [];
            }
            editAssessment.Candidates.push(newCandidate);
            ($$('assessmentTable').updateItem(editAssessment.id, editAssessment))
        }
        ($$('studentTable').updateItem(selectITEM.id, newCandidate))
        $$('addCandidateInAssess').hide();
        webix.message("Кандидаты добавлены")
    }
})