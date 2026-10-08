import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const SAMPLE_JOBS = [
  {
    title: "Machine Learning Engineer",
    description:
      "We are looking for a Machine Learning Engineer with Python, machine learning, scikit-learn, TensorFlow, SQL, Docker, AWS, data analysis, and model deployment experience.",
  },
  {
    title: "Frontend Developer",
    description:
      "Build accessible web products using JavaScript, React, TypeScript, HTML, CSS, REST API, Git, testing, and responsive design. Experience with Node.js is a plus.",
  },
];

const SCORE_LABELS = {
  contact_details: ["Contact details", 15],
  skills_section: ["Skills section", 20],
  education: ["Education", 15],
  experience: ["Experience", 15],
  projects: ["Projects", 10],
  relevant_skills: ["Relevant skills", 15],
  measurable_achievements: ["Measurable achievements", 10],
};

function Icon({ name, size = 20 }) {
  const paths = {
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16.5v2A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-2" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function ScoreRing({ score }) {
  return (
    <div className="score-ring" style={{ "--score": `${score * 3.6}deg` }}>
      <div className="score-ring-inner">
        <strong>{score}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([{ title: "", description: "" }]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const fileInput = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((data) => setApiStatus(data.status === "ok" ? "online" : "offline"))
      .catch(() => setApiStatus("offline"));
  }, []);

  function chooseFile(selected) {
    setError("");
    if (!selected) return;
    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setFile(null);
      setResult(null);
      setNotice("");
      setError("Please choose a PDF or DOCX resume.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setResult(null);
      setNotice("");
      setError("The file is larger than 10 MB. Choose a smaller resume.");
      return;
    }
    setFile(selected);
    setResult(null);
    setNotice("");
  }

  function updateJob(index, key, value) {
    setJobs((current) => current.map((job, position) => position === index ? { ...job, [key]: value } : job));
    setResult(null);
    setNotice("");
  }

  function loadSamples() {
    setJobs(SAMPLE_JOBS.map((job) => ({ ...job })));
    setResult(null);
    setNotice("");
    setError("");
  }

  async function analyze(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!file) {
      setError("Upload a PDF or DOCX resume to get started.");
      return;
    }
    const filledJobs = jobs.filter((job) => job.description.trim());
    if (!filledJobs.length) {
      setError("Add at least one job description to see your job match.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jobs", JSON.stringify(filledJobs));
      const response = await fetch(`${API_BASE}/api/analyze`, { method: "POST", body: form });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Analyzer returned an unreadable response (HTTP ${response.status}). Check that the API is running.`);
      }
      if (!response.ok) throw new Error(data.detail || "Resume analysis failed. Please try again.");
      setResult(data);
      if (data.storage_status === "error") setNotice(`Analysis completed, but MongoDB history could not be saved: ${data.storage_message}`);
      else if (data.storage_status === "saved") setNotice("Analysis complete. Your file and resume text were not retained; a summary (filename, name, detected skills, score, and job matches) was saved to MongoDB history.");
      else if (data.storage_status === "disabled") setNotice("Analysis complete. Resume files and text are not retained; no analysis history was saved. Add MongoDB to enable optional history.");
      else setNotice("Analysis complete. The resume was processed for this request and not retained afterward.");
    } catch (requestError) {
      setError(requestError.message || "Could not reach the analyzer. Check that both servers are running.");
    } finally {
      setBusy(false);
    }
  }

  function downloadReport() {
    if (!result) return;
    const rows = [
      ["AI RESUME ANALYSIS REPORT", ""],
      ["Resume", result.filename],
      ["Candidate", result.candidate.name || "Not detected"],
      ["Email", result.candidate.email || "Not detected"],
      ["Phone", result.candidate.phone || "Not detected"],
      ["Resume score", `${result.resume_score}/100`],
      ["Skills", result.skills.join(", ") || "No skills detected"],
      ["Education", result.education.join(" | ") || "Not detected"],
      ["Experience", result.experience.join(" | ") || "Not detected"],
      ...result.job_matches.flatMap((match) => [
        [`Job: ${match.title}`, ""],
        ["Match", `${match.match_percentage}%`],
        ["Matched skills", match.matched_skills.join(", ") || "None"],
        ["Missing skills", match.missing_skills.join(", ") || "None"],
        ["Interview topics", (match.interview_prep?.topics || []).map((topic) => `${topic.topic} (${topic.priority})`).join("; ") || "Not available"],
        ["Interview practice questions", (match.interview_prep?.practice_questions || []).join("\n") || "Not available"],
        ["Interview preparation plan", (match.interview_prep?.preparation_plan || []).join("\n") || "Not available"],
      ]),
      ["Suggestions", result.suggestions.map((item) => `- ${item}`).join("\n")],
    ];
    const csv = rows.map((row) => row.map((cell) => {
      const value = String(cell);
      const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-analysis-report.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="SkillMatch home">
          <span className="brand-mark"><Icon name="spark" size={22} /></span>
          <span>skillmatch<span className="brand-period">.</span></span>
        </a>
        <p className="nav-caption">WORKSPACE</p>
        <a className="nav-link active" href="#analyzer"><Icon name="chart" size={18} /> Resume analyzer</a>
        <a className="nav-link" href="#results"><Icon name="file" size={18} /> Analysis report</a>
        <a className="nav-link" href="#interview-prep"><Icon name="spark" size={18} /> Interview prep</a>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="privacy-icon"><Icon name="check" size={16} /></span>
            <strong>Private by design</strong>
            <p>Uploaded files and full resume text are not retained. MongoDB can store an optional analysis summary.</p>
          </div>
          <div className="api-indicator">
            <span className={`status-dot ${apiStatus}`} />
            <span>{apiStatus === "online" ? "Analyzer API online" : apiStatus === "checking" ? "Connecting to API..." : "Analyzer API offline"}</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>Resume analyzer</strong></div>
          <div className="topbar-right"><span className="ai-badge"><Icon name="spark" size={14} /> AI-POWERED ANALYSIS</span><span className="avatar">AS</span></div>
        </header>

        <div className="content-wrap">
          <section className="welcome">
            <div>
              <p className="overline">YOUR NEXT OPPORTUNITY STARTS HERE</p>
              <h1>Make your resume<br /><span>work smarter.</span></h1>
              <p className="welcome-copy">Understand your strengths, compare job fit, and get focused interview topics and practice questions for each role.</p>
            </div>
            <div className="hero-decoration" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-spark"><Icon name="spark" size={48} /></div><span className="hero-label">GOOD THINGS<br />ARE AHEAD</span></div>
          </section>

          <form id="analyzer" className="analyzer-form" onSubmit={analyze}>
            <section className="panel upload-panel">
              <div className="section-heading"><div className="step-number">01</div><div><h2>Upload your resume</h2><p>Start with a PDF or DOCX. We’ll take it from here.</p></div></div>
              <div
                className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  hidden
                  onChange={(event) => {
                    chooseFile(event.target.files[0]);
                    event.target.value = "";
                  }}
                />
                <span className="upload-icon"><Icon name={file ? "file" : "upload"} size={23} /></span>
                {file ? <><strong className="file-name">{file.name}</strong><span className="drop-hint">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</span></> : <><strong>Drop your resume here, or <button type="button" className="text-button" onClick={() => fileInput.current?.click()}>browse files</button></strong><span className="drop-hint">PDF or DOCX · Up to 10 MB</span></>}
              </div>
            </section>

            <section className="panel jobs-panel">
              <div className="section-heading"><div className="step-number">02</div><div><h2>Add job descriptions</h2><p>Compare job fit and tailor interview prep for each role.</p></div></div>
              {jobs.map((job, index) => (
                <div className="job-input-card" key={index}>
                  <div className="job-card-top"><label htmlFor={`job-title-${index}`}>JOB {String(index + 1).padStart(2, "0")} <span>OPTIONAL TITLE</span></label>{jobs.length > 1 &&                   <button type="button" className="icon-button" aria-label="Remove job" onClick={() => { setJobs((current) => current.filter((_, position) => position !== index)); setResult(null); setNotice(""); }}><Icon name="close" size={16} /></button>}</div>
                  <input id={`job-title-${index}`} className="title-input" maxLength="100" placeholder="e.g. Machine Learning Engineer" value={job.title} onChange={(event) => updateJob(index, "title", event.target.value)} />
                  <textarea aria-label={`Job description ${index + 1}`} rows="4" maxLength="12000" placeholder="Paste the job description here. Include responsibilities and required skills for a more useful comparison." value={job.description} onChange={(event) => updateJob(index, "description", event.target.value)} />
                </div>
              ))}
              <div className="job-actions">
                <button type="button" className="add-job-button" disabled={jobs.length >= 10} onClick={() => { setJobs((current) => [...current, { title: "", description: "" }]); setResult(null); setNotice(""); }}><Icon name="plus" size={16} /> Add another job</button>
                <button type="button" className="sample-button" onClick={loadSamples}>Try sample jobs <Icon name="arrow" size={14} /></button>
              </div>
            </section>

            {error && <div className="alert error-alert" role="alert">{error}</div>}
            <button className="analyze-button" type="submit" disabled={busy}>
              <Icon name="spark" size={18} /> {busy ? "Analyzing your resume..." : "Analyze my resume"} {!busy && <span aria-hidden="true">→</span>}
            </button>
            <p className="form-note">Your file and resume text are not retained. When MongoDB history is enabled, the report explains which analysis details are saved.</p>
          </form>

          {result && (
            <section className="results" id="results" aria-live="polite">
              <div className="results-heading">
                <div>
                  <p className="overline">YOUR PERSONALIZED REPORT</p>
                  <h2>Here’s your career snapshot.</h2>
                  <p>Based on <strong>{result.filename}</strong></p>
                </div>
                <div className="report-actions">
                  <button type="button" className="export-button" onClick={downloadReport}>
                    <Icon name="download" size={16} /> Export CSV
                  </button>
                  <button type="button" className="export-button" onClick={() => window.print()}>
                    Print / Save PDF
                  </button>
                </div>
              </div>
              {notice && (
                <div className={`alert ${result.storage_status === "error" ? "error-alert" : "notice-alert"}`} role="status">
                  {notice}
                </div>
              )}
              <div className="score-grid">
                <article className="result-card resume-score-card">
                  <div>
                    <p className="card-label">RESUME SCORE</p>
                    <h3>Looking good{result.resume_score >= 75 ? "!" : " — room to grow"}</h3>
                    <p className="muted-copy">A practical checklist score, not a hiring decision.</p>
                  </div>
                  <ScoreRing score={result.resume_score} />
                </article>
                {result.job_matches.slice(0, 2).map((match, index) => (
                  <article className="result-card match-score-card" key={`${index}-${match.title}`}>
                    <p className="card-label">JOB MATCH</p>
                    <h3>{match.title}</h3>
                    <div className="match-number">{match.match_percentage}<span>%</span></div>
                    <div className="progress-track">
                      <div className="progress-value" style={{ width: `${match.match_percentage}%` }} />
                    </div>
                    <p className="muted-copy">
                      {match.required_skills.length
                        ? `${match.matched_skills.length} of ${match.required_skills.length} recognized skills matched`
                        : "No recognized skills; match is based on text similarity"}
                    </p>
                  </article>
                ))}
              </div>

              <article className="result-card score-breakdown-card">
                <div className="report-card-heading">
                  <div>
                    <h3>Resume score breakdown</h3>
                    <p className="muted-copy">Checklist score, with every category adding up to 100 points</p>
                  </div>
                  <span className="subtle-tag">SCORING RUBRIC</span>
                </div>
                <div className="breakdown-list">
                  {Object.entries(SCORE_LABELS).map(([key, [label, maximum]]) => {
                    const points = result.score_breakdown[key] || 0;
                    return (
                      <div className="breakdown-row" key={key}>
                        <span>{label}</span>
                        <div className="breakdown-track">
                          <div className="breakdown-value" style={{ width: `${(points / maximum) * 100}%` }} />
                        </div>
                        <strong>{points}<span> / {maximum}</span></strong>
                      </div>
                    );
                  })}
                </div>
              </article>

              <div className="report-grid">
                <article className="result-card">
                  <div className="report-card-heading">
                    <h3>Candidate profile</h3>
                    <span className="subtle-tag">EXTRACTED</span>
                  </div>
                  <dl className="detail-list">
                    <div><dt>Name</dt><dd>{result.candidate.name || "Not detected"}</dd></div>
                    <div><dt>Email</dt><dd>{result.candidate.email || "Not detected"}</dd></div>
                    <div><dt>Phone</dt><dd>{result.candidate.phone || "Not detected"}</dd></div>
                  </dl>
                </article>
                <article className="result-card">
                  <div className="report-card-heading">
                    <h3>Education &amp; experience</h3>
                    <span className="subtle-tag">EXTRACTED</span>
                  </div>
                  <div className="detail-block">
                    <strong>Education</strong>
                    <p>{result.education.length ? result.education.join(" · ") : "No education keywords detected"}</p>
                  </div>
                  <div className="detail-block">
                    <strong>Experience indicators</strong>
                    <p>{result.experience.length ? result.experience.join(" · ") : "No experience indicators detected"}</p>
                  </div>
                </article>
              </div>

              <article className="result-card skills-card">
                <div className="report-card-heading">
                  <div>
                    <h3>Your skill set</h3>
                    <p className="muted-copy">Skills identified in your resume</p>
                  </div>
                  <span className="subtle-tag">{result.skills.length} SKILLS</span>
                </div>
                <div className="skill-chips">
                  {result.skills.length ? result.skills.map((skill) => (
                    <span className="skill-chip" key={skill}><Icon name="check" size={13} />{skill}</span>
                  )) : (
                    <p className="muted-copy">No skills were identified. Try a text-based PDF or DOCX with a skills section.</p>
                  )}
                </div>
              </article>

              <article className="result-card job-results-card">
                <div className="report-card-heading">
                  <div>
                    <h3>Job-by-job match</h3>
                    <p className="muted-copy">A combined TF-IDF text similarity and skill-coverage score</p>
                  </div>
                  <span className="subtle-tag"><Icon name="chart" size={13} /> NLP MATCHING</span>
                </div>
                <div className="job-match-list">
                  {result.job_matches.map((match, index) => (
                    <div className="job-match" key={`${index}-${match.title}`}>
                      <div className="match-top">
                        <div>
                          <h4>{match.title}</h4>
                          <p>{match.match_percentage}% match · Text similarity {match.text_similarity}%</p>
                        </div>
                        <span className="match-pill">{match.match_percentage}%</span>
                      </div>
                      <div className="skills-comparison">
                        <div>
                          <strong>Matched skills</strong>
                          <div className="skill-chips">
                            {match.matched_skills.length ? match.matched_skills.map((skill) => (
                              <span className="skill-chip good" key={skill}><Icon name="check" size={13} />{skill}</span>
                            )) : <span className="empty-label">None detected</span>}
                          </div>
                        </div>
                        <div>
                          <strong>Skills to develop</strong>
                          <div className="skill-chips">
                            {match.missing_skills.length ? match.missing_skills.map((skill) => (
                              <span className="skill-chip missing" key={skill}>{skill}</span>
                            )) : <span className="empty-label">No missing skills detected</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="result-card interview-prep-card" id="interview-prep">
                <div className="report-card-heading interview-prep-heading">
                  <div>
                    <h3>Interview preparation</h3>
                    <p className="muted-copy">Role-specific topics, practice questions, and a focused plan based on your resume and each job description.</p>
                  </div>
                  <span className="subtle-tag"><Icon name="spark" size={13} /> PERSONALIZED</span>
                </div>
                <div className="interview-prep-list">
                  {result.job_matches.map((match, index) => {
                    const prep = match.interview_prep || {};
                    return (
                      <section className="interview-job-prep" key={`${index}-${match.title}`}>
                        <div className="interview-job-heading">
                          <div>
                            <span className="interview-role-label">PREP FOR ROLE</span>
                            <h4>{match.title}</h4>
                          </div>
                          <span className="interview-topic-count">{(prep.topics || []).length} focus topics</span>
                        </div>
                        <div className="interview-prep-columns">
                          <div className="interview-prep-block">
                            <h5>Topics to prepare</h5>
                            {prep.topics?.length ? (
                              <ul className="interview-topic-list">
                                {prep.topics.map((topic) => (
                                  <li className={topic.priority === "High priority" ? "interview-topic-high" : ""} key={`${topic.topic}-${topic.priority}`}>
                                    <div className="interview-topic-title">
                                      <strong>{topic.topic}</strong>
                                      <span className={`priority-badge ${topic.priority === "High priority" ? "priority-high" : ""}`}>{topic.priority}</span>
                                    </div>
                                    <p>{topic.guidance}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="interview-empty">Interview prep is not available for this report. Analyze again after the analyzer update is active.</p>
                            )}
                          </div>
                          <div className="interview-prep-block">
                            <h5>Practice questions</h5>
                            <ol className="interview-question-list">
                              {(prep.practice_questions || []).map((question) => <li key={question}>{question}</li>)}
                            </ol>
                            <h5 className="prep-plan-title">Your preparation plan</h5>
                            <ol className="prep-plan-list">
                              {(prep.preparation_plan || []).map((step) => <li key={step}>{step}</li>)}
                            </ol>
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
                <p className="interview-note">Use these suggestions as practice prompts, not predictions of exact interview questions. Build answers from your real experience and be transparent about skills you are still learning.</p>
              </article>

              <article className="result-card suggestions-card">
                <div className="report-card-heading">
                  <h3>Ways to strengthen your resume</h3>
                  <span className="subtle-tag"><Icon name="spark" size={13} /> PERSONALIZED</span>
                </div>
                <ul>
                  {result.suggestions.map((suggestion) => (
                    <li key={suggestion}><span><Icon name="arrow" size={15} /></span>{suggestion}</li>
                  ))}
                </ul>
              </article>
              <p className="disclaimer">For guidance only. This score is based on resume structure, detected skills, and text similarity. It is not a hiring decision and does not predict job performance.</p>
            </section>
          )}
          {!result && <section className="how-it-works"><div className="how-icon"><Icon name="clock" size={18} /></div><div><strong>What happens next?</strong><p>We identify resume skills, compare each role, then suggest interview topics, questions, and practical preparation steps.</p></div><span>ABOUT 10 SECONDS</span></section>}
          <footer className="app-footer"><span>SkillMatch <span className="brand-period">•</span> AI Resume Analyzer</span><span>Built to help you take the next step.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
