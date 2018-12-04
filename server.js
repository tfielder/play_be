const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'be_play';

app.get('/', (request, response) => {
  response.send("Welcome!\n");
});

//Song Endpoints

//Create
app.post('/api/v1/songs', (request, response) => {
  const song = request.body;

  for (let requiredParameter of ['name', 'artist_name', 'genre', 'song_rating']){
    if (!song[requiredParameter]){
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
    }
  }

  database('songs').insert(song, 'id')
    .then(song => {
      response.status(201).json({ id: song[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Read
app.get('/api/v1/songs', (request, response) => {
  database('songs').select('name', 'artist_name', 'genre', 'song_rating')
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/songs/:id', (request, response) => {
  database('songs').where('id', request.params.id).select('id', 'name', 'artist_name', 'genre', 'song_rating')
    .then(songs => {
      if (songs.length) {
        response.status(200).json(songs);
      } else {
        response.status(404).json({
          error: `Could not find song with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//Update
// app.patch('/api/vi/songs/:id', (request, response) => {
//   const song = request.body;
//   const id = parseInt(request.params.id);
//
//   for (let requiredParameter of ['name', 'artist_name', 'genre', 'song_rating']){
//     if (!song[requiredParameter]){
//       return response
//         .status(422)
//         .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer>}. You're missing a "${requiredParameter}" property.`});
//     }
//   }
//
//   database('songs').insert(song, 'id')
//   .then(song => {
//     response.status(201).json({ id: song[id] })
//   })
//   .catch(error => {
//     response.status(500).json({ error });
//   });
// });


//Destroy
// app.delete('/api/vi/songs/:id', (request, response) => {
//   database('songs').where('id', request.params.id).select()
//   .then(song => {
//     if (song.length) {
//       database('songs').where('id', request.params.id).del();
//       response.status(204).json(`Successfully deleted song with id: ${request.params.id}.`);
//     } else {
//       response.status(404).json({
//         error: `Could not find song with id ${request.params.id}`
//       });
//     }
//   })
//   .catch(error => {
//     response.status(500).json({ error });
//   });
// });

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});