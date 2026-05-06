import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wshfgskvpobfehyyqdvd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaGZnc2t2cG9iZmVoeXlxZHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzYxMjQsImV4cCI6MjA5MzY1MjEyNH0.hrICzXTpmQ193xjkaD9AFa5AN7g79iqrVp8vwce16Vg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const PROPERTY_ID = "cf017321-108c-4474-99ae-385222131c56";
