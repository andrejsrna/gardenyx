import ArticleForm from '../ArticleForm';
import { createArticleAction } from '../actions';

export const dynamic = 'force-dynamic';

const EMPTY = {
  slug: '',
  status: 'draft',
  coverImage: '',
  publishedAt: '',
  translations: {
    sk: { title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
    en: { title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
    hu: { title: '', excerpt: '', content: '', metaTitle: '', metaDescription: '' },
  },
};

export default function AdminNewArticlePage() {
  return <ArticleForm initial={EMPTY} action={createArticleAction} title="Nový článok" />;
}
