
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://fbvuquuncqlhnwrmcbjj.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidnVxdXVuY3FsaG53cm1jYmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDI3OTUsImV4cCI6MjA2NjMxODc5NX0.5VwrNxdzoMPr_u0SLXIstfuQqJ0dzWCjRLCfl8POmWw";
export const supabaseClient = createClient(supabaseUrl, supabaseKey)