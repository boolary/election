interface ElectionResult {
  minute_from_election_station: string,
  sum_config: {
    data: {
      datasets: {
        data: number[]
      }[]
    }
  },
  stat_sum_numbers: {
    available: string,
    number_of_stations: number,
    table_have_image: boolean,
    datetime: string,
    election_title: string,
    total_voters: string,
    processed_stations: number
  },
  table_data: {
      count_number: number,
      list_image: string,
      list_name: string,
      won_number: string
  }[]
}