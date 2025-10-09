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
  subtitle= '';
myForm: any;

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
    this.successMessage = '';
    this.errorMessage = '';

    const selectedCategoryIds = Object.keys(this.categoriesSelection)
      .filter(key => this.categoriesSelection[Number(key)])
      .map(key => Number(key));

    let randomImageId: number | undefined = undefined;
    if (this.allMedia.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.allMedia.length);
      randomImageId = this.allMedia[randomIndex].id;
    }

    // Create an object for our ACF data
    const acfData = {
      subtitle: this.subtitle
    };

    // Pass the acfData object to the service
    this.wordpress.createPost(this.title, this.content, selectedCategoryIds, randomImageId, acfData).subscribe({
      next: (response) => {
        // This 'next' block runs on success
        this.successMessage = 'Post created successfully!';

        // The redirect logic goes here
        // setTimeout(() => {
        //   this.router.navigate(['/all-posts']);
        // }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to create post. Please check your credentials.';
        console.error('Create post error', err);
      }
    });
  }
}

