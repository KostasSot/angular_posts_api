import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // Import ActivatedRoute and RouterLink
import { Wordpress } from '../../services/wordpress';

@Component({
  selector: 'app-single-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './single-post.html',
  styleUrls: ['./single-post.css']
})
export class SinglePostComponent implements OnInit {
  post: any; // This will store our single post object

  // We inject ActivatedRoute to get information about the current URL
  constructor(
    private route: ActivatedRoute,
    public wordpress: Wordpress
  ) { }

  ngOnInit(): void {
    // Get the 'id' from the URL
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Use the id to fetch the specific post
      this.wordpress.getPost(Number(id)).subscribe(data => {
        this.post = data;
      });
    }
  }
}





