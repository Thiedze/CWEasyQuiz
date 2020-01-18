const { App } = require("@slack/bolt");
const fs = require("fs");
const questionsService = require("./questionService");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

app.event("app_home_opened", ({ event, say }) => {
  if (!fs.existsSync(event.user + ".json")) {
    fs.writeFile(event.user + ".json", "{}", function(err) {
      if (err) throw err;
      console.log("File is created successfully.");
    });
  }
  say(
    'Gebe ein beliebiges Datum bis "heute" im Format dd.mm.yyyy ein und starte das Quiz.'
  );
});

app.message(/^[0-9]{2}.[0-9]{2}.[0-9]{4}/, async ({ message, say }) => {
  fs.readFile(message.user + ".json", (err, data) => {
    if (err) throw err;
    var userResults = JSON.parse(data);

    const question = questionsService.getQuestion(message.text);
    if (question != null) {
      say(question.question);
      questionsService.saveLastQuestion(userResults, message.user, question);
    } else {
      say(
        "Keine Frage zum Datum " +
          message.text +
          " gefunden. Versuche es später noch einmal."
      );
    }
  });
});

app.message(/[\s\S]*/, async ({ message, say }) => {
  if (!/^[0-9]{2}.[0-9]{2}.[0-9]{4}/.test(message.text)) {
    fs.readFile(message.user + ".json", (err, data) => {
      if (err) throw err;
      var userResults = JSON.parse(data);

      if (userResults.lastQuestion != null) {
        const question = questionsService.getQuestion(
          userResults.lastQuestion.id
        );
        if (question != null) {
          if (
            questionsService.check(
              userResults,
              message.user,
              question,
              message.text
            )
          ) {
            say("Deine Antwort " + message.text + " ist richtig.");
          } else {
            say("Deine Antwort " + message.text + " ist leider falsch.");
          }
        }
      } else {
        say("Du musst eine neue Frage auswählen.");
      }
    });
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
})();
