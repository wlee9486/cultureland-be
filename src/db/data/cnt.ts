import eventsData from '../data/detailData/detailEvents.json';
import venueData from '../data/detailData/detailVenues.json';

console.log(
  `venue length by id : ${JSON.stringify(venueData).split('mt10id').length - 1}`,
);
console.log(`venue length by lengthFn : ${venueData.length}`);
console.log(
  `events length by id : ${JSON.stringify(eventsData).split('mt20id').length - 1}`,
);
console.log(`events length by lengthFn :${eventsData.length}`);
