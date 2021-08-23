import { useEffect, useRef } from 'react'
import styles from './comments.module.scss'


export function Comments() {
  const commentBox = useRef<HTMLDivElement>();
  useEffect(() => {
    let scriptEl = document.createElement("script");;
    scriptEl.setAttribute("src", "https://utteranc.es/client.js");
    scriptEl.setAttribute("crossorigin", "anonymous");
    scriptEl.setAttribute("async", "true");
    scriptEl.setAttribute("repo", "MoisesMorandini/blog-project-comments");
    scriptEl.setAttribute("issue-term", "url");
    scriptEl.setAttribute("theme", "github-dark");
    commentBox.current?.appendChild(scriptEl);
  })

  return (
    <div className={styles.container}>
      <div ref={commentBox}></div>
    </div>
  )
}