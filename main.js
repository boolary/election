import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const API_BASE = 'https://www.rik.parlament.gov.rs/';
const token = '596xiHupbiFr2ni8JLxXl+obVGkGiRDwExBqJ2QtD4A=';
const method = 'POST';
const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Referer': 'https://www.rik.parlament.gov.rs/',
  'Origin': 'https://www.rik.parlament.gov.rs',
  'X-Requested-With': 'XMLHttpRequest',
  'Cookie': '_gid=GA1.3.558585754.1746692429; PHPSESSID=dij0efk8chdjhhv8t5gvu3dunu; _gat_gtag_UA_102970116_1=1; _ga_RS9DKB7GVQ=GS2.1.s1746993578$o19$g1$t1746993579$j0$l0$h0; _ga=GA1.1.100815485.1742808843'
}

const formatParams = (params) => {
  return {
    method,
    headers,
    body: new URLSearchParams({
      ...params
    })
  };
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const reformatOption = (html) => {
  const $ = cheerio.load(html);

  return $('option').map((_, option) => ({
    id: parseInt($(option).attr('data-id'), 10),
    value: parseInt($(option).attr('value'), 10),
    name: $(option).text().trim()
  })).get();
}


async function getElection({ election_type }) {
  const data = await fetch(`${API_BASE}get-elections`, formatParams({election_type}));
  const test = await data.text();
  console.log(JSON.parse(test));
  // try {
  //   const result = JSON.parse(data);
  //   console.log(result);
  // } catch (err) {
  //   console.error('JSON parse error:', err.message);
  // } 

  // if (data.error) {
  //   throw new Error(`Error fetching elections: ${data.error}`);
  // }
  // return data.elections;
}

async function getRegions({ election_type, election_round}) {
  const response = await fetch(`${API_BASE}get-regions/`, formatParams({election_type, election_round }));

  const data = await response.text();

  return JSON.parse(data);
}

async function getMunicipalities({ election_type, election_round, election_region }) {
  const response = await fetch(`${API_BASE}get-municipalities/`, formatParams({election_type, election_round, election_region }));

  const data = await response.text();

  return data;
}

async function getElectionStations({ election_type, election_round, election_region, election_municipality }) {
  const response = await fetch(`${API_BASE}get-election-stations/`, formatParams({ election_type, election_round, election_region, election_municipality }));

  const data = await response.text();

  return JSON.parse(data);
}

async function getResults({ should_update_pies, type, election_round, region, municipality, election_station }) {
  const data = await fetch(`${API_BASE}get_results/`, formatParams({should_update_pies, token, type, election_round, region, municipality, election_station }));
  const test = await data.text();
  console.log(JSON.parse(test));
  //return data.results;
}

async function run() {
  try {
    // const elections = await getElection({ election_type: 2 });
    // console.log(`Fetched ${elections.length} elections`);
    // await wait(10000);
    const election_type = 2;
    const election_round = 341140;

      const regions = await getRegions({ election_type, election_round });
      await wait(2000);
      console.log(regions)

      for (const election_region of Object.keys(regions.regions)) {
        const municipalitiesOptions = await getMunicipalities({election_type, election_round, election_region});
        await wait(2000);

        const municipalities = reformatOption(municipalitiesOptions);

        for (const municipality of municipalities) {
          console.log(`→→ Municipality: ${municipality.id}`);
           const stations = await getElectionStations({
              election_type,
              election_round,
              election_region,
              election_municipality: municipality.value
           });
          await wait(2000);
          console.log(stations);

          for (const election_station of Object.keys(stations)) {
               const result = await getResults({
                should_update_pies: 1,
                type: election_type,
                election_round,
                region: election_region,
                municipality: municipality.value,
                election_station
               });
            await wait(2000);
          }
        }
      }
  } catch (err) {
    console.error('Greška u obradi:', err.message);
  }
}

run();