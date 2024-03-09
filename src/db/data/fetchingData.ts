import path from 'path';

const xml2js = require('xml2js');
const fs = require('fs');

const KOPIS_KEY = process.env.KOPIS_KEY;
if (!KOPIS_KEY) throw new Error('KOPIS_KEY를 입력하세요');

const startDate = 20190101;
const today = new Date();
const endDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
const rows = 100000;

const directoryPath = path.join(__dirname, './dataList');

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function fetchData(apiName, startDate, endDate, rows, exportFileName) {
  const startTime = Date.now();
  console.log(`[START] (${startDate} - ${endDate}) start fetching data`);

  fetch(
    `http://kopis.or.kr/openApi/restful/${apiName}?service=${KOPIS_KEY}&stdate=${startDate}&eddate=${endDate}&cpage=1&rows=${rows}&newsql=Y`,
  )
    .then((response) => response.text())
    .then((xmlString) => {
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(xmlString, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        }
        const data = result.dbs.db;

        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(`${directoryPath}/${exportFileName}.json`, jsonData);
        const endTime = Date.now();

        console.log(
          `[Success]${exportFileName}.json file has been saved. ${exportFileName} Data length is ${data.length} and it took ${(endTime - startTime) / 1000}`,
        );
      });
    })
    .catch((err) => console.error('An error occurred:', err));
}

function getEvents() {
  return fetchData('pblprfr', startDate, endDate, rows, 'events');
}
// function getFestival() {
//   return fetchData('prffest', startDate, endDate, rows, 'festivals');
// }
function getVenues() {
  return fetchData('prfplc', startDate, endDate, rows, 'venues');
}

async function fetchAllData() {
  const startTime = Date.now();
  await Promise.all([getEvents(), getVenues()]);
  const endTime = Date.now();
  console.log(`[END]fetching data in ${(endTime - startTime) / 1000} seconds.`);
}

fetchAllData();
