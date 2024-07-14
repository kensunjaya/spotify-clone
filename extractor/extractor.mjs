import express from 'express';
import cors from 'cors';
import youtubeDl from 'youtube-dl-exec';
import play from 'play-dl';
import axios from 'axios';

const app = express();

const port = 5050;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}

app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});

app.get('/download', async (req, res) => {
  const datas = await play.search(req.query.url, {limit: 1});
  await youtubeDl(datas[0].url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    extractAudio: true,
  }).then(data => {
    res.status(200).json(data.url);
  }).catch(err => {
    console.log(err);
  });
  
});

app.get('/accesstoken', async (req, res) => {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: req.query.id,
      client_secret: req.query.secret
    }).toString();
  
    try {
      const response = await axios.post(tokenUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const accessToken = response.data.access_token;
      res.status(200).json(accessToken);
    } catch (err) {
      console.error('Something went wrong!', err);
    }
});