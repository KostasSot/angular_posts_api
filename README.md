This is an Angular application that retrieves Wordpress posts via Wordpress API having the ability to create a Wordpress Post from the Angular app and be displayed in the Posts post type in your Wordpress installation.

Installation instructions:
If you don't use Docker then you don't need the Dockerfile file, just the rest of the code.

In your Wordpress installation you need to install a plugin called JWT Authentication for WP-API (https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/ ), then go to wp-config.php and define these:

define('JWT_AUTH_SECRET_KEY', 'your_secret_key');
define('JWT_AUTH_CORS_ENABLE', true);
define( 'WP_ENVIRONMENT_TYPE', 'local' ); -> this will unlock you the section in Users -> Profile named Applications Password.

We need this plugin in order to save a token in browsers localStorage, so we can login into the Angular app and create Posts as we could do from the Wordpress admin panel.
