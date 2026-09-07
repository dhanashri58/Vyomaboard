import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalculatorShapeUtil } from '../shapes/CalculatorShapeUtil';
import { extractQuestions, gradeSubmission } from '../lib/grading';
import { resetExamSession, getExamAnswers } from '../lib/examSession';
import { loadProfile, loadCustomFields } from '../lib/examProfile';

import { StandaloneMcq, StandaloneWritten, StandaloneCode } from '../components/StandaloneExamQuestions';

const MAX_WARNINGS = 3;

export default function ExamPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [screen, setScreen] = useState('loading'); // loading | ready | not-started | closed | already-submitted | in-exam | submitted | terminated
  const [examConfig, setExamConfig] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const examRef = useRef(null);

  const requestFullscreen = () => {
    const el = examRef.current || document.documentElement;
    if (!document.fullscreenEnabled) return false;
    return el.requestFullscreen().then(() => true).catch(() => false);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Track fullscreen state live (used for the resume banner).
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const userName = localStorage.getItem('userName') || 'Student';
  const userId = localStorage.getItem('userId') || 'anon-' + Math.random().toString(36).substring(2, 9);
  const submittedRef = useRef(false);
  const warningsRef = useRef(0);

  // Read questions directly from Firestore exam config
  useEffect(() => {
    if (examConfig && examConfig.questions) {
      setQuestionCount(examConfig.questions.length);
      setQuestionsReady(true);
    } else if (examConfig) {
      setQuestionCount(0);
      setQuestionsReady(true);
    }
  }, [examConfig]);

  // Load exam config + existing submission, then decide which screen to show
  useEffect(() => {
    const loadConfig = async () => {
      let config = null;
      let submission = null;
      try {
        const roomRes = await fetch(`/api/rooms/${id}`);
        const roomData = await roomRes.json();
        if (roomData.success && roomData.room) {
          config = roomData.room?.meta?.exam || { title: `Exam: ${id}`, durationMinutes: 0 };
        } else {
          config = { title: `Exam: ${id}`, durationMinutes: 0 };
        }

        const subRes = await fetch(`/api/submissions/${id}/${userId}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success) submission = subData.submission;
        }
      } catch (e) {
        console.error('Failed to load exam config', e);
        config = { title: `Exam: ${id}`, durationMinutes: 0 };
      }

      setExamConfig(config);
      setExistingSubmission(submission);

      if (submission) {
        setScreen('already-submitted');
        return;
      }

      const now = Date.now();
      const openAt = config.openAt ? new Date(config.openAt).getTime() : null;
      const closeAt = config.closeAt ? new Date(config.closeAt).getTime() : null;
      if (openAt && now < openAt) {
        setScreen('not-started');
      } else if (closeAt && now > closeAt) {
        setScreen('closed');
      } else {
        setScreen('ready');
      }
    };
    loadConfig();
  }, [id]);


  const startExam = async () => {
    if (questionsReady && questionCount === 0) return; // never start an empty exam
    setScreen('in-exam'); // start regardless — fullscreen is enforced but never a trap
    requestFullscreen();
  };

  // Auto-exit fullscreen the moment the exam ends (submitted / terminated / etc.)
  useEffect(() => {
    if (screen !== 'in-exam') exitFullscreen();
  }, [screen]);

  // Never leave the app stuck in fullscreen
  useEffect(() => () => exitFullscreen(), []);

  // Fresh isolated answer session for this student
  useEffect(() => {
    resetExamSession();
  }, [id]);


  const submitExam = useCallback(async (reason) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const shapes = examConfig?.questions || [];
    const questions = extractQuestions(shapes);
    // Overlay the isolated per-tab answers (they never touch the shared doc)
    const isolatedAnswers = getExamAnswers();
    questions.forEach(q => {
      const a = isolatedAnswers[q.shapeId];
      if (a) q.studentAnswer = a.value;
    });
    const grade = gradeSubmission(questions);

    const submission = {
      studentId: userId,
      studentName: userName,
      roomId: id,
      profile: { ...loadProfile(), custom: loadCustomFields(id) },
      submittedAt: new Date().toISOString(),
      reason: reason || 'manual',
      answers: questions,
      totalMarks: grade.totalMarks,
      obtainedMarks: grade.obtainedMarks,
      autoGraded: grade.autoGraded,
      pendingManual: grade.pendingManual,
      status: grade.pendingManual > 0 ? 'submitted' : 'graded',
      warnings: warningsRef.current
    };

    try {
      await fetch(`/api/submissions/${id}/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      exitFullscreen();
      setSubmissionResult(submission);
      setScreen('submitted');
    } catch (e) {
      console.error('Failed to save submission', e);
      exitFullscreen();
      setSubmissionResult(submission);
      setScreen('submitted');
    } finally {
      setSubmitting(false);
    }
  }, [editor, id, userId, userName]);

  // Countdown timer
  useEffect(() => {
    if (screen !== 'in-exam' || !examConfig) return;
    const durationMin = examConfig.durationMinutes || 0;
    if (!durationMin) return;

    const endAt = Date.now() + durationMin * 60 * 1000;
    const tick = () => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        submitExam('time-up');
      }
    };
    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [screen, examConfig, submitExam]);

  // Anti-cheat: visibility + blur + fullscreen exit
  useEffect(() => {
    if (screen !== 'in-exam') return;

    const lastWarnRef = { current: 0 };
    const triggerWarning = () => {
      if (submittedRef.current) return; // don't punish programmatic fullscreen exit on submit
      const now = Date.now();
      if (now - lastWarnRef.current < 1500) return; // debounce alert/blur loops
      lastWarnRef.current = now;
      warningsRef.current += 1;
      const newCount = warningsRef.current;
      setWarnings(newCount);
      setWarningMsg(`Warning ${newCount} of ${MAX_WARNINGS}: You left the exam window. Stay in fullscreen — your exam auto-submits at ${MAX_WARNINGS} violations.`);
      if (newCount >= MAX_WARNINGS) {
        setScreen('terminated');
        submitExam('too-many-warnings');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerWarning();
    };
    const handleBlur = () => triggerWarning();
    const handleFullscreenChange = () => {
      // Fullscreen is compulsory — exiting it mid-exam is a violation.
      if (!document.fullscreenElement) triggerWarning();
    };

    // Delay attaching so the fullscreen transition's initial blur isn't counted.
    const attach = setTimeout(() => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }, 800);

    return () => {
      clearTimeout(attach);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [screen, submitExam]);

  // Lockdown: since fullscreen alone can't block everything, also disable
  // right-click, devtools/shortcut keys and Print Screen during the exam.
  useEffect(() => {
    if (screen !== 'in-exam') return;

    const onKeyDown = (e) => {
      const k = (e.key || '').toLowerCase();
      const code = e.code || '';
      if (code === 'PrintScreen' || k === 'printscreen') { e.preventDefault(); e.stopPropagation(); return; }
      if (k === 'f12' || k === 'f5' || k === 'f3' || k === 'f1') { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p' || k === 'u' || k === 'c' || k === 'x' || k === 'a' || k === 'i' || k === 'j' || k === 'k' || k === 'w' || k === 'n' || k === 't' || k === 'h' || k === 'r' || k === 'f')) { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) { e.preventDefault(); return; }
      if (e.altKey && (k === 'i' || k === 'j' || k === 'd')) { e.preventDefault(); return; }
    };

    const onContextMenu = (e) => e.preventDefault();
    const onCopy = (e) => e.preventDefault();
    const onCut = (e) => e.preventDefault();
    const onDragStart = (e) => e.preventDefault();

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCut);
    document.addEventListener('dragstart', onDragStart);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, [screen]);

  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderHeader = () => {
    const hasTimer = examConfig?.durationMinutes > 0 && screen === 'in-exam';
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', backgroundColor: 'var(--surface-color)', borderBottom: '4px solid #000', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 100, justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
          {examConfig?.title || `Exam Mode: ${id}`}
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {hasTimer && (
            <span style={{ fontWeight: '900', fontFamily: 'Fira Code, monospace', fontSize: '18px', color: timeLeft <= 60 ? 'red' : 'black' }}>
              ⏱ {fmtTime(timeLeft)}
            </span>
          )}
          <span style={{ fontWeight: '800', color: warnings > 0 ? 'red' : 'black' }}>Warnings: {warnings}/{MAX_WARNINGS}</span>
          {screen === 'in-exam' && !isFullscreen && (
            <button className="neo-btn" style={{ backgroundColor: '#FBEA72', padding: '8px 16px', fontSize: '14px' }} onClick={() => requestFullscreen()}>
              ⛶ Resume Fullscreen
            </button>
          )}
          <button className="neo-btn" style={{ backgroundColor: '#88D8C0', padding: '8px 16px', fontSize: '14px' }} disabled={submitting} onClick={() => {
            if (window.confirm("Are you sure you want to submit your exam?")) {
              submitExam('manual');
            }
          }}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  };

  if (screen === 'loading') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFAF0' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900' }}>Loading Exam...</h1>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '12px' }}>Preparing your assessment surface.</p>
        </div>
      </div>
    );
  }

  if (screen === 'ready') {
    const noQuestions = questionsReady && questionCount === 0;
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBEA72' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '520px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>READY TO START</h1>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            {examConfig?.title || `Exam: ${id}`}
          </p>
          {questionsReady ? (
            <span className="neo-badge" style={{ background: questionCount > 0 ? 'var(--accent-green)' : '#FFB7B2', fontSize: '14px', display: 'inline-block', marginBottom: '16px' }}>
              {questionCount} question{questionCount === 1 ? '' : 's'} in this test
            </span>
          ) : (
            <span className="neo-badge" style={{ background: 'var(--accent-blue)', fontSize: '14px', display: 'inline-block', marginBottom: '16px' }}>
              Loading questions...
            </span>
          )}
          {noQuestions ? (
            <>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#b02a37' }}>
                This test has no questions yet. Your teacher needs to add questions before it can start.
              </p>
              <button className="neo-btn" style={{ marginTop: '16px', padding: '10px 16px', fontSize: '14px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                This exam runs in <span style={{ fontWeight: '900' }}>fullscreen mode</span>. Press the button below to enter fullscreen and begin.
                {examConfig?.durationMinutes > 0 && <span style={{ display: 'block', marginTop: '6px' }}>⏱ Duration: <b>{examConfig.durationMinutes} minutes</b></span>}
              </p>
              <button className="neo-btn" style={{ background: 'var(--accent-green)', padding: '16px 24px', fontSize: '18px' }} onClick={startExam} disabled={!questionsReady}>
                ⛶ Enter Fullscreen & Start Exam
              </button>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#555', marginTop: '14px' }}>
                Leaving fullscreen during the exam counts as a warning and auto-submits at {MAX_WARNINGS} violations.
              </p>
              <button className="neo-btn" style={{ marginTop: '16px', padding: '10px 16px', fontSize: '14px' }} onClick={() => navigate('/dashboard')}>Cancel</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'not-started') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBEA72' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>EXAM NOT STARTED</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>This exam has not opened yet. Please wait for your teacher to start it.</p>
          <button className="neo-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (screen === 'closed') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFB7B2' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>EXAM CLOSED</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>The submission window for this exam has closed.</p>
          <button className="neo-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (screen === 'already-submitted' && existingSubmission) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#88D8C0' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>ALREADY SUBMITTED</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>You have already submitted this exam.</p>
          <div style={{ marginTop: '16px' }}>
            <span className="neo-badge" style={{ background: 'var(--accent-green)', fontSize: '16px' }}>
              Auto-graded score: {existingSubmission.obtainedMarks}/{existingSubmission.totalMarks}
            </span>
          </div>
          {existingSubmission.pendingManual > 0 && (
            <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
              {existingSubmission.pendingManual} written question(s) pending manual grading.
            </p>
          )}
          <button className="neo-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (screen === 'submitted' && submissionResult) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#88D8C0' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '520px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>EXAM SUBMITTED</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Your answers have been recorded. Good luck!</p>
          <div style={{ marginTop: '16px' }}>
            <span className="neo-badge" style={{ background: 'var(--accent-green)', fontSize: '16px' }}>
              Auto-graded score: {submissionResult.obtainedMarks}/{submissionResult.totalMarks}
            </span>
          </div>
          {submissionResult.pendingManual > 0 && (
            <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
              {submissionResult.pendingManual} written question(s) will be graded by your teacher.
            </p>
          )}
          <button className="neo-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (screen === 'terminated') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBEA72' }}>
        <div className="neo-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', backgroundColor: 'var(--surface-color)' }}>
          <h1 style={{ color: 'red', fontSize: '32px', marginBottom: '16px', fontWeight: '900' }}>EXAM TERMINATED</h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>You have exceeded the maximum number of tab-switch warnings. Your in-progress answers were saved.</p>
          <button className="neo-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // Start the exam when config loaded and editor ready is handled by the config effect.

  return (
    <div ref={examRef} style={{ position: 'fixed', inset: 0, backgroundColor: '#FFFAF0' }}>
      {renderHeader()}

      {warningMsg && screen === 'in-exam' && (
        <div style={{
          position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          background: 'var(--accent-pink)', border: '3px solid #000', boxShadow: '3px 3px 0 #000',
          padding: '10px 16px', fontWeight: '900', fontSize: '13px', maxWidth: '80%', textAlign: 'center'
        }}>
          ⚠ {warningMsg}
        </div>
      )}

      <div style={{ position: 'absolute', top: '60px', left: 0, right: 0, bottom: 0 }}>
        {!examConfig ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontWeight: 'bold' }}>
            Loading Exam...
          </div>
        ) : (() => {
          const shapes = examConfig.questions || [];
          return (
            <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '40px 20px', backgroundColor: '#FFFAF0' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {shapes.map(shape => {
                  if (shape.type === 'quiz-mcq-shape') return <StandaloneMcq key={shape.id} shape={shape} />;
                  if (shape.type === 'quiz-written-shape') return <StandaloneWritten key={shape.id} shape={shape} />;
                  if (shape.type === 'quiz-code-shape') return <StandaloneCode key={shape.id} shape={shape} />;
                  return null;
                })}
                {shapes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', fontWeight: 'bold' }}>No questions found in this exam.</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
