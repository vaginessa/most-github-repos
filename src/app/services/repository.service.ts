import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GithubAPI } from '../models/github-api';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  href = 'https://api.github.com/search/repositories';

  constructor(private _http: HttpClient) { }

  _getRepoIssues(sort: string, order: string, page: number): Observable<GithubAPI> {
    const requestUrl = `${this.href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${page + 1}`;
    return this._http.get<GithubAPI>(requestUrl);
  }
 

}
