const axios = require('axios');
const querystring = require('querystring');

// Environment variables
const {
  DROPBOX_APP_KEY,
  DROPBOX_APP_SECRET,
  DROPBOX_REFRESH_TOKEN
} = process.env;

exports.handler = async (event) => {
  // Handle CORS for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Exchange refresh token for new access token
    const tokenResponse = await axios.post(
      'https://api.dropbox.com/oauth2/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: DROPBOX_REFRESH_TOKEN,
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Successful response format that matches what getDropboxAccessToken expects
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        access_token: tokenResponse.data.access_token,
        expires_in: tokenResponse.data.expires_in
      })
    };
  } catch (error) {
    console.error('Dropbox token error:', error.response?.data || error.message);
    
    // Error response format
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get Dropbox token',
        details: error.response?.data || error.message
      })
    };
  }
};