import clientHtml from './client.html';
import cronJobHtml from './cron-job.html';
import errorHtml from './error.html';
import { config } from './config';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import CryptoJS from 'crypto-js';

// Idea taken from Python's Flask
async function renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

function getSessionCookie(request, name) {
    const cookies = parseCookie(request.headers.get('Cookie') || '');
    if (!cookies[name]) return null;

    try {
        return decrypt(cookies[name]);
    } catch (e) {
        return null;
    }
}

function setSessionCookie(name, value, response) {
    const encryptedValue = encrypt(value);
    response.headers.append('Set-Cookie', serializeCookie(name, encryptedValue, { httpOnly: true, secure: true }));
}

// Unlike Flask, we will first encrypt the value, generate its HMAC, and then combine them both.
// Obviously, we will use a new IV every time to make encryption even harder to crack. ;)
function encrypt(value) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(value, CryptoJS.enc.Hex.parse(config.encryption.ENCRYPTION_KEY), { iv: iv });
    const encryptedString = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    const hmac = CryptoJS.HmacSHA256(encryptedString, config.encryption.HMAC_KEY).toString();

    return hmac + ':' + encryptedString;
}

// If any error occurs, then we already know that the value has been tampered with.
function decrypt(value) {
    const [hmac, encryptedString] = value.split(':');
    const calculatedHmac = CryptoJS.HmacSHA256(encryptedString, config.encryption.HMAC_KEY).toString();

    if (hmac !== calculatedHmac) {
        throw new Error('Invalid HMAC');
    }

    const encrypted = CryptoJS.enc.Base64.parse(encryptedString);
    const iv = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4));
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, CryptoJS.enc.Hex.parse(config.encryption.ENCRYPTION_KEY), { iv: iv });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
}

async function redeemAuthCode(code, clientId, clientSecret) {
    const data = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: config.worker.REDIRECT_URL,
        code: code
    });

    const response = await fetch(config.oauth.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    });
    const responseData = await response.json();
    return response.ok ? responseData.refresh_token : null;
}

async function acquireAccessToken(refreshToken, clientId, clientSecret) {
    const data = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: config.worker.REDIRECT_URL
    });
    const response = await fetch(config.oauth.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    });
    const responseData = await response.json();
    
    return response.ok ? responseData.access_token : null;
}

async function callEndpoints(accessToken) {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const shuffledEndpoints = config.graph.GRAPH_ENDPOINTS.sort(() => Math.random() - 0.5);

    for (const endpoint of shuffledEndpoints) {
        try {
            await fetch(endpoint, { headers });
        } catch (e) {}
    }
}

async function handleRequest(event, request) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
        if (request.method !== 'GET') {
            return new Response('Invalid request method.', { status: 405 });
        }

        const html = await renderTemplate(clientHtml, { redirect_url: config.worker.REDIRECT_URL });
        return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 200 });
    }

    if (url.pathname === '/auth') {
        if (request.method !== 'GET') {
            return new Response('Invalid request method.', { status: 405 });
        }

        const code = url.searchParams.get('code');

        if (code) {
            const clientId = getSessionCookie(request, 'client_id');
            const clientSecret = getSessionCookie(request, 'client_secret');

            if (!clientId || !clientSecret) {
                const html = await renderTemplate(errorHtml, { error_text: 'Session expired or not exist.' });
                return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 400 });
            }

            const refreshToken = await redeemAuthCode(code, clientId, clientSecret);

            if (!refreshToken) {
                const html = await renderTemplate(errorHtml, { error_text: 'Failed to acquire refresh token, please verify your client details and try again.' });
                return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 400 });
            }

            const html = await renderTemplate(cronJobHtml, {
                call_url: `${config.worker.WORKER_URL}/call`,
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            });

            return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 200 });
        }

        const clientId = url.searchParams.get('client_id');
        const clientSecret = url.searchParams.get('client_secret');

        if (!clientId || !clientSecret) {
            const html = await renderTemplate(errorHtml, { error_text: 'Client ID or secret not provided.' });
            return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 400 });
        } else if (clientId.length >= 128 || clientSecret.length >= 128) {
            const html = await renderTemplate(errorHtml, { error_text: 'Expected values too big.' });
            return new Response(html, { headers: { 'Content-Type': 'text/html' }, status: 400 });
        }

        const response = new Response(null, {
            status: 302,
            headers: { Location: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&scope=${config.oauth.AUTH_SCOPES}&redirect_uri=${config.worker.REDIRECT_URL}&response_type=code` }
        });
        setSessionCookie('client_id', clientId, response);
        setSessionCookie('client_secret', clientSecret, response);

        return response;
    }

    if (url.pathname === '/call') {
        if (request.method !== 'POST') {
            return new Response('Invalid request method.', { status: 405 });
        }

        const json = await request.json();
        const { client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken } = json;

        if (!clientId || !clientSecret) {
            return new Response('Client ID or secret not provided.', { status: 400 });
        } else if (!refreshToken) {
            return new Response('Refresh token not provided.', { status: 400 });
        }

        const accessToken = await acquireAccessToken(refreshToken, clientId, clientSecret);

        if (!accessToken) {
            return new Response('Failed to acquire access token.', { status: 400 });
        }

        event.waitUntil(callEndpoints(accessToken));

        return new Response('Success - new task created.', { status: 201 });
    }

    return new Response('Not found.', { status: 404 });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event, event.request));
});
