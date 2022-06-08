import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import headerStyles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header className={commonStyles.container}>
      <div className={headerStyles.headerContent}>
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
