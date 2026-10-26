
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Routes,
  Route,
  useNavigate,
  useParams
} from "react-router-dom";
import axios from "axios";
import "./index.css";

const API = "http://localhost:5000/api/feedback";

const courses = [
  ["MERN Stack Development", "CRS-001", "12 Weeks"],
  ["Web Development", "CRS-002", "10 Weeks"],
  ["Python Programming", "CRS-003", "8 Weeks"],
  ["Data Structures", "CRS-004", "8 Weeks"]
];

function Header() {
  return (
    <header>
      <Link to="/" className="logo">feedback.txt</Link>

      <nav>
        <Link to="/">[ dashboard ]</Link>
        <Link to="/add">[ + add ]</Link>
      </nav>
    </header>
  );
}

function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const res = await axios.get(API);
      setItems(res.data);
      setError("");
    } catch {
      setError("API not responding. Is the backend running?");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!window.confirm("Delete this entry?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      await load();
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  const filtered = items.filter(item =>
    `${item.courseName} ${item.courseId} ${item.comments}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const average = items.length
    ? (
        items.reduce((sum, item) => sum + item.rating, 0) /
        items.length
      ).toFixed(1)
    : "0.0";

  const courseSummary = courses.map(([name, id, duration]) => {
    const feedback = items.filter(item => item.courseId === id);

    const courseAverage = feedback.length
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) /
          feedback.length
        ).toFixed(1)
      : null;

    return {
      id,
      name,
      duration,
      average: courseAverage,
      count: feedback.length
    };
  });

  return (
    <>
      <Header />

      <main>
        <p className="muted">/ home / dashboard</p>
        <h1>Course feedback</h1>
        <p>A small place to keep course opinions.</p>

        <section className="stats">
          <div>
            <span>entries</span>
            <strong>{items.length}</strong>
          </div>

          <div>
            <span>courses</span>
            <strong>
              {new Set(items.map(item => item.courseId)).size}
            </strong>
          </div>

          <div>
            <span>average</span>
            <strong>{average}/5</strong>
          </div>
        </section>

        <section className="course-summary">
          <h2>Course overview</h2>
          <p className="muted">
            Average rating based on submitted feedback.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course name</th>
                  <th>Duration</th>
                  <th>Overall rating</th>
                  <th>Responses</th>
                </tr>
              </thead>

              <tbody>
                {courseSummary.map(course => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.name}</td>
                    <td>{course.duration}</td>
                    <td>
                      {course.average === null
                        ? "No ratings yet"
                        : `${course.average} / 5`}
                    </td>
                    <td>{course.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="tools">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="find something..."
            aria-label="Search feedback"
          />

          <button onClick={() => navigate("/add")}>
            + new entry
          </button>
        </div>

        {error && <p className="error">! {error}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Course</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>{item.courseId}</td>
                  <td>{item.courseName}</td>
                  <td>{item.courseDuration}</td>
                  <td>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </td>
                  <td className="comment">{item.comments}</td>

                  <td className="actions">
                    <button
                      onClick={() => navigate(`/edit/${item._id}`)}
                    >
                      edit
                    </button>

                    <button
                      className="delete"
                      onClick={() => remove(item._id)}
                    >
                      del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <p className="muted empty">
            {search
              ? "No matching feedback found."
              : "Nothing here. Add an entry?"}
          </p>
        )}

        <p className="footnote">
          // data comes from MongoDB. magic.
        </p>
      </main>
    </>
  );
}

function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [courseName, setCourseName] = useState("");
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    async function loadEntry() {
      try {
        const res = await axios.get(API);
        const item = res.data.find(entry => entry._id === id);

        if (!item) {
          setError("Entry not found.");
          return;
        }

        setCourseName(item.courseName);
        setComments(item.comments);
        setRating(String(item.rating));
      } catch {
        setError("Could not load entry.");
      }
    }

    loadEntry();
  }, [editing, id]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = {
        courseName,
        comments: comments.trim(),
        rating: Number(rating)
      };

      if (editing) {
        await axios.put(`${API}/${id}`, data);
      } else {
        await axios.post(API, data);
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Save failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header />

      <main className="form-page">
        <p className="muted">
          / home / {editing ? "edit" : "new"}
        </p>

        <h1>{editing ? "Edit entry" : "New feedback"}</h1>
        <p>No big deal. Just fill this in.</p>

        <form onSubmit={submit}>
          <label htmlFor="course">Course</label>

          <select
            id="course"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            required
          >
            <option value="">pick one</option>

            {courses.map(course => (
              <option key={course[1]} value={course[0]}>
                {course[0]}
              </option>
            ))}
          </select>

          <label htmlFor="comments">Comment</label>

          <textarea
            id="comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Type something useful..."
            maxLength={1000}
            required
          />

          <label htmlFor="rating">Rating</label>

          <select
            id="rating"
            value={rating}
            onChange={e => setRating(e.target.value)}
            required
          >
            {[1, 2, 3, 4, 5].map(number => (
              <option key={number} value={number}>
                {number} / 5
              </option>
            ))}
          </select>

          {error && <p className="error">! {error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="plain"
              onClick={() => navigate("/")}
            >
              cancel
            </button>

            <button type="submit" disabled={saving}>
              {saving ? "saving..." : "save entry"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<FeedbackForm />} />
        <Route path="/edit/:id" element={<FeedbackForm />} />
      </Routes>
    </BrowserRouter>
  );
}
