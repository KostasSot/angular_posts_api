// Import necessary modules from Angular's core and router
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Needed for forms and ngModel
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router'; // Needed to navigate to other pages

// Import our custom service to talk to the WordPress API
import { Wordpress } from '../../services/wordpress';

// Import RxJS's forkJoin to run multiple API calls at the same time
import { forkJoin, switchMap, of, Observable } from 'rxjs';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css']
})
export class CreatePostComponent implements OnInit {
  title = '';
  content = '';
  subtitle = '';
  successMessage = '';
  errorMessage = '';
  allCategories: any[] = [];
  allMedia: any[] = [];
  categoriesSelection: { [key: number]: boolean } = {};
  selectedMediaId: number | null = null;
  fileToUpload: File | null = null;

  constructor(private wordpress: Wordpress, private router: Router) { }

  ngOnInit(): void {
    forkJoin({
      categories: this.wordpress.getCategories(),
      media: this.wordpress.getMedia()
    }).subscribe(response => {
      this.allCategories = response.categories;
      this.allMedia = response.media;
      this.allCategories.forEach(cat => this.categoriesSelection[cat.id] = false);
    });
  }

  selectMedia(id: number): void {
    // Allow toggling selection
    this.selectedMediaId = this.selectedMediaId === id ? null : id;
    this.fileToUpload = null;
  }

  onFileChange(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.fileToUpload = fileList[0];
      this.selectedMediaId = null;
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // This observable will handle getting the featured media ID
    let getMediaId$: Observable<any>;

    // --- THIS IS THE NEW COMBINED LOGIC ---
    // Priority 1: A new file is being uploaded.
    if (this.fileToUpload) {
      getMediaId$ = this.wordpress.uploadMedia(this.fileToUpload);
    }
    // Priority 2: An existing image has been selected.
    else if (this.selectedMediaId) {
      // Immediately return an observable with the selected ID.
      getMediaId$ = of({ id: this.selectedMediaId });
    }
    // Priority 3: Fallback to a random image.
    else if (this.allMedia.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.allMedia.length);
      const randomImageId = this.allMedia[randomIndex].id;
      // Immediately return an observable with the random ID.
      getMediaId$ = of({ id: randomImageId });
    }
    // Last resort: No image will be set.
    else {
      getMediaId$ = of(null);
    }

    getMediaId$.pipe(
      switchMap(mediaResponse => {
        const featuredMediaId = mediaResponse ? mediaResponse.id : undefined;

        const selectedCategoryIds = Object.keys(this.categoriesSelection)
          .filter(key => this.categoriesSelection[Number(key)])
          .map(key => Number(key));

        const acfData = {
          subtitle: this.subtitle
        };

        // Now, create the post with the determined media ID
        return this.wordpress.createPost(this.title, this.content, selectedCategoryIds, featuredMediaId, acfData);
      })
    ).subscribe({
      next: (response) => {
        this.successMessage = "Post created successfully!";
        setTimeout(() => {
          this.router.navigate(['/all-posts']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to create post. Please make sure you are logged in.';
        console.error('Create post error', err);
      }
    });
  }
}

