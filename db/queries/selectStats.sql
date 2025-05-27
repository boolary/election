SELECT 
  ps_stats.polling_station_id,
  ps.name AS polling_station_name,
  m.name AS municipality_name,
  ps_stats.valid_votes,
  ps_stats.total_votes,
  ROUND((ps_stats.valid_votes::decimal / ps_stats.total_votes) * 100, 2) AS percentage
FROM polling_station_stats ps_stats
JOIN polling_stations ps ON ps_stats.polling_station_id = ps.id
JOIN municipalities m ON ps.municipality_id = m.id
WHERE ps_stats.total_votes > 0 AND (ps_stats.valid_votes::decimal / ps_stats.total_votes) > 0.9;