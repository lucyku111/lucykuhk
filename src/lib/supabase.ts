import { createClient } from '@supabase/supabase-js';

// Hard-code the values for now to debug the issue
const supabaseUrl = "https://fhzcjlsphqsgkgejvppy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemNqbHNwaHFzZ2tnZWp2cHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MDIwOTIsImV4cCI6MjA1OTI3ODA5Mn0.GSF5qO9AOO39oCNPVJ26_UnmJpH5LOnE5IqECNW-KVI";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);