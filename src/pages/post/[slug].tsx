import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import { formatDate } from '../../lib/formatDate';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header'
import { Comments } from '../../components/Comments';
import { Preview } from '../../components/Preview';

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

interface ClosestPost {
  uid: string;
  title: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextPost: ClosestPost,
  previousPost: ClosestPost
}

export default function Post({ post, preview, nextPost, previousPost }: PostProps) {
  const router = useRouter();
  const totalMinutes = calcTotalMinutesToRead();

  function calcTotalMinutesToRead(): number {
    const totalWords = post.data.content.reduce((total, postContent) => {
      const totalBody = postContent.body.reduce((total, bodyContent) => {
        return total + bodyContent.text.split(' ').length
      }, 0)
      return total + totalBody + postContent.heading.split(' ').length;
    }, 0)
    return Math.ceil(totalWords / 200)
  }

  return (
    <>
      <Header />
      {
        !router.isFallback ? (
          <>
            <img height="400px" width="1440px" src="https://slm-assets.secondlife.com/assets/2775442/view_large/FLORESTA.jpg?1294162518" alt="" />
            <main className={styles.container}>
              <h1>{post.data.title}</h1>
              <div className={styles.iconsContainer}>
                <FiCalendar />
                <time>{formatDate(new Date(post.first_publication_date))}</time>
                <FiUser />
                <span>{post.data.author}</span>
                <FiClock />
                <span>{totalMinutes} min</span>
              </div>
              {
                post.data.content.map(postContent => {
                  return (
                    <div key={postContent.heading} className={styles.content} >
                      <h1>{postContent.heading}</h1>
                      <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(postContent.body) }} />

                    </div>
                  )
                })
              }
              <div className={styles.closestPost}>
                <div>
                  {
                    previousPost && (
                      <>
                        <aside>{previousPost.title}</aside>
                        <Link href={`/post/${previousPost.uid}`}>
                          <a href="">Post anterior</a>
                        </Link>
                      </>
                    )
                  }
                </div>
                <div>
                  {
                    nextPost && (
                      <>
                        <aside>{nextPost.title}</aside>
                        <Link href={`/post/${nextPost.uid}`}>
                          <a href="">Próximo post</a>
                        </Link>
                      </>
                    )
                  }
                </div>
              </div>
              <Comments />
              {preview && (
                <Preview />
              )}
            </main>
          </>
        ) : <span className={styles.loading}>Carregando...</span>
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      orderings: '[document.first_publication_date desc]',
      pageSize: 3
    }
  );

  const slugs = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths: [...slugs],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false,
  previewData }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    String(slug),
    {
      ref: previewData?.ref ?? null
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      author: response.data.author,
      subtitle: response.data.subtitle,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body
        }
      }),
      banner: {
        url: response.data.banner.url
      }
    }
  }

  const before = await prismic.queryFirst(
    [Prismic.Predicates.dateBefore('document.first_publication_date', new Date(post.first_publication_date))],
    {
      orderings: '[document.first_publication_date desc]',
      pageSize: 1
    },
  )
  const after = await prismic.queryFirst(
    [Prismic.Predicates.dateAfter('document.first_publication_date', new Date(post.first_publication_date))],
    {
      orderings: '[document.first_publication_date]',
      pageSize: 1
    }
  )

  const previousPost = before ? {
    uid: before?.uid,
    title: before?.data.title
  } : null;

  const nextPost = after ? {
    uid: after?.uid,
    title: after?.data.title
  } : null;

  return {
    props: {
      post,
      preview,
      nextPost,
      previousPost
    },
  }
};
