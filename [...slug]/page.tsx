export default async function BlogPost({ params }: PageProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <header className="mb-8">
        <h1 
          className="text-4xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <time className="text-gray-600">{formattedDate}</time>
      </header>

      <div 
        className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-4
          prose-p:text-gray-600 prose-p:leading-relaxed
          prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900
          prose-ul:my-6 prose-li:my-2
          
          prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full
          
          prose-figure:my-12
          prose-figcaption:text-center prose-figcaption:text-gray-500 
          prose-figcaption:text-base prose-figcaption:mt-4 
          prose-figcaption:italic prose-figcaption:max-w-2xl 
          prose-figcaption:mx-auto
          
          prose-table:border-collapse prose-td:border prose-td:p-3
          prose-blockquote:border-l-4 prose-blockquote:border-green-600 prose-blockquote:pl-4 prose-blockquote:italic"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
} 