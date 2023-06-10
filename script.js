function createQuestionElement(question, options, questionNumber) {
  var questionElement = document.createElement('div');
  questionElement.classList.add('question');
  questionElement.id = 'question-' + questionNumber;

  var questionNumberElement = document.createElement('span');
  questionNumberElement.classList.add('question-number');
  questionNumberElement.textContent = 'Q' + questionNumber + '. ';
  questionElement.appendChild(questionNumberElement);

  var questionTextElement = document.createElement('span');
  questionTextElement.textContent = question;
  questionElement.appendChild(questionTextElement);

  var shuffledOptions = shuffleOptions(options);

  shuffledOptions.forEach(function(option, optionIndex) {
    var optionDiv = document.createElement('div');
    optionDiv.classList.add('option');

    var optionInput = document.createElement('input');
    optionInput.type = 'radio';
    optionInput.name = 'question-' + questionNumber;
    optionInput.value = option.text;
    optionInput.setAttribute('data-option-index', optionIndex);
    optionInput.setAttribute('data-correct-option-index', getCorrectOptionIndex(shuffledOptions));

    var optionLabel = document.createElement('label');
    optionLabel.appendChild(optionInput);
    optionLabel.appendChild(document.createTextNode(option.text));

    optionDiv.appendChild(optionLabel);
    questionElement.appendChild(optionDiv);
  });

  var submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.addEventListener('click', function() {
    checkAnswer('question-' + questionNumber);
  });
  questionElement.appendChild(submitButton);

  return questionElement;
}

function checkAnswer(questionId) {
  var questionElement = document.getElementById(questionId);
  var selectedOption = questionElement.querySelector('input[name="' + questionId + '"]:checked');

  if (selectedOption === null) {
    alert('Please select an answer for Question ' + questionId.substring(9) + '.');
    return;
  }

  var selectedOptionIndex = parseInt(selectedOption.getAttribute('data-option-index'));
  var correctOptionIndex = parseInt(selectedOption.getAttribute('data-correct-option-index'));

  var resultText, resultColor;

  if (selectedOptionIndex === correctOptionIndex) {
    resultText = 'Correct';
    resultColor = 'green';
  } else {
    resultText = 'Incorrect';
    resultColor = 'red';
  }

  var dialogBox = document.createElement('div');
  dialogBox.style.backgroundColor = resultColor;
  dialogBox.style.color = 'white';
  dialogBox.style.padding = '10px';
  dialogBox.style.marginTop = '10px';
  dialogBox.textContent = 'Your answer for Question ' + questionId.substring(9) + ' is ' + resultText + '.';
  questionElement.appendChild(dialogBox);

  // Disable options and submit button after checking the answer
  var options = questionElement.querySelectorAll('input[name="' + questionId + '"]');
  options.forEach(function(option) {
    option.disabled = true;
  });

  var submitButton = questionElement.querySelector('button');
  submitButton.disabled = true;
}

function getCorrectOptionIndex(options) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].isCorrect) {
      return i;
    }
  }
  return -1;
}

function shuffleArray(array) {
  var shuffledArray = array.slice();
  for (var i = shuffledArray.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffledArray[i];
    shuffledArray[i] = shuffledArray[j];
    shuffledArray[j] = temp;
  }
  return shuffledArray;
}

fetch('https://raw.githubusercontent.com/DocPatthar/The-mcq/main/Questions.txt')
  .then(response => response.text())
  .then(inputText => generateMCQ(inputText))
  .catch(error => console.error(error));

function generateMCQ(inputText) {
  var lines = inputText.trim().split('\n');
  var container = document.getElementById('mcq-container');
  container.innerHTML = '';

  var selectedQuestions = [];
  var allQuestions = [];
  var currentQuestion = null;
  var currentOptions = [];
  var questionNumber = 1;

  lines.forEach(function(line) {
    line = line.trim();

    if (line.startsWith('#')) {
      if (currentQuestion !== null) {
        allQuestions.push({ question: currentQuestion, options: currentOptions });
        currentOptions = [];
        questionNumber++;
      }
      currentQuestion = line.substring(1);
    } else if (line.startsWith('+')) {
      currentOptions.push({ text: line.substring(1), isCorrect: true });
    } else if (line.startsWith('-')) {
      currentOptions.push({ text: line.substring(1), isCorrect: false });
    }
  });

  if (currentQuestion !== null) {
    allQuestions.push({ question: currentQuestion, options: currentOptions });
  }

  if (allQuestions.length <= 50) {
    selectedQuestions = allQuestions;
  } else {
    var shuffledQuestions = shuffleArray(allQuestions);
    selectedQuestions = shuffledQuestions.slice(0, 50);
  }

  selectedQuestions.forEach(function(questionData, index) {
    container.appendChild(createQuestionElement(questionData.question, questionData.options, index + 1));
  });

  var finalSubmitButton = document.createElement('button');
  finalSubmitButton.textContent = 'Submit All';
  finalSubmitButton.addEventListener('click', calculateScore);
  container.appendChild(finalSubmitButton);
}

function calculateScore() {
  var questions = document.getElementsByClassName('question');
  var correctCount = 0;
  var attemptedCount = 0;

  Array.from(questions).forEach(function(questionElement, index) {
    var selectedOption = questionElement.querySelector('input[name="' + questionElement.id + '"]:checked');

    if (selectedOption !== null) {
      var selectedOptionIndex = parseInt(selectedOption.getAttribute('data-option-index'));
      var correctOptionIndex = parseInt(selectedOption.getAttribute('data-correct-option-index'));

      if (selectedOptionIndex === correctOptionIndex) {
        correctCount++;
      }
      attemptedCount++;
    } else {
      attemptedCount++;
    }
  });

  var score = correctCount * 2;
  var totalQuestions = questions.length;
  var incorrectCount = attemptedCount - correctCount;
  var percentageCorrect = (correctCount / totalQuestions) * 100;

  var resultText = 'Score: ' + score + '/' + (totalQuestions * 2) + '<br>' +
                   'Correct: ' + correctCount + '<br>' +
                   'Incorrect: ' + incorrectCount + '<br>' +
                   'Percentage Correct: ' + percentageCorrect.toFixed(2) + '%';

  var dialogBox = document.createElement('div');
  dialogBox.style.backgroundColor = 'green';
  dialogBox.style.color = 'white';
  dialogBox.style.padding = '10px';
  dialogBox.style.marginTop = '10px';
  dialogBox.innerHTML = resultText;
  document.getElementById('mcq-container').appendChild(dialogBox);
}

function shuffleOptions(options) {
  var shuffledOptions = options.slice();
  for (var i = shuffledOptions.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffledOptions[i];
    shuffledOptions[i] = shuffledOptions[j];
    shuffledOptions[j] = temp;
  }
  return shuffledOptions;
}
