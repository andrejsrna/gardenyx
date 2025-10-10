# Relevanssi Integration Setup

## Problem
Currently, the blog search uses standard WordPress REST API `search` parameter which uses basic MySQL fulltext search, NOT Relevanssi.

## Solution

### Step 1: Add WordPress Endpoint for Relevanssi

Add this code to your WordPress theme's `functions.php` or create a custom plugin:

```php
<?php
/**
 * Custom REST API endpoint for Relevanssi search
 */
add_action('rest_api_init', function () {
    register_rest_route('relevanssi/v1', '/search', array(
        'methods' => 'GET',
        'callback' => 'relevanssi_rest_search',
        'permission_callback' => '__return_true',
        'args' => array(
            's' => array(
                'required' => false,
                'type' => 'string',
                'description' => 'Search query',
            ),
            'per_page' => array(
                'required' => false,
                'type' => 'integer',
                'default' => 9,
            ),
            'page' => array(
                'required' => false,
                'type' => 'integer',
                'default' => 1,
            ),
            'tags' => array(
                'required' => false,
                'type' => 'integer',
                'description' => 'Filter by tag ID',
            ),
            'categories' => array(
                'required' => false,
                'type' => 'integer',
                'description' => 'Filter by category ID',
            ),
        ),
    ));
});

function relevanssi_rest_search($request) {
    // Get parameters
    $search_query = $request->get_param('s');
    $per_page = $request->get_param('per_page') ?: 9;
    $page = $request->get_param('page') ?: 1;
    $tags = $request->get_param('tags');
    $categories = $request->get_param('categories');
    
    // Setup query args
    $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'orderby' => 'relevance', // Relevanssi will handle this
        'order' => 'DESC',
    );
    
    // Add search query
    if (!empty($search_query)) {
        $args['s'] = $search_query;
    }
    
    // Add tag filter
    if (!empty($tags)) {
        $args['tag__in'] = array($tags);
    }
    
    // Add category filter
    if (!empty($categories)) {
        $args['cat'] = $categories;
    }
    
    // Create query
    $query = new WP_Query($args);
    
    // Let Relevanssi do its magic
    if (function_exists('relevanssi_do_query')) {
        relevanssi_do_query($query);
    }
    
    // Prepare response
    $posts = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            
            // Get featured image
            $featured_media = null;
            if (has_post_thumbnail()) {
                $thumbnail_id = get_post_thumbnail_id();
                $thumbnail_url = wp_get_attachment_image_src($thumbnail_id, 'full');
                $featured_media = array(
                    'source_url' => $thumbnail_url ? $thumbnail_url[0] : null,
                );
            }
            
            // Get categories
            $categories_data = array();
            $post_categories = get_the_category();
            if (!empty($post_categories)) {
                foreach ($post_categories as $cat) {
                    $categories_data[] = array(
                        'id' => $cat->term_id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                    );
                }
            }
            
            // Get tags
            $tags_data = array();
            $post_tags = get_the_tags();
            if (!empty($post_tags)) {
                foreach ($post_tags as $tag) {
                    $tags_data[] = array(
                        'id' => $tag->term_id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    );
                }
            }
            
            $posts[] = array(
                'id' => get_the_ID(),
                'date' => get_the_date('c'),
                'title' => array(
                    'rendered' => get_the_title(),
                ),
                'content' => array(
                    'rendered' => get_the_content(),
                ),
                'excerpt' => array(
                    'rendered' => get_the_excerpt(),
                ),
                'link' => get_permalink(),
                'slug' => get_post_field('post_name'),
                'featured_media' => get_post_thumbnail_id(),
                '_embedded' => array(
                    'wp:featuredmedia' => $featured_media ? array($featured_media) : array(),
                    'wp:term' => array($categories_data, $tags_data),
                ),
            );
        }
    }
    
    wp_reset_postdata();
    
    // Prepare response with headers
    $response = new WP_REST_Response($posts);
    $response->header('X-WP-Total', $query->found_posts);
    $response->header('X-WP-TotalPages', $query->max_num_pages);
    
    return $response;
}
```

### Step 2: Update Next.js Code

The Next.js code has been updated to use the new Relevanssi endpoint when search query is present.

## Testing

1. After adding the WordPress code, test the endpoint directly:
   ```
   https://admin.najsilnejsiaklbovavyziva.sk/wp-json/relevanssi/v1/search?s=koleno&per_page=9&page=1
   ```

2. On your Next.js site, use the search functionality on `/blog` page

3. Check that results are sorted by relevance (not by date)

## Benefits

- ✅ Better search relevance with Relevanssi's algorithm
- ✅ Partial word matching
- ✅ Synonym support (if configured in Relevanssi)
- ✅ Better Slovak language support
- ✅ Excerpt highlighting (can be added)
- ✅ Search logging for analytics

## Notes

- Make sure Relevanssi plugin is installed and activated in WordPress
- Build the Relevanssi index: Settings > Relevanssi > "Build index"
- Configure Relevanssi settings as needed (Settings > Relevanssi)

