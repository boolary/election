import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { insertRegions } from './db/queries/insertRegions.js';
import { insertMunicipalities } from './db/queries/insertMunicipalities.js';
import { insertStations } from './db/queries/insertStations.js';
import { insertStats } from './db/queries/insertStats.js';
import { insertResults } from './db/queries/insertResults.js';

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

const regex = /<div class=['"]table-file active['"]>.*?<a href=['"]([^'"]+\.pdf)['"]/s;
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

async function getStats({ should_update_pies, type, election_round, region, municipality, election_station }) {
  const data = await fetch(`${API_BASE}get_results/`, formatParams({should_update_pies, token, type, election_round, region, municipality, election_station }));
  const result = await data.text();
  return JSON.parse(result);
}

async function run() {
  try {
    const election_type = 2;
    const election_round = 341140;

    const regions = await getRegions({ election_type, election_round });
    await wait(1000);
    const formattedRegions = formatRegions(regions.regions);
    await insertRegions(formattedRegions);

      for (const [index, election_region] of Object.keys(formattedRegions).entries()) {
        const municipalitiesOptions = await getMunicipalities({election_type, election_round, election_region});
        await wait(1000);
        const regionId = index + 1;
        const municipalities = reformatOption(municipalitiesOptions);
        const formattedMunicipalities = formatMunicipalities(municipalities, regionId);
        await insertMunicipalities(formattedMunicipalities);

        for (const [index, municipality] of Object.keys(municipalities).entries()) {
          const municipalityId = index + 1;
           const stations = await getElectionStations({
              election_type,
              election_round,
              election_region,
              election_municipality: municipalities[index].value
           });
          await wait(1000);
          await insertStations(formatStations(stations.election_stations, municipalityId));

          
          for (const [station_index, external_id] of Object.keys(stations.election_stations).entries()) {
              const stats = await getStats({
                should_update_pies: 1,
                type: election_type,
                election_round,
                region: parseInt(election_region),
                municipality: municipalityId,
                election_station: parseInt(external_id, 10)
              });
            
              await wait(1000);
              const formattedStationsStats = formatStationStats(stats, (index + 1) * (station_index + 1), 1);
              await insertStats(formattedStationsStats);

              const results = formatStationsResults(stats.table_data, (index + 1) * (station_index + 1), 1, stats.minute_from_election_station.match(regex)[1]);
              await insertResults(results);


              
          }
        }
      }
  } catch (err) {
    console.error('Greška u obradi:', err.message);
  }
}

function formatRegions(raw) {
  return Object.entries(raw).map(([external_id, name]) => ({
    external_id,
    name
  }));
}

function formatMunicipalities(raw, region) {
  return raw.map(({ name, value }) => ({
    name,
    external_id: value,
    region_id: region
  }));
}

function formatStations(raw, municipality) {
  return Object.entries(raw).map(([external_id, name]) => ({
    external_id,
    name,
    municipality_id: municipality
  }));
}

function formatStationStats(raw, polling_station_id, election_id) {
  return {
    total_votes: parseInt(raw.stat_sum_numbers.total_voters.replace('.', ''), 10),
    votes: parseInt(raw.stat_sum_numbers.available.replace('.', ''), 10),
    valid_votes: raw.sum_config.data.datasets[0].data[0],
    invalid_votes: raw.sum_config.data.datasets[0].data[1],
    polling_station_id,
    election_id
  };
}

function formatStationsResults(raw, polling_station_id, election_id, document_path) {
  return raw.map(({ count_number, won_number, won_percent }) => ({
    external_id: count_number,
    election_id,
    polling_station_id,
    candidate_id: count_number,
    votes: parseInt(won_number.replace('.', ''), 10),
    percentage: won_percent,
    document_path
  }));
}

run();