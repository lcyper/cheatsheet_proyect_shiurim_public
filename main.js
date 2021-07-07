// url =
//   "https://www.chabad.org/webservices/Zmanim/CandleLighting/Load_CandleLightingWeeks?locationid=90&locationtype=1&save=1&tdate=6-1-2021";
// let date = getCurrentDate();
// let date = "7-4-2021";

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
let inputDatePicker = document.querySelector("input#fechaSemana");
window.onload = function () {
    inputDatePicker.value = new Date().toDateInputValue();
    fetchDate(inputDatePicker)
 };

 inputDatePicker.addEventListener("change", fetchDate, false);

async function fetchDate(e) {
    let inputValue = e.target ? e.target.value : e.value; // yyyy-mm-dd
    let dayOfTheWeek = e.target ? e.target.valueAsDate.getUTCDay() :e.valueAsDate.getUTCDay();
    let [yyyy, m, d] = inputValue.split("-");
    m = m.replaceAll("0", "");
    d = d.replaceAll("0", "");
    let date = m + "-" + d + "-" + yyyy;
    if (dayOfTheWeek != 0) {
        let diference = dayOfTheWeek - 7;
        let newDate = new Date(yyyy, m - 1, d);
        newDate.setDate(newDate.getDate() - diference);
        d = newDate.getDate();
        yyyy = newDate.getFullYear();
        m = newDate.getMonth() + 1;
        date = m + "-" + d + "-" + yyyy;
    }
    console.log(date);
    try {
        let response = await fetch("/json/" + date + ".json");
        response = await response.json();
        json = response;
        console.log(json);
        putData(json);
        document.getElementById("info").style.display = "block";
    } catch (error) {
        document.getElementById("info").style.display = "none";
        confirm("Error: archivo no encontrado!");
        throw error;
    }
}

function getCurrentDate() {
    let date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // if (month < 10) {
    //     month = "0" + month;
    // }
    let currentDate = `${month}-${day}-${year}`;
    // console.log(currentDate);
    return currentDate;
}


function putData(json) {
    let parasha = document.querySelector("#parasha");
    parasha.textContent = "Parasha: " + json.parasha;

    let fechaSemana = document.getElementById("fecha_semana");
    let concatFechas = "from: " + json.study[0].data.date + " <br/> to: " + json.study[6].data.date;
    fechaSemana.innerHTML = concatFechas;

    let fechaViernes = document.getElementById("fecha_viernes");
    fechaViernes.textContent = json.fechaViernes;

    let fragmentVelas = document.createDocumentFragment();
    for (const location of json.velas) {
        let tr = document.createElement("tr");
        let tdName = document.createElement("td");
        tdName.textContent = capitalizeTheFirstLetterOfEachWord(location.locationName);
        let tdTime = document.createElement("td");
        tdTime.textContent = location.time;
        tr.append(tdName, tdTime);
        fragmentVelas.appendChild(tr);

    }
    putDailyStudyByDay("#encendido_velas", fragmentVelas);

    let daysOfTheWeekSpanish = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Shabat"];

    let rambam_1_cap = document.createDocumentFragment(),
        rambam_3_cap = document.createDocumentFragment(),
        rambam_sefer_hamitzvot = document.createDocumentFragment(),
        haiomIom = document.createDocumentFragment(),
        jumashPortion = document.createDocumentFragment(),
        tehilimPortion = document.createDocumentFragment(),
        taniaPortion = document.createDocumentFragment();



    for (const elem of json.study) {
        // let day = elem.day.toString();
        let day = elem.day;


        // let tr = document.createElement("tr");
        // let tdName = document.createElement("td");
        // tdName.textContent = daysOfTheWeekSpanish[day];
        // let tdValue = document.createElement("td");



        Object.keys(elem.data).map((key) => {
            let tr = document.createElement("tr");
            let tdName = document.createElement("td");
            tdName.textContent = daysOfTheWeekSpanish[day];
            let tdValue = document.createElement("td");


            switch (key) {
                case "1 Chapter:":
                    rambam_1_cap.appendChild(tr);
                    break;
                case "3 Chapters:":
                    elem.data[key] = elem.data[key].replaceAll(",", "</br>");
                    rambam_3_cap.appendChild(tr);
                    break;
                case "Daily Mitzvah:":
                    elem.data[key] = elem.data[key].replaceAll("Positive Commandment", "P");
                    elem.data[key] = elem.data[key].replaceAll("Negative Commandment", "N");

                    rambam_sefer_hamitzvot.appendChild(tr);
                    break;
                case "date":
                    elem.data[key] = elem.data[key].replaceAll("/", "-");
                    haiomIom.appendChild(tr);
                    break;
                case "jumashPortion":
                    jumashPortion.appendChild(tr);
                    break;
                case "tehilimPortion":
                    tehilimPortion.appendChild(tr);
                    break;
                case "taniaPortion":
                    taniaPortion.appendChild(tr);
                    break;
                default:
                    console.error(key, "no implementada");
                    break;
            }
            tdValue.innerHTML = elem.data[key];
            tr.append(tdName, tdValue);
            // console.log(elem.data[key]);

        });
    }
    // console.log(rambam_1_cap);
    putDailyStudyByDay("#rambam_1_cap", rambam_1_cap);
    putDailyStudyByDay("#rambam_3_cap", rambam_3_cap);
    putDailyStudyByDay("#rambam_sefer_hamitzvot", rambam_sefer_hamitzvot);
    putDailyStudyByDay("#haiom_iom", haiomIom);
    putDailyStudyByDay("#jumash", jumashPortion);
    putDailyStudyByDay("#tehilim", tehilimPortion);
    putDailyStudyByDay("#tania", taniaPortion);

};

function putDailyStudyByDay(selector, fragment) {
    let table = document.querySelector(selector);
    //first element
    let firstElement = table.getElementsByTagName("tr")[0];
    fragment.prepend(firstElement);
    table.replaceChildren(fragment)
}

function capitalizeTheFirstLetterOfEachWord(words) {
    var separateWord = words.toLowerCase().split(' ');
    for (var i = 0; i < separateWord.length; i++) {
        separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
            separateWord[i].substring(1);
    }
    return separateWord.join(' ');
}