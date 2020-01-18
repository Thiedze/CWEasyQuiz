const fs = require("fs");
const questions = require("./questions.json");

exports.getQuestion = id => {
  for (var index = 0; index < questions.length; index++) {
    if (questions[index].id === id) {
      return questions[index];
    }
  }
  return null;
};

exports.saveLastQuestion = (userResults, user, question) => {
  userResults.lastQuestion = question;
  fs.writeFileSync("user_" + user + ".json", JSON.stringify(userResults));
};

exports.saveCorrectQuestion = (userResults, user, question) => {
  if (userResults.correctQuestions == null) {
    userResults.correctQuestions = [];
  }
  userResults.correctQuestions.push(question);
  userResults.lastQuestion = null;
  fs.writeFileSync("user_" + user + ".json", JSON.stringify(userResults));
};

exports.check = (userResults, user, question, answer) => {
  if (answer == userResults.lastQuestion.answer) {
    this.saveCorrectQuestion(userResults, user, question);
    return true;
  } else {
    return false;
  }
};
