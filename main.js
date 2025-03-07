// url =
//   "https://www.chabad.org/webservices/Zmanim/CandleLighting/Load_CandleLightingWeeks?locationid=90&locationtype=1&save=1&tdate=6-1-2021";
// let date = getCurrentDate();
// let date = "7-4-2021";
let currentDate;

Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
let inputDatePicker = document.querySelector("input#fechaSemana");
window.onload = function () {
  inputDatePicker.value = new Date().toDateInputValue();
  fetchDate(inputDatePicker);
};

inputDatePicker.addEventListener("change", fetchDate, false);

async function fetchDate(e) {
  let inputValue = e.target ? e.target.value : e.value; // yyyy-mm-dd
  let dayOfTheWeek = e.target
    ? e.target.valueAsDate.getUTCDay()
    : e.valueAsDate.getUTCDay();
  let [yyyy, m, d] = inputValue.split("-");
  m = m.replaceAll(/^0/g, "");
  d = d.replaceAll(/^0/g, "");
  let date = m + "-" + d + "-" + yyyy;
  if (dayOfTheWeek != 0) {
    let newDate = new Date(yyyy, m - 1, d);
    newDate.setDate(newDate.getDate() - dayOfTheWeek);

    d = newDate.getDate();
    yyyy = newDate.getFullYear();
    m = newDate.getMonth() + 1;
    date = m + "-" + d + "-" + yyyy;
  }
  if (currentDate === date) {
    console.log("currentDate: ", currentDate);
    return;
  } else {
    currentDate = date;
  }
  console.log("file: ", date);
  try {
    // los archivos tienen la fecha del domingo (dia de inicio de la semana 0)
    let response = await fetch("./json/" + date + ".json");
    response = await response.json();
    json = response;
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

function generateUrlLocationFrom(locationUrl) {
  const params = getQueryParams(locationUrl);
  return `https://www.chabad.org/calendar/candlelighting_cdo/locationid/${params.locationid}/locationtype/1/tdate/${params.tdate}`;
}

function getQueryParams(url) {
  const params = {};
  const queryString = url.split("?")[1]; // Obtener la parte después de "?"

  if (!queryString) return params; // Retornar vacío si no hay parámetros

  queryString.split("&").forEach((param) => {
    const [key, value] = param.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value || ""); // Decodificar valores
  });

  return params;
}

function putData(json) {
  let parasha = document.querySelector("#parasha");
  parasha.textContent = "Parasha: " + json.parasha;

  let fechaSemana = document.getElementById("fecha_semana");
  let concatFechas =
    "from: " +
    json.study[0].data.date +
    " <br/> to: " +
    json.study[6].data.date;
  fechaSemana.innerHTML = concatFechas;

  let fragmentVelas = document.createDocumentFragment();
  let trCandlesDate = document.createElement("tr");
  //   trCandlesDate.appendChild(document.createElement("th"));

  let lightingDays = Object.keys(json.velas[0].time);
  for (const day of Object.keys(json.velas[0].time)) {
    let thTime = document.createElement("th");
    thTime.textContent = day;
    thTime.className = "candlesDate";
    trCandlesDate.appendChild(thTime);
  }

  // ['Candle Lighting', 'Shabbat Ends']
  const candleTitles = Object.values(json.velas[0].time)
    .map((value) => Object.keys(value))
    .flat();
  const trTimeTitles = document.createElement("tr");
  candleTitles.forEach((title) => {
    const thTitles = document.createElement("th");
    thTitles.className = "candlesDate";
    thTitles.innerText = title;
    trTimeTitles.appendChild(thTitles);
  });
  fragmentVelas.appendChild(trTimeTitles);

  for (const location of json.velas) {
    let tr = document.createElement("tr");
    let tdName = document.createElement("td");
    tdName.className = "locationName";

    let aName = document.createElement("a");
    aName.href = generateUrlLocationFrom(location.url);
    aName.textContent = capitalizeTheFirstLetterOfEachWord(
      location.locationName
    );
    tdName.appendChild(aName);

    let daysTime = [];
    let adjustIndex = 0;
    for (const day of Object.keys(location.time)) {
      let index = Object.keys(location.time).indexOf(day) + adjustIndex;
      if (lightingDays[index] !== day) {
        adjustIndex++;
        let tdTime = document.createElement("td");
        daysTime.push(tdTime);
      }

      for (const [key, value] of Object.entries(location.time[day])) {
        let tdTime = document.createElement("td");
        tdTime.textContent = value;
        tdTime.className = "time";
        daysTime.push(tdTime);
      }
    }

    tr.append(tdName, ...daysTime);
    fragmentVelas.appendChild(tr);
  }
  fragmentVelas.prepend(trCandlesDate);
  putDailyStudyByDay("#encendido_velas", fragmentVelas);

  let daysOfTheWeekSpanish = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Shabat",
  ];

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
          elem.data[key] = elem.data[key].replaceAll(
            "Positive Commandment",
            "P"
          );
          elem.data[key] = elem.data[key].replaceAll(
            "Negative Commandment",
            "N"
          );
          elem.data[key] = elem.data[key].split(":")[1].trim();

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
}

function putDailyStudyByDay(selector, fragment) {
  let table = document.querySelector(selector);
  //first element
  let firstElement = table.getElementsByTagName("tr")[0];
  fragment.prepend(firstElement);
  table.replaceChildren(fragment);
}

function capitalizeTheFirstLetterOfEachWord(words) {
  var separateWord = words.toLowerCase().split(" ");
  for (var i = 0; i < separateWord.length; i++) {
    separateWord[i] =
      separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
  }
  return separateWord.join(" ");
}
