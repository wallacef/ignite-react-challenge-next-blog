import { useEffect, useMemo, useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import { formatDateToView } from '../utils/helpers';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Article {
  title: string;
  subtitle: string;
  author: string;
}

interface Post {
  uid?: string;
  first_publication_date: string;
  data: Article;
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const primicParams = {
  pageSize: 1,
};

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  function formatPosts(postsToFormat: Post[]): Post[] {
    return postsToFormat.map(result => ({
      ...result,
      first_publication_date: formatDateToView(result.first_publication_date),
    }));
  }

  async function handleLoadMorePosts(): Promise<void> {
    const prismic = getPrismicClient({});
    const postsResponse = await prismic.getByType('post-id', {
      ...primicParams,
      after: nextPage,
    });
    const { results, next_page } = postsResponse;
    const mappedResults = results.map(result => ({
      ...result,
      data: result.data as Article,
    }));

    const formattedPosts = formatPosts(mappedResults);
    setPosts(formattedPosts);
    setNextPage(next_page);
  }

  useEffect(() => {
    const initialPosts = postsPagination.results;
    setPosts(initialPosts);
    setNextPage(postsPagination.next_page);
  }, [postsPagination]);

  const formattedPosts = useMemo(() => formatPosts(posts), [posts]);

  // TODO
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={`${commonStyles.container} ${styles.postsContainer}`}>
        {formattedPosts?.map(result => (
          <div key={result.uid} className={styles.item}>
            <Link href={`/post/${result.uid}`}>
              <a>
                <p>{result.data.title}</p>
                <span>{result.data.subtitle}</span>
                <div>
                  <time>
                    <FiCalendar />
                    {result.first_publication_date}
                  </time>
                  <span>
                    <FiUser />
                    {result.data.author}
                  </span>
                </div>
              </a>
            </Link>
          </div>
        ))}
        {nextPage && (
          <button onClick={handleLoadMorePosts} type="button">
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post-id', primicParams);
  const { results, next_page } = postsResponse;

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
    revalidate: 60 * 60 * 24, //
  };
};
