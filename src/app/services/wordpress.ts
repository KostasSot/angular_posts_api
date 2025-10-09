import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, switchMap, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  data: {
    user: {
      id: string;
    }
  }
}

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
    const loginUrl = `${this.loginUrl}jwt-auth/v1/token`;
    return this.http.post<any>(loginUrl, { username, password })
      .pipe(
        // Use switchMap to chain another API call
        switchMap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            // Decode the token to get the user ID
            const decodedToken: DecodedToken = jwtDecode(response.token);
            const userId = decodedToken.data.user.id;
            // Fetch user details and return them
            return this.http.get<any>(`${this.loginUrl}wp/v2/users/${userId}`);
          }
          return of(null); // Return an empty observable if login fails
        }),
        tap(user => {
          // Save the user's display name
          if (user) {
            localStorage.setItem('user_display_name', user.name);
          }
        })
      );
  }

  getUserDisplayName(): string | null {
    return localStorage.getItem('user_display_name');
  }

  //logout method
  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // NEW: Create a new post
  createPost(title: string, content: string, categories: number[], featured_media?: number, acfData?: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found!');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body: any = {
      title,
      content,
      status: 'publish',
      categories,
      acf: acfData
    };

    if (featured_media) {
      body.featured_media = featured_media;
    }

    // Add the ACF fields to the body if they exist
    if (acfData) {
      body.acf = acfData;
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
