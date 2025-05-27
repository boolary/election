import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { insertRegions } from './db/queries/insertRegions.js';
import { insertMunicipalities } from './db/queries/insertMunicipalities.js';
import { insertStations } from './db/queries/insertStations.js';
import { insertStats } from './db/queries/insertStats.js';
import { insertResults } from './db/queries/insertResults.js';
import { getParams, reformatOption, regex, wait } from './utils.js';

const method = "POST";
const headers = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": "https://www.rik.parlament.gov.rs/",
    "Origin": "https://www.rik.parlament.gov.rs",
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": "_gid=GA1.3.558585754.1746692429; PHPSESSID=dij0efk8chdjhhv8t5gvu3dunu; _gat_gtag_UA_102970116_1=1; _ga_RS9DKB7GVQ=GS2.1.s1746993578$o19$g1$t1746993579$j0$l0$h0; _ga=GA1.1.100815485.1742808843"
};

const API_BASE = 'https://www.rik.parlament.gov.rs/';
const token = '596xiHupbiFr2ni8JLxXl+obVGkGiRDwExBqJ2QtD4A=';
const election_round = 341140;
const election_type = 2;

async function scrapRegions({ election_type, election_round}) {
  const response = await fetch(`${API_BASE}get-regions/`, getParams(method, headers, {election_type, election_round }));
  const data = await response.text();
  return JSON.parse(data);
}

async function scrapMunicipalities({ election_type, election_round, election_region }) {
  const response = await fetch(`${API_BASE}get-municipalities/`, getParams(method, headers, {election_type, election_round, election_region }));
  const data = await response.text();
  return data;
}

async function scrapStations({ election_type, election_round, election_region, election_municipality }) {
  const response = await fetch(`${API_BASE}get-election-stations/`, getParams(method, headers, { election_type, election_round, election_region, election_municipality }));
  const data = await response.text();
  return JSON.parse(data);
}

async function scrapeStats({ should_update_pies, type, election_round, region, municipality, election_station }) {
  const data = await fetch(`${API_BASE}get_results/`, getParams(method, headers, {should_update_pies, token, type, election_round, region, municipality, election_station }));
  const result = await data.text();
  return JSON.parse(result);
}

async function run() {
  try {
    await wait(1000);
    const scrapedRegions = await scrapRegions({ election_type, election_round });
    const extractedRegions = extractRegions(scrapedRegions.regions);
    const regions = await insertRegions(extractedRegions);

      for (const region of regions) {
        await wait(1000);
        const scrapedMunicipalities = await scrapMunicipalities({election_type, election_round, election_region: region.external_id });
        const formattedMunicipalities = reformatOption(cheerio.load(scrapedMunicipalities));
        const extractedMunicipalities = extractMunicipalities(formattedMunicipalities, region.id);
        const municipalities = await insertMunicipalities(extractedMunicipalities);

        for (const municipality of municipalities) {
          console.log(municipality);
          await wait(1000);
          const scrapedStations = await scrapStations({
            election_type,
            election_round,
            election_region: region.external_id,
            election_municipality: municipality.external_id
          });
          const extractedStations = extractStations(scrapedStations.election_stations, municipality.id);
          console.log(extractedStations);
          const stations = await insertStations(extractedStations);
          
          for (const station of stations) {
              await wait(1000);
              const scrapedStats = await scrapeStats({
                should_update_pies: 1,
                type: election_type,
                election_round,
                region: region.external_id,
                municipality: municipality.external_id,
                election_station: parseInt(station.external_id, 10)
              });
            
              const pdf = scrapedStats.minute_from_election_station?.match(regex);
              const extractedStationsStats = extractStationStats(scrapedStats, station.id, 1,  pdf.length ? pdf[1] : '');
              console.log(extractedStationsStats);
              await insertStats(extractedStationsStats);

              const results = formatStationsResults(scrapedStats.table_data, station.id, 1);
              console.log(results);
              await insertResults(results);
          }
        }
      }
  } catch (err) {
    console.error('Request error: ', err.message);
  }
}

function extractRegions(raw) {
  return Object.entries(raw).map(([external_id, name]) => ({
    external_id,
    name
  }));
}

function extractMunicipalities(raw, region) {
  return raw.map(({ name, value }) => ({
    name,
    external_id: value,
    region_id: region
  }));
}

function extractStations(raw, municipality) {
  return Object.entries(raw).map(([external_id, name]) => ({
    external_id,
    name,
    municipality_id: municipality
  }));
}

function extractStationStats(raw, polling_station_id, election_id, document_path) {
  return {
    total_votes: parseInt(raw.stat_sum_numbers.total_voters.replace('.', ''), 10),
    votes: parseInt(raw.stat_sum_numbers.available.replace('.', ''), 10),
    valid_votes: raw.sum_config.data.datasets[0].data[0],
    invalid_votes: raw.sum_config.data.datasets[0].data[1],
    polling_station_id,
    election_id,
    document_path
  };
}

function formatStationsResults(raw, polling_station_id, election_id) {
  return raw.map(({ count_number, won_number, won_percent }) => ({
    election_id,
    polling_station_id,
    candidate_id: count_number,
    votes: parseInt(won_number.replace('.', ''), 10),
    percentage: won_percent
  }));
}

run();