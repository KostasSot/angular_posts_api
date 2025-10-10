import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Wordpress } from '../../services/wordpress';
import { RouterLink } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wordpress: Wordpress
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch the existing post data to pre-fill the form
    this.wordpress.getPost(id).subscribe(data => {
      this.post = data;
    });
  }

  onSubmit(): void {
    const postData = {
      title: this.post.title.rendered,
      content: this.post.content.rendered,
      acf: {
        subtitle: this.post.acf.subtitle
      }
    };

    this.wordpress.updatePost(this.post.id, postData).subscribe(response => {
      this.successMessage = "Post updated successfully!";
      setTimeout(() => {
        // Navigate back to the single post view
        this.router.navigate(['/posts', this.post.id]);
      }, 3000);
    });
  }
}
