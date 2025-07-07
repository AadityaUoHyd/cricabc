import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '@radix-ui/react-label';
import { Edit2, Trash2 } from 'lucide-react';

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  serialNumber?: number;
}

export default function AdminQuiz() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [form, setForm] = useState<QuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchQuizQuestions();
  }, [page]);

  const fetchQuizQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/quiz`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size: 50 },
      });
      setQuizQuestions(response.data as QuizQuestion[]);
      setTotalPages(Number(response.headers['x-total-pages']) || 1);
      setTotalItems(Number(response.headers['x-total-elements']) || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch quiz questions');
      console.error('Fetch quiz questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === 'options' && typeof index === 'number') {
      const newOptions = [...form.options];
      newOptions[index] = value;
      setForm({ ...form, options: newOptions });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.question ||
      form.options.some((opt) => !opt) ||
      !form.correctAnswer ||
      !form.options.includes(form.correctAnswer)
    ) {
      setError('Please fill all fields and ensure the correct answer is one of the options.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (form.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/quiz/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/quiz`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      });
      setError(null);
      await fetchQuizQuestions();
      alert(form.id ? 'Quiz question updated successfully!' : 'Quiz question added successfully!');
    } catch (err) {
      setError(form.id ? 'Failed to update quiz question.' : 'Failed to add quiz question.');
      console.error('Quiz submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz: QuizQuestion) => {
    setForm(quiz);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz question?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchQuizQuestions();
      setError(null);
      alert('Quiz question deleted successfully!');
    } catch (err) {
      setError('Failed to delete quiz question');
      console.error('Delete quiz question error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg max-w-4xl mx-auto min-h-screen">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">
            Manage Quiz Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          {loading && <p className="text-purple-600 mb-4 text-sm">Loading...</p>}
          <form onSubmit={handleQuizSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question" className="text-sm font-medium text-gray-700">
                Question
              </Label>
              <textarea
                id="question"
                name="question"
                value={form.question}
                onChange={handleQuizChange}
                className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                rows={3}
                required
              />
            </div>
            {form.options.map((option, index) => (
              <div key={index}>
                <Label htmlFor={`option-${index}`} className="text-sm font-medium text-gray-700">
                  Option {index + 1}
                </Label>
                <input
                  type="text"
                  id={`option-${index}`}
                  name="options"
                  value={option}
                  onChange={(e) => handleQuizChange(e, index)}
                  className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                  required
                />
              </div>
            ))}
            <div>
              <Label htmlFor="correctAnswer" className="text-sm font-medium text-gray-700">
                Correct Answer
              </Label>
              <select
                id="correctAnswer"
                name="correctAnswer"
                value={form.correctAnswer}
                onChange={handleQuizChange}
                className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                required
              >
                <option value="">Select Correct Answer</option>
                {form.options.map((option, index) => (
                  <option key={index} value={option} disabled={!option}>
                    {option || `Option ${index + 1} (empty)`}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
            >
              {form.id ? 'Update Question' : 'Add Question'}
            </Button>
            {form.id && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                  })
                }
                className="w-full mt-2 border-purple-600 text-purple-600 text-sm sm:text-base"
              >
                Clear Form
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-purple-600">
            Quiz Questions List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {quizQuestions.length === 0 && !loading && (
              <p className="text-gray-600 text-sm">No quiz questions available.</p>
            )}
            {quizQuestions.map((quiz) => (
              <Card key={quiz.id} className="shadow-sm">
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-purple-600">
                      {quiz.serialNumber || 'N/A'}. {quiz.question}
                    </h3>
                    <ul className="text-sm text-gray-600 mt-2">
                      {quiz.options.map((option, optIndex) => (
                        <li key={optIndex} className={option === quiz.correctAnswer ? 'text-green-600 font-semibold' : ''}>
                          {optIndex + 1}. {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2 sm:mt-0 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quiz)}
                      disabled={loading}
                      className="text-purple-600 border-purple-600 text-xs sm:text-sm"
                    >
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quiz.id!)}
                      disabled={loading}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalItems > 0 && (
            <div className="mt-6 flex justify-between items-center space-x-2">
              <Button
                variant="outline"
                disabled={page === 0 || loading}
                onClick={() => setPage((prev) => prev - 1)}
                className="text-purple-600 border-purple-600 text-sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages} ({totalItems} total questions)
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((prev) => prev + 1)}
                className="text-purple-600 border-purple-600 text-sm"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}