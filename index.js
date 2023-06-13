import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import routes from './public_routes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//route for public pages
app.use('/', routes);




app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
