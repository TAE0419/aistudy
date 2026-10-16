"use client";

import { useState } from "react";
import { studyData } from "@/data/studyData";
import type { AiResponse, Studymode } from "@/types/study";
import styles from "./page.module.scss";

const StudyPage = () => {
  const [mode, setMode] = useState<Studymode>("explain");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizAnswer,setQuizAnswer]=useState('') //ai가 만들어낸 퀴즈
  const [showAnswer, setShowAnswer] = useState(false) //ai가 만든 퀴즈의 답변이 있으면 보여주고 그렇지 않으면 감추는 역할
  const [previousQuestions, setPreviousQuestion]= useState<string[]>([])
  const [currentQuiz, setCurrentQuiz] = useState('')

  const funcquiz = async () => {
    if (!message.trim()) {
      setAnswer('질문을 입력해주세요')
      return;
    }
    if(mode === 'hint'&& !currentQuiz){
      setAnswer('먼저 퀴즈를 출제해주세요')
      return
    }

    try {
      setLoading(true);
      setAnswer("");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error("AI 요청에 실패했습니다.");
      }

      const data: AiResponse = await res.json();
      setAnswer(data.answer);

      if(mode === 'quiz'){
        setCurrentQuiz(data.answer || '')
        // answer:string  question:string  questionans:string  hint:string
        setQuizAnswer(data.question || '')
        setShowAnswer(false)
        setPreviousQuestion((prev)=>[...prev,data.answer].slice(-10))
      }
    } catch(err) {
      console.log(err)
      setAnswer("AI 답변을 가져오지 못했습니다.");
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
                onClick={() => setMode(item.mode)}
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

            <button className={styles.submitButton} onClick={funcquiz} disabled={loading}>
              {loading ? "답변 생성 중" : "질문하기"}
            </button>
          </div>
        </div>
      </section>

      {answer && (
        <section className={styles.answer}>
          <h2>AI</h2>
          <p>{answer}</p>
          {
            mode === 'quiz' && quizAnswer && (
              <>
                <button onClick={()=>setShowAnswer(!showAnswer)}>
                  {showAnswer?'정답 숨기기':'답변 보기'}
                </button>
                {
                  showAnswer && (
                    <p>{quizAnswer}</p>
                  )
                }
              </>
            )
          }
        </section>
      )}
    </main>
  );
};

export default StudyPage;
