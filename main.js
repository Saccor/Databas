// main.js

import mongoose from 'mongoose';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/saccosdata');
const movies = mongoose.model('Movies', {
  title: String,
  director: String,
  releaseYear: Number,
  genres: [String],
  ratings: [Number],
  cast: [String]
});

// Function to display the menu
function displayMenu() {
  console.log('\nMenu:');
  console.log('1. View all movies');
  console.log('2. Select a movie');
  console.log('3. Add a new movie');
  console.log('4. Update a movie (Update title, director, release date, genres, ratings, cast)');
  console.log('5. Delete a movie');
  console.log('6. Exit');
}

// Function to view all movies
async function viewAllMovies() {
  const allMovies = await movies.find({});

  if (allMovies.length > 0) {
    console.log('\nAll Movies:');
    allMovies.forEach(movie => console.log(movie));
  } else {
    console.log('No movies found.');
  }
}

// Function to select a movie
async function selectMovie() {
  const titleToSelect = await getUserInput(['title']);
  const selectedMovie = await movies.findOne({ title: titleToSelect.title });

  if (selectedMovie) {
    console.log('\nSelected Movie:');
    console.log(selectedMovie);

    // Display sub-menu options for the selected movie
    let subMenuChoice;
    do {
      console.log('\nMovie Options:');
      console.log('1. Update movie details');
      console.log('2. Delete this movie');
      console.log('3. Back to the main menu');

      const subMenuInput = await getUserInput(['choice']);
      subMenuChoice = parseInt(subMenuInput.choice, 10);

      switch (subMenuChoice) {
        case 1:
          await updateMovie(selectedMovie);
          break;
        case 2:
          await deleteMovie(selectedMovie);
          return;  // This will exit the do-while loop and go back to the main menu
        case 3:
          console.log('Returning to the main menu.');
          break;
        default:
          console.log('Invalid choice. Please enter a number between 1 and 3.');
      }
    } while (subMenuChoice !== 3);
  } else {
    console.log('Movie not found.');
  }
}

// Function to update a movie
async function updateMovie(selectedMovie) {
  console.log('Updating Movie:');
  console.log(selectedMovie);

  let isValidChoice = false;

  do {
    console.log('\nUpdate Options:');
    console.log('1. Update title');
    console.log('2. Update director');
    console.log('3. Update release year');
    console.log('4. Update genres');
    console.log('5. Update ratings');
    console.log('6. Update cast');
    console.log('7. Back to movie options');

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
        // Update genres (add or remove)
        await updateArrayField(selectedMovie.genres, 'genres');
        break;
      case 5:
        // Update ratings (add or remove)
        await updateArrayField(selectedMovie.ratings, 'ratings');
        break;
      case 6:
        // Update cast (add or remove)
        await updateArrayField(selectedMovie.cast, 'cast');
        break;
      case 7:
        console.log('Returning to movie options.');
        isValidChoice = true;
        break;
      default:
        console.log('Invalid choice. Please enter a number between 1 and 7.');
    }
  } while (!isValidChoice);

  await selectedMovie.save();
  console.log('Movie updated successfully!');
}



// Function to delete a movie
async function deleteMovie(selectedMovie) {
  await movies.findOneAndDelete({ _id: selectedMovie._id });
  console.log('Movie deleted successfully!');
}

// Function to update an array field
async function updateArrayField(array, fieldName) {
  console.log(`Update ${fieldName}:`);
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
      console.log('Invalid index. Please enter a valid index to remove.');
    }
  } else {
    console.log('Invalid action. Please enter "add" or "remove".');
  }
}

// Function to get user input for specified fields
function getUserInput(fields) {
  return new Promise(resolve => {
    const inputObject = {};

    const handleInput = (index = 0) => {
      process.stdout.write(`Enter ${fields[index]}: `);
      process.stdin.once('data', data => {
        const value = data.toString().trim();

        if (fields[index] === 'choice') {
          const choice = parseInt(value, 10);
          if (!isNaN(choice) && choice >= 1 && choice <= 7) {
            inputObject[fields[index]] = choice;
          } else {
            console.log('Invalid choice. Please enter a number between 1 and 7.');
            handleInput(index);  // Re-prompt for input
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

// Main application loop
let userChoice;
do {
  displayMenu();
  process.stdout.write('Enter your choice (1-6): ');

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
      console.log('Select a movie before updating.');
      break;
    case 5:
      console.log('Select a movie before deleting.');
      break;
    case 6:
      console.log('Exiting application. Goodbye!');
      break;
    default:
      console.log('Invalid choice. Please enter a number between 1 and 6.');
  }
} while (userChoice !== 6);

// Close MongoDB connection
mongoose.connection.close();
