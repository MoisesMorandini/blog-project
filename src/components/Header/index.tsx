import commonStyle from '../../styles/common.module.scss';
import styles from './header.module.scss'
export default function Header() {
  return (
    <header className={`${commonStyle.applicationContainer} ${styles.headerContainer}`}>
      <a href="">
        <img src="/logo.svg" alt="logo" />
      </a>
    </header>
  )
}
