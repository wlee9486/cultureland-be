import fs from 'fs';
import path from 'path';
import events from './dataList/events.json';
import venue from './dataList/venues.json';

const directoryPath = path.join(__dirname, './transFormedData');

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function transformEvents(events) {
  return events.map((event) => ({
    apiId: event.mt20id,
    title: event.prfnm,
    start_date: event.prfpdfrom,
    end_date: event.prfpdto,
    venue_name: event.fcltynm,
    poster: event.poster,
    category: event.genrenm,
  }));
}

function transformVenues(venues) {
  return venues.map((venue) => ({
    apiId: venue.mt10id,
    name: venue.fcltynm,
  }));
}

// function transformFestivals(festivals) {
//   return festivals.map((festival) => ({
//     apiId: festival.mt20id,
//     title: festival.prfnm,
//     start_date: festival.prfpdfrom,
//     end_date: festival.prfpdto,
//     venue_name: festival.fcltynm,
//     poster: festival.poster,
//     category: festival.genrenm,
//   }));
// }

function transformEventsData() {
  const filePath = path.join(directoryPath, 'transformedEventsData.json');

  fs.writeFileSync(filePath, JSON.stringify(transformEvents(events), null, 2));
}

function transformVenuesData() {
  const filePath = path.join(directoryPath, 'transformedVenuesData.json');
  fs.writeFileSync(filePath, JSON.stringify(transformVenues(venue), null, 2));
}

// function transformFestivalsData() {
//   const filePath = path.join(directoryPath, 'transformedFestivalsData.json');
//   fs.writeFileSync(
//     filePath,
//     JSON.stringify(transformFestivals(festivals), null, 2),
//   );
// }

export function transformAllData() {
  transformEventsData();
  transformVenuesData();
  //transformFestivalsData();
}
transformAllData();
