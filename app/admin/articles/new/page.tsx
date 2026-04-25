import ArticleForm from '../ArticleForm';
import { createArticleAction } from '../actions';

export const dynamic = 'force-dynamic';

const EMPTY = {
  slug: '',
  status: 'draft',
  coverImage: '',
  publishedAt: '',
  translations: {
    sk: { slug: '', title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
    en: { slug: '', title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
    hu: { slug: '', title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
  },
};

export default function AdminNewArticlePage() {
  return <ArticleForm initial={EMPTY} action={createArticleAction} title="Nový článok" />;
}
