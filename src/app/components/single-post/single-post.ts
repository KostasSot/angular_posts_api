import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Add ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Wordpress} from '../../services/wordpress';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-post',
  standalone: true,
  // REMOVE AsyncPipe from imports
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './single-post.html',
  styleUrls: ['./single-post.css']
})
export class SinglePostComponent implements OnInit {
  // --- Use direct properties again ---
  post: any;
  comments: any[] = [];
  commentCount: number = 0;
  loading: boolean = true;

  // Comment form properties remain the same
  newCommentContent: string = '';
  commentSubmitError: string | null = null;
  commentSubmitSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public wordpressService: Wordpress,
    private cdr: ChangeDetectorRef // <-- Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      console.log(`--- Route Changed: New Post ID: ${id} ---`);
      if (id) {
        console.log("Resetting component state (setting comments to NULL)...");
        this.post = undefined;
        // Force comments to null temporarily to guarantee *ngIf re-evaluates
        this.comments = null!; // Use non-null assertion temporarily
        this.commentCount = 0;
        this.loading = true;
        this.cdr.detectChanges(); // Trigger update for loading state

        this.loadPostAndComments(id);
      } else {
        // ... error handling ...
      }
    });
  }

  loadPostAndComments(id: number): void {
    console.log(`Fetching data for Post ID: ${id}`);
    this.loading = true;
    // No need to call detectChanges here if ngOnInit did it

    forkJoin({
      post: this.wordpressService.getPost(id),
      comments: this.wordpressService.getComments(id)
    }).subscribe({
      next: (response) => {
        console.log(`Received API response for Post ID: ${id}`, response);

        // Use setTimeout to ensure assignment happens in the next change detection cycle
        setTimeout(() => {
          console.log("Inside setTimeout: Assigning data...");
          this.post = response.post;
          // Create a new array reference
          this.comments = [...(response.comments || [])];
          this.commentCount = this.comments.length;
          this.loading = false;
          console.log(`Assigned comments for Post ID: ${id}. New array:`, this.comments);

          // Manually trigger change detection AGAIN after assignment
          console.log("Forcing UI update via detectChanges() INSIDE setTimeout...");
          this.cdr.detectChanges();
          console.log("detectChanges() inside setTimeout completed.");
        }, 0); // setTimeout with 0ms delay

      },
      error: (err) => {
        // ... error handling ...
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitComment(): void {
    this.commentSubmitError = null;
    this.commentSubmitSuccess = false;
    if (!this.newCommentContent.trim() || !this.post?.id) { // Use optional chaining for post.id
      this.commentSubmitError = "Comment cannot be empty.";
      return;
    }

    this.wordpressService.createComment(this.post.id, this.newCommentContent).subscribe({
      next: (newComment) => {
        this.commentSubmitSuccess = true;
        this.newCommentContent = '';
        this.refreshComments();
        setTimeout(() => this.commentSubmitSuccess = false, 3000);
      },
      error: (err) => {
        this.commentSubmitError = "Failed to submit comment. Please try again.";
        console.error("Error submitting comment:", err);
        this.cdr.detectChanges(); // Update view on error
      }
    });
  }

  refreshComments(): void {
    if (this.post && this.post.id) {
      console.log(`Refreshing comments for Post ID: ${this.post.id}`);
      this.wordpressService.getComments(this.post.id).subscribe(comments => {
        this.comments = comments || []; // Ensure it's an array
        this.commentCount = this.comments.length;
        console.log(`Refreshed comments assigned:`, this.comments);
        this.cdr.detectChanges(); // Force update after refresh
      });
    }
  }
}
