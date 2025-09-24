import express from "express";
import cors from "cors";
import { google } from "googleapis";
import path from "path";
import { setInterval } from 'timers';
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// A variable to store the latest sheet data
let sheetData = null; // For D-1 Reservation
let reliabilityweek = null; // For Reliability
let eagleeye = null;  //eagle
let FDP_view = null; //FDP
let RSPS_view = null; //RSPS
let executivesData = null;
let Tracking_view = null;

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

creds.private_key = creds.private_key.replace(/\\n/g, '\n');

// console.log("------------------"+JSON.stringify(creds, null, 2));

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});


const spreadsheetId = process.env.SHEET_ID || "1enVTHFGgBz0IqL0VSHWynbcIZPn_Xf44ZuPvwdK1Qzs";


// Function to fetch and update the global sheet data variable for "D-1 Reservation"
const fetchAndStoreData = async () => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const range = "D-1 Reservation";

    console.log("Fetching data from Google Sheets..."+spreadsheetId);

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'D-1 Reservation' sheet.");
      return;
    }
    sheetData = response.data;
    console.log("Data for 'D-1 Reservation' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'D-1 Reservation' sheet data:", err.message);
    sheetData = null;
  }
};

// Function to fetch and update the global sheet data variable for "Reliability"
const fetchDataForReliability = async () => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const range = "Reliability";

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'Reliability' sheet.");
      return;
    }
    reliabilityweek = response.data;
    console.log("Data for 'Reliability' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Failed to Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'Reliability' sheet data:", err.message);
    reliabilityweek = null;
  }
};

const fetchAndStoreeagle = async () => { //eagle
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const range = "EagleEye";

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'EagleEye' sheet.");
      return;
    }
    eagleeye = response.data;
    console.log("Data for 'EagleEye' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'EagleEye' sheet data:", err.message);
    eagleeye = null;
  }
};

const fetchAndStoreFDP = async () => { //FDP
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const range = "FDP_Pendency";

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'FDP' sheet.");
      return;
    }
    FDP_view = response.data;
    console.log("Data for 'FDP' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'FDP' sheet data:", err.message);
    FDP_view = null;
  }
};

const fetchAndStoreFDPMuiltiSheets = async () => { //FDP
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    
    //const range = "FDP_Demo";

    const sheetNames = ["Day_Start", "FDP_Pendency","Promises"];
     
    var sheetsData;

    for (const name of sheetNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: name, // whole sheet
    });
    
    sheetData[name] = res.data;
    console.log(`Data from from ${name}:`, name);
    }

    FDP_view = sheetData;

    // const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    // if (!response.data || !response.data.values) {
    //   console.error("No data found in the 'FDP' sheet.");
    //   return;
    // }
    // FDP_view = response.data;
    console.log("Data for 'FDPMMul' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'FDP' sheet data:", err.message);
    FDP_view = null;
  }
};

const fetchAndStoreRSPS = async () => { //RSPS
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    
    const range = "RSPS_Pendencydemo";

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'RSPS' sheet.");
      return;
    }
    RSPS_view = response.data;
    console.log("Data for 'RSPS' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'RSPS' sheet data:", err.message);
    RSPS_view = null;
  }
};

const fetchAndStoreRSPSMul = async () => { //RSPS
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    
    const sheetNames = ["Day_Start", "RSPS_Pendency"];
     
    var sheetsData;

    for (const name of sheetNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: name, // whole sheet
    });
    
    sheetData[name] = res.data;

    console.log(`Data from from ${name}:`, name);
    }

    RSPS_view = sheetData;

    console.log("Data for 'RSPS' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'RSPS' sheet data:", err.message);
    RSPS_view = null;
  }
};

const fetchAndStoreExecutives = async () => { //RSPS
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    
    const sheetNames = ["Day_Start", "RSPS_Pendency","Promises","Reliability"];
     
    var sheetsData;

    for (const name of sheetNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: name, // whole sheet
    });
    
    sheetData[name] = res.data;

    console.log(`Data from from ${name}:`, name);
    }

    executivesData = sheetData;

    console.log("Data for 'RSPS' successfully refreshed from Google Sheets.");
  } catch (err) {
    console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'RSPS' sheet data:", err.message);
    executivesData = null;
  }
};

const fetchAndStoreTracking = async () => { //tracking
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });


    const range = "Sheet25";

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    if (!response.data || !response.data.values) {
      console.error("No data found in the 'tracking' sheet.");
      return;
    }
    Tracking_view = response.data;
    console.log("Data for 'tracking' successfully refreshed from Google Sheets.");
  } catch (err) {
  console.log("Fail Fetching data from Google Sheets..."+spreadsheetId);
    console.error("Failed to fetch 'tracking' sheet data:", err.message);
    Tracking_view = null;
  }
};

// Initial data fetch when the server starts
fetchAndStoreData();
fetchDataForReliability();
fetchAndStoreeagle();
fetchAndStoreFDPMuiltiSheets();
fetchAndStoreRSPSMul();
fetchAndStoreExecutives();
fetchAndStoreTracking();

// Schedule data refresh every 60 seconds
setInterval(fetchAndStoreData, 60000);
setInterval(fetchDataForReliability, 60000);
setInterval(fetchAndStoreeagle, 60000);
setInterval(fetchAndStoreFDPMuiltiSheets, 60000);
setInterval(fetchAndStoreRSPSMul,60000);
setInterval(fetchAndStoreExecutives,60000);
setInterval(fetchAndStoreTracking, 60000);

// Root route to show the server is working
app.get("/", (req, res) => {
  res.send("Backend server is running.");
});

// API endpoint to manually trigger a data refresh for D-1 Reservation
app.get("/api/refresh-d1-data", async (req, res) => {
  await fetchAndStoreData();
  res.status(200).json({ message: "D-1 Reservation data refresh triggered successfully." });
});

// API endpoint to manually trigger a data refresh for Reliability
app.get("/api/refresh-reliability-data", async (req, res) => {
  await fetchDataForReliability();
  res.status(200).json({ message: "Reliability data refresh triggered successfully." });
});

app.get("/api/refresh-eagle-data", async (req, res) => { //eagle
  await fetchAndStoreeagle();
  res.status(200).json({ message: "EagleEye data refresh triggered successfully." });
});

app.get("/api/refresh-FDP-data", async (req, res) => { //FDP
  await fetchAndStoreFDP();
  res.status(200).json({ message: "FDP data refresh triggered successfully." });
});


// API endpoint to serve the stored "D-1 Reservation" data
app.get("/api/sheets-data", (req, res) => {
  if (sheetData) {
    res.json(sheetData);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  }
});

app.get("/api/eagle-data", (req, res) => { //eagle
  if (eagleeye) {
    res.json(eagleeye);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  }
});

app.get("/api/FDP-data", async (req, res) => { //FDP
  await fetchAndStoreFDPMuiltiSheets();
  if (FDP_view) {
    res.json(FDP_view);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  }
});


// API endpoint to serve the stored "Reliability" data
app.get("/api/reliability-data", (req, res) => {
  if (reliabilityweek) {
    res.json(reliabilityweek);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  }
});

app.get("/api/refresh-RSPS-data", async (req, res) => { //RSPS
  await fetchAndStoreRSPSMul();
  res.status(200).json({ message: "RSPS data refresh triggered successfully." });
});

app.get("/api/RSPS-data", (req, res) => { //RSPS
  if (RSPS_view) {
    fetchAndStoreRSPSMul();
    res.json(RSPS_view);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  }
});

app.get("/api/executives-data", (req, res) => { //RSPS
  if (executivesData) {
    fetchAndStoreExecutives();
    res.json(executivesData);
  } else {
    res.status(503).json({
      error: "Data is not yet available or failed to load. Please try again in a few moments."
    });
  } 
});

app.get("/api/refresh-Tracking-data", async (req, res) => { //tracking
  await fetchAndStoreTracking();
  res.status(200).json({ message: "tracking data refresh triggered successfully." });
});

app.get("/api/tracking-data", (req, res) => {
    // 1. Get the tracking_id from the query parameters
    const trackingIdToFind = req.query.tracking_id;

    // Handle case where data isn't loaded yet or tracking_id is missing
    if (!Tracking_view || !Tracking_view.values) {
        return res.status(503).json({
            error: "Data is not yet available or failed to load. Please try again in a few moments."
        });
    }

    if (!trackingIdToFind) {
        return res.status(400).json({
            error: "Please provide a tracking_id query parameter."
        });
    }

    // 2. Parse the headers and find the index of the "tracking_id" column
    const headers = Tracking_view.values[0].map(h => h.trim());
    const trackingIdIndex = headers.indexOf('tracking_id');

    if (trackingIdIndex === -1) {
        return res.status(500).json({
            error: "Tracking ID column not found in sheet headers."
        });
    }

    // 3. Find the row that matches the provided tracking ID
    const dataRows = Tracking_view.values.slice(1);
    const foundRow = dataRows.find(row => 
        row[trackingIdIndex] && String(row[trackingIdIndex]).toLowerCase().trim() === trackingIdToFind.toLowerCase().trim()
    );

    // 4. If a matching row is found, format it and send the response
    if (foundRow) {
        const resultObject = {};
        headers.forEach((header, index) => {
            resultObject[header] = foundRow[index];
        });
        res.json({ range: Tracking_view.range, values: [headers, foundRow] });
    } else {
        // 5. If no match is found, send a 404 Not Found response
        res.status(404).json({
            error: "No records found for the specified tracking ID."
        });
    }
});

app.listen(3001, ()=> console.log("Backend running on http://localhost:3001"));

// export default app;



