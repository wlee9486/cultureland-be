import fs from 'fs';
import path from 'path';
import transformedEvents from './transFormedData/transformedEventsData.json';
import transformedVenues from './transFormedData/transformedVenuesData.json';

const xml2js = require('xml2js');

const KOPIS_KEY = process.env.KOPIS_KEY;
if (!KOPIS_KEY) throw new Error('KOPIS_KEY를 입력하세요');
const startIdx = 0;
const endIdx = 90000;

const directoryPath = path.join(__dirname, './transFormedData');

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

async function fetchDetailData(transformedDataList, apiName, startIdx, endIdx) {
  const dataToGetDetail = transformedDataList.slice(startIdx, endIdx);

  const detailDataList = [];

  for (const data of dataToGetDetail) {
    try {
      const response = await fetch(
        `http://kopis.or.kr/openApi/restful/${apiName}/${data.apiId}?service=${KOPIS_KEY}&newsql=Y`,
      );
      const xmlString = await response.text();
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          const detail = result.dbs.db;
          resolve(detail);
        });
      });
      if (result !== null) {
        detailDataList.push(result);
      }
    } catch (err) {
      console.error('An error occurred:', err);
    }
  }

  return detailDataList;
}

export async function saveDetailData(
  transformedDataList,
  apiName,
  exportFileName,
) {
  const startTime = Date.now();
  console.log(`[STAR-(1)] start fetching detail data`);

  const detailDataList = await fetchDetailData(
    transformedDataList,
    apiName,
    startIdx,
    endIdx,
  );

  const jsonData = JSON.stringify(detailDataList, null, 2);
  fs.writeFileSync(`${directoryPath}/${exportFileName}.json`, jsonData);

  const endTime = Date.now();
  console.log(
    `[END-(1)]fetching detail data in ${(endTime - startTime) / 1000} seconds.`,
  );
}

async function saveAllDetailData() {
  await saveDetailData(transformedVenues, 'prfplc', 'detailVenues');
  await saveDetailData(transformedEvents, 'pblprfr', 'detailEvents');
}

saveAllDetailData();
