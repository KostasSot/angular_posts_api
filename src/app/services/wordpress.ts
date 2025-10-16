import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, switchMap, of, forkJoin } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user_display_name: string;
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
        tap(response => {
          if (response && response.token) {
            // Step 1: Save the token
            localStorage.setItem('token', response.token);

            // Step 2: Decode the token to get the name directly from it
            const decodedToken: DecodedToken = jwtDecode(response.token);
            const displayName = decodedToken.user_display_name;

            // Step 3: Save the name to local storage
            localStorage.setItem('user_display_name', displayName);
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
    return this.http.get<any[]>(`${this.apiUrl}media?per_page=100`);
  }

  //usage of my custom feedpack api
  sendFeedback(message: string): Observable<any> {
    const feedbackUrl = `${this.loginUrl}my-playground/v1/submit`;
    const body = { message };
    return this.http.post<any>(feedbackUrl, body);
  }

  updatePost(id: number, postData: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) { throw new Error('No token found!'); }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      return this.http.post<any>(`${this.loginUrl}wp/v2/posts/${id}`, postData, { headers });
  }

  //Create a new WordPress user (requires admin token)
  createUser(username: string, firstname:string, lastname:string, email: string, password: string, role: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No admin token found!');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      username,
      first_name: firstname,
      last_name: lastname,
      email,
      password,
      roles: [role]
    };

    return this.http.post<any>(`${this.loginUrl}wp/v2/users`, body, { headers });
  }

  searchPosts(searchTerm: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.loginUrl}wp/v2/posts?_embed&title_search=${searchTerm}`);
  }

  getAllPosts(): Observable<any[]> {
    // We need to make an authenticated call to see all posts, even private ones if needed
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // --- Step 1: Make the initial call to get page 1 AND the total number of pages ---
    return this.http.get<any[]>(
      `${this.loginUrl}wp/v2/posts?_embed&per_page=100&page=1`,
      { headers, observe: 'response' }
    ).pipe(
      // --- Step 2: Use switchMap to chain subsequent calls based on the first response ---
      switchMap(response => {
        const totalPages = Number(response.headers.get('X-WP-TotalPages'));
        const firstPagePosts = response.body || [];

        // If there's only one page, we're done! Return the posts we already have.
        if (totalPages <= 1) {
          return of(firstPagePosts);
        }

        // --- Step 3: Create an array of API calls for the remaining pages ---
        const pageRequests: Observable<any[]>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          const nextPageRequest = this.http.get<any[]>(
            `${this.loginUrl}wp/v2/posts?_embed&per_page=100&page=${page}`,
            { headers }
          );
          pageRequests.push(nextPageRequest);
        }

        // --- Step 4: Execute all remaining calls in parallel and combine results ---
        return forkJoin(pageRequests).pipe(
          map(arrayOfPostArrays => {
            // We get an array of arrays, e.g., [[posts from page 2], [posts from page 3]]
            // Flatten this into a single array
            const otherPosts = arrayOfPostArrays.flat();
            // Combine the posts from page 1 with all the other posts
            return [...firstPagePosts, ...otherPosts];
          })
        );
      })
    );
  }

  uploadMedia(file: File): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) { throw new Error('No admin token found!'); }

    // For file uploads, we use FormData
    const formData = new FormData();
    formData.append('file', file, file.name);

    // IMPORTANT: For FormData, we ONLY set the Authorization header.
    // The browser will automatically set the correct 'Content-Type' for file uploads.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.loginUrl}wp/v2/media`, formData, { headers });
  }

  deletePost(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) { throw new Error('No admin token found!'); }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Use the http.delete method for the request
    return this.http.delete<any>(`${this.loginUrl}wp/v2/posts/${id}`, { headers });
  }

}
