import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list';
import { SinglePostComponent } from './components/single-post/single-post';
import { Home } from './components/home/home';
import { HeaderComponent } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PostsListComponent,
    SinglePostComponent,
    Home,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'angular-app';
}
