import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const tests = [
  { id: 'FAQ', name: 'Functional Activities Questionnaire', icon: '📋' },
  { id: 'NPI', name: 'Neuropsychiatric Inventory', icon: '🧠' },
  { id: 'GDS', name: 'Geriatric Depression Scale', icon: '😊' },
  { id: 'CDR', name: 'Clinical Dementia Rating', icon: '📊' }
];

const FAQ_QUESTIONS = [
  'Writing checks, paying bills, balancing checkbook',
  'Assembling tax records, business affairs, papers',
  'Shopping alone for clothes, household necessities, groceries',
  'Playing a game of skill, working on a hobby',
  'Heating water, making a cup of coffee, turning off stove after use',
  'Preparing a balanced meal',
  'Keeping track of current events',
  'Paying attention to, understanding, discussing TV, book, magazine',
  'Remembering appointments, family occasions, holidays, medications',
  'Traveling out of neighborhood, driving, arranging transport',
];

const NPI_DOMAINS = [
  'Delusions', 'Hallucinations', 'Agitation/Aggression', 'Depression/Dysphoria', 'Anxiety', 'Elation/Euphoria',
  'Apathy/Indifference', 'Disinhibition', 'Irritability/Lability', 'Aberrant Motor Behavior', 'Nighttime Behavior Disturbances', 'Appetite/Eating'
];

const GDS_QUESTIONS = [
  'Are you basically satisfied with your life?',
  'Have you dropped many of your activities and interests?',
  'Do you feel that your life is empty?',
  'Do you often get bored?',
  'Are you hopeful about the future?',
  'Are you bothered by thoughts you can’t get out of your head?',
  'Are you in good spirits most of the time?',
  'Are you afraid that something bad is going to happen to you?',
  'Do you feel happy most of the time?',
  'Do you often feel helpless?',
  'Do you prefer to stay at home, rather than going out and doing new things?',
  'Do you feel you have more problems with memory than most?',
  'Do you think it is wonderful to be alive now?',
  'Do you feel pretty worthless the way you are now?',
  'Do you feel full of energy?'
];

const CDR_DOMAINS = [
  'Memory', 'Orientation', 'Judgment & Problem Solving', 'Community Affairs', 'Home & Hobbies', 'Personal Care'
];

function App() {
  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState({ FAQ: {}, NPI: {}, GDS: {}, CDR: {} });
  const [completed, setCompleted] = useState([]);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    // Reset current question when changing tests
    setCurrentQuestion(0);
    setTestStarted(false);
  }, [currentTest]);

  const handleSelectTest = (test) => {
    setCurrentTest(test);
  };

  const handleAnswerChange = (q, val) => {
    setAnswers({
      ...answers,
      [currentTest]: { ...answers[currentTest], [q]: val }
    });
  };

  const handleNPIChange = (domain, field, val) => {
    setAnswers({
      ...answers,
      NPI: {
        ...answers.NPI,
        [domain]: {
          ...answers.NPI[domain],
          [field]: val
        }
      }
    });
  };

  const handleSubmitTest = () => {
    setCompleted([...completed, currentTest]);
    setCurrentTest(null);
    setTestStarted(false);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/predict', answers);
      setResult(res.data.result);
    } catch (error) {
      console.error('Error predicting result:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionList = () => {
    switch(currentTest) {
      case 'FAQ': return FAQ_QUESTIONS;
      case 'GDS': return GDS_QUESTIONS;
      case 'NPI': return NPI_DOMAINS;
      case 'CDR': return CDR_DOMAINS;
      default: return [];
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentQuestion(0);
  };

  const handleNext = () => {
    const questions = getQuestionList();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isQuestionAnswered = (questionIndex) => {
    if (currentTest === 'FAQ') {
      return !!answers.FAQ[`Q${questionIndex+1}`];
    } else if (currentTest === 'GDS') {
      return !!answers.GDS[`Q${questionIndex+1}`];
    } else if (currentTest === 'NPI') {
      const domain = NPI_DOMAINS[questionIndex];
      return !!answers.NPI[domain]?.frequency && !!answers.NPI[domain]?.severity;
    } else if (currentTest === 'CDR') {
      const domain = CDR_DOMAINS[questionIndex];
      return !!answers.CDR[domain];
    }
    return false;
  };

  const getProgress = () => {
    const questions = getQuestionList();
    const answered = questions.filter((_, idx) => isQuestionAnswered(idx)).length;
    return (answered / questions.length) * 100;
  };

  const isTestComplete = () => {
    const questions = getQuestionList();
    return questions.every((_, idx) => isQuestionAnswered(idx));
  };

  const renderQuestion = () => {
    const questions = getQuestionList();
    
    if (currentTest === 'FAQ') {
      return (
        <div className="question-container active fade-in">
          <div className="question-number">Question {currentQuestion + 1} of {questions.length}</div>
          <div className="question-text">{questions[currentQuestion]}</div>
          <div className="options-container">
            {['Normal', 'Has difficulty but does by self', 'Requires assistance', 'Dependent'].map((option, idx) => (
              <button 
                key={idx} 
                className={`option-button ${answers.FAQ[`Q${currentQuestion+1}`] === String(idx) ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(`Q${currentQuestion+1}`, String(idx))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentTest === 'GDS') {
      return (
        <div className="question-container active fade-in">
          <div className="question-number">Question {currentQuestion + 1} of {questions.length}</div>
          <div className="question-text">{questions[currentQuestion]}</div>
          <div className="options-container">
            {['No', 'Yes'].map((option, idx) => (
              <button 
                key={idx} 
                className={`option-button ${answers.GDS[`Q${currentQuestion+1}`] === String(idx) ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(`Q${currentQuestion+1}`, String(idx))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentTest === 'NPI') {
      const domain = questions[currentQuestion];
      return (
        <div className="question-container active fade-in">
          <div className="question-number">Domain {currentQuestion + 1} of {questions.length}</div>
          <div className="question-text">{domain}</div>
          <div className="npi-row">
            <div className="npi-group">
              <div className="npi-label">Frequency</div>
              <div className="options-container">
                {['Occasionally', 'Often', 'Frequently', 'Very Frequently'].map((option, idx) => (
                  <button 
                    key={idx} 
                    className={`option-button ${answers.NPI[domain]?.frequency === String(idx + 1) ? 'selected' : ''}`}
                    onClick={() => handleNPIChange(domain, 'frequency', String(idx + 1))}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="npi-group">
              <div className="npi-label">Severity</div>
              <div className="options-container">
                {['Mild', 'Moderate', 'Severe'].map((option, idx) => (
                  <button 
                    key={idx} 
                    className={`option-button ${answers.NPI[domain]?.severity === String(idx + 1) ? 'selected' : ''}`}
                    onClick={() => handleNPIChange(domain, 'severity', String(idx + 1))}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (currentTest === 'CDR') {
      const domain = questions[currentQuestion];
      return (
        <div className="question-container active fade-in">
          <div className="question-number">Domain {currentQuestion + 1} of {questions.length}</div>
          <div className="question-text">{domain}</div>
          <div className="options-container">
            {['None', 'Questionable', 'Mild', 'Moderate', 'Severe'].map((option, idx) => {
              const value = idx === 0 ? '0' : idx === 1 ? '0.5' : String(idx - 1);
              return (
                <button 
                  key={idx} 
                  className={`option-button ${answers.CDR[domain] === value ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(domain, value)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Alzheimer's Screening App</h1>
        <p className="app-subtitle">Complete all four screening tests to receive a comprehensive assessment</p>
      </header>

      {!currentTest && completed.length < 4 && (
        <div className="test-selection fade-in">
          <h2 className="selection-title">Select a test to take:</h2>
          <div className="test-buttons">
            {tests.filter(t => !completed.includes(t.id)).map(test => (
              <button 
                key={test.id} 
                className={`test-button ${currentTest === test.id ? 'active' : ''}`}
                onClick={() => handleSelectTest(test.id)}
              >
                <span className="test-icon">{test.icon}</span>
                {test.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentTest && !testStarted && (
        <div className="test-container fade-in">
          <div className="test-header">
            <h2 className="test-title">
              {tests.find(t => t.id === currentTest)?.name}
            </h2>
          </div>
          <p>This test will help assess cognitive function and behavior patterns related to Alzheimer's disease.</p>
          <p>Please answer all questions as accurately as possible based on observations and experiences.</p>
          <div className="navigation">
            <button className="nav-button prev-button" onClick={() => setCurrentTest(null)}>
              Back to Tests
            </button>
            <button className="nav-button next-button" onClick={startTest}>
              Start Test
            </button>
          </div>
        </div>
      )}

      {currentTest && testStarted && (
        <div className="test-container fade-in">
          <div className="test-header">
            <h2 className="test-title">
              {tests.find(t => t.id === currentTest)?.name}
            </h2>
            <div className="test-progress">
              <div className="progress-text">
                {Math.round(getProgress())}% Complete
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgress()}%` }}></div>
              </div>
            </div>
          </div>

          {renderQuestion()}

          <div className="navigation">
            <button 
              className="nav-button prev-button" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            {currentQuestion < getQuestionList().length - 1 ? (
              <button 
                className="nav-button next-button" 
                onClick={handleNext}
                disabled={!isQuestionAnswered(currentQuestion)}
              >
                Next
              </button>
            ) : (
              <button 
                className="nav-button submit-button" 
                onClick={handleSubmitTest}
                disabled={!isTestComplete()}
              >
                Complete Test
              </button>
            )}
          </div>
        </div>
      )}

      {completed.length === 4 && !result && (
        <div className="predict-container fade-in">
          <h2 className="predict-title">All Tests Completed!</h2>
          <p className="predict-text">
            You have completed all four screening tests. Click the button below to analyze your results and generate a prediction.
          </p>
          <button 
            className={`predict-button ${loading ? '' : 'pulse'}`} 
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Prediction'}
          </button>
        </div>
      )}

      {result && (
        <div className="result-container fade-in">
          <h2 className="result-title">Assessment Result</h2>
          <p className="result-text">{result}</p>
          <button 
            className="restart-button" 
            onClick={() => {
              setCurrentTest(null);
              setAnswers({ FAQ: {}, NPI: {}, GDS: {}, CDR: {} });
              setCompleted([]);
              setResult(null);
            }}
          >
            Start New Assessment
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
