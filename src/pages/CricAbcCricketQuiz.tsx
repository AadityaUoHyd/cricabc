import { type FC, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QuizBgImg from '../assets/quizBg.png';
import { Trophy, Play, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

// Cloudinary URLs for sound effects
const CORRECT_SOUND_URL = 'https://res.cloudinary.com/dppx4dm9a/video/upload/v1748484190/correct_s55rpg.mp3';
const INCORRECT_SOUND_URL = 'https://res.cloudinary.com/dppx4dm9a/video/upload/v1748484190/incorrect_jy1fdd.mp3';
const CONGRATS_SOUND_URL = 'https://res.cloudinary.com/dppx4dm9a/video/upload/v1748484190/congrats_wcm0mq.mp3'; 

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionResult extends QuizQuestion {
  userAnswer: string | null;
  isCorrect: boolean | null;
  points: number;
}

const CricABCCricketQuiz: FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Refs for audio elements
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
  const congratsAudioRef = useRef<HTMLAudioElement | null>(null); // New ref for congrats audio

  useEffect(() => {
    // Initialize audio elements
    correctAudioRef.current = new Audio(CORRECT_SOUND_URL);
    incorrectAudioRef.current = new Audio(INCORRECT_SOUND_URL);
    congratsAudioRef.current = new Audio(CONGRATS_SOUND_URL); // Initialize congrats audio

    const fetchQuestions = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/quiz/random`;
        // Removed debug log
        const response = await axios.get(apiUrl);
        // Removed debug log

        if (Array.isArray(response.data) && response.data.length > 0) {
          const validatedQuestions: QuizQuestion[] = response.data.map((q: any) => ({
            id: String(q.id || ''),
            question: String(q.question || ''),
            options: Array.isArray(q.options) ? q.options.map(String) : [],
            correctAnswer: String(q.correctAnswer || ''),
          })).slice(0, 5); // Limit to 5 questions

          setQuestions(validatedQuestions);
          // Removed debug log
        } else {
          console.warn('API response data is not an array or is empty. Setting questions to empty array.');
          setQuestions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch quiz questions:', err);
        setLoading(false);
      }
    };
    fetchQuestions();

    // Cleanup function for audio elements
    return () => {
      correctAudioRef.current?.pause();
      correctAudioRef.current = null;
      incorrectAudioRef.current?.pause();
      incorrectAudioRef.current = null;
      congratsAudioRef.current?.pause();
      congratsAudioRef.current = null;
    };
  }, []);

  // Function to play general correct/incorrect sound effects
  const playSound = (isCorrect: boolean) => {
    if (isCorrect && correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(e => console.error("Error playing correct sound:", e));
    } else if (!isCorrect && incorrectAudioRef.current) {
      incorrectAudioRef.current.currentTime = 0;
      incorrectAudioRef.current.play().catch(e => console.error("Error playing incorrect sound:", e));
    }
  };

  // Function to play congratulations sound
  const playCongratsSound = () => {
    if (congratsAudioRef.current) {
      congratsAudioRef.current.currentTime = 0;
      congratsAudioRef.current.play().catch(e => console.error("Error playing congratulations sound:", e));
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error("Attempted to submit answer for a null/undefined current question.");
      nextQuestion();
      return;
    }

    let pointsAwarded = 0;
    let isAnswerCorrect: boolean | null = null;
    let userAnswered: string | null = selectedAnswer;

    if (!selectedAnswer) {
      pointsAwarded = 0;
      isAnswerCorrect = null;
      userAnswered = null;
      // Removed debug log
    } else {
      if (selectedAnswer === currentQuestion.correctAnswer) {
        pointsAwarded = 20;
        isAnswerCorrect = true;
        playSound(true);
        // Removed debug log
      } else {
        pointsAwarded = -10;
        isAnswerCorrect = false;
        playSound(false);
        // Removed debug log
      }
    }

    // Update score, and crucially, check for final quiz completion conditions here
    setScore((prevScore) => {
      const newScore = prevScore + pointsAwarded;

      // Check if this is the very last question AND score meets threshold
      if (currentQuestionIndex === questions.length - 1) {
        const maxPossibleScore = questions.length * 20; // Max score for 5 questions is 100
        const requiredScoreForCongrats = maxPossibleScore * 0.8; // 80% of max score

        if (newScore >= requiredScoreForCongrats) {
          setShowConfetti(true);
          playCongratsSound();
        }
      }
      return newScore;
    });

    // Record question result
    setQuestionResults((prevResults) => [
      ...prevResults,
      {
        ...currentQuestion,
        userAnswer: userAnswered,
        isCorrect: isAnswerCorrect,
        points: pointsAwarded,
      },
    ]);

    setSelectedAnswer(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      // Confetti and congrats sound logic is now handled in setScore callback
    }
  };

  const resetQuiz = () => {
    // Stop any playing sounds on reset
    correctAudioRef.current?.pause();
    incorrectAudioRef.current?.pause();
    congratsAudioRef.current?.pause();

    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setLoading(true);
    setQuestionResults([]);
    setShowConfetti(false); // Hide confetti

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/quiz/random`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          const validatedQuestions: QuizQuestion[] = response.data.map((q: any) => ({
            id: String(q.id || ''),
            question: String(q.question || ''),
            options: Array.isArray(q.options) ? q.options.map(String) : [],
            correctAnswer: String(q.correctAnswer || ''),
          })).slice(0, 5);
          setQuestions(validatedQuestions);
        } else {
          setQuestions([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch quiz questions on reset:', err);
        setLoading(false);
      }
    };
    fetchQuestions();
  };

  // Calculate progress bar width
  const finalProgressWidth = quizCompleted ? 100 : ((currentQuestionIndex) / questions.length) * 100;

  // --- RENDERING LOGIC ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${QuizBgImg})` }}>
        <div className="w-full max-w-xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-lg text-center text-gray-700">
          Loading Quiz...
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${QuizBgImg})` }}>
        <div className="w-full max-w-xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-lg text-center text-gray-700">
          No quiz questions available.
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion && !quizCompleted) {
    console.error('Runtime Error: currentQuestion is undefined or null!', { currentQuestionIndex, questions });
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${QuizBgImg})` }}>
        <div className="w-full max-w-xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-lg text-center text-red-500">
          Error: Quiz data is malformed. Please refresh.
        </div>
      </div>
    );
  }

  if (currentQuestion && !Array.isArray(currentQuestion.options)) {
    console.error('Runtime Error: currentQuestion.options is not an array!', { currentQuestionIndex, options: currentQuestion.options });
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${QuizBgImg})` }}>
        <div className="w-full max-w-xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-lg text-center text-red-500">
          Error: Quiz options data is malformed. Please refresh.
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${QuizBgImg})` }}
    >
      {showConfetti && <Confetti />}

      <div className="w-full max-w-xl bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-purple-600 mb-6 flex items-center justify-center">
          <Trophy className="w-8 h-8 mr-2" />
          CricABC Cricket Quiz
        </h1>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${finalProgressWidth}%` }}
          ></div>
        </div>

        {quizCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-800">Quiz Completed!</h2>
            <p className="text-gray-600">
              Your Final Score:{' '}
              <span className="text-purple-700 font-bold">{score}</span> out of{' '}
              <span className="text-purple-700 font-bold">{questions.length * 20}</span>
            </p>

            <div className="mt-6 text-left">
              <h3 className="text-lg font-semibold mb-2">Question Breakdown:</h3>
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {questionResults.map((result, index) => (
                  <li key={index} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium text-gray-800">
                      Q{index + 1}: {result.question}
                    </p>
                    <p className={`text-sm ${result.isCorrect ? 'text-green-600' : result.isCorrect === false ? 'text-red-600' : 'text-gray-500'}`}>
                      Your Answer: {result.userAnswer || 'Skipped'}
                      {result.isCorrect === true && <span className="ml-2 font-bold">(Correct!)</span>}
                      {result.isCorrect === false && <span className="ml-2 font-bold">(Incorrect!)</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      Correct Answer: <span className="font-medium">{result.correctAnswer}</span>
                    </p>
                    <p className="text-sm text-gray-700">Points: <span className="font-bold">{result.points}</span></p>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={resetQuiz}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition flex items-center justify-center mx-auto mt-6"
            >
              <Play className="w-4 h-4 mr-2" /> Play Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="text-gray-800">{currentQuestion.question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-4 py-2 rounded-md border transition ${
                    selectedAnswer === option
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white border-gray-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  submitAnswer();
                }}
                className="border border-purple-600 text-purple-600 px-5 py-2 rounded-md hover:bg-purple-100 transition flex items-center"
              >
                <XCircle className="w-4 h-4 mr-2" /> Skip
              </button>
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className={`px-5 py-2 rounded-md text-white transition flex items-center ${
                  selectedAnswer === null
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Submit
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Your Current Score: <span className="font-semibold">{score}</span> | Correct: +20 | Wrong: -10 | Skip: 0
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CricABCCricketQuiz;