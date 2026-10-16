"use client";

import { useState } from "react";
import { studyData } from "@/data/studyData";
import type { AiRequest, AiResponse, Studymode } from "@/types/study";
import styles from "./page.module.scss";

const StudyPage = () => {
  const [mode, setMode] = useState<Studymode>("explain");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [responseMode, setResponseMode] = useState<Studymode>("explain");

  const requestAnswer = async (requestedMode: Studymode) => {
    if (loading) return;

    setError("");
    if (requestedMode === "hint" && !currentQuiz) {
      setError("먼저 문제를 만들어주세요.");
      return;
    }
    if (requestedMode !== "hint" && !message.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const payload: AiRequest = {
        message: requestedMode === "hint" ? "현재 문제의 힌트를 알려주세요." : message,
        mode: requestedMode,
        ...(requestedMode === "hint" && { currentQuiz }),
      };

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("AI 요청에 실패했습니다.");
      }

      const data: AiResponse = await res.json();
      if (!data.answer?.trim() || (requestedMode === "quiz" && !data.quizAnswer?.trim())) {
        throw new Error("AI 응답이 올바르지 않습니다.");
      }

      if (requestedMode === "hint") {
        setAnswer(currentQuiz);
        setHint(data.answer);
        setResponseMode("quiz");
      } else {
        setAnswer(data.answer);
        setHint("");
        setShowAnswer(false);
        setResponseMode(requestedMode);

        if (requestedMode === "quiz") {
          setCurrentQuiz(data.answer);
          setQuizAnswer(data.quizAnswer ?? "");
        }
      }
    } catch {
      setError("AI 답변을 가져오지 못했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.title}>
        <p>OPENAI API</p>
        <h1>React 학습</h1>
        <span>학습 방식을 선택하고 질문을 입력하세요.</span>
      </div>

      <section className={styles.panel}>
        <h2>학습방법</h2>
        <div className={styles.studyForm}>
          <div className={styles.modeList}>
            {studyData.map((item) => (
              <button
                key={item.id}
                className={mode === item.mode ? styles.activeMode : styles.modeButton}
                disabled={loading}
                aria-pressed={mode === item.mode}
                onClick={() => {
                  setMode(item.mode);
                  if (item.mode === "hint") {
                    void requestAnswer("hint");
                  }
                }}
              >
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            ))}
          </div>

          <div className={styles.questionArea}>
            <div className={styles.field}>
              <label htmlFor="message">질문</label>
              <textarea
                id="message"
                placeholder="예시: useState를 쉽게 설명해줘"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button className={styles.submitButton} onClick={() => requestAnswer(mode)} disabled={loading}>
              {loading ? "답변 생성 중" : mode === "hint" ? "힌트 받기" : "질문하기"}
            </button>
          </div>
        </div>
      </section>

      {error && <p role="alert">{error}</p>}

      {answer && (
        <section className={styles.answer}>
          <h2>AI</h2>
          <p>{answer}</p>
          {
            responseMode === "quiz" && quizAnswer && (
              <>
                <button
                  className={styles.submitButton}
                  onClick={() => setShowAnswer((previous) => !previous)}
                  aria-expanded={showAnswer}
                  aria-controls="quiz-answer"
                >
                  {showAnswer ? "정답 숨기기" : "정답 보기"}
                </button>
                {
                  showAnswer && (
                    <div id="quiz-answer" className={styles.quizDetail}>
                      <h3>정답</h3>
                      <p>{quizAnswer}</p>
                    </div>
                  )
                }
              </>
            )
          }
          {responseMode === "quiz" && hint && (
            <div className={styles.quizDetail} aria-live="polite">
              <h3>힌트</h3>
              <p>{hint}</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default StudyPage;
