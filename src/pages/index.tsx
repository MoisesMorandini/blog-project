import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { formatDate } from '../lib/formatDate';

import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { useState } from 'react';
import Link from 'next/link';
import { Preview } from '../components/Preview';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  async function handleClick() {
    fetch(nextPage).then(response => {
      return response.json();
    }).then((response: PostPagination) => {
      setNextPage(response.next_page);
      const posts: Post[] = response.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }
      })
      setPosts(oldPosts => [...oldPosts, ...posts]);
    })
  }

  return (
    <main className={styles.container}>
      <img src="/logo.svg" alt="logo" />
      <div className={styles.post}>
        {posts.map(post => {
          return (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a href="" >
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postFooter}>
                  <div >
                    <FiCalendar />
                    <time>{formatDate(new Date(post.first_publication_date))}</time>
                  </div>
                  <div >
                    <FiUser />
                    <span>
                      {post.data.author}
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          )
        })}
      </div>
      {
        nextPage && (
          <button type="button" className={styles.loadPosts} onClick={handleClick}>
            Carregar mais posts
          </button>
        )
      }
      {preview && (
        <Preview />
      )}

    </main >
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null
    }
  );

  const nextPage = postsResponse.next_page;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: nextPage,
        results
      },
      preview
    }
  }
};
