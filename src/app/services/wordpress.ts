import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Wordpress {
  private apiUrl = 'http://localhost:8000/wp-json/wp/v2/';
  private loginUrl = 'http://localhost:8000/wp-json/';
  private postsPerPage = 8;

  constructor(private http: HttpClient) { }

  // Ensure this method accepts a 'page' argument
  getPosts(page: number = 1): Observable<{ posts: any[], totalPages: number }> {
    return this.http.get<any[]>(
      `${this.apiUrl}posts?_embed&per_page=${this.postsPerPage}&page=${page}`,
      { observe: 'response' }
    ).pipe(
      map(response => {
        const totalPages = Number(response.headers.get('X-WP-TotalPages'));
        const posts = response.body || [];
        return { posts, totalPages };
      })
    );
  }

  getPost(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}posts/${id}?_embed`);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}categories/${id}`);
  }

  getPostsByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}posts?_embed&categories=${categoryId}`);
  }

  //login authentication method
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.loginUrl}jwt-auth/v1/token`, { username, password })
      .pipe(
        tap(response => {
          // Save token to browser local storage
          if (response && response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // NEW: Create a new post
  createPost(title: string, content: string, categories: number [], featured_media?: number ): Observable<any> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found!');
    }

    // send token in special header
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body : any = {
      title,
      content,
      status: 'publish',
      categories
    };

    if (featured_media) {
      body.featured_media = featured_media;
    }

    return this.http.post<any>(`${this.apiUrl}posts`, body, { headers });
  }

  //get wp posts categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}categories?hide_empty=false`);
  }

  //get wp media
  getMedia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}media`);
  }


}
