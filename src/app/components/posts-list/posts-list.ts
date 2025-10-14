import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wordpress } from '../../services/wordpress';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.css']
})
export class PostsListComponent implements OnInit {
  posts: any[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  loading: boolean = true;
  error: string | null = null;

  private searchTerms = new Subject<string>();

  constructor(
    private wordpress: Wordpress,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentPage = Number(params.get('page')) || 1;
      this.loadPosts();
    });

    this.searchTerms.pipe(
      // Wait 300ms after the last keystroke
      debounceTime(300),
      // Ignore if the new search term is the same as the previous one
      distinctUntilChanged(),
      // Switch to a new search observable each time the term changes
      switchMap((term: string) => {
        this.loading = true;
        // If the term is empty, go back to the paginated list
        if (!term.trim()) {
          this.loadPosts();
          return []; // Return an empty array to clear search results
        }
        // Otherwise, call the search service
        return this.wordpress.searchPosts(term);
      })
    ).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
        // Hide pagination during a search
        this.totalPages = 0;
      },
      error: (err) => {
        this.error = 'Search failed. Please try again.';
        this.loading = false;
      }
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;

    this.wordpress.getPosts(this.currentPage).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        this.error = 'Could not load posts. Please try again later.';
        this.loading = false;
      }
    });
  }


  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.router.navigate(['/all-posts/page', this.currentPage]);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.router.navigate(['/all-posts/page', this.currentPage]);
    }
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  clearSearch(inputElement: HTMLInputElement): void {
    // Clear the input field's value
    inputElement.value = '';
    // Trigger a new "search" with an empty term to reset the list
    this.search('');
  }

  loadAllPosts(): void {
    this.loading = true;
    this.error = null;
    this.wordpress.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.totalPages = 0; // Set to 0 to hide pagination controls
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load all posts. Please try again.';
        this.loading = false;
      }
    });
  }
}
