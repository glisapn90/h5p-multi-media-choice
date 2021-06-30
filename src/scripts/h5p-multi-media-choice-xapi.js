/**
 * Packs the current state of the users interactivity into a
 * serializable object.
 */
export function getCurrentState(selectedIndexes) {
  return { answers: selectedIndexes.toString() };
}

/**
 * Retrieves the xAPI data necessary for generating result reports
 */
export function getXAPIData(app, question, options, score, maxScore, success) {
  const xAPIEvent = getAnsweredXAPIEvent(app, question, options, score, maxScore, success);
  return { statement: xAPIEvent.data.statement };
}

/**
 * Generates the xAPI event for answered.
 */
export function getAnsweredXAPIEvent(app, question, options, score, maxScore, success) {
  const xAPIEvent = app.createXAPIEventTemplate('answered');

  addQuestionToXAPI(xAPIEvent, options, question);
  xAPIEvent.setScoredResult(score, maxScore, app, true, success);
  addResponseToXAPI(xAPIEvent, options);
  return xAPIEvent;
}

/**
 * Adds the question to the definition part of an xAPIEvent
 *
 * @param {H5P.XAPIEvent} xAPIEvent to add a question to
 */
function addQuestionToXAPI(xAPIEvent, options, question) {
  const definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
  definition.description = {
    'en-US': question,
  };
  definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
  definition.interactionType = 'choice';

  definition.choices = getChoices(options);
  definition.correctResponsePattern = getCorrectOptions(options);
}

/**
 * Adds the response to the definition part of an xAPIEvent
 * @param {H5P.XAPIEvent} xAPIEvent to add a response to
 */
function addResponseToXAPI(xAPIEvent, options) {
  xAPIEvent.data.statement.result.response = options
    .flatMap(function (option, index) {
      if (option.isSelected()) {
        return index;
      }
      return [];
    })
    .toString()
    .replaceAll(',', '[,]'); // [,] is the deliminator used when multiple answers are corect
}

/**
 * Creates a list of choice objects with id and description
 * @returns {Object[]} List of options the player could choose from
 */
function getChoices(options) {
  return options.map((option, index) => ({
    id: index.toString(),
    description: {
      'en-US': option.getDescription(),
    },
  }));
}

/**
 * Creates a list of correct response patterns for an xAPI event
 * @returns {String[]} Correct response patterns for the task
 */
function getCorrectOptions(options) {
  return options
    .flatMap(function (option, index) {
      if (option.isCorrect()) {
        return index;
      }
      return [];
    })
    .toString()
    .replaceAll(',', '[,]'); // [,] is the deliminator used when multiple answers are corect
}