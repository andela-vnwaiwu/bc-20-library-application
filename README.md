[![Build Status](https://travis-ci.org/vonvick/bc-20-library-application.svg?branch=master)](https://travis-ci.org/vonvick/bc-20-library-application.svg?branch=master)

# bc-20-library-application
A library application written in javascript. That allows a user to borrow and return borrowed books. The Admin can create, edit and delete books from the library

## Usage
To run the application, make sure you have node installed on your system

1. clone the project from the repository ``` https://github.com/vonvick/bc-20-library-application ```
2 cd into the folder bc-20-library-application.
3. Run ``` npm install ``` to install the dependencies and packages.
4. create an account on firebase and input the config keys in the ``` .env ``` file.
5. Also create a randon string and save in the  ``` .env ``` file to handle sessions
5. After storing the keys, enter  ``` npm start ``` in the command prompt to start the application.

A live version of the application can be found on this link (https://ebook-hub.herokuapp.com)[https://ebook-hub.herokuapp.com]

### Next Features

1. Implement a document viewer to allow user read the books online.
2. Allow users to upload their profile images to the application.
3. create a billing system that actually bills customer for late returning of books.

### Tests
- No test written yet

### Continuous Integration
[![Build Status](https://travis-ci.org/vonvick/bc-20-library-application.svg?branch=master)](https://travis-ci.org/vonvick/bc-20-library-application.svg?branch=master)
