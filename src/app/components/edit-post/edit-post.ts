import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Wordpress } from '../../services/wordpress';
import { RouterLink } from '@angular/router';
import { forkJoin, switchMap, of, Observable } from 'rxjs';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-post.html',
  styleUrls: ['./edit-post.css']
})
export class EditPost implements OnInit {
  post: any; // To hold the post data
  successMessage = '';
  allMedia: any[] = [];
  selectedMediaId: number | null = null;
  fileToUpload: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wordpress: Wordpress
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch both the post details and all media files at the same time
    forkJoin({
      post: this.wordpress.getPost(id),
      media: this.wordpress.getMedia()
    }).subscribe(response => {
      this.post = response.post;
      this.allMedia = response.media;
      // Pre-select the post's current featured image
      this.selectedMediaId = response.post.featured_media;
    });
  }

  // Called when a user selects an existing image from the gallery
  selectMedia(id: number): void {
    this.selectedMediaId = id;
    this.fileToUpload = null; // Clear any pending file upload
  }

  // Called when a user chooses a new file to upload
  onFileChange(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.fileToUpload = fileList[0];
      this.selectedMediaId = null; // Clear any existing selection
    }
  }

  onSubmit(): void {
    // Start with an observable that does nothing (for the case where no image changes)
    let uploadOrSelect$: Observable<any> = of({ id: this.selectedMediaId });

    // If a new file was chosen, change the observable to the upload process
    if (this.fileToUpload) {
      uploadOrSelect$ = this.wordpress.uploadMedia(this.fileToUpload);
    }

    uploadOrSelect$.pipe(
      // Use switchMap to chain the update call after the upload (if any)
      switchMap(mediaResponse => {
        const featuredMediaId = mediaResponse ? mediaResponse.id : null;

        const postData = {
          title: this.post.title.rendered,
          content: this.post.content.rendered,
          featured_media: featuredMediaId,
          acf: {
            subtitle: this.post.acf.subtitle
          }
        };
        // Now, update the post
        return this.wordpress.updatePost(this.post.id, postData);
      })
    ).subscribe(response => {
      this.successMessage = "Post updated successfully!";
      setTimeout(() => {
        this.router.navigate(['/posts', this.post.id]);
      }, 2000);
    });
  }

  onDelete(): void {
    // 1. Show a confirmation dialog to the user
    const confirmation = confirm('Are you sure you want to delete this post? This action cannot be undone.');

    // 2. Only proceed if the user clicked "OK"
    if (confirmation) {
      this.wordpress.deletePost(this.post.id).subscribe({
        next: () => {
          // 3. On success, redirect to the all-posts page
          alert('Post deleted successfully.');
          this.router.navigate(['/all-posts']);
        },
        error: (err) => {
          // 4. On failure, show an error message
          alert('Failed to delete post. Please try again.');
          console.error('Delete post error', err);
        }
      });
    }
  }
}
