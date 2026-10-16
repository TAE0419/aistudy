import Link from "next/link";
import StudyCard from "./components/StudyCard";
import styles from "./page.module.scss";
import { studyData } from "@/data/studyData";

const Home = () => {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p>NEXT PROJECT</p>
        <h1>
          Next 기반
          <br />
          AI React Study
        </h1>
        <p>OpenAI를 활용해 React.js 학습을 이어갈 수 있는 사이트입니다.</p>
      </section>

      <section className={styles.study}>
        <h2>AI 학습 구성</h2>
        <div className={styles.cardGrid}>
          {studyData.map((item) => (
            <StudyCard key={item.id} item={item} />
          ))}
        </div>

        <Link className={styles.linkButton} href="/study">
          학습 바로가기
        </Link>
      </section>

      <section className={styles.weather}>
        <div>
          <p>Open Weather API</p>
          <h2>지역 날씨 확인</h2>
        </div>
        <Link className={styles.linkButton} href="/weather">
          날씨 확인 바로가기
        </Link>
      </section>
    </main>
  );
};

export default Home;
