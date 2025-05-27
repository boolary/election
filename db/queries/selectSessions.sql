SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'elections'
  AND pid <> pg_backend_pid();