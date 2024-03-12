import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built and maintained by Spencer Williams
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <h1>Welcome to INFO 463</h1>
      </div>

      <div className={styles.description}>
      <p>This is a course website to compile resources and lab assignments for INFO 463 at the University 
          of Washington, as taught by me (Spencer). Here, you will find links to all your lab assignments,
          which will typically involve trying out various input devices and techniques on your own machine.
        </p>
      </div>

      <div className={styles.grid}>
      <a
          href="lab1"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 1 <span>-&gt;</span>
          </h2>
          <p>Introduction</p>
        </a>

        <a
          href="lab2"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 2 <span>-&gt;</span>
          </h2>
          <p>A Fitts' law experiment</p>
        </a>

        <a
          href="lab3"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 3 <span>-&gt;</span>
          </h2>
          <p>Evaluating pointing techniques</p>
        </a>

        <a
          href="lab4"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 4 <span>-&gt;</span>
          </h2>
          <p>Conjunctive search</p>
        </a>

        <a
          href="lab5"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 5 <span>-&gt;</span>
          </h2>
          <p>Building a chat bot</p>
        </a>

        <a
          href="lab6"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 6 <span>-&gt;</span>
          </h2>
          <p>Working with pens</p>
        </a>

        <a
          href="lab7"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 7 <span>-&gt;</span>
          </h2>
          <p>A tiny display</p>
        </a>

        <a
          href="lab8"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 8 <span>-&gt;</span>
          </h2>
          <p>Surface input</p>
        </a>

        <a
          href="lab9"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 9 <span>-&gt;</span>
          </h2>
          <p>Using your voice</p>
        </a>

        <a
          href="lab10"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Lab 10 <span>-&gt;</span>
          </h2>
          <p>Reflection</p>
        </a>

      </div>
    </main>
  );
}
