import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { formatDate } from '../../lib/formatDate';
import { RichText } from 'prismic-dom';

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

export default function Post({ post }: PostProps) {
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
      orderings: '[post.first_publication_date desc]',
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

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    String(slug),
    {}
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

  return {
    props: {
      post
    }
  }
};