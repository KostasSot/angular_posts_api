import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wordpress } from '../../services/wordpress';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

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
}
