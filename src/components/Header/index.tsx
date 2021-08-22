import commonStyle from '../../styles/common.module.scss';
import styles from './header.module.scss'
import Link from 'next/link';
export default function Header() {
  return (
    <header className={`${commonStyle.applicationContainer} ${styles.headerContainer}`}>
      <Link href="/">
        <a href="/">
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
