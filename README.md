This is an Angular application that retrieves Wordpress posts via Wordpress API having the ability to create a Wordpress Post from the Angular app and be displayed in the Posts post type in your Wordpress installation.

Installation instructions:
If you don't use Docker then you don't need the Dockerfile file, just the rest of the code.

In your Wordpress installation you need to install a plugin called JWT Authentication for WP-API (https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/ ), then go to wp-config.php and define these:

define('JWT_AUTH_SECRET_KEY', 'your_secret_key');
define('JWT_AUTH_CORS_ENABLE', true);
define( 'WP_ENVIRONMENT_TYPE', 'local' ); -> this will unlock you the section in Users -> Profile named Applications Password.

We need this plugin in order to save a token in browsers localStorage, so we can login into the Angular app and create Posts as we could do from the Wordpress admin panel.
Also you need to add these functions into functions.php for the search bar to work and the one for ACF fields to add a custom field into posts.

function add_acf_fields_to_rest_api() {
    register_rest_field( 'post', 'acf', array(
        // This is for READING the data
        'get_callback' => function( $object ) {
            return get_fields( $object['id'] );
        },
        // This is the new, crucial part for WRITING the data
        'update_callback' => function( $value, $post ) {
            if ( empty( $value ) || ! is_array( $value ) ) {
                return;
            }
            // Loop through the submitted fields (e.g., 'post_subtitle') and update them
            foreach ( $value as $field_name => $field_value ) {
                update_field( $field_name, $field_value, $post->ID );
            }
            return true;
        },
        'schema' => null,
    ) );
}
add_action( 'rest_api_init', 'add_acf_fields_to_rest_api' );


function filter_posts_by_title_only( $args, $request ) {
    // Check if our custom 'title_search' parameter is in the URL
    if ( ! empty( $request['title_search'] ) ) {
        // If it is, modify the main search parameter 's'
        $args['s'] = sanitize_text_field( $request['title_search'] );
        // Add a filter to change what the 's' parameter searches
        add_filter( 'posts_search', 'force_search_in_title_only', 10, 2 );
    }
    return $args;
}
add_filter( 'rest_post_query', 'filter_posts_by_title_only', 10, 2 );

function force_search_in_title_only( $search, $wp_query ) {
    global $wpdb;
    if ( ! empty( $wp_query->query_vars['s'] ) ) {
        $q = $wp_query->query_vars;
        $n = ! empty( $q['exact'] ) ? '' : '%';
        $search = '';
        $searchand = '';
        foreach ( (array) $q['search_terms'] as $term ) {
            $term = esc_sql( $wpdb->esc_like( $term ) );
            $search .= "{$searchand}($wpdb->posts.post_title LIKE '{$n}{$term}{$n}')";
            $searchand = ' AND ';
        }
        if ( ! empty( $search ) ) {
            $search = " AND ({$search}) ";
        }
    }
    // Important: Remove this filter immediately so it doesn't affect other searches on the site
    remove_filter( 'posts_search', 'force_search_in_title_only', 10 );
    return $search;
}

// increase the maximum number of posts in one page
function increase_rest_api_per_page_limit( $params ) {
    if ( isset( $params['per_page'] ) ) {
        $params['per_page']['maximum'] = 500; // Set a new, higher limit
    }
    return $params;
}
add_filter( 'rest_post_collection_params', 'increase_rest_api_per_page_limit', 10, 1 );
