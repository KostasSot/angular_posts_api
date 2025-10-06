// Import necessary modules from Angular's core and router
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for forms and ngModel
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router'; // Needed to navigate to other pages

// Import our custom service to talk to the WordPress API
import { Wordpress } from '../../services/wordpress';

// Import RxJS's forkJoin to run multiple API calls at the same time
import { forkJoin } from 'rxjs';

// The @Component decorator defines this as an Angular component
@Component({
  selector: 'app-create-post', // The HTML tag for this component (e.g., <app-create-post>)
  standalone: true, // Indicates it's a modern, standalone component
  imports: [CommonModule, FormsModule, RouterLink], // Lists the modules this component's template needs
  templateUrl: './create-post.html', // Path to the HTML file
  styleUrls: ['./create-post.css']   // Path to the CSS file
})
export class CreatePostComponent implements OnInit {
  // --- CLASS PROPERTIES ---
  // These variables hold the state of our component

  // Bound to the form's title input field
  title = '';
  // Bound to the form's content textarea
  content = '';
  // Holds the success message to display after a successful post
  successMessage = '';
  // Holds an error message if something goes wrong
  errorMessage = '';

  // This array will be filled with all available categories from WordPress
  allCategories: any[] = [];
  // This array will be filled with all available images from the WordPress Media Library
  allMedia: any[] = [];
  // This object tracks which category checkboxes are checked.
  // The key is the category ID (a number), and the value is true or false.
  categoriesSelection: { [key: number]: boolean } = {};

  // The constructor is where we inject the services our component needs
  constructor(private wordpress: Wordpress, private router: Router) { }

  // --- LIFECYCLE HOOK ---
  // ngOnInit runs automatically one time, right after the component is created.
  // It's the perfect place to fetch initial data.
  ngOnInit(): void {
    // We use forkJoin to make two API calls in parallel (for categories and media).
    // This is more efficient than making them one after the other.
    forkJoin({
      categories: this.wordpress.getCategories(),
      media: this.wordpress.getMedia()
    }).subscribe(response => {
      // Once both API calls are complete, this code runs.

      // Store the fetched categories and media in our component's properties
      this.allCategories = response.categories;
      this.allMedia = response.media;

      // Initialize the categoriesSelection object, setting every category to 'false' (unchecked) by default
      this.allCategories.forEach(cat => this.categoriesSelection[cat.id] = false);
    });
  }

  // --- COMPONENT METHOD ---
  // This method is called when the form in the HTML is submitted.
  onSubmit(): void {
    // Reset any previous success or error messages
    this.successMessage = '';
    this.errorMessage = '';

    // --- Prepare the Data to Send ---

    // 1. Get the selected category IDs
    // Object.keys gets all the category IDs from our selection object (as strings)
    const selectedCategoryIds = Object.keys(this.categoriesSelection)
      // Filter the array to keep only the keys where the value is 'true' (checked)
      .filter(key => this.categoriesSelection[Number(key)])
      // Convert the remaining string keys back into numbers
      .map(key => Number(key));

    // 2. Get a random featured image ID
    let randomImageId: number | undefined = undefined;
    // Check if we have any images to choose from
    if (this.allMedia.length > 0) {
      // Pick a random index from the allMedia array
      const randomIndex = Math.floor(Math.random() * this.allMedia.length);
      // Get the ID of the image at that random index
      randomImageId = this.allMedia[randomIndex].id;
    }

    // --- Make the API Call ---

    // Call the createPost method in our service, passing all the prepared data
    this.wordpress.createPost(this.title, this.content, selectedCategoryIds, randomImageId).subscribe({
      // The 'next' block runs if the API call is successful
      next: (response) => {
        this.successMessage = 'Post created successfully!';
        // After 2 seconds, redirect the user back to the main posts list
        setTimeout(() => {
          this.router.navigate(['/all-posts']);
        }, 2000);
      },
      // The 'error' block runs if the API call fails
      error: (err) => {
        this.errorMessage = 'Failed to create post. Please make sure you are logged in.';
        console.error('Create post error', err);
      }
    });
  }
}
