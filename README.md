# Spotify Clone

Currently in a very early development stage

Prerequisites:
- [Node.js v20](https://nodejs.org/en/download/) or higher.
- [Spotify developer account](https://developer.spotify.com/documentation/web-api/tutorials/getting-started#create-an-app)

Running the website locally:
1. Clone this repository
```
git clone https://github.com/kensunjaya/spotify-clone.git
cd spotify-clone
```
2. Install all required depedencies
```
npm install
```
3. [Create an app](https://developer.spotify.com/dashboard/create) on spotify developer account if you haven't done already<br/>
If you're confused about Redirect URI, set it to https://example.org/callback<br/><br/>
4. Create a following .env file within the project root folder:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_id
```
5. Run the website with the following command:
```
node extractor/extractor.mjs
npm run dev
```
