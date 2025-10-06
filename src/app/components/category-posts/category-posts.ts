import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Wordpress } from '../../services/wordpress';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-category-posts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-posts.html',
  styleUrls: ['./category-posts.css']
})
export class CategoryPosts implements OnInit {
  posts: any[] = [];
  category: any;

  constructor(
    private route: ActivatedRoute,
    private wordpress: Wordpress
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      // Use forkJoin to make two API calls at the same time
      forkJoin({
        category: this.wordpress.getCategory(id),
        posts: this.wordpress.getPostsByCategory(id)
      }).subscribe(response => {
        this.category = response.category;
        this.posts = response.posts;
      });
    }
  }
}
