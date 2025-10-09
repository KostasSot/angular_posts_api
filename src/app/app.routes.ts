import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list';
import { SinglePostComponent } from './components/single-post/single-post';
import { Home } from './components/home/home';
import { CategoryPosts } from './components/category-posts/category-posts';
import { LoginComponent } from './components/login/login';
import { CreatePostComponent } from './components/create-post/create-post';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home},
  { path: 'all-posts', component: PostsListComponent },
  { path: 'all-posts/page/:page', component: PostsListComponent},
  { path: 'posts/:id', component: SinglePostComponent },
  { path: 'category/:id', component: CategoryPosts},
  { path: 'login', component: LoginComponent},
  { path: 'create-post', component: CreatePostComponent, canActivate: [authGuard]}
];
