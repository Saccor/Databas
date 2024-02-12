// main.js

import mongoose from 'mongoose';

// Anslut till MongoDB
await mongoose.connect('mongodb://localhost:27017/saccosdata');
const movies = mongoose.model('Movies', {
  title: String,
  director: String,
  releaseYear: Number,
  genres: [String],
  ratings: [Number],
  cast: [String]
});

// Funktion för att visa menyn
function displayMenu() {
  console.log('\nMeny:');
  console.log('1. Visa alla filmer');
  console.log('2. Välj en film');
  console.log('3. Lägg till en ny film');
  console.log('4. Uppdatera en film (Uppdatera titel, regissör, släppår, genrer, betyg, skådespelare)');
  console.log('5. Ta bort en film');
  console.log('6. Avsluta');
}

// Funktion för att visa alla filmer
async function viewAllMovies() {
  const allMovies = await movies.find({});

  if (allMovies.length > 0) {
    console.log('\nAlla filmer:');
    allMovies.forEach(movie => console.log(movie));
  } else {
    console.log('Inga filmer hittades.');
  }
}

// Funktion för att välja en film
async function selectMovie() {
  const titleToSelect = await getUserInput(['title']);
  const selectedMovie = await movies.findOne({ title: titleToSelect.title });

  if (selectedMovie) {
    console.log('\nVald film:');
    console.log(selectedMovie);

    // Visa undermenyalternativ för den valda filmen
    let subMenuChoice;
    do {
      console.log('\nFilmalternativ:');
      console.log('1. Uppdatera filminformation');
      console.log('2. Ta bort denna film');
      console.log('3. Tillbaka till huvudmenyn');

      const subMenuInput = await getUserInput(['choice']);
      subMenuChoice = parseInt(subMenuInput.choice, 10);

      switch (subMenuChoice) {
        case 1:
          await updateMovie(selectedMovie);
          break;
        case 2:
          await deleteMovie(selectedMovie);
          return; 
        case 3:
          console.log('Återgår till huvudmenyn.');
          break;
        default:
          console.log('Ogiltigt val. Ange ett nummer mellan 1 och 3.');
      }
    } while (subMenuChoice !== 3);
  } else {
    console.log('Film ej hittad.');
  }
}

// Funktion för att uppdatera en film
async function updateMovie(selectedMovie) {
  console.log('Uppdaterar film:');
  console.log(selectedMovie);

  let isValidChoice = false;

  do {
    console.log('\nUppdateringsalternativ:');
    console.log('1. Uppdatera titel');
    console.log('2. Uppdatera regissör');
    console.log('3. Uppdatera släppår');
    console.log('4. Uppdatera genrer');
    console.log('5. Uppdatera betyg');
    console.log('6. Uppdatera skådespelare');
    console.log('7. Tillbaka till filmalternativ');

    const updateChoiceInput = await getUserInput(['choice']);
    const updateChoice = parseInt(updateChoiceInput.choice, 10);

    switch (updateChoice) {
      case 1:
        selectedMovie.title = (await getUserInput(['title'])).title;
        break;
      case 2:
        selectedMovie.director = (await getUserInput(['director'])).director;
        break;
      case 3:
        selectedMovie.releaseYear = (await getUserInput(['releaseYear'])).releaseYear;
        break;
      case 4:
      
        await updateArrayField(selectedMovie.genres, 'genres');
        break;
      case 5:

        await updateArrayField(selectedMovie.ratings, 'ratings');
        break;
      case 6:

        await updateArrayField(selectedMovie.cast, 'cast');
        break;
      case 7:
        console.log('Återgår till filmalternativ.');
        isValidChoice = true;
        break;
      default:
        console.log('Ogiltigt val. Ange ett nummer mellan 1 och 7.');
    }
  } while (!isValidChoice);

  await selectedMovie.save();
  console.log('Film uppdaterad framgångsrikt!');
}

// Funktion för att ta bort en film
async function deleteMovie(selectedMovie) {
  await movies.findOneAndDelete({ _id: selectedMovie._id });
  console.log('Film borttagen framgångsrikt!');
}

// Funktion för att uppdatera en arrayfält
async function updateArrayField(array, fieldName) {
  console.log(`Uppdatera ${fieldName}:`);
  console.log(array);

  const action = await getUserInput(['addOrRemove']);

  if (action.addOrRemove === 'add') {
    const newItem = await getUserInput([fieldName]);
    array.push(newItem[fieldName]);
  } else if (action.addOrRemove === 'remove') {
    const indexToRemove = await getUserInput(['indexToRemove']);
    if (indexToRemove.indexToRemove >= 0 && indexToRemove.indexToRemove < array.length) {
      array.splice(indexToRemove.indexToRemove, 1);
    } else {
      console.log('Ogiltig index. Ange ett giltigt index att ta bort.');
    }
  } else {
    console.log('Ogiltig åtgärd. Ange "add" eller "remove".');
  }
}

// Funktion för att få användarinput för angivna fält
function getUserInput(fields) {
  return new Promise(resolve => {
    const inputObject = {};

    const handleInput = (index = 0) => {
      process.stdout.write(`Ange ${fields[index]}: `);
      process.stdin.once('data', data => {
        const value = data.toString().trim();

        if (fields[index] === 'choice') {
          const choice = parseInt(value, 10);
          if (!isNaN(choice) && choice >= 1 && choice <= 7) {
            inputObject[fields[index]] = choice;
          } else {
            console.log('Ogiltigt val. Ange ett nummer mellan 1 och 7.');
            handleInput(index);
            return;
          }
        } else {
          inputObject[fields[index]] = value;
        }

        if (index < fields.length - 1) {
          handleInput(index + 1);
        } else {
          resolve(inputObject);
        }
      });
    };

    handleInput();
  });
}

// Huvudapp-loopen
let userChoice;
do {
  displayMenu();
  process.stdout.write('Ange ditt val (1-6): ');

  const userInput = await getUserInput(['choice']);
  userChoice = parseInt(userInput.choice, 10);

  switch (userChoice) {
    case 1:
      await viewAllMovies();
      break;
    case 2:
      await selectMovie();
      break;
    case 3:
      await addNewMovie();
      break;
    case 4:
      console.log('Välj en film innan du uppdaterar.');
      break;
    case 5:
      console.log('Välj en film innan du tar bort.');
      break;
    case 6:
      console.log('Avslutar applikationen. Hejdå!');
      break;
    default:
      console.log('Ogiltigt val. Ange ett nummer mellan 1 och 6.');
  }
} while (userChoice !== 6);

// Stäng MongoDB-anslutningen
mongoose.connection.close();
