import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDateToView, getReadingTime } from '../../utils/helpers';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const formattedPost = {
    ...post,
    first_publication_date: formatDateToView(post.first_publication_date),
  };

  const readingTime = useMemo(() => {
    const joinText = post.data.content.reduce((acc, curr) => {
      const body = curr.body.map(item => item.text);
      const joinBody = body.join(' ');
      return joinBody;
    }, '');
    return getReadingTime(joinText);
  }, [post]);

  if (router.isFallback) {
    return <>Carregando...</>;
  }

  return (
    <>
      <Head>
        <title>{formattedPost?.data?.title} | spacetraveling</title>
      </Head>
      <main>
        <article className={styles.articleContainer}>
          <img src={formattedPost?.data.banner?.url} alt="Banner" />
          <div className={commonStyles.container}>
            <div className={`${styles.infoContainer}`}>
              <p>{formattedPost?.data?.title}</p>
              <div>
                <time>
                  <FiCalendar />
                  {formattedPost?.first_publication_date}
                </time>
                <span>
                  <FiUser />
                  {formattedPost?.data?.author}
                </span>
                <time>
                  <FiClock />
                  {readingTime}
                </time>
              </div>
            </div>
            {formattedPost?.data?.content?.map(content => (
              <div key={content.heading} className={styles.contentContainer}>
                <p>{content.heading}</p>
                {content.body.map(body => (
                  <span key={body.text}>{body.text}</span>
                ))}
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post-id');

  const paths = posts.results.map(result => ({ params: { slug: result.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post-id', String(slug), {});
  const post = { ...response };

  // TODO
  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
